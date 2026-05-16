"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, getConfig } from "@/lib/supabase";
import { loadGuest, saveGuest } from "@/lib/session";
import { Button } from "@/components/Button";
import { Tape } from "@/components/Tape";
import type { Config } from "@/lib/types";

type Phase = "loading" | "intake";

export default function GuestEntryPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("loading");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [config, setConfig] = useState<Config | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    (async () => {
      const existing = loadGuest();
      if (existing) {
        router.replace("/taste");
        return;
      }
      setConfig(await getConfig());
      setPhase("intake");
    })();
  }, [router]);

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
      if (!c.total_cheeses || c.total_cheeses < 1) {
        throw new Error("Host hasn't set up the competition yet. Hang tight.");
      }
      if (!c.tasting_open) {
        throw new Error("Tasting isn't open yet. Find the host.");
      }

      const { data: inserted, error: insErr } = await supabase
        .from("guests")
        .insert({ name: name.trim() })
        .select()
        .single();
      if (insErr) throw insErr;

      saveGuest({ id: inserted.id, name: inserted.name });
      router.replace("/taste");
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

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-md">
      <div className="px-7 pl-9 pt-8">
        <Tape rotate={-2}>judge console</Tape>
        <h1 className="mt-4 font-mono text-[32px] font-bold leading-[1.05] tracking-[-0.02em] text-ink">
          schmear
          <br />
          &amp;_schmooze<span className="text-lab-red">;</span>
        </h1>
        <p className="mt-2 font-body text-[14px] leading-snug text-ink-soft">
          A blind evaluation of the mightiest cream cheeses.
        </p>
        <div
          className="mt-1 font-hand text-[20px] text-lab-red"
          style={{ transform: "rotate(-1deg)" }}
        >
          (wohoo! it&apos;s my birthday)
        </div>

        <div className="mt-4 border-[1.5px] border-dashed border-ink-soft p-3 font-mono text-[10px] leading-[1.7] tracking-[0.04em] text-ink-soft">
          <div className="mb-1 font-bold tracking-[0.14em] text-ink">PROTOCOL</div>
          01 → 3 rounds × 3 tastings = 9 samples
          <br />
          02 → rate the schmear!
          <br />
          03 → optionally, nominate the schmear for an award category
          <br />
          04 → palate cleanse between rounds
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

        <div className="mt-6 font-mono text-[11px] tracking-[0.16em] text-ink-soft">
          02 · CONSENT
        </div>
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
              <span
                className="-mt-0.5 font-hand leading-none text-lab-red"
                style={{ fontSize: 24, lineHeight: 0.6 }}
              >
                ×
              </span>
            )}
          </span>
          <span>
            I understand bagels are an inadequate vehicle for the competition and I will use water
            crackers as instructed.
          </span>
        </label>

        {error && (
          <div className="mt-4 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
            ERROR — {error}
          </div>
        )}

        <div className="fixed inset-x-0 bottom-0 mx-auto max-w-md bg-paper/95 px-7 pb-5 pt-3 pl-9 backdrop-blur">
          <Button type="submit" disabled={submitting}>
            {submitting ? "CHECKING_IN…" : "BEGIN_TASTING >_"}
          </Button>
          <div className="mt-2 text-center font-mono text-[9px] tracking-[0.14em] text-ink-soft">
            {config && config.total_cheeses > 0
              ? `n=${config.total_cheeses} specimens · cap ${config.per_cheese_cap}/cheese`
              : "awaiting host setup"}
          </div>
        </div>
      </form>
    </div>
  );
}
