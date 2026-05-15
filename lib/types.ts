export type Config = {
  id: number;
  total_cheeses: number;
  round_1_open: boolean;
  round_2_open: boolean;
  results_revealed: boolean;
  finalist_ids: number[];
};

export type Guest = {
  id: string;
  name: string;
  flight: number[];
  created_at: string;
};

export type Round1Vote = {
  id: string;
  guest_id: string;
  cheese_number: number;
  created_at: string;
};

export type Round2Vote = {
  id: string;
  guest_id: string;
  category: CategoryKey;
  cheese_number: number;
  created_at: string;
};

export const CATEGORIES = [
  { key: "wildest", label: "Wildest concept" },
  { key: "best_execution", label: "Best execution" },
  { key: "most_sellable", label: "Most likely to actually sell" },
  { key: "crime_against_dairy", label: "Biggest crime against dairy" },
  { key: "personal_favorite", label: "Personal favorite" },
] as const;

export type CategoryKey = (typeof CATEGORIES)[number]["key"];
