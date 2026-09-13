"use client";
import { useRouter } from "next/navigation";
import { Upload, ConfirmButton, adminAction } from "./admin-helpers";
type Media = { id: string; name: string; mime: string; size: number };
export function MediaManager({ items }: { items: Media[] }) {
  const router = useRouter();
  return (
    <>
      <h1>Media library</h1>
      <p>
        Draft files stay private. Files become public only when referenced by
        published content. Referenced files cannot be deleted.
      </p>
      <Upload
        multiple
        accept="image/jpeg,image/png,image/webp,application/pdf"
        onUploaded={() => router.refresh()}
      />
      <div className="media-grid">
        {items.map((m) => (
          <article className="panel" key={m.id}>
            {m.mime.startsWith("image/") ? (
              <img src={`/api/media/${m.id}`} alt={m.name} />
            ) : (
              <a className="button secondary" href={`/api/media/${m.id}`}>
                View PDF ↗
              </a>
            )}
            <p>
              <small>
                {m.name}
                <br />
                {Math.round(m.size / 1024)} KB
              </small>
            </p>
            <ConfirmButton
              danger
              label="Delete file"
              message="Permanently remove this file? Files used by drafts or published content are protected."
              onConfirm={async () => {
                await adminAction({ action: "delete-media", id: m.id });
                router.refresh();
              }}
            />
          </article>
        ))}
      </div>
      {!items.length && <div className="panel">No uploaded files yet.</div>}
    </>
  );
}
