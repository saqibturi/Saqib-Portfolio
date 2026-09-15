import type { Metadata } from "next";
import { DigitalTwinChat } from "@/components/digital-twin-chat";
import { PortfolioIntelligence } from "@/components/portfolio-intelligence";
import "./twin.css";
import "./twin-overrides.css";

export const metadata: Metadata = {
  title: "PersonaIQ — Digital Twin + Portfolio Intelligence",
  description: "Explore PersonaIQ, Saqib Muhammad's source-grounded AI Digital Twin with an interactive Life Map, portfolio intelligence, and evidence-based Recruiter Mode.",
  alternates: { canonical: "/twin" },
};

export default function TwinPage() {
  return (
    <main className="container page-section twin-page">
      <div className="twin-heading">
        <p className="eyebrow">FLAGSHIP AI PROJECT</p>
        <h1>Meet <span className="headline-accent">PersonaIQ.</span></h1>
        <p className="lead">
          A professional digital twin and portfolio-intelligence system powered by retrieval-augmented generation, semantic memory, evidence extraction, and explainable recruiter analysis.
        </p>
      </div>

      <DigitalTwinChat />

      <section className="twin-architecture" aria-labelledby="architecture-title">
        <div>
          <p className="eyebrow">SYSTEM DESIGN</p>
          <h2 id="architecture-title">More than a chatbot.</h2>
        </div>
        <div className="twin-grid">
          {[
            ["01", "Orchestrator", "Routes questions through retrieval, memory, privacy policy, and response generation."],
            ["02", "RAG Engine", "Uses vector similarity search over verified resume, project, profile, note, and certificate chunks."],
            ["03", "Intelligence Layer", "Extracts structured milestones, goals, and skill evidence to build the interactive Life Map."],
            ["04", "Evidence Layer", "Returns citations and confidence so recruiter-facing claims remain inspectable instead of becoming unsupported AI output."],
          ].map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <PortfolioIntelligence />
    </main>
  );
}
