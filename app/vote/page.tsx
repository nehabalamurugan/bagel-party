"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getConfig } from "@/lib/supabase";
import { loadGuest, verifyGuest } from "@/lib/session";
import { Button } from "@/components/Button";
import { SampleCard } from "@/components/SampleCard";
import { Stamp } from "@/components/Stamp";
import { FigLabel, NotebookHeader } from "@/components/NotebookHeader";
import { TileSkeletonGrid } from "@/components/Skeleton";
import { fireConfetti } from "@/components/Confetti";
import type { StoredGuest } from "@/lib/session";

type Phase = "loading" | "voting" | "submitted" | "closed";

export default function Round1Page() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [guest, setGuest] = useState<StoredGuest | null>(null);
  const [picks, setPicks] = useState<number[]>([]);
  const [notes, setNotes] = useState("");
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

      const [{ data: existingVotes }, cfg] = await Promise.all([
        supabase.from("votes_round1").select("cheese_number").eq("guest_id", g.id),
        getConfig(),
      ]);

      if (existingVotes && existingVotes.length > 0) {
        // Returning voter — restore their picks so the receipt shows
        // YOUR_VOTES instead of an empty submitted screen.
        setPicks(existingVotes.map((v) => v.cheese_number as number));
        setPhase("submitted");
        return;
      }
      if (!cfg.round_1_open) {
        setPhase("closed");
        return;
      }
      setPhase("voting");
    })();
  }, [router]);

  function onTap(n: number) {
    setPicks((prev) => {
      const idx = prev.indexOf(n);
      if (idx >= 0) return prev.filter((x) => x !== n);
      if (prev.length >= 2) return prev;
      return [...prev, n];
    });
  }

  async function submit() {
    if (!guest || picks.length !== 2) return;
    setSubmitting(true);
    setError(null);
    try {
      const rows = picks.map((cheese_number) => ({
        guest_id: guest.id,
        cheese_number,
      }));
      const { error: insErr } = await supabase.from("votes_round1").insert(rows);
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
      <div className="mx-auto min-h-dvh w-full max-w-md px-7 pt-6">
        <div className="h-6 w-2/3 animate-pulse rounded bg-ink/10" />
        <div className="mt-6">
          <TileSkeletonGrid />
        </div>
      </div>
    );
  }

  if (phase === "submitted") {
    return <Submitted name={guest.name} picks={picks} />;
  }

  if (phase === "closed") {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center px-7 text-center">
        <div className="font-mono text-[11px] tracking-[0.22em] text-lab-red">// PANEL CLOSED</div>
        <h1 className="mt-2 font-mono text-[26px] font-bold leading-tight text-ink">
          tasting panel
          <br />
          not open_
        </h1>
        <p className="mt-3 font-body text-[14px] text-ink-soft">
          The host will open Round 1 voting shortly.
        </p>
      </div>
    );
  }

  const ready = picks.length === 2;
  const counter = `${picks.length}/2`;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col pb-32">
      <NotebookHeader
        pageId="NOTEBOOK_07 / PG.015"
        right={
          <span
            className="px-2 py-0.5"
            style={{
              background: ready ? "#ffe87a" : "transparent",
              border: ready ? "1.5px solid #0e1730" : "none",
              color: ready ? "#0e1730" : "#c4302b",
              transition: "background .2s",
            }}
          >
            TASTING_PANEL · {counter}
          </span>
        }
      />

      <div className="px-7 pt-4">
        <FigLabel>// FIG.2 — SCORE_SHEET</FigLabel>
        <h1 className="mt-1 font-mono text-[24px] font-bold leading-[1.05] text-ink">
          rank top two<span className="text-lab-red">_</span>
        </h1>
        <p className="mt-1 font-body text-[12px] text-ink-soft">
          tap to pick (first tap = #1, second = #2). tap again to undo.
        </p>
      </div>

      <div className="px-7 pt-4">
        <div className="grid grid-cols-2 gap-2.5">
          {guest.flight.map((n) => {
            const idx = picks.indexOf(n);
            const rank = idx >= 0 ? idx + 1 : null;
            const disabled = idx < 0 && picks.length >= 2;
            return (
              <SampleCard
                key={n}
                num={n}
                size={140}
                selected={idx >= 0}
                rank={rank}
                disabled={disabled}
                onClick={() => onTap(n)}
                className="w-full"
                style={{ width: "100%", height: 140 }}
              />
            );
          })}
        </div>
      </div>

      <div className="px-7 pt-5">
        <div className="font-mono text-[10px] tracking-[0.16em] text-ink-soft">
          FREE_NOTES (optional)
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value.slice(0, 140))}
          placeholder="observations..."
          rows={2}
          className="mt-1 block w-full resize-none border-[1.5px] border-ink bg-transparent px-3 py-2 font-hand text-[18px] leading-tight text-ink caret-lab-red"
        />
      </div>

      {error && (
        <div className="mx-7 mt-4 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
          ERROR — {error}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-paper/95 px-7 pb-5 pt-3 backdrop-blur">
        <Button onClick={submit} disabled={!ready || submitting}>
          {submitting ? "SUBMITTING…" : "SUBMIT_SPECIMENS >_"}
        </Button>
      </div>
    </div>
  );
}

function Submitted({ name, picks }: { name: string; picks: number[] }) {
  useEffect(() => {
    fireConfetti();
  }, []);
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-12">
      <NotebookHeader pageId="NOTEBOOK_07 / PG.015" />
      <div className="px-7 pt-6">
        <FigLabel>// FIG.3 — SUBMISSION RECEIPT</FigLabel>
        <h1 className="mt-1 font-mono text-[28px] font-bold leading-[1.05] text-ink">
          thanks,
          <br />
          {name || "subject"}_
        </h1>
        <p className="mt-3 font-body text-[14px] text-ink-soft">
          Your Round 1 ballot is in. The board updates as more judges submit.
        </p>
      </div>

      <div className="absolute right-4 top-12">
        <Stamp label="SUBMITTED" color="red" />
      </div>

      {picks.length > 0 && (
        <div className="mx-7 mt-6 flex items-center gap-3 border-[1.5px] border-dashed border-lab-green p-3 font-mono text-[11px] text-ink-soft">
          <span className="font-bold tracking-[0.12em] text-lab-green">YOUR_VOTES</span>
          {picks.map((n, i) => (
            <span key={n} className="font-bold text-ink">
              #{i + 1} → {String(n).padStart(3, "0")}
            </span>
          ))}
        </div>
      )}

      <div className="mt-8 px-7">
        <div className="border-[1.5px] border-dashed border-ink-soft p-4 font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-ink-soft">
          <div className="mb-1.5 font-bold tracking-[0.14em] text-ink">NEXT</div>
          01 → wait for round 01 to close
          <br />
          02 → host opens round 02 (awards)
          <br />
          03 → revisit this device for the ballot
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 px-7">
        <Link
          href="/leaderboard"
          className="text-center font-mono text-[12px] tracking-[0.18em] text-ink underline underline-offset-4"
        >
          // VIEW LIVE BOARD →
        </Link>
        <Link
          href="/finals"
          className="text-center font-mono text-[10px] tracking-[0.18em] text-ink-soft"
        >
          // check round_02 status
        </Link>
      </div>
    </div>
  );
}
