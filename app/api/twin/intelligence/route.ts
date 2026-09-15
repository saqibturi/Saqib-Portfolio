import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase";
import { getTwinOwnerId } from "@/lib/ai/twin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = serviceClient();
    const ownerId = await getTwinOwnerId();

    const [{ data: events, error: eventsError }, { data: goals, error: goalsError }, { data: skillRows, error: skillsError }] = await Promise.all([
      supabase
        .from("twin_life_events")
        .select("id, category, title, summary, started_at, ended_at, importance, evidence")
        .eq("owner_id", ownerId)
        .eq("visibility", "public")
        .order("started_at", { ascending: true, nullsFirst: false }),
      supabase
        .from("twin_goals")
        .select("id, title, category, status, progress, target_date, rationale, evidence")
        .eq("owner_id", ownerId)
        .eq("visibility", "public")
        .order("target_date", { ascending: true, nullsFirst: false }),
      supabase
        .from("twin_skill_evidence")
        .select("skill, category, confidence, observed_at")
        .eq("owner_id", ownerId)
        .eq("visibility", "public"),
    ]);

    if (eventsError) throw eventsError;
    if (goalsError) throw goalsError;
    if (skillsError) throw skillsError;

    const skillMap = new Map<string, { skill: string; category: string; total: number; count: number; lastObservedAt: string | null }>();
    for (const row of skillRows || []) {
      const key = `${row.category}:${row.skill.toLowerCase()}`;
      const current = skillMap.get(key) || {
        skill: row.skill,
        category: row.category,
        total: 0,
        count: 0,
        lastObservedAt: null,
      };
      current.total += Number(row.confidence || 0);
      current.count += 1;
      if (row.observed_at && (!current.lastObservedAt || row.observed_at > current.lastObservedAt)) {
        current.lastObservedAt = row.observed_at;
      }
      skillMap.set(key, current);
    }

    const skills = [...skillMap.values()]
      .map((skill) => ({
        skill: skill.skill,
        category: skill.category,
        evidenceStrength: Math.round((skill.total / Math.max(skill.count, 1)) * 100),
        evidenceCount: skill.count,
        lastObservedAt: skill.lastObservedAt,
      }))
      .sort((a, b) => b.evidenceStrength - a.evidenceStrength || b.evidenceCount - a.evidenceCount)
      .slice(0, 12);

    return NextResponse.json({ events: events || [], goals: goals || [], skills });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load portfolio intelligence" },
      { status: 500 },
    );
  }
}
