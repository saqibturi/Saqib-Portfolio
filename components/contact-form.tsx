"use client";
import { useState } from "react";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
export function ContactForm() {
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  const [sent, setSent] = useState(false);
  const [id, setId] = useState("");
  return sent ? (
    <div className="form-success" role="status">
      <CheckCircle2 size={36} />
      <h2>Message received.</h2>
      <p>
        Thanks for reaching out. I’ll get back to you using the email you
        provided.
      </p>
      <button
        className="button secondary"
        onClick={() => {
          setSent(false);
          setId("");
          setStatus("");
        }}
      >
        Send another message
      </button>
    </div>
  ) : (
    <form
      className="contact-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setStatus("");
        const submissionId = id || crypto.randomUUID();
        setId(submissionId);
        try {
          const values = Object.fromEntries(new FormData(e.currentTarget));
          const res = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...values, submissionId }),
          });
          const data = await res.json();
          if (!res.ok)
            throw new Error(data.error || "Unable to send. Please try again.");
          setSent(true);
        } catch (err) {
          setStatus(
            err instanceof Error
              ? err.message
              : "Unable to send. Please email me directly.",
          );
        } finally {
          setPending(false);
        }
      }}
    >
      <div className="form-grid">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            minLength={2}
            maxLength={100}
            required
            placeholder="Your full name"
          />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
            placeholder="you@company.com"
          />
        </label>
      </div>
      <div className="form-grid">
        <label>
          Company <span className="muted">(optional)</span>
          <input
            name="company"
            autoComplete="organization"
            maxLength={150}
            placeholder="Where you work"
          />
        </label>
        <label>
          What brings you here?
          <select name="type">
            <option>Project enquiry</option>
            <option>Job opportunity</option>
            <option>Collaboration</option>
            <option>Other</option>
          </select>
        </label>
      </div>
      <label>
        Your message
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder="Tell me a little about your project or opportunity…"
          aria-describedby="message-help"
        />
        <small id="message-help">At least 20 characters.</small>
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="privacy">
        Your details are used only to respond to your enquiry and are stored
        privately. You can request deletion by email.
      </p>
      {status && (
        <p className="form-error" role="alert">
          {status}
        </p>
      )}
      <button disabled={pending} className="button">
        {pending ? "Sending…" : "Send message"} <ArrowUpRight size={18} />
      </button>
    </form>
  );
}
