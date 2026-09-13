import Image from "next/image";
import { getProfile } from "@/lib/data";
import { Expertise, Experience, ContactCTA } from "@/components/public";
export async function generateMetadata() {
  const p = await getProfile();
  return { ...p.pageSeo.about, alternates: { canonical: "/about" } };
}
export default async function About() {
  const p = await getProfile();
  return (
    <>
      <section className="container page-section about-page">
        <div>
          <p className="eyebrow">BEHIND THE WORK</p>
          <h1>
            Hi, I’m <span className="headline-accent">Saqib.</span>
          </h1>
          <p className="hero-role">{p.title}</p>
          <div className="prose large-copy">{p.about}</div>
          {p.resume && (
            <a className="button secondary" href={p.resume} download>
              Download résumé ↓
            </a>
          )}
        </div>
        <Image
          className="about-photo"
          src={p.photo || "/portrait.webp"}
          alt={p.name}
          width={960}
          height={1200}
        />
      </section>
      <Experience profile={p} />
      <Expertise profile={p} />
      <ContactCTA />
    </>
  );
}
