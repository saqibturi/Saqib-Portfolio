import "server-only";
import { z } from "zod";
import { serviceClient } from "@/lib/supabase";
import { createJsonResponse, embedText, type TwinSource } from "@/lib/ai/openai";

const categorySchema = z.enum([
  "education",
  "career",
  "skill",
  "project",
  "goal",
  "certificate",
  "personal",
]);

const signalSchema = z.object({
  events: z.array(
    z.object({
      category: categorySchema,
      title: z.string().min(1).max(180),
      summary: z.string().max(1000),
      startedAt: z.string().nullable(),
      endedAt: z.string().nullable(),
      importance: z.number().int().min(1).max(5),
      evidence: z.string().max(1200),
    }),
  ),
  goals: z.array(
    z.object({
      title: z.string().min(1).max(180),
      category: z.string().max(80),
      status: z.enum(["planned", "active", "paused", "completed", "abandoned"]),
      progress: z.number().int().min(0).max(100),
      targetDate: z.string().nullable(),
      rationale: z.string().nullable(),
      evidence: z.string().max(1200),
    }),
  ),
  skills: z.array(
    z.object({
      skill: z.string().min(1).max(120),
      category: z.string().max(80),
      evidenceText: z.string().min(1).max(1200),
      confidence: z.number().min(0).max(1),
      observedAt: z.string().nullable(),
    }),
  ),
});

const signalJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["events", "goals", "skills"],
  properties: {
    events: {
      type: "array",
      maxItems: 16,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["category", "title", "summary", "startedAt", "endedAt", "importance", "evidence"],
        properties: {
          category: { type: "string", enum: ["education", "career", "skill", "project", "goal", "certificate", "personal"] },
          title: { type: "string" },
          summary: { type: "string" },
          startedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
          endedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
          importance: { type: "integer", minimum: 1, maximum: 5 },
          evidence: { type: "string" },
        },
      },
    },
    goals: {
      type: "array",
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "category", "status", "progress", "targetDate", "rationale", "evidence"],
        properties: {
          title: { type: "string" },
          category: { type: "string" },
          status: { type: "string", enum: ["planned", "active", "paused", "completed", "abandoned"] },
          progress: { type: "integer", minimum: 0, maximum: 100 },
          targetDate: { anyOf: [{ type: "string" }, { type: "null" }] },
          rationale: { anyOf: [{ type: "string" }, { type: "null" }] },
          evidence: { type: "string" },
        },
      },
    },
    skills: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["skill", "category", "evidenceText", "confidence", "observedAt"],
        properties: {
          skill: { type: "string" },
          category: { type: "string" },
          evidenceText: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          observedAt: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
      },
    },
  },
} as const;

function safeDate(value: string | null | undefined) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? null : value;
}

export async function extractPortfolioSignals(input: {
  ownerId: string;
  sourceId: string;
  sourceType: string;
  title: string;
  rawContent: string;
  visibility: "private" | "twin" | "public";
}) {
  const instructions = `You extract structured portfolio-intelligence signals from user-provided material.

Rules:
- Extract only information explicitly supported by the source.
- Never invent achievements, dates, skills, employers, projects, progress, or goals.
- Do not infer health, religion, politics, sexuality, ethnicity, financial status, or other sensitive traits.
- A goal must be explicitly stated as an intention, plan, target, or desired outcome.
- A skill signal must quote or closely paraphrase concrete evidence from the source.
- Use YYYY-MM-DD only when the source provides enough date information; otherwise use null.
- If the source gives only a year, use YYYY-01-01 and state in evidence that only the year was available.
- Keep personal/journal material professional and trajectory-focused; ignore intimate details unrelated to portfolio intelligence.
- Return JSON only through the supplied schema.`;

  const result = await createJsonResponse({
    model: process.env.OPENAI_ANALYSIS_MODEL || "gpt-5.6-terra",
    name: "portfolio_intelligence_signals",
    schema: signalJsonSchema,
    instructions,
    input: `SOURCE TYPE: ${input.sourceType}\nSOURCE TITLE: ${input.title}\n\nSOURCE CONTENT:\n${input.rawContent}`,
    maxOutputTokens: 3200,
  });

  const parsed = signalSchema.parse(result.data);
  const supabase = serviceClient();

  await Promise.all([
    supabase.from("twin_life_events").delete().eq("source_id", input.sourceId),
    supabase.from("twin_goals").delete().eq("source_id", input.sourceId),
    supabase.from("twin_skill_evidence").delete().eq("source_id", input.sourceId),
  ]);

  if (parsed.events.length) {
    const { error } = await supabase.from("twin_life_events").insert(
      parsed.events.map((event) => ({
        owner_id: input.ownerId,
        source_id: input.sourceId,
        category: event.category,
        title: event.title,
        summary: event.summary,
        started_at: safeDate(event.startedAt),
        ended_at: safeDate(event.endedAt),
        importance: event.importance,
        evidence: [event.evidence],
        visibility: input.visibility,
      })),
    );
    if (error) throw error;
  }

  if (parsed.goals.length) {
    const { error } = await supabase.from("twin_goals").insert(
      parsed.goals.map((goal) => ({
        owner_id: input.ownerId,
        source_id: input.sourceId,
        title: goal.title,
        category: goal.category,
        status: goal.status,
        progress: goal.progress,
        target_date: safeDate(goal.targetDate),
        rationale: goal.rationale,
        evidence: [goal.evidence],
        visibility: input.visibility,
      })),
    );
    if (error) throw error;
  }

  if (parsed.skills.length) {
    const { error } = await supabase.from("twin_skill_evidence").insert(
      parsed.skills.map((skill) => ({
        owner_id: input.ownerId,
        source_id: input.sourceId,
        skill: skill.skill,
        category: skill.category,
        evidence_text: skill.evidenceText,
        confidence: skill.confidence,
        observed_at: safeDate(skill.observedAt),
        visibility: input.visibility,
      })),
    );
    if (error) throw error;
  }

  return {
    events: parsed.events.length,
    goals: parsed.goals.length,
    skills: parsed.skills.length,
  };
}

