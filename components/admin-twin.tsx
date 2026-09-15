"use client";

import { useState } from "react";

export function AdminTwin() {
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("note");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function ingest(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("Embedding and indexing source…");
    try {
      const response = await fetch("/api/twin/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sourceType, sourceUrl, rawContent }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Ingestion failed");
      setStatus(json.unchanged ? "Source is already up to date." : `Indexed ${json.chunks} semantic chunks.`);
      setTitle(""); setSourceUrl(""); setRawContent("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ingestion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-card">
      <div className="admin-card-head">
        <div><p className="eyebrow">AI DIGITAL TWIN</p><h2>Knowledge ingestion</h2></div>
        <a href="/twin" target="_blank" rel="noreferrer">Open public twin ↗</a>
      </div>
      <p>Add verified professional knowledge. The server chunks, embeds, and indexes it in Supabase pgvector.</p>
      <form className="admin-form" onSubmit={ingest}>
        <label>Source type<select value={sourceType} onChange={(e) => setSourceType(e.target.value)}><option value="profile">Profile</option><option value="resume">Resume</option><option value="linkedin">LinkedIn</option><option value="project">Project</option><option value="note">Note</option><option value="document">Document</option><option value="custom">Custom</option></select></label>
        <label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} /></label>
        <label>Source URL (optional)<input value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} type="url" /></label>
        <label>Verified content<textarea value={rawContent} onChange={(e) => setRawContent(e.target.value)} rows={14} required minLength={40} /></label>
        <button className="button" disabled={busy}>{busy ? "Indexing…" : "Embed & index source"}</button>
        {status && <p className="form-status">{status}</p>}
      </form>
    </section>
  );
}
