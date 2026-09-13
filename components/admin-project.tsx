"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Project } from "@/lib/types";
import { emptyProject } from "@/lib/types";
import {
  Upload,
  ConfirmButton,
  adminAction,
  useUnsaved,
} from "./admin-helpers";
export function ProjectEditor({
  initial,
  published = false,
}: {
  initial?: Project;
  published?: boolean;
}) {
  const router = useRouter();
  const [p, setP] = useState<Project>(
    initial || { ...emptyProject, id: crypto.randomUUID() },
  );
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(Boolean(initial));
  useUnsaved(dirty);
  function update<K extends keyof Project>(key: K, value: Project[K]) {
    setP((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }
  async function save() {
    setBusy(true);
    setStatus("");
    try {
      await adminAction({ action: "save-project", project: p });
      setDirty(false);
      setSaved(true);
      setStatus("Draft saved. Your published version is unchanged.");
      router.refresh();
      return true;
    } catch (e) {
      setStatus(e instanceof Error ? e.message : "Save failed");
      return false;
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <p className="eyebrow">
            {published ? "PUBLISHED · EDITING DRAFT" : "PROJECT DRAFT"}
          </p>
          <h1>{initial ? "Edit project" : "New project"}</h1>
        </div>
        {dirty && <span className="unsaved">Unsaved changes</span>}
      </div>
      <div className="panel">
        <label>
          Project title
          <input
            value={p.title}
            onChange={(e) => {
              update("title", e.target.value);
              if (!saved)
                update(
                  "slug",
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, ""),
                );
            }}
          />
        </label>
        <label>
          URL slug
          <input
            value={p.slug}
            onChange={(e) => update("slug", e.target.value)}
          />
          <small>
            Lowercase words separated by hyphens. Old published URLs will
            redirect.
          </small>
        </label>
        <label>
          Summary
          <textarea
            rows={3}
            value={p.summary}
            onChange={(e) => update("summary", e.target.value)}
          />
        </label>
        <div className="form-grid">
          <label>
            Category
            <input
              value={p.category}
              onChange={(e) => update("category", e.target.value)}
            />
          </label>
          <label>
            Technologies (comma separated)
            <input
              value={p.tags.join(", ")}
              onChange={(e) =>
                update(
                  "tags",
                  e.target.value.split(",").map((t) => t.trim()),
                )
              }
            />
          </label>
        </div>
        <div className="form-grid">
          <label>
            My role
            <input
              value={p.role}
              onChange={(e) => update("role", e.target.value)}
            />
          </label>
          <label>
            Timeline
            <input
              value={p.timeline}
              onChange={(e) => update("timeline", e.target.value)}
            />
          </label>
        </div>
        <div className="form-grid">
          <label>
            GitHub URL
            <input
              type="url"
              value={p.github}
              onChange={(e) => update("github", e.target.value)}
            />
          </label>
          <label>
            Live demo URL
            <input
              type="url"
              value={p.demo}
              onChange={(e) => update("demo", e.target.value)}
            />
          </label>
        </div>
        <label className="check-label">
          <input
            type="checkbox"
            checked={p.featured}
            onChange={(e) => update("featured", e.target.checked)}
          />
          Feature on homepage
        </label>
        <label>
          Display order (lower first)
          <input
            type="number"
            min={0}
            value={p.order}
            onChange={(e) => update("order", Number(e.target.value))}
          />
        </label>
      </div>
      <div className="panel">
        <h2>Cover image</h2>
        {p.cover && (
          <img
            className="preview-image"
            src={p.cover}
            alt={p.coverAlt || "Cover preview"}
          />
        )}
        <Upload onUploaded={(url) => update("cover", url)} />
        <label>
          Cover alt text
          <input
            value={p.coverAlt}
            onChange={(e) => update("coverAlt", e.target.value)}
          />
        </label>
        {p.cover && (
          <button
            className="button secondary small-button"
            onClick={() => update("cover", "")}
          >
            Remove cover
          </button>
        )}
      </div>
      <div className="panel">
        <h2>The case study</h2>
        <p>
          Write in plain text. Include only work and results you can
          substantiate. Empty sections stay hidden.
        </p>
        {(
          [
            "problem",
            "approach",
            "data",
            "implementation",
            "evaluation",
            "limitations",
            "outcomes",
          ] as const
        ).map((k) => (
          <label key={k}>
            {k[0].toUpperCase() + k.slice(1)}
            <textarea
              rows={5}
              value={p[k]}
              onChange={(e) => update(k, e.target.value)}
            />
          </label>
        ))}
      </div>
      <div className="panel">
        <h2>Gallery</h2>
        <Upload
          multiple
          onUploaded={(url) => {
            setP((old) => ({
              ...old,
              gallery: [...old.gallery, { url, alt: "", caption: "" }],
            }));
            setDirty(true);
          }}
        />
        <div className="editor-gallery">
          {p.gallery.map((g, i) => (
            <div key={g.url}>
              <img src={g.url} alt={g.alt || "Gallery preview"} />
              <label>
                Alt text
                <input
                  value={g.alt}
                  onChange={(e) =>
                    update(
                      "gallery",
                      p.gallery.map((x, j) =>
                        i === j ? { ...x, alt: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                Caption
                <input
                  value={g.caption}
                  onChange={(e) =>
                    update(
                      "gallery",
                      p.gallery.map((x, j) =>
                        i === j ? { ...x, caption: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <button
                className="button secondary small-button"
                onClick={() =>
                  update(
                    "gallery",
                    p.gallery.filter((_, j) => j !== i),
                  )
                }
              >
                Remove image
              </button>
            </div>
          ))}
        </div>
      </div>
      <p role="status" className="status-message">
        {status}
      </p>
      <div className="editor-actions">
        <button className="button" disabled={busy} onClick={save}>
          {busy ? "Saving…" : "Save draft"}
        </button>
        {saved && (
          <a
            className="button secondary"
            href={`/admin/preview/${p.id}`}
            target="_blank"
          >
            Preview saved draft ↗
          </a>
        )}
        <ConfirmButton
          label="Publish"
          message="Publish the latest saved draft? Save your changes first. This updates the live site immediately."
          onConfirm={async () => {
            if (dirty) throw new Error("Save your draft before publishing.");
            await adminAction({ action: "publish", id: p.id });
            setStatus("Project published.");
            router.refresh();
          }}
        />
        {published && (
          <ConfirmButton
            label="Unpublish"
            message="Remove this project from public pages? Your draft will remain."
            onConfirm={async () => {
              await adminAction({ action: "unpublish", id: p.id });
              setStatus("Project unpublished.");
              router.refresh();
            }}
          />
        )}
        {saved && (
          <ConfirmButton
            danger
            label="Delete project"
            message="Permanently delete the draft, published version, and old URL records?"
            onConfirm={async () => {
              await adminAction({ action: "delete-project", id: p.id });
              setDirty(false);
              router.push("/admin/projects");
              router.refresh();
            }}
          />
        )}
      </div>
    </>
  );
}
