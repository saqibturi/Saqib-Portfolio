import { createClient } from "@supabase/supabase-js";
import { initialProfile } from "../lib/profile";
// Run: node --env-file=.env.local --import tsx scripts/seed.ts
const url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key)
  throw new Error("Set Supabase URL and service role key first.");
const db = createClient(url, key, { auth: { persistSession: false } });
const { error } = await db
  .from("profile")
  .upsert(
    { id: 1, content: initialProfile },
    { onConflict: "id", ignoreDuplicates: true },
  );
if (error)
  throw new Error("Profile initialization failed. Apply the migration first.");
console.log(
  "Profile initialized without overwriting existing content. No example projects were published.",
);
