"use client";

import { useCallback, useEffect, useState } from "react";
import {
  supabase,
  getConfig,
  ensureConfigRow,
  patchConfig,
  deleteAll,
} from "@/lib/supabase";
import { Button } from "@/components/Button";
import { Tape } from "@/components/Tape";
import { Stamp } from "@/components/Stamp";
import { FigLabel, NotebookHeader } from "@/components/NotebookHeader";
import { fmtId } from "@/lib/format";
import { CATEGORIES, type CategoryKey, type Config } from "@/lib/types";

const STORAGE_KEY = "schmear:admin-ok";

export default function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [pw, setPw] = useState("");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  if (!unlocked) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md px-7 pb-10 pt-12">
        <NotebookHeader pageId="NOTEBOOK_07 / PG.013 · ADMIN" />
        <div className="mt-8">
          <FigLabel>// ACCESS_CONTROL</FigLabel>
          <h1 className="mt-1 font-mono text-[28px] font-bold leading-none text-ink">
            host_console_
          </h1>
          <p className="mt-2 font-body text-[13px] text-ink-soft">
            Enter password. Lab personnel only.
          </p>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
            if (pw && pw === expected) {
              window.sessionStorage.setItem(STORAGE_KEY, "1");
              setUnlocked(true);
            } else {
              setPw("");
              setShake(true);
              setTimeout(() => setShake(false), 350);
            }
          }}
          className={`mt-6 ${shake ? "animate-shake" : ""}`}
        >
          <div className="font-mono text-[11px] tracking-[0.16em] text-ink-soft">PASSWORD</div>
          <div className="mt-1 flex items-center border-b-[1.5px] border-ink">
            <input
              autoFocus
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="• • • • • •"
              className="w-full bg-transparent py-2 font-mono text-[20px] text-ink caret-lab-red placeholder:text-ink-soft/50"
            />
          </div>
          <div className="mt-6">
            <Button type="submit">UNLOCK &gt;_</Button>
          </div>
        </form>
      </div>
    );
  }

  return <AdminDashboard />;
}

