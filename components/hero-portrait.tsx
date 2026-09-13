"use client";
import Image from "next/image";
import { useRef } from "react";
import { BrainCircuit, Code2, ArrowUpRight } from "lucide-react";
export function HeroPortrait({ photo, name }: { photo: string; name: string }) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      className="hero-portrait"
      ref={ref}
      onPointerMove={(e) => {
        if (
          e.pointerType !== "mouse" ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const b = e.currentTarget.getBoundingClientRect();
        ref.current?.style.setProperty(
          "--rx",
          `${(e.clientY - b.top - b.height / 2) / -90}deg`,
        );
        ref.current?.style.setProperty(
          "--ry",
          `${(e.clientX - b.left - b.width / 2) / 90}deg`,
        );
      }}
      onPointerLeave={() => {
        ref.current?.style.setProperty("--rx", "0deg");
        ref.current?.style.setProperty("--ry", "0deg");
      }}
    >
      <div className="portrait-topline">
        <span>THE PERSON BEHIND THE CODE</span>
        <span>SM / 01</span>
      </div>
      <div className="portrait-outline" aria-hidden="true" />
      <div className="portrait-frame">
        <Image
          src={photo || "/portrait.webp"}
          alt={`${name}, wearing a navy blazer with arms folded`}
          width={960}
          height={1200}
          priority
          sizes="(max-width: 760px) 90vw, 40vw"
        />
        <div className="portrait-caption">
          <span>{name}</span>
          <ArrowUpRight size={22} />
        </div>
      </div>
      <div className="portrait-bottomline">
        <span>THINK. BUILD. REFINE.</span>
        <span>↗</span>
      </div>
      <div className="floating-skill skill-ai">
        <span className="skill-icon">
          <BrainCircuit size={21} />
        </span>
        <div>
          <strong>AI & Machine Learning</strong>
          <span>Curiosity. Code. Possibility.</span>
        </div>
      </div>
      <div className="floating-skill skill-web">
        <span className="skill-icon">
          <Code2 size={21} />
        </span>
        <div>
          <strong>Web & Shopify</strong>
          <span>Built around your business.</span>
        </div>
      </div>
    </div>
  );
}
