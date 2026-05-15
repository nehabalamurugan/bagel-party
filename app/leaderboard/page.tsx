"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, getConfig } from "@/lib/supabase";
import { Stamp } from "@/components/Stamp";
import { Tape } from "@/components/Tape";
import { fmtId } from "@/lib/format";
import { CATEGORIES, type CategoryKey, type Config } from "@/lib/types";

type R1Row = { cheese_number: number };
type R2Row = { cheese_number: number; category: CategoryKey };

export default function LeaderboardPage() {
  const [config, setConfig] = useState<Config | null>(null);
  const [r1Counts, setR1Counts] = useState<Map<number, number>>(new Map());
  const [r2Counts, setR2Counts] = useState<Map<CategoryKey, Map<number, number>>>(new Map());
  const [guestCount, setGuestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [highlight, setHighlight] = useState<number | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());

  const refetch = useCallback(async () => {
    const [cfg, { data: r1 }, { data: r2 }, { count: gc }] = await Promise.all([
      getConfig(),
      supabase.from("votes_round1").select("cheese_number"),
      supabase.from("votes_round2").select("cheese_number, category"),
      supabase.from("guests").select("*", { count: "exact", head: true }),
    ]);

    setConfig(cfg);
    setGuestCount(gc ?? 0);

    const m1 = new Map<number, number>();
    for (const row of (r1 ?? []) as R1Row[]) {
      m1.set(row.cheese_number, (m1.get(row.cheese_number) ?? 0) + 1);
    }
    setR1Counts(m1);

    const m2 = new Map<CategoryKey, Map<number, number>>();
    for (const row of (r2 ?? []) as R2Row[]) {
      if (!m2.has(row.category)) m2.set(row.category, new Map());
      const inner = m2.get(row.category)!;
      inner.set(row.cheese_number, (inner.get(row.cheese_number) ?? 0) + 1);
    }
    setR2Counts(m2);
    setUpdatedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
    const channel = supabase
      .channel(`leaderboard-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes_round1" }, (payload) => {
        if (payload.new && "cheese_number" in payload.new) {
          const n = (payload.new as R1Row).cheese_number;
          setHighlight(n);
          setTimeout(() => setHighlight((h) => (h === n ? null : h)), 1400);
        }
        refetch();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "votes_round2" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "config" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const ranked = useMemo(
    () => [...r1Counts.entries()].sort((a, b) => b[1] - a[1]),
    [r1Counts],
  );
  const totalR1Votes = useMemo(
    () => [...r1Counts.values()].reduce((s, v) => s + v, 0),
    [r1Counts],
  );

  const phase: "pre" | "round1" | "between" | "round2-pending" | "round2-revealed" = !config
    ? "pre"
    : config.results_revealed && config.finalist_ids.length > 0
      ? "round2-revealed"
      : config.round_2_open || (config.finalist_ids.length > 0 && !config.round_1_open)
        ? "round2-pending"
        : config.round_1_open
          ? "round1"
          : "pre";

  const round1Closed = config && !config.round_1_open && config.finalist_ids.length > 0;
  const blurR1 = !round1Closed && phase === "round1";

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-mono text-sm tracking-[0.16em] text-ink-soft">
        // collating_results…
      </div>
    );
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-[1400px] px-6 py-6 sm:px-10 sm:py-10">
      <header className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-mono text-[28px] font-bold leading-none tracking-[-0.02em] text-ink sm:text-[44px]">
            schmear &amp; schmooze<span className="text-lab-red">_</span>
          </h1>
          <p className="mt-1 font-body text-[13px] text-ink-soft sm:text-[15px]">
            {phase === "round2-revealed"
              ? "Final results · awards certified · double-blind"
              : phase === "round2-pending"
                ? "Round 02 in progress · results sealed"
                : phase === "round1"
                  ? `Round 01 · live tally · n=${totalR1Votes} votes · ${guestCount} judges`
                  : "Awaiting host setup · n=0"}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Tape rotate={2}>
            updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
        {phase === "round2-revealed" ? (
          <Stamp label="CERTIFIED" color="green" />
        ) : phase === "round2-pending" ? (
          <Stamp label="SEALED" color="red" />
        ) : phase === "round1" || ranked.length > 0 ? (
          <Stamp label="PRELIMINARY" color="red" />
        ) : null}
      </div>

      <div className="mt-8">
        {phase === "round2-revealed" ? (
          <RevealedFinals config={config!} r2Counts={r2Counts} />
        ) : phase === "round2-pending" ? (
          <SealedFinals config={config!} />
        ) : (
          <Round1Board
            ranked={ranked}
            totalVotes={totalR1Votes}
            blur={blurR1}
            highlight={highlight}
            finalists={config?.finalist_ids ?? []}
          />
        )}
      </div>
    </div>
  );
}

function Round1Board({
  ranked,
  totalVotes,
  blur,
  highlight,
  finalists,
}: {
  ranked: Array<[number, number]>;
  totalVotes: number;
  blur: boolean;
  highlight: number | null;
  finalists: number[];
}) {
  const top = ranked.slice(0, 6);
  const max = top[0]?.[1] || 1;
  const finalistSet = new Set(finalists);

  if (ranked.length === 0) {
    return (
      <div className="border-[1.5px] border-dashed border-ink-soft p-10 text-center">
        <div className="font-mono text-[11px] tracking-[0.18em] text-ink-soft">// NO_DATA_YET</div>
        <p className="mt-2 font-body text-[14px] text-ink-soft">
          As soon as judges start submitting their flights, you&apos;ll see the standings here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Bar chart */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-lab-red">
          // FIG.4a — votes by sample ID (top 6)
        </div>
        <div
          className="relative mt-3 flex items-end gap-3 border-l-[1.5px] border-b-[1.5px] border-ink pb-0 pl-3 sm:gap-4"
          style={{ height: 240 }}
        >
          <div
            className="absolute -left-7 top-1/2 font-mono text-[9px] tracking-[0.14em] text-ink-soft"
            style={{ transform: "rotate(-90deg) translateX(50%)", transformOrigin: "left center" }}
          >
            VOTES →
          </div>
          {top.map(([num, votes], i) => {
            const h = (votes / max) * 200;
            const isLead = i === 0;
            return (
              <div key={num} className="flex flex-1 flex-col items-center gap-1">
                <div className="font-mono text-[12px] font-bold text-ink">{votes}</div>
                <div
                  key={`bar-${num}-${votes}`}
                  className="stripe-light w-full transition-all duration-700"
                  style={{
                    height: h,
                    background: isLead ? "#c4302b" : "#0e1730",
                    backgroundImage: isLead
                      ? "repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,0.18) 4px 6px)"
                      : "repeating-linear-gradient(45deg, transparent 0 4px, rgba(253,252,247,0.12) 4px 6px)",
                    filter: blur ? "blur(8px)" : "none",
                    transition: "filter .3s",
                  }}
                />
                <div
                  className="mt-1 font-mono text-[12px] font-bold tracking-[-0.02em] text-ink"
                  style={{ filter: blur ? "blur(6px)" : "none", transition: "filter .3s" }}
                >
                  {fmtId(num)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center font-mono text-[9px] tracking-[0.14em] text-ink-soft">
          SAMPLE ID →
        </div>
        {blur && (
          <div className="mt-3 font-hand text-[16px] text-lab-red" style={{ transform: "rotate(-1deg)" }}>
            P.S. results blurred until R1 closes — no spoilers.
          </div>
        )}
      </div>

      {/* Ranking table */}
      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-lab-red">
          // TABLE.1 — ranked by total votes (n={totalVotes})
        </div>
        <table className="mt-3 w-full border-collapse">
          <thead>
            <tr className="border-b-[1.5px] border-ink">
              <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                RNK
              </th>
              <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                ID
              </th>
              <th className="px-1 py-1.5 text-left font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                STATUS
              </th>
              <th className="px-1 py-1.5 text-right font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                n
              </th>
              <th className="px-1 py-1.5 text-right font-mono text-[9px] font-bold tracking-[0.14em] text-ink-soft">
                %
              </th>
            </tr>
          </thead>
          <tbody>
            {ranked.slice(0, 12).map(([num, votes], i) => {
              const pct = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : "0.0";
              const isLead = i === 0;
              const isHi = highlight === num;
              const isFinalist = finalistSet.has(num);
              return (
                <tr
                  key={num}
                  className={`border-b border-dashed border-ink-soft ${isHi ? "animate-row-tick" : ""}`}
                >
                  <td
                    className={`px-1 py-1.5 font-mono text-[12px] font-bold ${
                      isLead ? "text-lab-red" : "text-ink"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td
                    className="px-1 py-1.5 font-mono text-[12px] font-bold text-ink"
                    style={{ letterSpacing: "-0.02em", filter: blur ? "blur(6px)" : "none" }}
                  >
                    {fmtId(num)}
                  </td>
                  <td className="px-1 py-1.5 font-body text-[12px] text-ink">
                    {isFinalist ? (
                      <span className="font-mono text-[10px] tracking-[0.14em] text-lab-green">
                        FINALIST
                      </span>
                    ) : (
                      <span className="font-mono text-[10px] tracking-[0.14em] text-ink-soft">
                        round_01
                      </span>
                    )}
                  </td>
                  <td className="px-1 py-1.5 text-right font-mono text-[12px] font-bold text-ink">
                    {votes}
                  </td>
                  <td className="px-1 py-1.5 text-right font-mono text-[12px] text-ink-soft">
                    {pct}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SealedFinals({ config }: { config: Config }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="border-[1.5px] border-dashed border-ink-soft p-8">
        <div className="font-mono text-[11px] tracking-[0.22em] text-lab-red">
          // FIG.5 — ROUND_02 BALLOT IN PROGRESS
        </div>
        <h2 className="mt-2 font-mono text-[28px] font-bold leading-tight text-ink">
          results sealed_
        </h2>
        <p className="mt-2 font-body text-[14px] text-ink-soft">
          The host will lift the embargo once the final votes are in.
        </p>
      </div>
      <div>
        <div className="font-mono text-[10px] tracking-[0.22em] text-lab-red">
          // TABLE.2 — finalists ({config.finalist_ids.length})
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {config.finalist_ids.map((n, i) => (
            <div key={n} className="flex flex-col items-center gap-1">
              <div className="font-mono text-[8px] tracking-[0.14em] text-ink-soft">
                F.{i + 1}
              </div>
              <div
                className="border-[1.5px] border-ink bg-card px-3 py-1 font-mono text-[20px] font-bold text-ink"
                style={{ letterSpacing: "-0.02em" }}
              >
                {fmtId(n)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RevealedFinals({
  config,
  r2Counts,
}: {
  config: Config;
  r2Counts: Map<CategoryKey, Map<number, number>>;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.22em] text-lab-red">
        // FIG.6 — CERTIFIED AWARDS · n={config.finalist_ids.length} finalists
      </div>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((cat) => {
          const inner = r2Counts.get(cat.key) ?? new Map<number, number>();
          const ranked = [...inner.entries()].sort((a, b) => b[1] - a[1]);
          const winner = ranked[0];
          const accent =
            cat.key === "best_execution"
              ? "#5b8a45"
              : cat.key === "wildest"
                ? "#2a5fb3"
                : cat.key === "crime_against_dairy" || cat.key === "personal_favorite"
                  ? "#c4302b"
                  : "#0e1730";
          return (
            <div
              key={cat.key}
              className="relative border-[1.5px] border-ink p-3"
              style={{
                background: "rgba(253,252,247,0.7)",
                boxShadow: `2px 2px 0 ${accent}`,
              }}
            >
              <div className="font-mono text-[9px] tracking-[0.18em] text-ink-soft">
                {cat.key.toUpperCase()}
              </div>
              <div
                className="mt-0.5 font-mono text-[14px] font-bold leading-tight"
                style={{ color: accent }}
              >
                {cat.label}
              </div>
              {winner ? (
                <div className="mt-2 flex items-baseline gap-3">
                  <div
                    className="border-[1.5px] bg-card px-2 py-1 font-mono text-[40px] font-bold leading-none text-ink"
                    style={{ borderColor: accent, letterSpacing: "-0.02em" }}
                  >
                    {fmtId(winner[0])}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft">
                    {winner[1]} votes
                  </div>
                </div>
              ) : (
                <div className="mt-3 font-mono text-[11px] tracking-[0.14em] text-ink-soft">
                  // no votes yet
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
