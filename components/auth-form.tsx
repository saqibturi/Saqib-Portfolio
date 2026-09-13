"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function AuthForm({
  reset = false,
  configured = true,
}: {
  reset?: boolean;
  configured?: boolean;
}) {
  const router = useRouter();
  const [recover, setRecover] = useState(false);
  const [status, setStatus] = useState("");
  const [pending, setPending] = useState(false);
  return (
    <div className="login-panel">
      <p className="eyebrow">OWNER ACCESS</p>
      <h1>
        {reset
          ? "Set a new password"
          : recover
            ? "Recover access"
            : "Welcome back."}
      </h1>
      <p>
        {reset
          ? "Use a unique password of at least 12 characters."
          : recover
            ? "We’ll send a recovery link if this email has an account."
            : "Sign in to manage your projects and messages."}
      </p>
      {!configured && (
        <p className="notice">
          Owner access is not connected yet. Complete the Supabase setup in the
          included owner guide to enable sign-in.
        </p>
      )}
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setPending(true);
          setStatus("");
          const values = Object.fromEntries(new FormData(e.currentTarget));
          try {
            const r = await fetch("/api/auth", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...values,
                action: reset ? "reset" : recover ? "recover" : "login",
              }),
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d.error);
            if (recover)
              setStatus(
                "If the account exists, a recovery link has been sent. Check your inbox.",
              );
            else {
              router.push("/admin");
              router.refresh();
            }
          } catch (err) {
            setStatus(err instanceof Error ? err.message : "Please try again.");
          } finally {
            setPending(false);
          }
        }}
      >
        {!reset && (
          <label>
            Email address
            <input type="email" name="email" required autoComplete="email" />
          </label>
        )}
        {!recover && (
          <label>
            {reset ? "New password" : "Password"}
            <input
              type="password"
              name="password"
              required
              minLength={reset ? 12 : 1}
              maxLength={200}
              autoComplete={reset ? "new-password" : "current-password"}
            />
          </label>
        )}
        <p role="status" className="status-message">
          {status}
        </p>
        <button className="button" disabled={!configured || pending}>
          {pending
            ? "Please wait…"
            : reset
              ? "Save password"
              : recover
                ? "Send recovery link"
                : "Sign in"}
        </button>
      </form>
      {!reset && (
        <button
          className="text-link"
          style={{ background: "none", border: 0, padding: 0, marginTop: 15 }}
          onClick={() => {
            setRecover(!recover);
            setStatus("");
          }}
        >
          {recover ? "Back to sign in" : "Forgot your password?"}
        </button>
      )}
    </div>
  );
}
