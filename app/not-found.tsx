import Link from "next/link";
export default function NotFound() {
  return (
    <section className="container empty-state">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>
        This page took
        <br />a different path.
      </h1>
      <p>The link may have changed, or this project is no longer public.</p>
      <Link className="button" href="/">
        Back to home ↗
      </Link>
    </section>
  );
}
