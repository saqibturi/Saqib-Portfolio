"use client";
import { useState } from "react";
import { Search, FolderOpen } from "lucide-react";
import type { Project } from "@/lib/types";
import { ProjectCard } from "./public";
export function ProjectList({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [limit, setLimit] = useState(6);
  const filtered = projects.filter(
    (p) =>
      (category === "All" || p.category === category) &&
      `${p.title} ${p.summary} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="project-tools">
        <div className="filter-group" aria-label="Filter projects">
          {["All", ...new Set(projects.map((p) => p.category))].map((c) => (
            <button
              key={c}
              aria-pressed={c === category}
              onClick={() => {
                setCategory(c);
                setLimit(6);
              }}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-field">
          <Search size={18} />
          <span className="sr-only">Search projects</span>
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(6);
            }}
            placeholder="Search projects…"
          />
        </label>
      </div>
      <p className="muted" aria-live="polite">
        {filtered.length} project{filtered.length === 1 ? "" : "s"}
      </p>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.slice(0, limit).map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FolderOpen size={36} />
          <h2>
            {projects.length
              ? "No matching projects"
              : "Case studies are on the way."}
          </h2>
          <p>
            {projects.length
              ? "Try another keyword or category."
              : "For a look at my code or to discuss my experience, visit GitHub or send me a message."}
          </p>
          {!projects.length && (
            <a className="button secondary" href="https://github.com/saqibturi">
              Explore GitHub ↗
            </a>
          )}
        </div>
      )}
      {filtered.length > limit && (
        <button
          className="button secondary"
          onClick={() => setLimit(limit + 6)}
        >
          Show more projects
        </button>
      )}
    </>
  );
}
