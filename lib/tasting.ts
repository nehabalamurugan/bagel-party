"use client";

import { supabase } from "./supabase";
import type { NominationKey } from "./types";

export type TastingRow = {
  cheese_number: number;
  stars: number;
  nomination: NominationKey | null;
};

/** Counts how many distinct guests have tasted each cheese. */
export async function fetchCheeseCounts(): Promise<Map<number, number>> {
  const { data, error } = await supabase.from("tastings").select("cheese_number");
  if (error) {
    console.error("[fetchCheeseCounts]", error);
    return new Map();
  }
  const counts = new Map<number, number>();
  for (const row of (data ?? []) as Array<{ cheese_number: number }>) {
    counts.set(row.cheese_number, (counts.get(row.cheese_number) ?? 0) + 1);
  }
  return counts;
}

/** Lowest-count cheese numbers, excluding ones the guest already tasted. */
export function suggestLeastTried(
  totalCheeses: number,
  counts: Map<number, number>,
  alreadyTasted: Set<number>,
  k = 5,
): Array<{ num: number; count: number }> {
  const pool: Array<{ num: number; count: number }> = [];
  for (let n = 1; n <= totalCheeses; n++) {
    if (alreadyTasted.has(n)) continue;
    pool.push({ num: n, count: counts.get(n) ?? 0 });
  }
  pool.sort((a, b) => a.count - b.count || Math.random() - 0.5);
  return pool.slice(0, k);
}

/** Cheeses this guest has already tasted. */
export async function fetchGuestTasted(guestId: string): Promise<Set<number>> {
  const { data, error } = await supabase
    .from("tastings")
    .select("cheese_number")
    .eq("guest_id", guestId);
  if (error) {
    console.error("[fetchGuestTasted]", error);
    return new Set();
  }
  return new Set((data ?? []).map((r) => (r as { cheese_number: number }).cheese_number));
}
