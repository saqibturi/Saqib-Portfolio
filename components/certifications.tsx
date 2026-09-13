import Link from "next/link";
import Image from "next/image";
import { Award, ArrowUpRight, FileText } from "lucide-react";
import type { Certificate } from "@/lib/types";
export function CertificateCards({
  certificates,
}: {
  certificates: Certificate[];
}) {
  return certificates.length ? (
    <div className="certificate-grid">
      {certificates.map((c) => (
        <article className="certificate-card" key={c.id} data-reveal>
          {c.thumbnail ? (
            <Image
              className="certificate-art"
              src={c.thumbnail}
              alt={c.alt || c.title}
              width={600}
              height={400}
            />
          ) : (
            <div className="certificate-symbol">
              <Award size={25} />
            </div>
          )}
          <p className="eyebrow">{c.issuer}</p>
          <h3>{c.title}</h3>
          <div className="certificate-meta">
            {c.issued && (
              <span>
                Issued{" "}
                {new Date(c.issued + "T00:00:00Z").toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                  timeZone: "UTC",
                })}
              </span>
            )}
            {c.expires && <span> · Expires {c.expires}</span>}
            {c.credentialId && <div>Credential: {c.credentialId}</div>}
          </div>
          {c.description && <p className="prose">{c.description}</p>}
          <div className="tags">
            {c.skills.map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
          <div className="actions">
            {c.file && (
              <a
                href={c.file}
                className="text-link"
                target="_blank"
                rel="noreferrer"
              >
                Certificate <FileText size={16} />
              </a>
            )}
            {c.verificationUrl && (
              <a
                href={c.verificationUrl}
                className="text-link"
                target="_blank"
                rel="noreferrer"
              >
                Verify <ArrowUpRight size={16} />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="certificate-empty">
      <div className="certificate-symbol">
        <Award size={24} />
      </div>
      <div>
        <h3>Learning is an ongoing commitment.</h3>
        <p>Verified certificates will appear here as I add them.</p>
      </div>
    </div>
  );
}
export function Certifications({
  certificates,
}: {
  certificates: Certificate[];
}) {
  return (
    <section id="certifications" className="container section" data-reveal>
      <div className="section-heading">
        <div>
          <p className="eyebrow">05 / LEARNING & CREDENTIALS</p>
          <h2>
            Knowledge worth
            <br />
            <span className="muted">building on.</span>
          </h2>
        </div>
        <Link className="text-link" href="/certifications">
          All certifications <ArrowUpRight size={18} />
        </Link>
      </div>
      <CertificateCards certificates={certificates.slice(0, 3)} />
    </section>
  );
}
