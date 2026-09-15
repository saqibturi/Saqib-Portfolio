import "server-only";
import { createHash } from "node:crypto";
import { serviceClient } from "@/lib/supabase";
import {
  createTwinResponse,
  embedText,
  summarizeTwinConversation,
  type TwinSource,
} from "@/lib/ai/gemini";
import { extractPortfolioSignals } from "@/lib/ai/intelligence";

const MAX_CHUNK_CHARS = 2600;
const CHUNK_OVERLAP = 320;

type ConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

type RpcSourceMatch = {
  title: string;
  source_type: string;
  source_url: string | null;
  content: string;
  similarity: number | null;
};

export const twinSourceTypes = [
  "profile",
  "resume",
  "linkedin",
  "project",
  "note",
  "document",
  "goal",
  "calendar",
  "journal",
  "certificate",
  "custom",
] as const;

export type TwinSourceType = (typeof twinSourceTypes)[number];
export type TwinVisibility = "private" | "twin" | "public";

export function chunkText(text: string) {
  const normalized = text.replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  const chunks: string[] = [];
  let start = 0;
  while (start < normalized.length) {
    let end = Math.min(start + MAX_CHUNK_CHARS, normalized.length);
    if (end < normalized.length) {
      const paragraph = normalized.lastIndexOf("\n\n", end);
      const sentence = normalized.lastIndexOf(". ", end);
      const candidate = Math.max(paragraph, sentence);
      if (candidate > start + 1200) end = candidate + 1;
    }
    chunks.push(normalized.slice(start, end).trim());
    if (end === normalized.length) break;
    start = Math.max(end - CHUNK_OVERLAP, start + 1);
  }
  return chunks.filter(Boolean);
}

export async function getTwinOwnerId() {
  const supabase = serviceClient();
  const { data, error } = await supabase.from("owners").select("user_id").limit(1).maybeSingle();
  if (error || !data) throw new Error("Portfolio owner is not configured");
  return data.user_id as string;
}

export async function upsertTwinSource(input: {
  ownerId: string;
  sourceType: TwinSourceType;
  title: string;
  sourceUrl?: string | null;
  rawContent: string;
  visibility: TwinVisibility;
  metadata?: Record<string, unknown>;
}) {
  const supabase = serviceClient();
  const checksum = createHash("sha256").update(input.rawContent).digest("hex");
  const { data: existing } = await supabase
    .from("twin_sources")
    .select("id, checksum, visibility")
    .eq("owner_id", input.ownerId)
    .eq("title", input.title)
    .eq("source_type", input.sourceType)
    .maybeSingle();

  let sourceId: string;
  if (existing?.id) {
    sourceId = existing.id;
    if (existing.checksum === checksum) {
      if (existing.visibility !== input.visibility) {
        await Promise.all([
          supabase.from("twin_sources").update({ visibility: input.visibility, updated_at: new Date().toISOString() }).eq("id", sourceId),
          supabase.from("twin_life_events").update({ visibility: input.visibility }).eq("source_id", sourceId),
          supabase.from("twin_goals").update({ visibility: input.visibility }).eq("source_id", sourceId),
          supabase.from("twin_skill_evidence").update({ visibility: input.visibility }).eq("source_id", sourceId),
        ]);
      }
      return { sourceId, unchanged: true, visibility: input.visibility };
    }

    const { error } = await supabase
      .from("twin_sources")
      .update({
        raw_content: input.rawContent,
        source_url: input.sourceUrl,
        metadata: input.metadata || {},
        checksum,
        visibility: input.visibility,
        updated_at: new Date().toISOString(),
      })
      .eq("id", sourceId);
    if (error) throw error;
    await supabase.from("twin_chunks").delete().eq("source_id", sourceId);
  } else {
    const { data, error } = await supabase
      .from("twin_sources")
      .insert({
        owner_id: input.ownerId,
        source_type: input.sourceType,
        title: input.title,
        source_url: input.sourceUrl,
        raw_content: input.rawContent,
        metadata: input.metadata || {},
        checksum,
        visibility: input.visibility,
      })
      .select("id")
      .single();
    if (error) throw error;
    sourceId = data.id;
  }

  const chunks = chunkText(input.rawContent);
  for (let index = 0; index < chunks.length; index += 1) {
    const embedding = await embedText(chunks[index]);
    const { error } = await supabase.from("twin_chunks").insert({
      owner_id: input.ownerId,
      source_id: sourceId,
      chunk_index: index,
      content: chunks[index],
      embedding,
      token_estimate: Math.ceil(chunks[index].length / 4),
      metadata: { title: input.title },
    });
    if (error) throw error;
  }

  const signals = await extractPortfolioSignals({
    ownerId: input.ownerId,
    sourceId,
    sourceType: input.sourceType,
    title: input.title,
    rawContent: input.rawContent,
    visibility: input.visibility,
  });

  return {
    sourceId,
    unchanged: false,
    chunks: chunks.length,
    signals,
    visibility: input.visibility,
  };
}

