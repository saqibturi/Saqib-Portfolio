import { ArrowUpRight, Mail, Phone, MapPin } from "lucide-react";
import { getProfile } from "@/lib/data";
import { ContactForm } from "@/components/contact-form";
export async function generateMetadata() {
  const p = await getProfile();
  return { ...p.pageSeo.contact, alternates: { canonical: "/contact" } };
}
export default async function Contact() {
  const p = await getProfile();
  return (
    <section className="container page-section contact-page">
      <div>
        <p className="eyebrow">LET’S CONNECT</p>
        <h1>
          Good things start
          <br />
          with <span className="headline-accent">a conversation.</span>
        </h1>
        <p className="lead">
          Have a project in mind, an opportunity to share, or just want to say
          hello? I’d love to hear from you.
        </p>
        <div className="contact-details">
          <a href={`mailto:${p.email}`}>
            <Mail size={20} />
            <span>{p.email}</span>
          </a>
          <a href={`tel:${p.phone}`}>
            <Phone size={20} />
            <span>{p.phone}</span>
          </a>
          <p>
            <MapPin size={20} />
            {p.location}
          </p>
        </div>
        <div className="socials">
          {p.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer">
              {s.label}
              <ArrowUpRight size={15} />
            </a>
          ))}
        </div>
      </div>
      <ContactForm />
    </section>
  );
}
