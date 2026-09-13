"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="container empty-state">
      <h1>Something didn’t load.</h1>
      <p>Please try again in a moment.</p>
      <button className="button" onClick={reset}>
        Try again
      </button>
    </section>
  );
}
