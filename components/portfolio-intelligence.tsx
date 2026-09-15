"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  BrainCircuit,
  GraduationCap,
  Map as MapIcon,
  Rocket,
  Sparkles,
  Target,
} from "lucide-react";

type LifeEvent = {
  id: string;
  category: string;
  title: string;
  summary: string;
  started_at: string | null;
  ended_at: string | null;
  importance: number;
};

type Goal = {
  id: string;
  title: string;
  category: string;
  status: string;
  progress: number;
  target_date: string | null;
  rationale: string | null;
};

type Skill = {
  skill: string;
  category: string;
  evidenceStrength: number;
  evidenceCount: number;
  lastObservedAt: string | null;
};

type IntelligenceData = {
  events: LifeEvent[];
  goals: Goal[];
  skills: Skill[];
};

type RecruiterEvaluation = {
  summary: string;
  overallFit: number;
  dimensions: Array<{
    name: string;
    score: number;
    confidence: number;
    rationale: string;
    evidenceMarkers: string[];
  }>;
  strengths: string[];
  evidenceGaps: string[];
  interviewQuestions: string[];
  citations: Array<{ marker: string; title: string; type: string; url?: string | null }>;
};

const categories = [
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "career", label: "Career", icon: BriefcaseBusiness },
  { id: "skill", label: "Skills", icon: BrainCircuit },
  { id: "project", label: "Projects", icon: Rocket },
  { id: "goal", label: "Goals", icon: Target },
] as const;

