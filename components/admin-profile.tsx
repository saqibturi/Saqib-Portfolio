"use client";
import { useState } from "react";
import type { Profile } from "@/lib/types";
import { Upload, adminAction, useUnsaved } from "./admin-helpers";
export function ProfileEditor({ initial }: { initial: Profile }) {
  const [p, setP] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  useUnsaved(dirty);
  function update<K extends keyof Profile>(k: K, v: Profile[K]) {
    setP((p) => ({ ...p, [k]: v }));
    setDirty(true);
  }
  return (
    <>
      <div className="admin-heading">
        <h1>Profile & content</h1>
        {dirty && <span className="unsaved">Unsaved changes</span>}
      </div>
      <div className="panel">
        <h2>The essentials</h2>
        {(
          [
            "name",
            "title",
            "heroHeadline",
            "heroAccent",
            "intro",
            "about",
            "email",
            "phone",
            "location",
            "availability",
          ] as const
        ).map((k) => (
          <label key={k}>
            {
              {
                name: "Name",
                title: "Professional title",
                heroHeadline: "Hero headline",
                heroAccent: "Hero accent line",
                intro: "Hero introduction",
                about: "About",
                email: "Contact email",
                phone: "Phone number",
                location: "Location",
                availability: "Availability",
              }[k]
            }
            {["intro", "about"].includes(k) ? (
              <textarea
                rows={k === "about" ? 6 : 3}
                value={p[k]}
                onChange={(e) => update(k, e.target.value)}
              />
            ) : (
              <input value={p[k]} onChange={(e) => update(k, e.target.value)} />
            )}
          </label>
        ))}
      </div>
      <div className="panel">
        <h2>Portrait & résumé</h2>
        <img
          className="preview-image"
          src={p.photo || "/portrait.webp"}
          alt="Current portrait"
        />
        <Upload onUploaded={(url) => update("photo", url)} />
        <button
          className="button secondary small-button"
          onClick={() => update("photo", "/portrait.webp")}
        >
          Use original portrait
        </button>
        <hr className="divider" />
        {p.resume && (
          <>
            <a className="text-link" href={p.resume}>
              View résumé ↗
            </a>
            <button
              className="button secondary small-button"
              onClick={() => update("resume", "")}
            >
              Remove résumé
            </button>
          </>
        )}
        <Upload
          accept="application/pdf"
          onUploaded={(url) => update("resume", url)}
        />
      </div>
      <div className="panel">
        <h2>Social links</h2>
        {p.socials.map((s, i) => (
          <div className="dynamic-item" key={i}>
            <div className="form-grid">
              <label>
                Label
                <input
                  value={s.label}
                  onChange={(e) =>
                    update(
                      "socials",
                      p.socials.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
              <label>
                HTTPS URL
                <input
                  value={s.url}
                  onChange={(e) =>
                    update(
                      "socials",
                      p.socials.map((x, j) =>
                        j === i ? { ...x, url: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
            </div>
            <button
              className="button secondary small-button"
              onClick={() =>
                update(
                  "socials",
                  p.socials.filter((_, j) => j !== i),
                )
              }
            >
              Remove link
            </button>
          </div>
        ))}
        <button
          className="button secondary small-button"
          onClick={() =>
            update("socials", [...p.socials, { label: "", url: "" }])
          }
        >
          Add social link
        </button>
      </div>
      <div className="panel">
        <h2>Expertise</h2>
        {p.expertise.map((s, i) => (
          <div className="dynamic-item" key={i}>
            {(["title", "description"] as const).map((k) => (
              <label key={k}>
                {k}
                <input
                  value={s[k]}
                  onChange={(e) =>
                    update(
                      "expertise",
                      p.expertise.map((x, j) =>
                        j === i ? { ...x, [k]: e.target.value } : x,
                      ),
                    )
                  }
                />
              </label>
            ))}
            <label>
              Skills (comma separated)
              <input
                value={s.tags.join(", ")}
                onChange={(e) =>
                  update(
                    "expertise",
                    p.expertise.map((x, j) =>
                      j === i
                        ? {
                            ...x,
                            tags: e.target.value
                              .split(",")
                              .map((t) => t.trim()),
                          }
                        : x,
                    ),
                  )
                }
              />
            </label>
            <button
              className="button secondary small-button"
              onClick={() =>
                update(
                  "expertise",
                  p.expertise.filter((_, j) => i !== j),
                )
              }
            >
              Remove expertise
            </button>
          </div>
        ))}
        <button
          className="button secondary small-button"
          onClick={() =>
            update("expertise", [
              ...p.expertise,
              { title: "", description: "", tags: [] },
            ])
          }
        >
          Add expertise
        </button>
      </div>
      {(["experience", "education"] as const).map((type) => (
        <div className="panel" key={type}>
          <h2>{type === "experience" ? "Experience" : "Education"}</h2>
          {p[type].map((s, i) => (
            <div className="dynamic-item" key={i}>
              {(
                ["title", "organization", "period", "description"] as const
              ).map((k) => (
                <label key={k}>
                  {k}
                  <input
                    value={s[k]}
                    onChange={(e) =>
                      update(
                        type,
                        p[type].map((x, j) =>
                          j === i ? { ...x, [k]: e.target.value } : x,
                        ),
                      )
                    }
                  />
                </label>
              ))}
              <button
                className="button secondary small-button"
                onClick={() =>
                  update(
                    type,
                    p[type].filter((_, j) => j !== i),
                  )
                }
              >
                Remove entry
              </button>
            </div>
          ))}
          <button
            className="button secondary small-button"
            onClick={() =>
              update(type, [
                ...p[type],
                { title: "", organization: "", period: "", description: "" },
              ])
            }
          >
            Add entry
          </button>
        </div>
      ))}
      <div className="panel">
        <h2>Homepage sections</h2>
        <p>
          Reorder visible sections or hide them. The hero and contact links
          remain available.
        </p>
        {p.sections.map((s, i) => (
          <div className="reorder" key={s}>
            <span>{s}</span>
            <button
              className="icon-button"
              aria-label={`Move ${s} up`}
              disabled={i === 0}
              onClick={() => {
                const n = [...p.sections];
                [n[i - 1], n[i]] = [n[i], n[i - 1]];
                update("sections", n);
              }}
            >
              ↑
            </button>
            <button
              className="icon-button"
              aria-label={`Move ${s} down`}
              disabled={i === p.sections.length - 1}
              onClick={() => {
                const n = [...p.sections];
                [n[i + 1], n[i]] = [n[i], n[i + 1]];
                update("sections", n);
              }}
            >
              ↓
            </button>
            <button
              className="button secondary small-button"
              onClick={() =>
                update(
                  "sections",
                  p.sections.filter((x) => x !== s),
                )
              }
            >
              Hide
            </button>
          </div>
        ))}
        {["expertise", "projects", "about", "experience", "certifications"]
          .filter((s) => !p.sections.includes(s))
          .map((s) => (
            <button
              key={s}
              className="button secondary small-button"
              onClick={() => update("sections", [...p.sections, s])}
            >
              Show {s}
            </button>
          ))}
      </div>
      <div className="panel">
        <h2>Search & sharing</h2>
        <label>
          Site title
          <input
            value={p.seoTitle}
            onChange={(e) => update("seoTitle", e.target.value)}
          />
        </label>
        <label>
          Site description
          <textarea
            value={p.seoDescription}
            onChange={(e) => update("seoDescription", e.target.value)}
          />
        </label>
        {(["projects", "about", "contact"] as const).map((page) => (
          <div key={page} className="dynamic-item">
            <h3>{page}</h3>
            <label>
              Page title
              <input
                value={p.pageSeo[page]?.title || ""}
                onChange={(e) =>
                  update("pageSeo", {
                    ...p.pageSeo,
                    [page]: { ...p.pageSeo[page], title: e.target.value },
                  })
                }
              />
            </label>
            <label>
              Page description
              <textarea
                value={p.pageSeo[page]?.description || ""}
                onChange={(e) =>
                  update("pageSeo", {
                    ...p.pageSeo,
                    [page]: { ...p.pageSeo[page], description: e.target.value },
                  })
                }
              />
            </label>
          </div>
        ))}
        <p>Optional social preview image</p>
        {p.ogImage && (
          <>
            <img
              src={p.ogImage}
              className="preview-image"
              alt="Social preview"
            />
            <button
              className="button secondary small-button"
              onClick={() => update("ogImage", "")}
            >
              Remove preview
            </button>
          </>
        )}
        <Upload onUploaded={(url) => update("ogImage", url)} />
      </div>
      <p role="status">{status}</p>
      <div className="editor-actions">
        <button
          className="button"
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            try {
              await adminAction({ action: "profile", profile: p });
              setDirty(false);
              setStatus("Profile saved. Changes are now public.");
            } catch (e) {
              setStatus(e instanceof Error ? e.message : "Could not save");
            } finally {
              setBusy(false);
            }
          }}
        >
          {busy ? "Saving…" : "Save & publish profile"}
        </button>
      </div>
    </>
  );
}
