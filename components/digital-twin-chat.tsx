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
    {
      role: "assistant",
      content:
        "Hi — I’m PersonaIQ, Saqib Muhammad’s AI Digital Twin. I answer from his current portfolio, projects, experience, education, and indexed professional knowledge. Ask me anything about his work or suitability for a role.",
    },
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
    "Who is Saqib Muhammad?",
    "What are Saqib’s strongest skills?",
    "Show me Saqib’s best AI project.",
    "What professional experience does Saqib have?",
    "Why should I interview Saqib?",
    "Is Saqib suitable for a Junior AI Engineer role?",
  ];

  return (
    <div className="twin-shell">
      <aside className="twin-sidebar">
        <div className="twin-orb"><Sparkles size={28} /></div>
        <p className="eyebrow">SAQIB MUHAMMAD · AI DIGITAL TWIN</p>
        <h2>Meet PersonaIQ.</h2>
        <p>
          Ask about Saqib’s skills, projects, education, experience, or fit for a role.
          PersonaIQ grounds answers in his current portfolio knowledge before responding.
        </p>
        <div className="twin-trust">
          <span>Profile grounded</span>
          <span>Source aware</span>
          <span>Recruiter friendly</span>
        </div>
        <p className="twin-try-label">Try asking</p>
        <div className="twin-suggestions">
          {suggestions.map((suggestion) => (
            <button key={suggestion} type="button" onClick={() => send(suggestion)} disabled={busy}>{suggestion}</button>
          ))}
        </div>
      </aside>
      <section className="twin-chat-panel" aria-label="PersonaIQ chat">
        <div className="twin-chat-header">
          <div className="twin-chat-identity">
            <div className="twin-mini-orb"><Sparkles size={17} /></div>
            <div>
              <strong>PersonaIQ</strong>
              <span>Saqib Muhammad’s AI Digital Twin</span>
            </div>
          </div>
          <div className="twin-status"><span /> Portfolio intelligence online</div>
        </div>
        <div className="twin-messages">
          {messages.map((message, index) => (
            <article className={`twin-message ${message.role}`} key={`${message.role}-${index}`}>
              <div className="twin-avatar">{message.role === "assistant" ? <Bot size={18} /> : <UserRound size={18} />}</div>
              <div>
                <p>{message.content}</p>

              </div>
            </article>
          ))}
          {busy && <div className="twin-thinking">PersonaIQ is retrieving evidence…</div>}
        </div>
        <form className="twin-composer" onSubmit={(event) => { event.preventDefault(); send(); }}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about Saqib’s skills, projects, education, experience, or role fit…"
            rows={2}
            maxLength={2000}
          />
          <button type="submit" aria-label="Send message" disabled={busy || !input.trim()}><Send size={19} /></button>
        </form>
      </section>
    </div>
  );
}