function AdminDashboard() {
  const [config, setConfig] = useState<Config | null>(null);
  const [totalInput, setTotalInput] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [r1VoteCount, setR1VoteCount] = useState(0);
  const [r2VoteCount, setR2VoteCount] = useState(0);
  const [r1Standings, setR1Standings] = useState<Array<[number, number]>>([]);
  const [r2Standings, setR2Standings] = useState<Map<CategoryKey, Array<[number, number]>>>(
    new Map(),
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const [cfg, { count: gc }, { data: r1 }, { count: r1c }, { data: r2 }, { count: r2c }] =
        await Promise.all([
          getConfig(),
          supabase.from("guests").select("*", { count: "exact", head: true }),
          supabase.from("votes_round1").select("cheese_number"),
          supabase.from("votes_round1").select("*", { count: "exact", head: true }),
          supabase.from("votes_round2").select("cheese_number, category"),
          supabase.from("votes_round2").select("*", { count: "exact", head: true }),
        ]);

      setConfig(cfg);
      setGuestCount(gc ?? 0);
      setR1VoteCount(r1c ?? 0);
      setR2VoteCount(r2c ?? 0);

      const m1 = new Map<number, number>();
      for (const row of (r1 ?? []) as Array<{ cheese_number: number }>) {
        m1.set(row.cheese_number, (m1.get(row.cheese_number) ?? 0) + 1);
      }
      setR1Standings([...m1.entries()].sort((a, b) => b[1] - a[1]));

      const m2 = new Map<CategoryKey, Map<number, number>>();
      for (const row of (r2 ?? []) as Array<{
        cheese_number: number;
        category: CategoryKey;
      }>) {
        if (!m2.has(row.category)) m2.set(row.category, new Map());
        const inner = m2.get(row.category)!;
        inner.set(row.cheese_number, (inner.get(row.cheese_number) ?? 0) + 1);
      }
      const ranked = new Map<CategoryKey, Array<[number, number]>>();
      m2.forEach((inner, cat) =>
        ranked.set(cat, [...inner.entries()].sort((a, b) => b[1] - a[1])),
      );
      setR2Standings(ranked);
    } catch (e: unknown) {
      console.error("[admin refetch]", e);
      setErr(e instanceof Error ? e.message : "Couldn't load data.");
    }
  }, []);

  useEffect(() => {
    (async () => {
      await ensureConfigRow();
      await refetch();
    })();
    const channel = supabase
      .channel(`admin-${Math.random().toString(36).slice(2, 8)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "guests" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes_round1" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "votes_round2" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "config" }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  useEffect(() => {
    if (config) setTotalInput(String(config.total_cheeses ?? 0));
  }, [config]);

  async function saveTotal() {
    setBusy("total");
    setErr(null);
    try {
      const n = Math.max(0, parseInt(totalInput || "0", 10));
      await patchConfig({ total_cheeses: n });
      await refetch();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(null);
    }
  }

  async function setFlag(patch: Partial<Config>) {
    setBusy("flag");
    setErr(null);
    try {
      await patchConfig(patch);
      await refetch();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Update failed.");
    } finally {
      setBusy(null);
    }
  }

  async function closeRound1AndSelectFinalists() {
    if (!confirm("Close Round 1 and pick the top 12 by total votes?")) return;
    setBusy("close-r1");
    setErr(null);
    try {
      const top = r1Standings.slice(0, 12).map(([cheese]) => cheese);
      await patchConfig({ round_1_open: false, finalist_ids: top });
      await refetch();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Close failed.");
    } finally {
      setBusy(null);
    }
  }

  async function resetEverything() {
    const phrase = prompt('Type "reset" to wipe all guests and votes.');
    if (phrase !== "reset") return;
    setBusy("reset");
    setErr(null);
    try {
      // Order matters because of FK references.
      await deleteAll("votes_round1");
      await deleteAll("votes_round2");
      await deleteAll("guests");
      await patchConfig({
        round_1_open: false,
        round_2_open: false,
        results_revealed: false,
        finalist_ids: [],
      });
      await refetch();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Reset failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!config) {
    return (
      <div className="flex min-h-dvh items-center justify-center font-mono text-sm tracking-[0.16em] text-ink-soft">
        // booting_console…
      </div>
    );
  }

  const phaseLabel = config.round_2_open
    ? "ROUND_02 · awards"
    : config.round_1_open
      ? "ROUND_01 · flights"
      : config.finalist_ids.length > 0
        ? "BETWEEN_ROUNDS"
        : "SETUP";

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-6 pb-10">
      <NotebookHeader
        pageId="NOTEBOOK_07 / PG.013 · ADMIN"
        right={<span className="text-lab-red">{phaseLabel}</span>}
      />

      <div className="px-1 pt-4">
        <Tape rotate={-2}>host console</Tape>
        <h1 className="mt-3 font-mono text-[26px] font-bold leading-none text-ink">
          dashboard<span className="text-lab-red">_</span>
        </h1>
        <p className="mt-1 font-body text-[12px] text-ink-soft">
          Wire the rounds. The boards update in real time.
        </p>
      </div>

      {/* Stats row */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="judges" value={guestCount} />
        <Stat label="r1_votes" value={r1VoteCount} />
        <Stat label="r2_votes" value={r2VoteCount} />
      </div>

      {err && (
        <div className="mt-3 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
          ERROR — {err}
        </div>
      )}

      {/* Setup */}
      <Section title="01 · SETUP" figLabel="// FIG.S1 — SPECIMEN COUNT">
        <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft">
          total cream cheeses in competition
        </div>
        <div className="mt-1.5 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={6}
            value={totalInput}
            onChange={(e) => setTotalInput(e.target.value)}
            className="numeric min-h-[56px] flex-1 border-[1.5px] border-ink bg-transparent px-3 font-mono text-[24px] font-bold text-ink"
          />
          <Button onClick={saveTotal} disabled={busy === "total"} className="!w-auto !px-6">
            SAVE
          </Button>
        </div>
      </Section>

      {/* Round 1 */}
      <Section title="02 · ROUND_01" figLabel="// FIG.S2 — FLIGHTS">
        <div className="flex flex-wrap gap-2">
          {config.round_1_open ? (
            <Button
              variant="ghost"
              onClick={() => setFlag({ round_1_open: false })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              PAUSE R1
            </Button>
          ) : (
            <Button
              onClick={() => setFlag({ round_1_open: true, round_2_open: false })}
              disabled={!!busy || config.total_cheeses < 6}
              className="!w-auto !px-4"
            >
              OPEN R1
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={closeRound1AndSelectFinalists}
            disabled={!!busy || r1Standings.length === 0}
            className="!w-auto !px-4"
          >
            CLOSE + PICK_TOP_12
          </Button>
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-ink-soft">
          status: <span className="text-ink">{config.round_1_open ? "open" : "closed"}</span> ·
          submissions: <span className="text-ink">{r1VoteCount}</span>
        </div>
        {r1Standings.length > 0 && (
          <details className="mt-2 border-[1.5px] border-dashed border-ink-soft p-2">
            <summary className="cursor-pointer font-mono text-[11px] font-bold tracking-[0.14em] text-ink">
              ▾ live standings ({r1Standings.length} samples)
            </summary>
            <ol className="mt-2 space-y-1 font-mono text-[12px]">
              {r1Standings.slice(0, 20).map(([n, c], i) => {
                const isFinalist = config.finalist_ids.includes(n);
                return (
                  <li key={n} className="flex items-center justify-between border-b border-dashed border-ink-soft/40 py-0.5">
                    <span className="text-ink">
                      {String(i + 1).padStart(2, "0")} · <span className="font-bold">{fmtId(n)}</span>
                      {isFinalist && (
                        <span className="ml-2 font-mono text-[9px] tracking-[0.14em] text-lab-green">
                          FINALIST
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-ink">{c}</span>
                  </li>
                );
              })}
            </ol>
          </details>
        )}
      </Section>

      {/* Round 2 */}
      <Section title="03 · ROUND_02" figLabel="// FIG.S3 — AWARDS">
        <div className="flex flex-wrap gap-2">
          {config.round_2_open ? (
            <Button
              variant="ghost"
              onClick={() => setFlag({ round_2_open: false })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              CLOSE R2
            </Button>
          ) : (
            <Button
              onClick={() => setFlag({ round_2_open: true, round_1_open: false })}
              disabled={!!busy || config.finalist_ids.length === 0}
              className="!w-auto !px-4"
            >
              OPEN R2
            </Button>
          )}
          {config.results_revealed ? (
            <Button
              variant="ghost"
              onClick={() => setFlag({ results_revealed: false })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              HIDE_RESULTS
            </Button>
          ) : (
            <Button
              variant="ghost"
              onClick={() => setFlag({ results_revealed: true })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              REVEAL_RESULTS
            </Button>
          )}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-ink-soft">
          status: <span className="text-ink">{config.round_2_open ? "open" : "closed"}</span> ·
          results: <span className="text-ink">{config.results_revealed ? "shown" : "hidden"}</span>
        </div>

        {config.finalist_ids.length > 0 && (
          <div className="mt-3">
            <div className="font-mono text-[10px] tracking-[0.18em] text-lab-red">FINALISTS</div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {config.finalist_ids.map((n) => (
                <span
                  key={n}
                  className="border-[1.5px] border-ink bg-card px-2 py-0.5 font-mono text-[14px] font-bold text-ink"
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {fmtId(n)}
                </span>
              ))}
            </div>
          </div>
        )}

        {r2Standings.size > 0 && (
          <details className="mt-3 border-[1.5px] border-dashed border-ink-soft p-2">
            <summary className="cursor-pointer font-mono text-[11px] font-bold tracking-[0.14em] text-ink">
              ▾ category standings
            </summary>
            <div className="mt-2 space-y-3 font-mono text-[11px]">
              {CATEGORIES.map((cat) => {
                const rows = r2Standings.get(cat.key) ?? [];
                return (
                  <div key={cat.key}>
                    <div className="font-bold tracking-[0.1em] text-ink">{cat.label}</div>
                    <ol className="ml-1 mt-1 space-y-0.5">
                      {rows.slice(0, 5).map(([n, c], i) => (
                        <li key={n} className="flex justify-between text-ink-soft">
                          <span>
                            {String(i + 1).padStart(2, "0")} · <span className="font-bold text-ink">{fmtId(n)}</span>
                          </span>
                          <span className="font-bold text-ink">{c}</span>
                        </li>
                      ))}
                      {rows.length === 0 && (
                        <li className="text-ink-soft/60">// no votes yet</li>
                      )}
                    </ol>
                  </div>
                );
              })}
            </div>
          </details>
        )}
      </Section>

      {/* Status */}
      {(config.round_1_open || config.round_2_open || config.results_revealed) && (
        <div className="mt-4 flex justify-center">
          {config.results_revealed ? (
            <Stamp label="RESULTS LIVE" color="green" />
          ) : config.round_2_open ? (
            <Stamp label="ROUND 02 LIVE" color="red" />
          ) : (
            <Stamp label="ROUND 01 LIVE" color="red" />
          )}
        </div>
      )}

      {/* Danger zone */}
      <Section title="04 · DANGER_ZONE" figLabel="// FIG.S4 — RESET">
        <Button variant="danger" onClick={resetEverything} disabled={!!busy}>
          ⚠ RESET_EVERYTHING
        </Button>
        <div className="mt-2 font-mono text-[10px] tracking-[0.14em] text-ink-soft">
          wipes guests + votes. keeps total_cheeses. type &ldquo;reset&rdquo; to confirm.
        </div>
      </Section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-[1.5px] border-ink bg-card p-2 text-center" style={{ boxShadow: "1px 1px 0 rgba(14,23,48,0.12)" }}>
      <div className="numeric font-mono text-[28px] font-bold leading-none text-ink" style={{ letterSpacing: "-0.02em" }}>
        {value}
      </div>
      <div className="mt-1 font-mono text-[9px] tracking-[0.16em] text-ink-soft">{label}</div>
    </div>
  );
}

function Section({
  title,
  figLabel,
  children,
}: {
  title: string;
  figLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="font-mono text-[10px] tracking-[0.22em] text-lab-red">{figLabel}</div>
      <h2 className="mt-1 font-mono text-[16px] font-bold tracking-[0.14em] text-ink">{title}</h2>
      <div className="mt-3 border-[1.5px] border-dashed border-ink-soft p-3" style={{ background: "rgba(253,252,247,0.55)" }}>
        {children}
      </div>
    </section>
  );
}
