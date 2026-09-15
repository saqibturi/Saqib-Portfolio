"use client";

import { useState } from "react";

const sourceOptions = [
  ["profile", "Profile"],
  ["resume", "Resume / CV"],
  ["linkedin", "LinkedIn"],
  ["project", "Project"],
  ["certificate", "Certificate"],
  ["goal", "Goals"],
  ["calendar", "Calendar export"],
  ["note", "Notes"],
  ["journal", "Journal"],
  ["document", "Document"],
  ["custom", "Custom"],
] as const;

export function AdminTwin() {
  const [title, setTitle] = useState("");
  const [sourceType, setSourceType] = useState("resume");
  const [visibility, setVisibility] = useState<"private" | "twin" | "public">("twin");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rawContent, setRawContent] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function changeSourceType(next: string) {
    setSourceType(next);
    if (["journal", "calendar", "goal", "note"].includes(next)) setVisibility("private");
    else setVisibility("twin");
  }

  async function loadTextFile(file: File | undefined) {
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    const supported = ["txt", "md", "csv", "json", "ics", "html", "log"];
    if (!extension || !supported.includes(extension)) {
      setStatus("For this build, direct import supports TXT, MD, CSV, JSON, ICS, HTML and LOG. Paste extracted PDF/DOCX text below; native PDF/DOCX extraction is the next ingestion adapter.");
      return;
    }
    const text = await file.text();
    setRawContent(text);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
    setStatus(`Loaded ${file.name}. Review the text and privacy level before indexing.`);
  }

  async function ingest(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus("Chunking, embedding, indexing, and extracting portfolio-intelligence signals…");
    try {
      const response = await fetch("/api/twin/source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, sourceType, visibility, sourceUrl, rawContent }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Ingestion failed");
      setStatus(
        json.unchanged
          ? `Source is already up to date. Visibility: ${json.visibility}.`
          : `Indexed ${json.chunks} semantic chunks · extracted ${json.signals?.events || 0} milestones, ${json.signals?.skills || 0} skill signals, and ${json.signals?.goals || 0} goals.`,
      );
      setTitle("");
      setSourceUrl("");
      setRawContent("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Ingestion failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel">
      <div className="admin-heading">
        <div>
          <p className="eyebrow">AI DIGITAL TWIN + PORTFOLIO INTELLIGENCE</p>
          <h1>Knowledge workspace</h1>
        </div>
        <a className="button secondary" href="/twin" target="_blank" rel="noreferrer">Open public experience ↗</a>
      </div>

      <div className="notice">
        <strong>Privacy model:</strong> Private sources are owner-only. Twin sources may ground public AI answers but are not displayed as public timeline data. Public sources can also appear in the Life Map and shareable intelligence views.
      </div>

      <form className="form-grid" onSubmit={ingest}>
        <label>
          Source type
          <select value={sourceType} onChange={(event) => changeSourceType(event.target.value)}>
            {sourceOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>

        <label>
          Visibility
          <select value={visibility} onChange={(event) => setVisibility(event.target.value as "private" | "twin" | "public")}>
            <option value="private">Private — analysis only</option>
            <option value="twin">Twin — can ground AI answers</option>
            <option value="public">Public — can appear in Life Map</option>
          </select>
        </label>

        <label className="full-span">
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} required minLength={2} placeholder="e.g. Resume 2026, AI Agent Project Notes" />
        </label>

        <label className="full-span">
          Import text-based file
          <input type="file" accept=".txt,.md,.csv,.json,.ics,.html,.log,text/*" onChange={(event) => loadTextFile(event.target.files?.[0])} />
        </label>

        <label className="full-span">
          Source URL (optional)
          <input value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} type="url" placeholder="https://…" />
        </label>

        <label className="full-span">
          Verified source content
          <textarea value={rawContent} onChange={(event) => setRawContent(event.target.value)} rows={16} required minLength={40} placeholder="Paste resume, project description, notes, journal extract, goals, LinkedIn content, or calendar text here…" />
        </label>

        <div className="full-span editor-actions">
          <button className="button" disabled={busy}>{busy ? "Building intelligence…" : "Analyze, embed & index"}</button>
          <span className="status-message" aria-live="polite">{status}</span>
        </div>
      </form>
    </section>
  );
}
