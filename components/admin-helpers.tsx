"use client";
import { useEffect, useRef, useState } from "react";
export async function adminAction(body: unknown) {
  const r = await fetch("/api/admin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!r.ok) throw new Error(d.error || "Operation failed");
  return d;
}
export function useUnsaved(dirty: boolean) {
  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    const click = (e: MouseEvent) => {
      if (!dirty) return;
      const link = (e.target as HTMLElement).closest("a");
      if (
        link &&
        link.target !== "_blank" &&
        !confirm("You have unsaved changes. Leave this page?")
      )
        e.preventDefault();
    };
    window.addEventListener("beforeunload", before);
    document.addEventListener("click", click, true);
    return () => {
      window.removeEventListener("beforeunload", before);
      document.removeEventListener("click", click, true);
    };
  }, [dirty]);
}
export function Upload({
  onUploaded,
  accept = "image/jpeg,image/png,image/webp",
  multiple = false,
}: {
  onUploaded: (url: string) => void;
  accept?: string;
  multiple?: boolean;
}) {
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");
  return (
    <div className="upload-control">
      <label>
        Upload {accept.includes("pdf") ? "document" : "image"}
        {multiple ? "s" : ""}
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={progress !== null}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            setError("");
            for (const file of files) {
              if (file.size > 3_000_000) {
                setError("Each file must be under 3 MB.");
                break;
              }
              setProgress(0);
              try {
                await new Promise<void>((resolve, reject) => {
                  const xhr = new XMLHttpRequest();
                  xhr.open("POST", "/api/upload");
                  xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable)
                      setProgress(Math.round((e.loaded / e.total) * 100));
                  };
                  xhr.onload = () => {
                    try {
                      const data = JSON.parse(xhr.responseText);
                      if (xhr.status < 200 || xhr.status >= 300)
                        reject(new Error(data.error || "Upload failed"));
                      else {
                        onUploaded(data.url);
                        resolve();
                      }
                    } catch {
                      reject(new Error("Upload failed"));
                    }
                  };
                  xhr.onerror = () =>
                    reject(new Error("Connection interrupted"));
                  const f = new FormData();
                  f.set("file", file);
                  xhr.send(f);
                });
              } catch (err) {
                setError(err instanceof Error ? err.message : "Upload failed");
                break;
              } finally {
                setProgress(null);
              }
            }
            e.target.value = "";
          }}
        />
        <small>Up to 3 MB per file. Images are optimized automatically.</small>
      </label>
      {progress !== null && (
        <>
          <progress value={progress} max={100} />
          <p role="status">
            {progress === 100 ? "Processing file…" : `Uploading ${progress}%`}
          </p>
        </>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function ConfirmButton({
  label,
  message,
  onConfirm,
  danger = false,
}: {
  label: string;
  message: string;
  onConfirm: () => Promise<void>;
  danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <>
      <button
        type="button"
        className={`button secondary small-button ${danger ? "danger" : ""}`}
        onClick={() => {
          setError("");
          ref.current?.showModal();
        }}
      >
        {label}
      </button>
      <dialog ref={ref} className="alert-dialog" aria-label={label}>
        <h2>{label}?</h2>
        <p>{message}</p>
        {error && <p className="form-error">{error}</p>}
        <div className="actions">
          <button
            type="button"
            className="button secondary"
            onClick={() => ref.current?.close()}
            disabled={busy}
          >
            Cancel
          </button>
          <button
            type="button"
            className="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
                ref.current?.close();
              } catch (err) {
                setError(
                  err instanceof Error ? err.message : "Operation failed",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Working…" : "Confirm"}
          </button>
        </div>
      </dialog>
    </>
  );
}
