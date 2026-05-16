"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import { supabase, getConfig } from "@/lib/supabase";
import { loadGuest, verifyGuest, type StoredGuest } from "@/lib/session";
import { Button } from "@/components/Button";
import { Stamp } from "@/components/Stamp";
import { FigLabel, NotebookHeader } from "@/components/NotebookHeader";
import { Tape } from "@/components/Tape";
import { fmtId } from "@/lib/format";
import { fireConfetti } from "@/components/Confetti";
import {
  fetchCheeseCounts,
  fetchGuestTasted,
  suggestLeastTried,
} from "@/lib/tasting";
import {
  NOMINATIONS,
  NOMINATION_ACCENT,
  TASTINGS_PER_ROUND,
  TOTAL_TASTINGS,
  roundOf,
  type Config,
  type NominationKey,
} from "@/lib/types";

type Phase = "loading" | "closed" | "tasting" | "between_rounds" | "done";

export default function TastePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [guest, setGuest] = useState<StoredGuest | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [tasted, setTasted] = useState<Set<number>>(new Set());
  const [counts, setCounts] = useState<Map<number, number>>(new Map());

  // Per-tasting form state
  const [cheeseInput, setCheeseInput] = useState("");
  const [stars, setStars] = useState(0);
  const [nomination, setNomination] = useState<NominationKey | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const bootstrap = useCallback(async () => {
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

    const [c, gTasted, allCounts] = await Promise.all([
      getConfig(),
      fetchGuestTasted(g.id),
      fetchCheeseCounts(),
    ]);
    setConfig(c);
    setTasted(gTasted);
    setCounts(allCounts);
    setCompletedCount(gTasted.size);

    if (!c.tasting_open && gTasted.size === 0) {
      setPhase("closed");
      return;
    }
    if (gTasted.size >= TOTAL_TASTINGS) {
      setPhase("done");
      return;
    }
    // If they just finished a round (size = 3, 6) → palate cleanse
    if (gTasted.size > 0 && gTasted.size % TASTINGS_PER_ROUND === 0) {
      setPhase("between_rounds");
      return;
    }
    setPhase("tasting");
  }, [router]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  // Live counts via realtime
  useEffect(() => {
    const channel = supabase
      .channel(`taste-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "tastings" }, async () => {
        const c = await fetchCheeseCounts();
        setCounts(c);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "config" }, async () => {
        setConfig(await getConfig());
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  function resetForm() {
    setCheeseInput("");
    setStars(0);
    setNomination(null);
    setErr(null);
  }

  async function submitTasting() {
    if (!guest || !config) return;
    const n = parseInt(cheeseInput, 10);
    if (!Number.isFinite(n) || n < 1 || n > config.total_cheeses) {
      setErr(`Enter a number between 1 and ${config.total_cheeses}.`);
      return;
    }
    if (tasted.has(n)) {
      setErr(`You've already rated #${fmtId(n)} — pick a different one.`);
      return;
    }
    if (stars < 1 || stars > 5) {
      setErr("Pick a star rating.");
      return;
    }
    setSubmitting(true);
    setErr(null);
    try {
      const roundNumber = roundOf(completedCount);
      const { error: insErr } = await supabase.from("tastings").insert({
        guest_id: guest.id,
        cheese_number: n,
        stars,
        nomination,
        round_number: roundNumber,
      });
      if (insErr) {
        if (insErr.code === "23505") {
          setErr(`#${fmtId(n)} already rated — pick a different one.`);
        } else {
          throw insErr;
        }
        return;
      }
      fireConfetti();
      const newTasted = new Set(tasted);
      newTasted.add(n);
      setTasted(newTasted);
      const newCount = completedCount + 1;
      setCompletedCount(newCount);
      // Update local count immediately (realtime will reconcile)
      setCounts((prev) => {
        const m = new Map(prev);
        m.set(n, (m.get(n) ?? 0) + 1);
        return m;
      });
      resetForm();
      if (newCount >= TOTAL_TASTINGS) {
        setPhase("done");
      } else if (newCount % TASTINGS_PER_ROUND === 0) {
        setPhase("between_rounds");
      }
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Couldn't save. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading" || !guest || !config) {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center font-mono text-sm tracking-[0.16em] text-ink-soft">
        // loading_session…
      </div>
    );
  }

  if (phase === "closed") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-7 text-center">
        <div className="font-mono text-[11px] tracking-[0.22em] text-lab-red">// CLOSED</div>
        <h1 className="mt-2 font-mono text-[26px] font-bold leading-tight text-ink">
          tasting not open_
        </h1>
        <p className="mt-3 font-body text-[14px] text-ink-soft">
          The host hasn&apos;t opened tasting yet. Hang tight.
        </p>
      </div>
    );
  }

  if (phase === "between_rounds") {
    const justFinished = completedCount / TASTINGS_PER_ROUND;
    const nextRound = justFinished + 1;
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-7 text-center">
        <Tape rotate={-2} color="rgba(91,138,69,0.85)">
          palate cleanse
        </Tape>
        <h1 className="mt-6 font-mono text-[28px] font-bold leading-tight text-ink">
          round {String(justFinished).padStart(2, "0")} complete_
        </h1>
        <p className="mt-3 max-w-xs font-body text-[14px] text-ink-soft">
          Drink water. Eat a cracker. Reset your palate.
          <br />
          Round {nextRound} when you&apos;re ready.
        </p>
        <div className="mt-6">
          <Stamp label="3 LOGGED" color="green" />
        </div>
        <div className="mt-10 w-full">
          <Button onClick={() => setPhase("tasting")}>BEGIN_ROUND_{nextRound} &gt;_</Button>
        </div>
        <Link
          href="/leaderboard"
          className="mt-4 font-mono text-[10px] tracking-[0.18em] text-ink-soft underline underline-offset-4"
        >
          // peek at live board
        </Link>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-7 text-center">
        <Stamp label="CERTIFIED" color="green" />
        <h1 className="mt-6 font-mono text-[30px] font-bold leading-tight text-ink">
          nine logged_
        </h1>
        <p className="mt-3 max-w-xs font-body text-[14px] text-ink-soft">
          Your ballot is sealed, judge {guest.name}. Awards announced when host reveals.
        </p>
        <div className="mt-8 w-full">
          <Link
            href="/leaderboard"
            className="block w-full bg-ink py-4 text-center font-mono text-[14px] font-bold uppercase tracking-[0.22em] text-paper"
          >
            VIEW_LIVE_BOARD &gt;_
          </Link>
        </div>
      </div>
    );
  }

  // Active tasting form
  const tastingIndex = completedCount; // 0-indexed
  const round = roundOf(tastingIndex);
  const positionInRound = (tastingIndex % TASTINGS_PER_ROUND) + 1;

  const parsedN = parseInt(cheeseInput, 10);
  const validN = Number.isFinite(parsedN) && parsedN >= 1 && parsedN <= config.total_cheeses;
  const currentCount = validN ? (counts.get(parsedN) ?? 0) : 0;
  const overCap = validN && currentCount >= config.per_cheese_cap;
  const alreadyTasted = validN && tasted.has(parsedN);

  const suggestions = suggestLeastTried(config.total_cheeses, counts, tasted, 5);

  const ready = validN && !alreadyTasted && stars >= 1;

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md pb-32">
      <NotebookHeader
        right={
          <span>
            ROUND {String(round).padStart(2, "0")} / TASTING {positionInRound}/{TASTINGS_PER_ROUND}
          </span>
        }
      />

      <div className="px-7 pt-4">
        <FigLabel>// FIG.{round + 3} — SCORE_ENTRY</FigLabel>
        <h1 className="mt-1 font-mono text-[26px] font-bold leading-tight text-ink">
          sample {String(tastingIndex + 1).padStart(2, "0")} of {TOTAL_TASTINGS}
          <span className="text-lab-red">_</span>
        </h1>
        <p className="mt-1 font-body text-[12px] text-ink-soft">
          Type the cheese number, give it stars, and (optionally) nominate it for an award.
        </p>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="px-7 pt-4">
          <div className="font-mono text-[10px] tracking-[0.18em] text-lab-red">
            NEEDS_TASTERS ↓
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s.num}
                type="button"
                onClick={() => {
                  setCheeseInput(String(s.num));
                  setErr(null);
                }}
                className="border-[1.5px] border-dashed border-ink-soft bg-card px-2.5 py-1 font-mono text-[13px] font-bold text-ink hover:border-ink"
              >
                {fmtId(s.num)}
                <span className="ml-1 text-[9px] tracking-[0.1em] text-ink-soft">·{s.count}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cheese number */}
      <div className="px-7 pt-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ink-soft">
          01 · SAMPLE_ID
        </div>
        <div className="mt-1.5 flex items-end gap-3 border-b-[1.5px] border-ink">
          <input
            type="number"
            inputMode="numeric"
            value={cheeseInput}
            onChange={(e) => {
              setCheeseInput(e.target.value);
              setErr(null);
            }}
            placeholder="—"
            className="w-full bg-transparent py-1 font-mono text-[44px] font-bold leading-none text-ink caret-lab-red placeholder:text-ink-soft/40"
            style={{ letterSpacing: "-0.02em" }}
          />
          {validN && (
            <div className="pb-2 font-mono text-[10px] tracking-[0.14em] text-ink-soft">
              SMP-{fmtId(parsedN)}
            </div>
          )}
        </div>
        {/* Live counter / warnings */}
        <div className="mt-2 min-h-[20px] font-mono text-[11px] tracking-[0.04em]">
          {alreadyTasted ? (
            <span className="text-lab-red">⚠ already rated by you — pick a different #</span>
          ) : !validN && cheeseInput.length > 0 ? (
            <span className="text-lab-red">
              ⚠ out of range (1–{config.total_cheeses})
            </span>
          ) : validN ? (
            overCap ? (
              <span className="text-lab-red">
                ⚠ {currentCount} others tasted this — try a less-rated # ↑
              </span>
            ) : (
              <span className="text-ink-soft">
                {currentCount === 0
                  ? "fresh sample · 0 others have tried it"
                  : `${currentCount} others have tasted this`}
              </span>
            )
          ) : (
            <span className="text-ink-soft/60">// enter a number 1–{config.total_cheeses}</span>
          )}
        </div>
      </div>

      {/* Stars */}
      <div className="px-7 pt-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ink-soft">
          02 · OVERALL RATING (★/5)
        </div>
        <div className="mt-3 flex items-center justify-between gap-2">
          {[1, 2, 3, 4, 5].map((s) => {
            const active = stars >= s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setStars(s)}
                className="flex-1 active:scale-95"
                aria-label={`${s} star${s > 1 ? "s" : ""}`}
              >
                <Star
                  className="mx-auto"
                  size={48}
                  fill={active ? "#ffe87a" : "transparent"}
                  stroke={active ? "#0e1730" : "#3a4866"}
                  strokeWidth={1.5}
                />
              </button>
            );
          })}
        </div>
        {stars > 0 && (
          <div
            className="mt-1 text-center font-hand text-[16px] text-lab-red"
            style={{ transform: "rotate(-0.8deg)" }}
          >
            {stars === 5
              ? "elite schmear"
              : stars === 4
                ? "very respectable"
                : stars === 3
                  ? "fine, i guess"
                  : stars === 2
                    ? "questionable"
                    : "crimes were committed"}
          </div>
        )}
      </div>

      {/* Nomination */}
      <div className="px-7 pt-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ink-soft">
          03 · NOMINATION (optional)
        </div>
        <div className="mt-2 flex flex-col gap-1.5">
          {NOMINATIONS.map((nom) => {
            const selected = nomination === nom.key;
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
              <button
                key={nom.key}
                type="button"
                onClick={() => setNomination(selected ? null : nom.key)}
                className="flex items-center gap-2.5 border-[1.5px] px-3 py-2.5 text-left font-mono text-[12px] font-bold transition-colors duration-150"
                style={{
                  borderStyle: selected ? "solid" : "dashed",
                  borderColor: selected ? accentHex : "#3a4866",
                  background: selected ? accentHex : "transparent",
                  color: selected ? "#fdfcf7" : "#0e1730",
                }}
              >
                <span
                  className="inline-flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center border-[1.5px]"
                  style={{
                    borderColor: selected ? "#fdfcf7" : "#3a4866",
                    background: selected ? "#fdfcf7" : "transparent",
                  }}
                >
                  {selected && (
                    <span
                      className="leading-none"
                      style={{ color: accentHex, fontSize: 11, fontWeight: 900 }}
                    >
                      ×
                    </span>
                  )}
                </span>
                {nom.label}
              </button>
            );
          })}
          {nomination && (
            <button
              type="button"
              onClick={() => setNomination(null)}
              className="self-start font-mono text-[10px] tracking-[0.14em] text-ink-soft underline underline-offset-2"
            >
              // clear nomination
            </button>
          )}
        </div>
      </div>

      {err && (
        <div className="mx-7 mt-4 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
          ERROR — {err}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-paper/95 px-7 pb-5 pt-3 backdrop-blur">
        <Button onClick={submitTasting} disabled={!ready || submitting}>
          {submitting
            ? "LOGGING…"
            : `LOG_TASTING ${tastingIndex + 1}/${TOTAL_TASTINGS} >_`}
        </Button>
        <div className="mt-2 text-center font-mono text-[9px] tracking-[0.14em] text-ink-soft">
          {overCap && validN
            ? "// soft cap exceeded — submit anyway if you must"
            : "// confetti on submit · no take-backs"}
        </div>
      </div>
    </div>
  );
}
