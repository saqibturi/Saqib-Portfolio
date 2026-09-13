"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Certificate } from "@/lib/types";
import { emptyCertificate } from "@/lib/types";
import {
  Upload,
  ConfirmButton,
  adminAction,
  useUnsaved,
} from "./admin-helpers";
import { CertificateCards } from "./certifications";
export function CertificateManager({
  drafts,
  publishedIds,
}: {
  drafts: Certificate[];
  publishedIds: string[];
}) {
  const router = useRouter();
  const [current, setCurrent] = useState<Certificate | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState(false);
  useUnsaved(dirty);
  function change<K extends keyof Certificate>(key: K, value: Certificate[K]) {
    setCurrent((c) => (c ? { ...c, [key]: value } : c));
    setDirty(true);
  }
  function close() {
    if (dirty && !confirm("Discard unsaved certificate changes?")) return;
    setCurrent(null);
    setDirty(false);
    setStatus("");
    setPreview(false);
  }
  if (!current)
    return (
      <>
        <div className="admin-heading">
          <div>
            <p className="eyebrow">YOUR CREDENTIALS</p>
            <h1>Certifications</h1>
          </div>
          <button
            className="button"
            onClick={() => {
              setCurrent({ ...emptyCertificate, id: crypto.randomUUID() });
              setDirty(true);
            }}
          >
            Add certificate +
          </button>
        </div>
        <p>
          Upload certificates, add their details, and publish when ready. Draft
          changes remain private.
        </p>
        {drafts.length ? (
          drafts.map((c) => (
            <div className="list-row" key={c.id}>
              <div>
                <h3>{c.title}</h3>
                <p>
                  {c.issuer} ·{" "}
                  {publishedIds.includes(c.id) ? "Published + draft" : "Draft"}
                </p>
              </div>
              <button
                className="button secondary small-button"
                onClick={() => {
                  setCurrent(c);
                  setStatus("");
                }}
              >
                Edit certificate
              </button>
            </div>
          ))
        ) : (
          <div className="panel">
            <h2>Your learning belongs here.</h2>
            <p>
              Add your first genuine certificate. No placeholder credentials are
              shown publicly.
            </p>
          </div>
        )}
      </>
    );
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">
            {publishedIds.includes(current.id)
              ? "PUBLISHED · EDITING DRAFT"
              : "CERTIFICATE DRAFT"}
          </p>
          <h1>{current.title || "New certificate"}</h1>
        </div>
        <button className="button secondary small-button" onClick={close}>
          Back to certificates
        </button>
      </div>
      {dirty && <p className="unsaved">Unsaved changes</p>}
      <div className="panel">
        <label>
          Certificate title
          <input
            required
            value={current.title}
            onChange={(e) => change("title", e.target.value)}
          />
        </label>
        <label>
          Issuing organization
          <input
            required
            value={current.issuer}
            onChange={(e) => change("issuer", e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Issue date
            <input
              type="date"
              value={current.issued}
              onChange={(e) => change("issued", e.target.value)}
            />
          </label>
          <label>
            Expiry date (optional)
            <input
              type="date"
              value={current.expires}
              onChange={(e) => change("expires", e.target.value)}
            />
          </label>
        </div>
        <label>
          Credential ID (optional)
          <input
            value={current.credentialId}
            onChange={(e) => change("credentialId", e.target.value)}
          />
        </label>
        <label>
          Verification URL (optional)
          <input
            type="url"
            placeholder="https://…"
            value={current.verificationUrl}
            onChange={(e) => change("verificationUrl", e.target.value)}
          />
        </label>
        <label>
          Description
          <textarea
            rows={5}
            value={current.description}
            onChange={(e) => change("description", e.target.value)}
          />
        </label>
        <label>
          Related skills (comma separated)
          <input
            value={current.skills.join(", ")}
            onChange={(e) =>
              change(
                "skills",
                e.target.value.split(",").map((x) => x.trim()),
              )
            }
          />
        </label>
        <label>
          Display order (lower first)
          <input
            type="number"
            min={0}
            max={10000}
            value={current.order}
            onChange={(e) => change("order", Number(e.target.value))}
          />
        </label>
      </div>
      <div className="panel">
        <h2>Certificate file</h2>
        <p>Upload the genuine certificate as a PDF, JPG, PNG, or WebP.</p>
        {current.file && (
          <div className="actions">
            <a
              className="text-link"
              href={current.file}
              target="_blank"
              rel="noreferrer"
            >
              View uploaded certificate ↗
            </a>
            <button
              className="button secondary small-button"
              onClick={() => change("file", "")}
            >
              Remove file
            </button>
          </div>
        )}
        <Upload
          accept="application/pdf,image/jpeg,image/png,image/webp"
          onUploaded={(url) => change("file", url)}
        />
        <hr className="divider" />
        <h2>Card image (optional)</h2>
        {current.thumbnail && (
          <img
            src={current.thumbnail}
            className="preview-image"
            alt={current.alt || "Certificate preview"}
          />
        )}
        <Upload onUploaded={(url) => change("thumbnail", url)} />
        {current.thumbnail && (
          <>
            <label>
              Image alt text
              <input
                value={current.alt}
                onChange={(e) => change("alt", e.target.value)}
              />
            </label>
            <button
              className="button secondary small-button"
              onClick={() => change("thumbnail", "")}
            >
              Remove card image
            </button>
          </>
        )}
      </div>
      <button className="button secondary" onClick={() => setPreview(!preview)}>
        {preview ? "Hide card preview" : "Preview certificate card"}
      </button>
      {preview && (
        <div className="certification-list">
          <CertificateCards certificates={[current]} />
        </div>
      )}
      <p role="status" className="status-message">
        {status}
      </p>
      <div className="editor-actions">
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await adminAction({
                action: "save-certificate",
                certificate: current,
              });
              setDirty(false);
              setStatus("Draft saved. The published certificate is unchanged.");
              router.refresh();
            } catch (e) {
              setStatus(e instanceof Error ? e.message : "Could not save");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save draft"}
        </button>
        <ConfirmButton
          label="Publish certificate"
          message="Publish the saved certificate and its attached file?"
          onConfirm={async () => {
            if (dirty) throw new Error("Save your changes before publishing.");
            await adminAction({
              action: "publish-certificate",
              id: current.id,
            });
            setStatus("Certificate published.");
            router.refresh();
          }}
        />
        {publishedIds.includes(current.id) && (
          <ConfirmButton
            label="Unpublish certificate"
            message="Hide this certificate from the public website while keeping the draft?"
            onConfirm={async () => {
              await adminAction({
                action: "unpublish-certificate",
                id: current.id,
              });
              setStatus("Certificate unpublished.");
              router.refresh();
            }}
          />
        )}
        <ConfirmButton
          danger
          label="Delete certificate"
          message="Permanently remove this draft and its published version? Uploaded files remain in Media until removed separately."
          onConfirm={async () => {
            await adminAction({ action: "delete-certificate", id: current.id });
            setDirty(false);
            setCurrent(null);
            router.refresh();
          }}
        />
      </div>
    </>
  );
}
