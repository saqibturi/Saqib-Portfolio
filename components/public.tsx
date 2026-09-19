import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  ArrowRight,
  BrainCircuit,
  Code2,
  ShoppingBag,
  ChartNoAxesCombined,
  MapPin,
} from "lucide-react";
import type { Profile, Project } from "@/lib/types";
export function Footer({ profile: p }: { profile: Profile }) {
  return (
    <footer className="container footer">
      <div className="footer-top">
        <Link href="/" className="wordmark" aria-label={`${p.name} home`}>
          <Image
            src="/logo.png"
            alt={`${p.name} logo`}
            width={172}
            height={54}
            sizes="(max-width: 760px) 180px, 280px"
            style={{
              width: "clamp(180px, 24vw, 280px)",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </Link>
        <p>Building with purpose. Learning with curiosity.</p>
        <a href="#top" className="back-top">
          Back to top ↑
        </a>
      </div>
      <div className="footer-bottom">
        <span>
          © {new Date().getFullYear()} {p.name}
        </span>
        <div className="socials">
          {p.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
              <ArrowUpRight size={14} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
export function ContactCTA() {
  return (
    <section className="container section contact-cta" data-reveal>
      <div>
        <p className="eyebrow">LET’S BUILD SOMETHING USEFUL</p>
        <h2>
          Have an idea?
          <br />
          <span className="muted">Let’s make it happen.</span>
        </h2>
      </div>
      <Link href="/contact" className="round-cta" aria-label="Contact Saqib">
        <ArrowUpRight size={42} />
      </Link>
    </section>
  );
}
export function Expertise({ profile: p }: { profile: Profile }) {
  const icons = [BrainCircuit, Code2, ShoppingBag, ChartNoAxesCombined];
  return (
    <section
      id="expertise"
      className="container section expertise-section"
      data-reveal
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">01 / WHAT I BRING</p>
          <h2>
            A toolkit for
            <br />
            <span className="muted">what comes next.</span>
          </h2>
        </div>
        <p className="section-intro">
          From training a model to bringing an online store to life, I enjoy
          making technology useful.
        </p>
      </div>
      <div className="expertise-grid">
        {p.expertise.map((e, i) => {
          const Icon = icons[i % 4];
          return (
            <article key={e.title} className="expertise-card" data-reveal>
              <div className="card-top">
                <Icon size={26} />
                <span>0{i + 1}</span>
              </div>
              <h3>{e.title}</h3>
              <p>{e.description}</p>
              <div className="tags">
                {e.tags.map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
export function ProjectCard({ project: p }: { project: Project }) {
  return (
    <Link href={`/projects/${p.slug}`} className="project-card">
      <div className="project-cover">
        {p.cover ? (
          <Image
            src={p.cover}
            alt={p.coverAlt || p.title}
            width={900}
            height={600}
          />
        ) : (
          <div className="project-type">
            <Code2 size={48} />
            <span>{p.category}</span>
          </div>
        )}
        <span className="project-arrow">
          <ArrowUpRight />
        </span>
      </div>
      <div className="project-meta">
        <span className="eyebrow">{p.category}</span>
        <h3>{p.title}</h3>
        <p>{p.summary}</p>
        <div className="tags">
          {p.tags.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
export function SelectedProjects({ projects }: { projects: Project[] }) {
  const selected = projects.filter((p) => p.featured).slice(0, 4);
  return (
    <section id="work" className="container section" data-reveal>
      <div className="section-heading">
        <div>
          <p className="eyebrow">02 / SELECTED WORK</p>
          <h2>
            Ideas into <span className="muted">practice.</span>
          </h2>
        </div>
        <Link href="/projects" className="text-link">
          Explore projects <ArrowUpRight size={18} />
        </Link>
      </div>
      {selected.length ? (
        <div className="project-grid">
          {selected.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="work-empty">
          <div>
            <Code2 size={30} />
            <h3>Explore the code behind the curiosity.</h3>
            <p>
              Explore my repositories, follow what I’m learning, or get in touch
              to discuss the next thing we could build together.
            </p>
          </div>
          <a
            href="https://github.com/saqibturi"
            target="_blank"
            rel="noreferrer"
            className="button secondary"
          >
            Explore GitHub <ArrowUpRight size={18} />
          </a>
        </div>
      )}
    </section>
  );
}
export function AboutSnippet({ profile: p }: { profile: Profile }) {
  return (
    <section className="container section about-split" data-reveal>
      <div>
        <p className="eyebrow">03 / A LITTLE ABOUT ME</p>
        <h2>
          Technology meets
          <br />
          <span className="muted">business thinking.</span>
        </h2>
        <p className="location">
          <MapPin size={16} />
          {p.location}
        </p>
      </div>
      <div>
        <p className="large-copy">{p.about.split("\n\n")[0]}</p>
        <p>{p.about.split("\n\n").slice(1).join("\n\n")}</p>
        <Link className="text-link" href="/about">
          More about me <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
export function Experience({ profile: p }: { profile: Profile }) {
  return (
    <section className="container section journey" data-reveal>
      <div>
        <p className="eyebrow">04 / THE JOURNEY SO FAR</p>
        <h2>
          Always <span className="muted">learning.</span>
        </h2>
      </div>
      <div className="timeline">
        {[...p.experience, ...p.education].map((e, i) => (
          <article key={i}>
            <div className="timeline-meta">
              <span>{e.period}</span>
              <span>
                {i < p.experience.length ? "EXPERIENCE" : "EDUCATION"}
              </span>
            </div>
            <h3>{e.title}</h3>
            <p className="organization">{e.organization}</p>
            <p>{e.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
export function CaseStudy({ project: p }: { project: Project }) {
  return (
    <article className="container case-study">
      <Link className="text-link" href="/projects">
        ← All projects
      </Link>
      <p className="eyebrow">{p.category}</p>
      <h1>{p.title}</h1>
      <p className="lead">{p.summary}</p>
      <div className="tags">
        {p.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      {p.cover && (
        <Image
          className="case-cover"
          src={p.cover}
          alt={p.coverAlt || p.title}
          width={1400}
          height={900}
        />
      )}
      <div className="case-facts">
        {p.role && (
          <div>
            <small>ROLE</small>
            <p>{p.role}</p>
          </div>
        )}
        {p.timeline && (
          <div>
            <small>TIMELINE</small>
            <p>{p.timeline}</p>
          </div>
        )}
        <div className="actions">
          {p.github && (
            <a
              className="button secondary"
              href={p.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub <ArrowUpRight size={16} />
            </a>
          )}
          {p.demo && (
            <a
              className="button"
              href={p.demo}
              target="_blank"
              rel="noreferrer"
            >
              Live demo <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
      <div className="case-content">
        {(
          [
            "problem",
            "approach",
            "data",
            "implementation",
            "evaluation",
            "limitations",
            "outcomes",
          ] as const
        )
          .filter((k) => p[k])
          .map((k) => (
            <section key={k} data-reveal>
              <h2>{k[0].toUpperCase() + k.slice(1)}</h2>
              <div className="prose">{p[k]}</div>
            </section>
          ))}
      </div>
      {p.gallery.map((g, i) => (
        <figure key={i}>
          <Image src={g.url} alt={g.alt} width={1400} height={900} />
          {g.caption && <figcaption>{g.caption}</figcaption>}
        </figure>
      ))}
    </article>
  );
}
