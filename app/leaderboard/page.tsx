"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
import { supabase, getConfig } from "@/lib/supabase";
import { Stamp } from "@/components/Stamp";
import { Tape } from "@/components/Tape";
import { fmtId } from "@/lib/format";
import {
  NOMINATIONS,
  NOMINATION_ACCENT,
  type Config,
  type NominationKey,
} from "@/lib/types";

type TastingRow = {
  cheese_number: number;
  stars: number;
  nomination: NominationKey | null;
};

type CheeseAgg = {
  num: number;
  count: number;
  avg: number;
  sum: number;
};

export default function LeaderboardPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [tastings, setTastings] = useState<TastingRow[]>([]);
  const [guestCount, setGuestCount] = useState(0);
  const [completedJudges, setCompletedJudges] = useState(0);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());

  const refetch = useCallback(async () => {
    const [cfg, { data: t }, { count: gc }, { data: doneRows }] = await Promise.all([
      getConfig(),
      supabase.from("tastings").select("cheese_number, stars, nomination"),
      supabase.from("guests").select("*", { count: "exact", head: true }),
      // Per-guest completion check — count guests with >= 9 tastings
      supabase
        .from("tastings")
        .select("guest_id, cheese_number"),
    ]);

    setConfig(cfg);
    setGuestCount(gc ?? 0);
    setTastings((t ?? []) as TastingRow[]);

    if (doneRows) {
      const byGuest = new Map<string, number>();
      for (const r of doneRows as Array<{ guest_id: string }>) {
        byGuest.set(r.guest_id, (byGuest.get(r.guest_id) ?? 0) + 1);
      }
      setCompletedJudges([...byGuest.values()].filter((n) => n >= 9).length);
    }
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel(`leaderboard-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tastings" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "config" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const { aggregates, qualified, nominationsByCat } = useMemo(() => {
    const m = new Map<number, { count: number; sum: number }>();
    const noms = new Map<NominationKey, Map<number, number>>();
    for (const t of tastings) {
      const cur = m.get(t.cheese_number) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += t.stars;
      m.set(t.cheese_number, cur);
      if (t.nomination) {
        if (!noms.has(t.nomination)) noms.set(t.nomination, new Map());
        const inner = noms.get(t.nomination)!;
        inner.set(t.cheese_number, (inner.get(t.cheese_number) ?? 0) + 1);
      }
    }
    const arr: CheeseAgg[] = [...m.entries()].map(([num, v]) => ({
      num,
      count: v.count,
      sum: v.sum,
      avg: v.count > 0 ? v.sum / v.count : 0,
    }));
    arr.sort((a, b) => b.avg - a.avg || b.count - a.count);

    const min = config?.min_raters_to_qualify ?? 5;
    const qualified = arr.filter((a) => a.count >= min);

    const nominationsByCat: Record<NominationKey, Array<[number, number]>> = {
      erewhon: [],
      dining_hall: [],
      wildest: [],
      should_not_exist: [],
    };
    noms.forEach((inner, cat) => {
      nominationsByCat[cat] = [...inner.entries()].sort((a, b) => b[1] - a[1]);
    });

    return { aggregates: arr, qualified, nominationsByCat };
  }, [tastings, config]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-mono text-sm tracking-[0.16em] text-ink-soft">
        // collating_results…
      </div>
    );
  }

  const totalTastings = tastings.reduce((s) => s + 1, 0);
  const revealed = config?.results_revealed ?? false;

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1400px] px-6 py-6 sm:px-10 sm:py-10">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-mono text-[28px] font-bold leading-none tracking-[-0.02em] text-ink sm:text-[44px]">
            schmear &amp; schmooze<span className="text-lab-red">_</span>
          </h1>
          <p className="mt-1 font-body text-[13px] text-ink-soft sm:text-[15px]">
            {revealed
              ? `Final results · n=${totalTastings} tastings · ${completedJudges}/${guestCount} judges complete`
              : `Live tally · n=${totalTastings} tastings · ${completedJudges}/${guestCount} judges complete · awaiting reveal`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Tape rotate={2}>
            updated{" "}
            {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </Tape>
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-ink-soft">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "#c4302b", boxShadow: "0 0 6px #c4302b" }}
            />
            LIVE
          </div>
        </div>
      </header>

      <div className="absolute right-6 top-6 sm:right-12 sm:top-12">
        {revealed ? (
          <Stamp label="CERTIFIED" color="green" />
        ) : aggregates.length > 0 ? (
          <Stamp label="PRELIMINARY" color="red" />
        ) : null}
      </div>

      {!revealed && aggregates.length === 0 && (
        <div className="mt-10 border-[1.5px] border-dashed border-ink-soft p-10 text-center">
          <div className="font-mono text-[11px] tracking-[0.18em] text-ink-soft">// NO_DATA</div>
          <p className="mt-2 font-body text-[14px] text-ink-soft">
            As soon as judges start logging tastings, the standings will appear here.
          </p>
        </div>
      )}

      {!revealed && aggregates.length > 0 && (
        <SealedView config={config!} tastingCount={totalTastings} aggregates={aggregates} />
      )}

      {revealed && (
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-10">
          <div className="lg:col-span-2">
            <OverallRanking
              qualified={qualified}
              minRaters={config?.min_raters_to_qualify ?? 5}
              aggregates={aggregates}
            />
          </div>
          <div>
            <CategoryWinners
              byCat={nominationsByCat}
              aggregates={new Map(aggregates.map((a) => [a.num, a]))}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SealedView({
  config,
  tastingCount,
  aggregates,
}: {
  config: Config;
  tastingCount: number;
  aggregates: CheeseAgg[];
}) {
  const min = config.min_raters_to_qualify;
  const qualifiedCount = aggregates.filter((a) => a.count >= min).length;
  const needsTasters = aggregates
    .filter((a) => a.count < min)
    .sort((a, b) => a.count - b.count)
    .slice(0, 10);
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="border-[1.5px] border-dashed border-ink-soft p-6">
        <FigLabel>// FIG.7 — IN_PROGRESS</FigLabel>
        <h2 className="mt-1 font-mono text-[24px] font-bold leading-tight text-ink">
          results sealed_
        </h2>
        <p className="mt-2 font-body text-[14px] text-ink-soft">
          The host hasn&apos;t revealed the standings yet. Numbers in motion:
        </p>
        <ul className="mt-3 space-y-1 font-mono text-[12px] text-ink">
          <li>· {tastingCount} tastings logged</li>
          <li>
            · {qualifiedCount} / {aggregates.length} samples have ≥{min} raters
          </li>
          <li>
            · {needsTasters.length} samples below threshold
          </li>
        </ul>
      </div>

      {needsTasters.length > 0 && (
        <div>
          <FigLabel color="ink">// NEEDS_TASTERS (live nudge)</FigLabel>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {needsTasters.map((a) => (
              <span
                key={a.num}
                className="border-[1.5px] border-dashed border-ink-soft bg-card px-2 py-1 font-mono text-[13px] font-bold text-ink"
              >
                {fmtId(a.num)}
                <span className="ml-1 text-[9px] tracking-[0.1em] text-ink-soft">
                  ·{a.count}/{min}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OverallRanking({
  qualified,
  minRaters,
  aggregates,
}: {
  qualified: CheeseAgg[];
  minRaters: number;
  aggregates: CheeseAgg[];
}) {
  const top = qualified.slice(0, 10);
  const maxAvg = top[0]?.avg || 5;
  return (
    <div>
      <FigLabel>// FIG.8 — OVERALL_RANKING (★avg · min {minRaters} raters)</FigLabel>
      <h2 className="mt-1 font-mono text-[24px] font-bold leading-tight text-ink">
        the champion_
      </h2>

      {top.length === 0 ? (
        <div className="mt-4 border-[1.5px] border-dashed border-ink-soft p-6 font-mono text-[12px] text-ink-soft">
          // no cheese has hit the {minRaters}-rater threshold yet · {aggregates.length} samples in
          play
        </div>
      ) : (
        <>
          {top[0] && (
            <div
              className="mt-4 flex items-center gap-4 border-[1.5px] border-ink p-4"
              style={{ background: "rgba(253,252,247,0.7)", boxShadow: "3px 3px 0 #c4302b" }}
            >
              <div
                className="border-[1.5px] border-ink bg-card px-3 py-1 font-mono text-[42px] font-bold text-ink"
                style={{ letterSpacing: "-0.02em" }}
              >
                {fmtId(top[0].num)}
              </div>
              <div>
                <div className="font-mono text-[10px] tracking-[0.18em] text-lab-red">
                  CHAMPION
                </div>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-mono text-[28px] font-bold leading-none text-ink">
                    {top[0].avg.toFixed(2)}
                  </span>
                  <span className="font-mono text-[12px] text-ink-soft">/5.00</span>
                </div>
                <div className="mt-1 font-mono text-[10px] tracking-[0.14em] text-ink-soft">
                  {top[0].count} raters
                </div>
              </div>
              <div className="ml-auto flex gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={20}
                    fill={s <= Math.round(top[0].avg) ? "#ffe87a" : "transparent"}
                    stroke="#0e1730"
                    strokeWidth={1.5}
                  />
                ))}
              </div>
            </div>
          )}

          <table className="mt-6 w-full border-collapse">
            <thead>
              <tr className="border-b-[1.5px] border-ink">
                <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                  RNK
                </th>
                <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                  ID
                </th>
                <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                  AVG
                </th>
                <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                  BAR
                </th>
                <th className="px-1 py-1.5 text-right font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                  n
                </th>
              </tr>
            </thead>
            <tbody>
              {top.map((a, i) => {
                const isLead = i === 0;
                const pct = (a.avg / maxAvg) * 100;
                return (
                  <tr key={a.num} className="border-b border-dashed border-ink-soft">
                    <td
                      className={`px-1 py-1.5 font-mono text-[12px] font-bold ${
                        isLead ? "text-lab-red" : "text-ink"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </td>
                    <td
                      className="px-1 py-1.5 font-mono text-[14px] font-bold text-ink"
                      style={{ letterSpacing: "-0.02em" }}
                    >
                      {fmtId(a.num)}
                    </td>
                    <td className="px-1 py-1.5 font-mono text-[13px] font-bold text-ink">
                      {a.avg.toFixed(2)}
                    </td>
                    <td className="px-1 py-1.5">
                      <div className="h-2 w-full bg-ink/10">
                        <div
                          className="h-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            background: isLead ? "#c4302b" : "#0e1730",
                            backgroundImage:
                              "repeating-linear-gradient(45deg, transparent 0 4px, rgba(253,252,247,0.18) 4px 6px)",
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-1 py-1.5 text-right font-mono text-[12px] text-ink-soft">
                      {a.count}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

function CategoryWinners({
  byCat,
  aggregates,
}: {
  byCat: Record<NominationKey, Array<[number, number]>>;
  aggregates: Map<number, CheeseAgg>;
}) {
  return (
    <div>
      <FigLabel>// FIG.9 — CATEGORY_WINNERS</FigLabel>
      <h2 className="mt-1 font-mono text-[24px] font-bold leading-tight text-ink">
        the awards_
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {NOMINATIONS.map((nom) => {
          const ranked = byCat[nom.key] ?? [];
          const winner = ranked[0];
          const accent = NOMINATION_ACCENT[nom.key];
          const accentHex =
            accent === "green"
              ? "#5b8a45"
              : accent === "blue"
                ? "#2a5fb3"
                : accent === "red"
                  ? "#c4302b"
                  : "#0e1730";
          return (
            <div
              key={nom.key}
              className="border-[1.5px] border-ink p-3"
              style={{
                background: "rgba(253,252,247,0.7)",
                boxShadow: `2px 2px 0 ${accentHex}`,
              }}
            >
              <div className="font-mono text-[9px] tracking-[0.18em] text-ink-soft">
                {nom.short.toUpperCase()}
              </div>
              <div
                className="mt-0.5 font-mono text-[13px] font-bold leading-tight"
                style={{ color: accentHex }}
              >
                {nom.label}
              </div>
              {winner ? (
                <div className="mt-2 flex items-baseline gap-3">
                  <div
                    className="border-[1.5px] bg-card px-2 py-0.5 font-mono text-[28px] font-bold leading-none text-ink"
                    style={{ borderColor: accentHex, letterSpacing: "-0.02em" }}
                  >
                    {fmtId(winner[0])}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft">
                    {winner[1]} nominations
                    {aggregates.has(winner[0]) &&
                      ` · ${aggregates.get(winner[0])!.avg.toFixed(2)}★`}
                  </div>
                </div>
              ) : (
                <div className="mt-2 font-mono text-[10px] tracking-[0.14em] text-ink-soft">
                  // no nominations yet
                </div>
              )}
              {ranked.length > 1 && (
                <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
                  {ranked.slice(1, 4).map(([n, c]) => (
                    <span
                      key={n}
                      className="border border-dashed border-ink-soft px-1.5 py-0.5 font-mono text-ink-soft"
                    >
                      {fmtId(n)} · {c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FigLabel({ children, color = "red" }: { children: React.ReactNode; color?: "red" | "ink" }) {
  return (
    <div
      className={`font-mono text-[11px] tracking-[0.22em] ${
        color === "red" ? "text-lab-red" : "text-ink-soft"
      }`}
    >
      {children}
    </div>
  );
}
