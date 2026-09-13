import "server-only";
import { configured, publicClient } from "./supabase";
import { initialProfile } from "./profile";
import type { Profile, Project } from "./types";
export async function getProfile(): Promise<Profile> {
  if (!configured()) return initialProfile;
  const { data, error } = await publicClient()
    .from("profile")
    .select("content")
    .eq("id", 1)
    .single();
  if (error) throw new Error("Profile temporarily unavailable");
  return { ...initialProfile, ...data.content };
}
export async function getProjects(): Promise<Project[]> {
  if (!configured()) return [];
  const { data, error } = await publicClient()
    .from("published_projects")
    .select("content");
  if (error) throw new Error("Projects temporarily unavailable");
  return (data || [])
    .map((x) => x.content as Project)
    .sort((a, b) => a.order - b.order);
}

export async function getCertificates(): Promise<
  import("./types").Certificate[]
> {
  if (!configured()) return [];
  const { data, error } = await publicClient()
    .from("published_certificates")
    .select("content");
  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") return [];
    throw new Error("Certificates temporarily unavailable");
  }
  return (data || [])
    .map((x) => x.content as import("./types").Certificate)
    .sort((a, b) => a.order - b.order);
}
