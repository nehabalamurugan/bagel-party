import { supabase } from "./supabase";

const FLIGHT_SIZE = 6;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Greedy load-balanced flight assignment.
 * Counts current tastings per cheese, sorts ascending,
 * shuffles within tie tiers, takes 6 with lowest counts.
 */
export async function assignFlight(totalCheeses: number): Promise<number[]> {
  if (totalCheeses < FLIGHT_SIZE) {
    throw new Error(`Need at least ${FLIGHT_SIZE} cheeses to assign a flight.`);
  }

  const { data: guests, error } = await supabase.from("guests").select("flight");
  if (error) throw error;

  const counts = new Map<number, number>();
  for (let n = 1; n <= totalCheeses; n++) counts.set(n, 0);
  for (const g of guests ?? []) {
    for (const n of (g.flight as number[]) ?? []) {
      counts.set(n, (counts.get(n) ?? 0) + 1);
    }
  }

  // Group by count, shuffle within tier, then concat sorted ascending by count.
  const tiers = new Map<number, number[]>();
  counts.forEach((c, n) => {
    if (!tiers.has(c)) tiers.set(c, []);
    tiers.get(c)!.push(n);
  });

  const sortedTierKeys = [...tiers.keys()].sort((a, b) => a - b);
  const ordered: number[] = [];
  for (const k of sortedTierKeys) {
    ordered.push(...shuffle(tiers.get(k)!));
  }

  return ordered.slice(0, FLIGHT_SIZE).sort((a, b) => a - b);
}
