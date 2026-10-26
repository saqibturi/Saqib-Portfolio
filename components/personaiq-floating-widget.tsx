"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import "./personaiq-floating-widget.css";
import { Bot, Minimize2, Send, Sparkles, UserRound, X } from "lucide-react";

type ChatMessage = { role: "user" | "assistant"; content: string; citations?: { marker: string; title: string; type: string; url?: string | null }[] };

function sessionId() {
  const key = "saqib-twin-session";
  try {
    const existing = window.localStorage.getItem(key);
    if (existing) return existing;
    const id = window.crypto.randomUUID();
    window.localStorage.setItem(key, id);
    return id;
  } catch {
    return window.crypto.randomUUID();
  }
}

const starters = [
  "Who is Saqib?",
  "Show me his best AI project",
  "What skills does he bring?",
];

export function PersonaIQFloatingWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sid, setSid] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setSid(sessionId()); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [messages, busy, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/login")) return null;

  async function send(question = input) {
    const clean = question.trim();
    if (!clean || busy || !sid) return;
    setInput("");
    setMessages((current) => [...current, { role: "user", content: clean }]);
    setBusy(true);
    try {
      const response = await fetch("/api/twin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: sid, question: clean }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "PersonaIQ could not answer just now.");
      setMessages((current) => [...current, { role: "assistant", content: result.answer, citations: result.citations }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "PersonaIQ is temporarily unavailable. Please try again." }]);
    } finally { setBusy(false); }
  }

  return (
    <div className="personaiq-widget" aria-live="polite">
      {open && (
        <section className="personaiq-window" role="dialog" aria-label="Chat with PersonaIQ" aria-modal="false">
          <header className="personaiq-header">
            <div className="personaiq-brand-icon"><Sparkles size={19} /></div>
            <div className="personaiq-heading"><strong>PersonaIQ</strong><span><i /> Saqib’s AI digital twin</span></div>
            <button className="personaiq-icon-button" type="button" onClick={() => setOpen(false)} aria-label="Minimize chat"><Minimize2 size={17} /></button>
          </header>
          <div className="personaiq-messages" aria-label="Conversation">
            <div className="personaiq-welcome"><div className="personaiq-welcome-icon"><Bot size={21} /></div><div><strong>Hey, I’m PersonaIQ.</strong><p>Ask me about Saqib’s AI projects, skills, experience, or fit for a role. I’ll use his portfolio knowledge to help.</p></div></div>
            {messages.length === 0 && <div className="personaiq-starters">{starters.map((s) => <button key={s} type="button" onClick={() => send(s)} disabled={busy || !sid}>{s}<span>↗</span></button>)}</div>}
            {messages.map((message, index) => <article className={`personaiq-message ${message.role}`} key={`${index}-${message.role}`}><span className="personaiq-message-avatar">{message.role === "assistant" ? <Bot size={15} /> : <UserRound size={15} />}</span><div className="personaiq-message-body"><p>{message.content}</p>{message.citations?.length ? <div className="personaiq-citations">{message.citations.filter((c) => c.url).slice(0, 3).map((c, i) => <a key={`${c.marker}-${i}`} href={c.url!} target="_blank" rel="noreferrer">{c.title || `Source ${i + 1}`} ↗</a>)}</div> : null}</div></article>)}
            {busy && <div className="personaiq-loading"><span /><span /><span /> <em>Looking through Saqib’s portfolio…</em></div>}
            <div ref={bottomRef} />
          </div>
          <form className="personaiq-composer" onSubmit={(event) => { event.preventDefault(); void send(); }}>
            <textarea aria-label="Your message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask me anything…" rows={1} maxLength={2000} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} />
            <button type="submit" aria-label="Send message" disabled={!input.trim() || busy || !sid}><Send size={17} /></button>
          </form>
          <footer className="personaiq-footnote">Powered by Saqib’s portfolio intelligence <a href="/twin">Explore PersonaIQ <span>↗</span></a></footer>
        </section>
      )}
      <div className="personaiq-quick-actions">
        <a
          className="personaiq-whatsapp"
          href="https://wa.me/923308925715?text=Hi%20Saqib%2C%20I%20visited%20your%20portfolio%20and%20would%20like%20to%20connect."
          target="_blank"
          rel="noreferrer"
          aria-label="Contact Saqib on WhatsApp"
          title="Chat on WhatsApp"
        >
          <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
            <path fill="currentColor" d="M16.04 3.2A12.7 12.7 0 0 0 5.1 22.35L3.4 28.6l6.4-1.68A12.7 12.7 0 1 0 16.04 3.2Zm0 23.1c-2 0-3.96-.54-5.66-1.56l-.4-.24-3.8 1 1.02-3.7-.26-.42a10.2 10.2 0 1 1 9.1 4.92Zm5.6-7.63c-.3-.15-1.8-.9-2.08-1-.28-.1-.48-.15-.68.15-.2.3-.78 1-.96 1.2-.18.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.5-.9-.8-1.5-1.8-1.68-2.1-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.68-1.64-.93-2.25-.24-.59-.49-.51-.68-.52h-.58c-.2 0-.53.08-.8.38-.28.3-1.06 1.04-1.06 2.54s1.09 2.95 1.24 3.15c.15.2 2.14 3.27 5.18 4.58.72.31 1.28.5 1.72.63.72.23 1.38.2 1.9.12.58-.09 1.8-.74 2.05-1.45.25-.72.25-1.33.17-1.45-.07-.13-.27-.2-.57-.35Z"/>
          </svg>
        </a>
        <button className={open ? "personaiq-launcher is-open" : "personaiq-launcher"} type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close PersonaIQ chat" : "Chat with PersonaIQ"} aria-expanded={open} title={open ? "Close PersonaIQ" : "Chat with PersonaIQ"}>
          {open ? <X size={21} /> : <Bot size={25} strokeWidth={1.9} />}
        </button>
      </div>
    </div>
  );
}
