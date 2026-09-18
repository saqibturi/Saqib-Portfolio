"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Menu, X } from "lucide-react";

export function Navigation({ name }: { name: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    nav.current?.querySelector("a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); button.current?.focus(); }
      if (e.key === "Tab") {
        const items = Array.from(nav.current?.querySelectorAll<HTMLAnchorElement>("a") || []);
        const first = items[0], last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", key); };
  }, [open]);

  return (
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" className="wordmark" aria-label={`${name} home`}>
          <Image
            src="/logo.png"
            alt={`${name} logo`}
            width={172}
            height={54}
            priority
            sizes="(max-width: 760px) 180px, 280px"
            style={{
              width: "clamp(180px, 24vw, 280px)",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </Link>
        <button ref={button} className="icon-button mobile-toggle" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} aria-controls="main-navigation" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav ref={nav} id="main-navigation" className={open ? "navigation open" : "navigation"} aria-label="Main navigation">
          {[["/","Home"],["/projects","Projects"],["/twin","PersonaIQ"],["/about","About"],["/certifications","Certifications"]].map(([href,label]) => <Link key={href} href={href} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>{label}</Link>)}
          <Link className="nav-cta" href="/contact" onClick={() => setOpen(false)}>Let’s talk <ArrowUpRight size={17} /></Link>
        </nav>
      </div>
    </header>
  );
}
