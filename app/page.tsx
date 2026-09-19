import { Certifications } from "@/components/certifications";
import type { Metadata } from "next";
import { HeroPortrait } from "@/components/hero-portrait";
import Link from "next/link";
import {
  ArrowUpRight,
  Download,
  ArrowRight,
} from "lucide-react";
import { getProfile, getProjects, getCertificates } from "@/lib/data";
import { siteUrl } from "@/lib/profile";
import {
  Expertise,
  SelectedProjects,
  AboutSnippet,
  Experience,
  ContactCTA,
} from "@/components/public";
export const metadata: Metadata = { alternates: { canonical: "/" } };
export default async function Home() {
  const [p, projects, certificates] = await Promise.all([
    getProfile(),
    getProjects(),
    getCertificates(),
  ]);
  return (
    <>
      <div className="hero-stage">
        <section className="container hero">
          <div className="hero-copy">
            <h1>
              {p.heroHeadline}
              <br />
              <span className="headline-accent">{p.heroAccent}</span>
            </h1>
            <p className="hero-role">
              Hi, I’m <strong>{p.name}.</strong>
            </p>
            <p className="hero-description">{p.intro}</p>
            <div className="actions">
              <Link className="button" href="/projects">
                Explore my work <ArrowUpRight size={19} />
              </Link>
              <Link className="button secondary" href="/contact">
                Get in touch <ArrowRight size={19} />
              </Link>
            </div>
            {p.resume && (
              <a className="text-link resume" href={p.resume} download>
                Download résumé <Download size={16} />
              </a>
            )}
          </div>
          <HeroPortrait photo={p.photo} name={p.name} />
        </section>
      </div>
      <section
        className="container proof-strip"
        aria-label="Background at a glance"
      >
        <div>
          <strong>
            02<span>+</span>
          </strong>
          <p>
            Years of hands-on
            <br />
            ecommerce experience
          </p>
        </div>
        <div>
          <strong>AI</strong>
          <p>
            Bachelor’s degree
            <br />
            in progress
          </p>
        </div>
        <div>
          <strong>01</strong>
          <p>
            Internship completed
            <br />
            Rhombix Technologies
          </p>
        </div>
        <a href="https://github.com/saqibturi" target="_blank" rel="noreferrer">
          Follow the work
          <ArrowUpRight size={24} />
        </a>
      </section>
      <div className="skills-strip">
        <p className="stack-caption">THE TOOLS BEHIND THE IDEAS</p>
        <div className="container">
          <span>PYTHON</span>
          <i /> <span>MACHINE LEARNING</span>
          <i />
          <span>WEB DEVELOPMENT</span>
          <i />
          <span>SHOPIFY</span>
          <i />
          <span>C++</span>
        </div>
      </div>
      {p.sections.map((section) =>
        section === "expertise" ? (
          <Expertise key={section} profile={p} />
        ) : section === "projects" ? (
          <SelectedProjects key={section} projects={projects} />
        ) : section === "about" ? (
          <AboutSnippet key={section} profile={p} />
        ) : section === "certifications" ? (
          <Certifications key={section} certificates={certificates} />
        ) : (
          <Experience key={section} profile={p} />
        ),
      )}
      <ContactCTA />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            name: p.name,
            url: siteUrl(),
            image: siteUrl() + p.photo,
            jobTitle: p.title,
            sameAs: p.socials.map((s) => s.url),
            knowsAbout: p.expertise.map((e) => e.title),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
