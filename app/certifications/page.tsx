import { getCertificates } from "@/lib/data";
import { CertificateCards } from "@/components/certifications";
import { ContactCTA } from "@/components/public";
export const metadata = {
  title: "Certifications",
  description:
    "Professional certificates, learning credentials, and verification links from Saqib Muhammad.",
  alternates: { canonical: "/certifications" },
};
export default async function Certificates() {
  return (
    <>
      <section className="container page-section">
        <p className="eyebrow">LEARNING & CREDENTIALS</p>
        <h1>
          Never stop
          <br />
          <span className="headline-accent">getting better.</span>
        </h1>
        <p className="lead">
          Certificates and credentials that support my journey in technology.
        </p>
        <div className="certification-list">
          <CertificateCards certificates={await getCertificates()} />
        </div>
      </section>
      <ContactCTA />
    </>
  );
}
