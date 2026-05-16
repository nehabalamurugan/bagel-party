"use client";

import { createClient } from "@supabase/supabase-js";
import type { Config } from "./types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, anon, {
  auth: { persistSession: false },
  realtime: { params: { eventsPerSecond: 10 } },
});

export const DEFAULT_CONFIG: Config = {
  id: 1,
  total_cheeses: 0,
  tasting_open: false,
  results_revealed: false,
  per_cheese_cap: 20,
  min_raters_to_qualify: 5,
};

export async function diagnoseSupabase(): Promise<void> {
  try {
    const res = await fetch(`${url}/rest/v1/config?select=*&id=eq.1`, {
      headers: {
        apikey: anon,
        Authorization: `Bearer ${anon}`,
        Accept: "application/json",
      },
    });
    const body = await res.text();
    console.log("[supabase diagnose]", {
      url,
      status: res.status,
      statusText: res.statusText,
      body: body.slice(0, 500),
    });
  } catch (e) {
    console.log("[supabase diagnose] fetch threw:", e);
  }
}

export async function getConfig(): Promise<Config> {
  const { data, error } = await supabase
    .from("config")
    .select("*")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    console.error("[getConfig] failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      stringified: JSON.stringify(error),
    });
    return DEFAULT_CONFIG;
  }
  return (data as Config | null) ?? DEFAULT_CONFIG;
}

export async function ensureConfigRow(): Promise<Config> {
  const existing = await getConfig();
  if (existing !== DEFAULT_CONFIG) return existing;

  const { data, error } = await supabase
    .from("config")
    .insert(DEFAULT_CONFIG)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") return await getConfig();
    console.error("[ensureConfigRow] failed:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      stringified: JSON.stringify(error),
    });
    await diagnoseSupabase();
    return DEFAULT_CONFIG;
  }
  return (data as Config | null) ?? DEFAULT_CONFIG;
}

export async function patchConfig(patch: Partial<Omit<Config, "id">>): Promise<Config> {
  const { data, error } = await supabase
    .from("config")
    .upsert({ id: 1, ...patch }, { onConflict: "id" })
    .select()
    .single();
  if (error) {
    console.error("[patchConfig]", error);
    throw error;
  }
  return data as Config;
}

const ALL_UUIDS_SENTINEL = "00000000-0000-0000-0000-000000000000";

export async function deleteAll(table: "guests" | "tastings") {
  return supabase.from(table).delete().neq("id", ALL_UUIDS_SENTINEL);
}
