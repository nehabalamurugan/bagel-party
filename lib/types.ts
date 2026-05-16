export const TOTAL_TASTINGS = 9;
export const TASTINGS_PER_ROUND = 3;

export type Config = {
  id: number;
  total_cheeses: number;
  tasting_open: boolean;
  results_revealed: boolean;
  per_cheese_cap: number;
  min_raters_to_qualify: number;
};

export type Guest = {
  id: string;
  name: string;
  created_at: string;
};

export type Tasting = {
  id: string;
  guest_id: string;
  cheese_number: number;
  stars: number;
  nomination: NominationKey | null;
  round_number: number;
  created_at: string;
};

export const NOMINATIONS = [
  { key: "erewhon", label: "Most likely to sell at Erewhon", short: "erewhon" },
  { key: "dining_hall", label: "Most likely at a dining hall", short: "dining_hall" },
  { key: "wildest", label: "Wildest concept", short: "wildest" },
  { key: "should_not_exist", label: "Should not exist", short: "should_not_exist" },
] as const;

export type NominationKey = (typeof NOMINATIONS)[number]["key"];

export const NOMINATION_ACCENT: Record<NominationKey, "green" | "blue" | "red" | "ink"> = {
  erewhon: "green",
  dining_hall: "blue",
  wildest: "ink",
  should_not_exist: "red",
};

export function roundOf(tastingIndex: number): number {
  // 0-indexed tasting → 1-indexed round
  return Math.floor(tastingIndex / TASTINGS_PER_ROUND) + 1;
}
