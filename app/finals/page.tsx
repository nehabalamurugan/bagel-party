"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getConfig } from "@/lib/supabase";
import { loadGuest, verifyGuest } from "@/lib/session";
import { Button } from "@/components/Button";
import { Stamp } from "@/components/Stamp";
import { FigLabel, NotebookHeader } from "@/components/NotebookHeader";
import { fireConfetti } from "@/components/Confetti";
import { fmtId } from "@/lib/format";
import { CATEGORIES, type CategoryKey, type Config } from "@/lib/types";
import type { StoredGuest } from "@/lib/session";

type Phase = "loading" | "voting" | "submitted" | "closed";

type Picks = Partial<Record<CategoryKey, number>>;

const CATEGORY_META: Record<
  CategoryKey,
  { short: string; accent: "ink" | "green" | "blue" | "red" }
> = {
  wildest: { short: "wildest_concept", accent: "blue" },
  best_execution: { short: "best_execution", accent: "green" },
  most_sellable: { short: "most_likely_to_sell", accent: "ink" },
  crime_against_dairy: { short: "crime_against_dairy", accent: "red" },
  personal_favorite: { short: "personal_favorite", accent: "red" },
};

const ACCENT_HEX: Record<"ink" | "green" | "blue" | "red", string> = {
  ink: "#0e1730",
  green: "#5b8a45",
  blue: "#2a5fb3",
  red: "#c4302b",
};

