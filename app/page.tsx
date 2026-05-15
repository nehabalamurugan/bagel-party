"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, getConfig } from "@/lib/supabase";
import { loadGuest, saveGuest } from "@/lib/session";
import { assignFlight } from "@/lib/flight";
import { Button } from "@/components/Button";
import { SampleCard } from "@/components/SampleCard";
import { Tape } from "@/components/Tape";
import { FigLabel, NotebookHeader } from "@/components/NotebookHeader";
import type { Config } from "@/lib/types";

type Phase = "loading" | "intake" | "reveal";

export default function GuestEntryPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [flight, setFlight] = useState<number[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    (async () => {
      const existing = loadGuest();
      if (existing) {
        setFlight(existing.flight);
        setName(existing.name);
        setPhase("reveal");
        return;
      }
      setConfig(await getConfig());
      setPhase("intake");
    })();
  }, []);

  const canGo = name.trim().length > 0 && consent;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canGo) {
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const c = await getConfig();
      if (!c.total_cheeses || c.total_cheeses < 6) {
        throw new Error("Host hasn't set up the competition yet. Hang tight.");
      }
      if (!c.round_1_open) {
        throw new Error("Round 1 isn't open yet. Find the host.");
      }

      const assigned = await assignFlight(c.total_cheeses);
      const { data: inserted, error: insErr } = await supabase
        .from("guests")
        .insert({ name: name.trim(), flight: assigned })
        .select()
        .single();
      if (insErr) throw insErr;

      saveGuest({ id: inserted.id, name: inserted.name, flight: assigned });
      setFlight(assigned);
      setPhase("reveal");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (phase === "loading") {
    return (
      <div className="mx-auto flex min-h-dvh max-w-md items-center justify-center font-mono text-sm tracking-[0.16em] text-ink-soft">
        // initializing_…
      </div>
    );
  }

  if (phase === "reveal") {
    return <FlightReveal name={name} flight={flight} onGo={() => router.push("/vote")} />;
  }

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md">
      <NotebookHeader pageId="NOTEBOOK_07 / PG.014" />

      <div className="px-7 pl-9">
        <div className="mt-4">
          <Tape rotate={-2}>study no. 0042</Tape>
        </div>

        <h1 className="mt-3 font-mono text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          schmear
          <br />
          &amp;_schmooze<span className="text-lab-red">;</span>
        </h1>
        <p className="mt-2 font-body text-[14px] leading-snug text-ink-soft">
          A blind evaluation of the mightiest cream cheeses.
        </p>
        <div className="mt-1 font-hand text-[20px] text-lab-red" style={{ transform: "rotate(-1deg)" }}>
          (wohoo! it&apos;s my birthday)
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-7 pb-32 pl-9 pt-6">
        <div className="font-mono text-[11px] tracking-[0.16em] text-ink-soft">01 · JUDGE_NAME</div>
        <div
          className={`mt-1.5 flex items-center border-b-[1.5px] border-ink ${shake ? "animate-shake" : ""}`}
        >
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            placeholder="enter name"
            className="w-full bg-transparent py-2 font-mono text-[22px] text-ink placeholder:text-ink-soft/60 caret-lab-red"
          />
        </div>

        <div className="mt-6 font-mono text-[11px] tracking-[0.16em] text-ink-soft">02 · CONSENT</div>
        <label
          onClick={(e) => {
            e.preventDefault();
            setConsent((c) => !c);
          }}
          className="mt-2 flex cursor-pointer items-start gap-2.5 font-mono text-[12px] leading-relaxed text-ink"
        >
          <span
            className="mt-0.5 inline-flex h-[18px] w-[18px] flex-shrink-0 items-center justify-center border-[1.8px] border-ink"
            style={{ background: consent ? "#ffe87a" : "transparent" }}
          >
            {consent && (
              <span className="-mt-0.5 font-hand leading-none text-lab-red" style={{ fontSize: 24, lineHeight: 0.6 }}>
                ×
              </span>
            )}
          </span>
          <span>
            I understand bagels are an inadequate vehicle for the competition and I will use water crackers as instructed.
          </span>
        </label>

        {error && (
          <div className="mt-4 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
            ERROR — {error}
          </div>
        )}

        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-paper/95 px-7 pb-5 pt-3 pl-9 backdrop-blur">
          <Button type="submit" disabled={submitting}>
            {submitting ? "ASSIGNING…" : "ASSIGN_SAMPLES >_"}
          </Button>
          <div className="mt-2 text-center font-mono text-[9px] tracking-[0.14em] text-ink-soft">
            {config && config.total_cheeses > 0
              ? `randomized · double-blind · n=${config.total_cheeses} specimens`
              : "randomized · double-blind · awaiting host setup"}
          </div>
        </div>
      </form>
    </div>
  );
}

function FlightReveal({
  name,
  flight,
  onGo,
}: {
  name: string;
  flight: number[];
  onGo: () => void;
}) {
  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md pb-28">
      <NotebookHeader
        pageId="NOTEBOOK_07 / PG.014"
        right={
          <span>
            SUBJECT / <span className="text-ink">{name.toUpperCase()}</span>
          </span>
        }
      />

      <div className="px-7 pt-4">
        <FigLabel>// FIG.1 — YOUR SAMPLES</FigLabel>
        <h1 className="mt-1 font-mono text-[26px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          specimen
          <br />
          assignment_
        </h1>
        <p className="mt-2 font-body text-[13px] leading-snug text-ink-soft">
          Six labelled cheeses are on the table. IDs were randomized at intake. Please taste the following assinged to you and rank your top two.
        </p>
      </div>

      <div className="relative px-7 pt-5">
        <div className="grid grid-cols-3 gap-2.5">
          {flight.map((n, i) => (
            <div
              key={n}
              className="animate-fade-up relative"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <SampleCard num={n} size={96} />
              <div className="absolute -left-0.5 -top-1.5 font-mono text-[8px] tracking-[0.1em] text-ink-soft">
                fig.1.{i + 1}
              </div>
            </div>
          ))}
        </div>
        <div
          className="absolute -top-1 right-4 font-hand text-[18px] text-lab-red"
          style={{ transform: "rotate(6deg)" }}
        >
          taste these →
        </div>
      </div>

      <div className="px-7 pt-6">
        <div className="border-[1.5px] border-dashed border-ink-soft p-4 font-mono text-[11px] leading-[1.7] tracking-[0.04em] text-ink-soft">
          <div className="mb-1.5 font-bold tracking-[0.14em] text-ink">PROTOCOL</div>
          01 → sip water (cleanse palate)
          <br />
          02 → spread on water cracker
          <br />
          03 → score on vibe + flavor
          <br />
          04 → return to console; submit top_2
        </div>
      </div>

      <div className="px-7 pt-4">
        <Link
          href="/leaderboard"
          className="block text-center font-mono text-[10px] tracking-[0.18em] text-ink-soft underline underline-offset-4"
        >
          // PEEK AT LIVE BOARD →
        </Link>
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-paper/95 px-7 pb-5 pt-3 backdrop-blur">
        <Button onClick={onGo}>BEGIN_PANEL &gt;_</Button>
      </div>
    </div>
  );
}
