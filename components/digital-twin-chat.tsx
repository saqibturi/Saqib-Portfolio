"use client";

import { useMemo, useState } from "react";
import { Bot, Send, Sparkles, UserRound } from "lucide-react";

type Citation = { marker: string; title: string; type: string; url?: string | null };
type Message = { role: "user" | "assistant"; content: string; citations?: Citation[] };

function getSessionId() {
  if (typeof window === "undefined") return crypto.randomUUID();
  const key = "saqib-twin-session";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem(key, id);
  return id;
}

export function DigitalTwinChat() {
  const sessionId = useMemo(getSessionId, []);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "I’m PersonaIQ — a source-grounded digital twin of Saqib Muhammad’s professional knowledge. Ask me about his projects, technical strengths, experience, or what he is currently building." },
  ]);

  async function send(question = input) {
    const clean = question.trim();
    if (!clean || busy) return;
    setInput("");
    setBusy(true);
    setMessages((current) => [...current, { role: "user", content: clean }]);
    try {
      const response = await fetch("/api/twin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, question: clean }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Request failed");
      setMessages((current) => [...current, { role: "assistant", content: json.answer, citations: json.citations }]);
    } catch (error) {
      setMessages((current) => [...current, { role: "assistant", content: error instanceof Error ? error.message : "PersonaIQ is temporarily unavailable." }]);
    } finally {
      setBusy(false);
    }
  }

  const suggestions = [
    "What are Saqib’s strongest AI skills?",
    "Which project best shows his engineering ability?",
    "Explain Saqib’s experience to a recruiter.",
    "What should an AI student learn from his projects?",
  ];

  return (
    <div className="twin-shell">
      <aside className="twin-sidebar">
        <div className="twin-orb"><Sparkles size={28} /></div>
        <p className="eyebrow">AI DIGITAL TWIN</p>
        <h2>Talk to my professional knowledge.</h2>
        <p>This agent retrieves evidence from my portfolio knowledge base before it answers. It is designed to be transparent, source-aware, and recruiter friendly.</p>
        <div className="twin-suggestions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => send(suggestion)} disabled={busy}>{suggestion}</button>
          ))}
        </div>
      </aside>
      <section className="twin-chat-panel" aria-label="PersonaIQ chat">
        <div className="twin-status"><span /> Retrieval + Memory + Gemini reasoning online</div>
        <div className="twin-messages">
          {messages.map((message, index) => (
            <article className={`twin-message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="twin-avatar">{message.role === "assistant" ? <Bot size={18} /> : <UserRound size={18} />}</div>
              <div>
                <p>{message.content}</p>
                {message.citations && message.citations.length > 0 && (
                  <div className="twin-citations">
                    {message.citations.slice(0, 5).map((citation) => citation.url ? (
                      <a key={citation.marker} href={citation.url} target="_blank" rel="noreferrer">[{citation.marker}] {citation.title}</a>
                    ) : <span key={citation.marker}>[{citation.marker}] {citation.title}</span>)}
                  </div>
                )}
              </div>
            </article>
          ))}
          {busy && <div className="twin-thinking">PersonaIQ is retrieving evidence…</div>}
        </div>
        <form className="twin-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about projects, AI skills, experience, or engineering decisions…" rows={2} maxLength={2000} />
          <button type="submit" aria-label="Send message" disabled={busy || !input.trim()}><Send size={19} /></button>
        </form>
      </section>
    </div>
  );
}
