"use client";
import { useEffect, useState } from "react";
import { ConfirmButton, adminAction } from "./admin-helpers";
type Message = {
  id: string;
  name: string;
  email: string;
  company: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
};
export function Inbox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [count, setCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const r = await fetch(
          `/api/admin?resource=messages&page=${page}&status=${filter}&q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        const d = await r.json();
        if (!r.ok) throw new Error(d.error);
        setMessages(d.data);
        setCount(d.count);
      } catch (e) {
        if (!controller.signal.aborted)
          setError(e instanceof Error ? e.message : "Unable to load");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 200);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, filter, page, revision]);
  return (
    <>
      <div className="admin-heading">
        <h1>Contact inbox</h1>
        <a
          className="button secondary small-button"
          href="/api/admin?resource=export"
        >
          Export CSV ↓
        </a>
      </div>
      <div className="admin-filter">
        <label className="sr-only" htmlFor="inbox-search">
          Search messages
        </label>
        <input
          id="inbox-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          placeholder="Search name, email, or message"
        />
        <label className="sr-only" htmlFor="inbox-status">
          Status
        </label>
        <select
          id="inbox-status"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setPage(0);
          }}
        >
          {["all", "unread", "read", "replied", "archived"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      {loading && <p role="status">Loading messages…</p>}
      {error && (
        <p role="alert" className="form-error">
          {error}
        </p>
      )}
      {!loading && !messages.length && !error && (
        <div className="panel">
          <h2>No messages here yet.</h2>
          <p>Accepted contact enquiries will appear here.</p>
        </div>
      )}
      {messages.map((m) => (
        <article className="panel" key={m.id}>
          <div className="message-header">
            <div>
              <h2>{m.name}</h2>
              <a href={`mailto:${m.email}`}>{m.email}</a>
              <p>
                {m.company}
                {m.company ? " · " : ""}
                {m.type}
              </p>
            </div>
            <div>
              <p>{new Date(m.created_at).toLocaleString()}</p>
              <label>
                Status
                <select
                  value={m.status}
                  onChange={async (e) => {
                    try {
                      await adminAction({
                        action: "message-status",
                        id: m.id,
                        status: e.target.value,
                      });
                      setRevision((r) => r + 1);
                    } catch (err) {
                      setError(
                        err instanceof Error ? err.message : "Could not update",
                      );
                    }
                  }}
                >
                  {["unread", "read", "replied", "archived"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>
          <p className="message-body">{m.message}</p>
          <div className="actions">
            <a
              className="button secondary small-button"
              href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.type}`)}`}
            >
              Draft reply ↗
            </a>
            <ConfirmButton
              danger
              label="Delete message"
              message="Permanently delete this enquiry?"
              onConfirm={async () => {
                await adminAction({ action: "delete-message", id: m.id });
                setRevision((r) => r + 1);
              }}
            />
          </div>
          <small className="muted">
            Mark as replied after you actually send your response.
          </small>
        </article>
      ))}
      <div className="pagination">
        <button
          className="button secondary small-button"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Previous
        </button>
        <span>
          {page + 1} / {Math.max(1, Math.ceil(count / 20))}
        </span>
        <button
          className="button secondary small-button"
          disabled={(page + 1) * 20 >= count}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </>
  );
}
