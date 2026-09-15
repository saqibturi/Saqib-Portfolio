import type { Metadata } from "next";
import { DigitalTwinChat } from "@/components/digital-twin-chat";
import "./twin.css";

export const metadata: Metadata = {
  title: "Saqib AI — Digital Twin",
  description: "Talk to Saqib Muhammad's source-grounded AI Digital Twin about his projects, technical skills, experience, and professional knowledge.",
  alternates: { canonical: "/twin" },
};

export default function TwinPage() {
  return (
    <main className="container page-section twin-page">
      <div className="twin-heading">
        <p className="eyebrow">FLAGSHIP AI PROJECT</p>
        <h1>Meet <span className="headline-accent">Saqib AI.</span></h1>
        <p className="lead">A professional digital twin powered by retrieval-augmented generation, long-term memory, semantic search, and a personality layer.</p>
      </div>
      <DigitalTwinChat />
      <section className="twin-architecture" aria-labelledby="architecture-title">
        <div><p className="eyebrow">SYSTEM DESIGN</p><h2 id="architecture-title">More than a chatbot.</h2></div>
        <div className="twin-grid">
          {[["01","Orchestrator","Routes the visitor question through retrieval, memory, policy, and response generation."],["02","RAG Engine","Uses vector similarity search over verified resume, project, profile, and note chunks."],["03","Memory Layer","Keeps conversation continuity and supports salience-ranked long-term memories."],["04","Evidence Layer","Returns human-readable source citations so recruiters can inspect what grounded the answer."]].map(([number,title,description]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></article>)}
        </div>
      </section>
    </main>
  );
}
