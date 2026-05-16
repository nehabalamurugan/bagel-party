"use client";

import { supabase } from "./supabase";

const KEY = "schmear:guest";

export type StoredGuest = {
  id: string;
  name: string;
};

export function saveGuest(g: StoredGuest) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(g));
}

export function loadGuest(): StoredGuest | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredGuest;
  } catch {
    return null;
  }
}

export function clearGuest() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}

export async function verifyGuest(g: StoredGuest): Promise<boolean> {
  const { data } = await supabase
    .from("guests")
    .select("id")
    .eq("id", g.id)
    .maybeSingle();
  if (!data) {
    clearGuest();
    return false;
  }
  return true;
}