export default function FinalsPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [guest, setGuest] = useState<StoredGuest | null>(null);
  const [finalists, setFinalists] = useState<number[]>([]);
  const [picks, setPicks] = useState<Picks>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const g = loadGuest();
      if (!g) {
        router.replace("/");
        return;
      }
      const ok = await verifyGuest(g);
      if (!ok) {
        router.replace("/");
        return;
      }
      setGuest(g);

      const [cfg, { data: existing }] = await Promise.all([
        getConfig(),
        supabase.from("votes_round2").select("category, cheese_number").eq("guest_id", g.id),
      ]);

      if (existing && existing.length > 0) {
        const restored: Picks = {};
        for (const row of existing as Array<{ category: CategoryKey; cheese_number: number }>) {
          restored[row.category] = row.cheese_number;
        }
        setPicks(restored);
        setFinalists((cfg as Config).finalist_ids ?? []);
        setPhase("submitted");
        return;
      }
      if (!cfg.round_2_open) {
        setPhase("closed");
        return;
      }
      setFinalists(cfg.finalist_ids ?? []);
      setPhase("voting");
    })();
  }, [router]);

  const completed = CATEGORIES.filter((c) => picks[c.key] !== undefined).length;
  const ready = completed === CATEGORIES.length;

  function assign(key: CategoryKey, num: number) {
    setPicks((p) => {
      const next = { ...p };
      if (next[key] === num) delete next[key];
      else next[key] = num;
      return next;
    });
  }

  async function submit() {
    if (!guest || !ready) return;
    setSubmitting(true);
    setError(null);
    try {
      const rows = CATEGORIES.map((c) => ({
        guest_id: guest.id,
        category: c.key,
        cheese_number: picks[c.key]!,
      }));
      const { error: insErr } = await supabase.from("votes_round2").insert(rows);
      if (insErr) throw insErr;
      fireConfetti();
      setPhase("submitted");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Couldn't submit. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading" || !guest) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center font-mono text-sm tracking-[0.16em] text-ink-soft">
        // loading_ballot…
      </div>
    );
  }

  if (phase === "submitted") {
    return <AwardsRecap name={guest.name} finalists={finalists} picks={picks} />;
  }

  if (phase === "closed") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-7 text-center">
        <div className="font-mono text-[11px] tracking-[0.22em] text-lab-red">// ROUND_02 PENDING</div>
        <h1 className="mt-2 font-mono text-[26px] font-bold leading-tight text-ink">
          awards ballot
          <br />
          not open_
        </h1>
        <p className="mt-3 font-body text-[14px] text-ink-soft">
          The host will open Round 2 once the top finalists are picked.
        </p>
        <Link
          href="/leaderboard"
          className="mt-6 font-mono text-[12px] tracking-[0.18em] text-ink underline underline-offset-4"
        >
          // VIEW LIVE BOARD →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-32">
      <NotebookHeader
        pageId="NOTEBOOK_07 / PG.016"
        right={
          <span
            className="px-2 py-0.5"
            style={{
              background: ready ? "#ffe87a" : "transparent",
              border: ready ? "1.5px solid #0e1730" : "none",
              color: ready ? "#0e1730" : "#c4302b",
            }}
          >
            AWARDS · {completed}/{CATEGORIES.length}
          </span>
        }
      />

      <div className="px-6 pt-4">
        <FigLabel>// FIG.5 — SUPERLATIVE BALLOT</FigLabel>
        <h1 className="mt-1 font-mono text-[24px] font-bold leading-none text-ink">
          round_02<span className="text-lab-red">_</span>
        </h1>
        <p className="mt-1 font-body text-[12px] leading-snug text-ink-soft">
          The {finalists.length} finalists, ranked by category. One sample can win multiple titles — we don&apos;t judge (yet).
        </p>
      </div>

      <div className="px-6 pt-3">
        <div className="flex items-center gap-3 border-[1.5px] border-dashed border-ink-soft p-2 px-3" style={{ background: "rgba(253,252,247,0.55)" }}>
          <div
            className="font-mono text-[9px] tracking-[0.18em] text-lab-red"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
          >
            FINALISTS
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-around gap-2">
            {finalists.map((n, i) => (
              <div key={n} className="flex flex-col items-center gap-0.5">
                <div className="font-mono text-[8px] tracking-[0.1em] text-ink-soft">F.{i + 1}</div>
                <div
                  className="border-[1.5px] border-ink bg-card px-2 py-0.5 font-mono text-[16px] font-bold text-ink"
                  style={{ minWidth: 44, textAlign: "center", letterSpacing: "-0.02em" }}
                >
                  {fmtId(n)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-6 pt-3">
        {CATEGORIES.map((cat, i) => {
          const meta = CATEGORY_META[cat.key];
          const chosen = picks[cat.key];
          const accent = ACCENT_HEX[meta.accent];
          return (
            <div key={cat.key} className="border-b border-dashed border-ink-soft pb-2">
              <div className="flex items-baseline justify-between">
                <div
                  className="font-mono text-[10px] font-bold uppercase tracking-[0.16em]"
                  style={{ color: accent }}
                >
                  05{String.fromCharCode(97 + i)} · {meta.short}
                </div>
                {chosen != null && (
                  <span
                    key={`stamp-${cat.key}-${chosen}`}
                    className="animate-stamp-in font-hand text-[14px]"
                    style={{ color: accent, transform: "rotate(-2deg)" }}
                  >
                    ↳ {fmtId(chosen)}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex gap-1.5">
                {finalists.map((n) => {
                  const selected = chosen === n;
                  return (
                    <button
                      type="button"
                      key={n}
                      onClick={() => assign(cat.key, n)}
                      className="relative flex-1 font-mono text-[13px] font-bold transition-colors duration-150"
                      style={{
                        height: 44,
                        background: selected ? accent : "transparent",
                        color: selected ? "#fdfcf7" : "#0e1730",
                        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? accent : "#3a4866"}`,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {fmtId(n)}
                      {meta.accent === "red" && selected && cat.key === "crime_against_dairy" && (
                        <span
                          className="pointer-events-none absolute inset-0"
                          style={{
                            backgroundImage:
                              "repeating-linear-gradient(45deg, transparent 0 6px, rgba(253,252,247,0.16) 6px 8px)",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="mx-6 mt-4 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
          ERROR — {error}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-paper/95 px-6 pb-5 pt-3 backdrop-blur">
        <Button onClick={submit} disabled={!ready || submitting}>
          {submitting ? "SUBMITTING…" : "CERTIFY_BALLOT >_"}
        </Button>
      </div>
    </div>
  );
}

function AwardsRecap({
  name,
  finalists,
  picks,
}: {
  name: string;
  finalists: number[];
  picks: Picks;
}) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-12">
      <NotebookHeader pageId="NOTEBOOK_07 / PG.017" />
      <div className="relative px-6 pt-4">
        <FigLabel>// FIG.6 — FINAL TITLES</FigLabel>
        <h1 className="mt-1 font-mono text-[28px] font-bold leading-none text-ink">the awards_</h1>
        <p className="mt-1 font-body text-[12px] text-ink-soft">
          Certified by judge <span className="font-mono font-bold text-ink">{name || "anon"}</span>. Recorded in perpetuity (or until neha clears localStorage).
        </p>
        <div className="absolute right-4 top-12">
          <Stamp label="CERTIFIED" color="green" />
        </div>
      </div>

      <div className="flex flex-col gap-2 px-5 pt-4">
        {CATEGORIES.map((cat) => {
          const meta = CATEGORY_META[cat.key];
          const num = picks[cat.key];
          if (num == null) return null;
          const accent = ACCENT_HEX[meta.accent];
          return (
            <div
              key={cat.key}
              className="animate-fade-up relative border-[1.5px] border-ink p-2 px-3"
              style={{
                background: "rgba(253,252,247,0.7)",
                boxShadow: `2px 2px 0 ${accent}`,
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.18em] text-ink-soft">
                    {meta.short.toUpperCase()}
                  </div>
                  <div
                    className="mt-0.5 font-mono text-[16px] font-bold leading-tight"
                    style={{ color: accent }}
                  >
                    {cat.label}
                  </div>
                </div>
                <div
                  className="ml-2 border-[1.5px] bg-card px-2 py-0.5 font-mono text-[22px] font-bold text-ink"
                  style={{ borderColor: accent, letterSpacing: "-0.02em" }}
                >
                  {fmtId(num)}
                </div>
              </div>
              {cat.key === "crime_against_dairy" && (
                <div
                  className="mt-1.5 font-hand text-[14px] text-lab-red"
                  style={{ transform: "rotate(-3deg)" }}
                >
                  so sorry to your cows
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 px-6">
        <Link
          href="/leaderboard"
          className="block text-center font-mono text-[12px] tracking-[0.18em] text-ink underline underline-offset-4"
        >
          // VIEW LIVE RECAP →
        </Link>
      </div>

      {finalists.length === 0 && (
        <div className="px-6 pt-4 text-center font-mono text-[10px] tracking-[0.14em] text-ink-soft">
          finalists were reset by host
        </div>
      )}
    </div>
  );
}