export async function answerTwinQuestion(input: { sessionId: string; question: string }) {
  const started = Date.now();
  const supabase = serviceClient();
  const ownerId = await getTwinOwnerId();

  const { data: conversation, error: conversationError } = await supabase
    .from("twin_conversations")
    .upsert({ owner_id: ownerId, session_id: input.sessionId, updated_at: new Date().toISOString() }, { onConflict: "owner_id,session_id" })
    .select("id, memory_summary, message_count")
    .single();
  if (conversationError) throw conversationError;

  const queryEmbedding = await embedText(input.question);

  const [{ data: profile }, { data: sourceMatches }, { data: memoryMatches }, { data: history }] = await Promise.all([
    supabase.from("twin_profiles").select("personality_prompt, is_public").eq("owner_id", ownerId).maybeSingle(),
    supabase.rpc("match_twin_chunks", { p_owner_id: ownerId, p_query_embedding: queryEmbedding, p_match_count: 8, p_min_similarity: 0.28 }),
    supabase.rpc("match_twin_memories", { p_owner_id: ownerId, p_conversation_id: conversation.id, p_query_embedding: queryEmbedding, p_match_count: 4, p_min_similarity: 0.34 }),
    supabase
      .from("twin_messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  if (profile && profile.is_public === false) throw new Error("Digital Twin is currently offline");

  const recentMessages = (history || []).reverse() as ConversationMessage[];
  const sources: TwinSource[] = ((sourceMatches || []) as RpcSourceMatch[]).map((source) => ({
    title: source.title,
    sourceType: source.source_type,
    sourceUrl: source.source_url,
    content: source.content,
    similarity: source.similarity ?? undefined,
  }));

  const response = await createTwinResponse({
    question: input.question,
    personalityPrompt: profile?.personality_prompt || "Professional, warm, technically precise, and honest about uncertainty.",
    conversationSummary: conversation.memory_summary,
    recentMessages,
    sources,
    memories: (memoryMatches || []) as Array<{ content: string; memory_type: string; salience: number }>,
  });

  const citationRows = sources.map((source, index) => ({
    marker: `S${index + 1}`,
    title: source.title,
    type: source.sourceType,
    url: source.sourceUrl || null,
    similarity: source.similarity || null,
  }));

  await supabase.from("twin_messages").insert([
    { conversation_id: conversation.id, role: "user", content: input.question },
    { conversation_id: conversation.id, role: "assistant", content: response.text, citations: citationRows, model: response.model, latency_ms: Date.now() - started },
  ]);

  const nextMessageCount = (conversation.message_count || 0) + 2;
  let nextSummary = conversation.memory_summary as string | null;
  if (nextMessageCount >= 10 && nextMessageCount % 10 === 0) {
    try {
      const summaryMessages: ConversationMessage[] = [
        ...recentMessages,
        { role: "user", content: input.question },
        { role: "assistant", content: response.text },
      ];
      nextSummary = await summarizeTwinConversation({
        previousSummary: conversation.memory_summary,
        messages: summaryMessages.slice(-12),
      });
    } catch {
      // Memory compaction must never make an otherwise valid answer fail.
    }
  }

  await Promise.all([
    supabase
      .from("twin_conversations")
      .update({ message_count: nextMessageCount, memory_summary: nextSummary, updated_at: new Date().toISOString() })
      .eq("id", conversation.id),
    supabase.from("twin_events").insert({
      owner_id: ownerId,
      session_id: input.sessionId,
      event_type: "chat_completed",
      payload: { latency_ms: Date.now() - started, source_count: citationRows.length, memory_compacted: nextSummary !== conversation.memory_summary },
    }),
  ]);

  return { answer: response.text, citations: citationRows, latencyMs: Date.now() - started };
}
