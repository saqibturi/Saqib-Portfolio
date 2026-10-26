"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bot, ChevronDown, MessageCircle, Minimize2, Send, Sparkles, UserRound, X } from "lucide-react";

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
      <button className={`personaiq-launcher${open ? " is-open" : ""}`} type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? "Close PersonaIQ chat" : "Chat with PersonaIQ"} aria-expanded={open}>
        {open ? <X size={22} /> : <><span className="personaiq-launcher-spark"><Sparkles size={16} /></span><MessageCircle size={22} /><span className="personaiq-launcher-label">Ask PersonaIQ</span><ChevronDown className="personaiq-launcher-chevron" size={15} /></>}
      </button>
    </div>
  );
}