const recruiterSchema = z.object({
  summary: z.string(),
  overallFit: z.number().int().min(0).max(100),
  dimensions: z.array(
    z.object({
      name: z.string(),
      score: z.number().int().min(0).max(100),
      confidence: z.number().min(0).max(1),
      rationale: z.string(),
      evidenceMarkers: z.array(z.string()),
    }),
  ),
  strengths: z.array(z.string()),
  evidenceGaps: z.array(z.string()),
  interviewQuestions: z.array(z.string()),
});

const recruiterJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "overallFit", "dimensions", "strengths", "evidenceGaps", "interviewQuestions"],
  properties: {
    summary: { type: "string" },
    overallFit: { type: "integer", minimum: 0, maximum: 100 },
    dimensions: {
      type: "array",
      minItems: 4,
      maxItems: 6,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "score", "confidence", "rationale", "evidenceMarkers"],
        properties: {
          name: { type: "string" },
          score: { type: "integer", minimum: 0, maximum: 100 },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          rationale: { type: "string" },
          evidenceMarkers: { type: "array", items: { type: "string" }, maxItems: 6 },
        },
      },
    },
    strengths: { type: "array", items: { type: "string" }, maxItems: 6 },
    evidenceGaps: { type: "array", items: { type: "string" }, maxItems: 6 },
    interviewQuestions: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 6 },
  },
} as const;

export async function evaluateCandidate(input: { ownerId: string; targetRole: string }) {
  const supabase = serviceClient();
  const queryEmbedding = await embedText(
    `Evidence needed to evaluate this candidate for ${input.targetRole}: technical skills, AI/ML depth, software engineering, problem solving, projects, delivery, communication, and impact.`,
  );

  const { data: matches, error } = await supabase.rpc("match_twin_chunks", {
    p_owner_id: input.ownerId,
    p_query_embedding: queryEmbedding,
    p_match_count: 16,
    p_min_similarity: 0.18,
  });
  if (error) throw error;

  const sources: TwinSource[] = (matches || []).map((source: any) => ({
    title: source.title,
    sourceType: source.source_type,
    sourceUrl: source.source_url,
    content: source.content,
    similarity: source.similarity,
  }));

  if (!sources.length) {
    throw new Error("Not enough public/twin evidence is indexed to run Recruiter Mode yet.");
  }

  const evidence = sources
    .map((source, index) => `[S${index + 1}] ${source.title} (${source.sourceType})\n${source.content}`)
    .join("\n\n");

  const result = await createJsonResponse({
    model: process.env.OPENAI_ANALYSIS_MODEL || "gpt-5.6-terra",
    name: "recruiter_evaluation",
    schema: recruiterJsonSchema,
    instructions: `You are an evidence-based technical recruiter evaluating a portfolio for a target role.

Scoring rules:
- Scores represent portfolio evidence strength and role fit, not a claim about the person's absolute ability.
- Use only the supplied evidence. Never infer missing experience.
- Penalize weak or absent evidence rather than filling gaps with assumptions.
- Every factual rationale must cite one or more valid [S#] markers.
- Confidence must reflect evidence coverage.
- Evidence gaps should be concrete things a recruiter would still want demonstrated.
- Interview questions should specifically test uncertain or high-value areas.
- Return JSON only through the supplied schema.`,
    input: `TARGET ROLE: ${input.targetRole}\n\nPORTFOLIO EVIDENCE:\n${evidence}`,
    maxOutputTokens: 2600,
  });

  const evaluation = recruiterSchema.parse(result.data);
  const citationMap = sources.map((source, index) => ({
    marker: `S${index + 1}`,
    title: source.title,
    type: source.sourceType,
    url: source.sourceUrl || null,
  }));

  await supabase.from("twin_recruiter_snapshots").insert({
    owner_id: input.ownerId,
    role_target: input.targetRole,
    dimensions: evaluation.dimensions,
    summary: evaluation.summary,
    evidence: citationMap,
    model: result.model,
  });

  return { ...evaluation, citations: citationMap, model: result.model };
}