function formatDate(value: string | null) {
  if (!value) return "Current / undated";
  return new Intl.DateTimeFormat("en", { month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00Z`),
  );
}

export function PortfolioIntelligence() {
  const [mode, setMode] = useState<"map" | "recruiter">("map");
  const [data, setData] = useState<IntelligenceData>({ events: [], goals: [], skills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [targetRole, setTargetRole] = useState("AI Engineer");
  const [evaluation, setEvaluation] = useState<RecruiterEvaluation | null>(null);
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/twin/intelligence")
      .then(async (response) => {
        const json = await response.json();
        if (!response.ok) throw new Error(json.error || "Unable to load intelligence data");
        if (active) setData(json);
      })
      .catch((reason) => active && setError(reason instanceof Error ? reason.message : "Unable to load intelligence data"))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const groupedEvents = useMemo(() => {
    const groups = new Map<string, LifeEvent[]>();
    for (const category of categories) groups.set(category.id, []);
    for (const event of data.events) {
      if (!groups.has(event.category)) groups.set(event.category, []);
      groups.get(event.category)?.push(event);
    }
    return groups;
  }, [data.events]);

  async function runRecruiterMode(event: React.FormEvent) {
    event.preventDefault();
    setEvaluating(true);
    setError("");
    try {
      const response = await fetch("/api/twin/recruiter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole }),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error || "Recruiter evaluation failed");
      setEvaluation(json);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Recruiter evaluation failed");
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <section className="intelligence-section" aria-labelledby="intelligence-title">
      <div className="intelligence-heading">
        <div>
          <p className="eyebrow">PORTFOLIO INTELLIGENCE</p>
          <h2 id="intelligence-title">From portfolio data to an interactive professional map.</h2>
          <p>
            Uploaded evidence is converted into structured milestones, skill signals, goals, and recruiter-facing analysis. Private material stays private unless explicitly promoted.
          </p>
        </div>
        <div className="intelligence-tabs" role="tablist" aria-label="Portfolio intelligence views">
          <button className={mode === "map" ? "active" : ""} onClick={() => setMode("map")} type="button">
            <MapIcon size={16} /> Life Map
          </button>
          <button className={mode === "recruiter" ? "active" : ""} onClick={() => setMode("recruiter")} type="button">
            <Sparkles size={16} /> Recruiter Mode
          </button>
        </div>
      </div>

      {error && <p className="intelligence-error">{error}</p>}

      {mode === "map" ? (
        <div className="life-map-panel">
          <div className="life-map-title">
            <span>YOUR LIFE MAP</span>
            <small>{loading ? "Building map…" : `${data.events.length} public milestones · ${data.skills.length} skill signals`}</small>
          </div>

          <div className="life-map-flow" aria-label="Life Map architecture">
            <div className="life-map-inputs">
              {categories.map(({ id, label, icon: Icon }) => (
                <div key={id} className="life-map-node">
                  <Icon size={18} />
                  <span>{label}</span>
                  <strong>{groupedEvents.get(id)?.length || 0}</strong>
                </div>
              ))}
            </div>
            <div className="life-map-engine">
              <BrainCircuit size={24} />
              <strong>AI Analysis</strong>
              <span>Evidence extraction + timeline reasoning</span>
            </div>
          </div>

          <div className="timeline-lanes">
            {categories.map(({ id, label, icon: Icon }) => {
              const events = groupedEvents.get(id) || [];
              return (
                <div className="timeline-lane" key={id}>
                  <div className="timeline-label"><Icon size={16} /><span>{label}</span></div>
                  <div className="timeline-track">
                    {events.length ? events.map((event) => (
                      <article className="timeline-event" key={event.id}>
                        <small>{formatDate(event.started_at)}</small>
                        <h3>{event.title}</h3>
                        <p>{event.summary}</p>
                      </article>
                    )) : <span className="timeline-empty">No public evidence yet</span>}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="intelligence-grid">
            <article className="intelligence-card">
              <div className="card-kicker"><BrainCircuit size={17} /> Skill Evidence</div>
              <h3>Skill growth signals</h3>
              <p className="card-note">Bars show strength of portfolio evidence, not an absolute ability score.</p>
              <div className="skill-signals">
                {data.skills.length ? data.skills.slice(0, 8).map((skill) => (
                  <div key={`${skill.category}-${skill.skill}`} className="skill-signal">
                    <div><span>{skill.skill}</span><small>{skill.evidenceCount} evidence signal{skill.evidenceCount === 1 ? "" : "s"}</small></div>
                    <div className="evidence-bar"><span style={{ width: `${skill.evidenceStrength}%` }} /></div>
                    <strong>{skill.evidenceStrength}</strong>
                  </div>
                )) : <p>No public skill evidence has been indexed yet.</p>}
              </div>
            </article>

            <article className="intelligence-card">
              <div className="card-kicker"><Target size={17} /> Goal Tracking</div>
              <h3>Goals and progress</h3>
              <p className="card-note">Only goals explicitly marked public appear here.</p>
              <div className="goal-list">
                {data.goals.length ? data.goals.slice(0, 6).map((goal) => (
                  <div className="goal-row" key={goal.id}>
                    <div><strong>{goal.title}</strong><small>{goal.status}{goal.target_date ? ` · target ${formatDate(goal.target_date)}` : ""}</small></div>
                    <span>{goal.progress}%</span>
                    <div className="goal-progress"><i style={{ width: `${goal.progress}%` }} /></div>
                  </div>
                )) : <p>No public goals have been shared yet.</p>}
              </div>
            </article>
          </div>
        </div>
      ) : (
        <div className="recruiter-panel">
          <div className="recruiter-intro">
            <p className="eyebrow">EVIDENCE-BASED CANDIDATE REVIEW</p>
            <h3>Evaluate this portfolio for a specific role.</h3>
            <p>Recruiter Mode retrieves relevant portfolio evidence, scores role fit, reports confidence, exposes evidence gaps, and generates targeted interview questions.</p>
            <form onSubmit={runRecruiterMode}>
              <label htmlFor="target-role">Target role</label>
              <div>
                <input id="target-role" value={targetRole} onChange={(event) => setTargetRole(event.target.value)} maxLength={120} />
                <button type="submit" disabled={evaluating}>{evaluating ? "Evaluating…" : "Evaluate candidate"}</button>
              </div>
            </form>
          </div>

          {evaluation ? (
            <div className="recruiter-results">
              <div className="fit-score"><span>Evidence-based fit</span><strong>{evaluation.overallFit}<small>/100</small></strong><p>{evaluation.summary}</p></div>
              <div className="dimension-list">
                {evaluation.dimensions.map((dimension) => (
                  <article key={dimension.name}>
                    <div className="dimension-head"><strong>{dimension.name}</strong><span>{dimension.score}</span></div>
                    <div className="dimension-bar"><i style={{ width: `${dimension.score}%` }} /></div>
                    <p>{dimension.rationale}</p>
                    <small>Confidence {Math.round(dimension.confidence * 100)}% · {dimension.evidenceMarkers.join(", ") || "No direct marker"}</small>
                  </article>
                ))}
              </div>
              <div className="recruiter-columns">
                <article><h4>Strong evidence</h4>{evaluation.strengths.map((item) => <p key={item}>+ {item}</p>)}</article>
                <article><h4>Evidence gaps</h4>{evaluation.evidenceGaps.map((item) => <p key={item}>→ {item}</p>)}</article>
                <article><h4>Interview questions</h4>{evaluation.interviewQuestions.map((item) => <p key={item}>? {item}</p>)}</article>
              </div>
              <div className="recruiter-sources">
                <strong>Retrieved evidence</strong>
                {evaluation.citations.map((citation) => citation.url ? (
                  <a key={citation.marker} href={citation.url} target="_blank" rel="noreferrer">[{citation.marker}] {citation.title}</a>
                ) : <span key={citation.marker}>[{citation.marker}] {citation.title}</span>)}
              </div>
            </div>
          ) : (
            <div className="recruiter-placeholder">
              <BriefcaseBusiness size={34} />
              <strong>No generic scorecards.</strong>
              <p>Choose a role and the system will build a fresh assessment from the evidence currently indexed in the Digital Twin.</p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
