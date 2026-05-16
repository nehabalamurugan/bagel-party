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
import {
  NOMINATIONS,
  TOTAL_TASTINGS,
  type Config,
  type NominationKey,
} from "@/lib/types";

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

type TastingRow = {
  guest_id: string;
  cheese_number: number;
  stars: number;
  nomination: NominationKey | null;
};

function AdminDashboard() {
  const [config, setConfig] = useState<Config | null>(null);
  const [totalInput, setTotalInput] = useState("");
  const [capInput, setCapInput] = useState("");
  const [minRatersInput, setMinRatersInput] = useState("");
  const [guestCount, setGuestCount] = useState(0);
  const [tastingCount, setTastingCount] = useState(0);
  const [completedJudges, setCompletedJudges] = useState(0);
  const [perCheese, setPerCheese] = useState<
    Array<{ num: number; count: number; avg: number }>
  >([]);
  const [perCategory, setPerCategory] = useState<
    Map<NominationKey, Array<[number, number]>>
  >(new Map());
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      const [cfg, { count: gc }, { data: rows, count: tc }] = await Promise.all([
        getConfig(),
        supabase.from("guests").select("*", { count: "exact", head: true }),
        supabase
          .from("tastings")
          .select("guest_id, cheese_number, stars, nomination", { count: "exact" }),
      ]);

      setConfig(cfg);
      setGuestCount(gc ?? 0);
      setTastingCount(tc ?? 0);

      const tastings = (rows ?? []) as TastingRow[];
      const byGuest = new Map<string, number>();
      const byCheese = new Map<number, { count: number; sum: number }>();
      const byCat = new Map<NominationKey, Map<number, number>>();

      for (const t of tastings) {
        byGuest.set(t.guest_id, (byGuest.get(t.guest_id) ?? 0) + 1);
        const c = byCheese.get(t.cheese_number) ?? { count: 0, sum: 0 };
        c.count += 1;
        c.sum += t.stars;
        byCheese.set(t.cheese_number, c);
        if (t.nomination) {
          if (!byCat.has(t.nomination)) byCat.set(t.nomination, new Map());
          const inner = byCat.get(t.nomination)!;
          inner.set(t.cheese_number, (inner.get(t.cheese_number) ?? 0) + 1);
        }
      }

      setCompletedJudges(
        [...byGuest.values()].filter((n) => n >= TOTAL_TASTINGS).length,
      );

      const arr = [...byCheese.entries()].map(([num, v]) => ({
        num,
        count: v.count,
        avg: v.sum / v.count,
      }));
      arr.sort((a, b) => b.count - a.count);
      setPerCheese(arr);

      const ranked = new Map<NominationKey, Array<[number, number]>>();
      byCat.forEach((inner, cat) =>
        ranked.set(cat, [...inner.entries()].sort((a, b) => b[1] - a[1])),
      );
      setPerCategory(ranked);
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
      .on("postgres_changes", { event: "*", schema: "public", table: "tastings" }, refetch)
      .on("postgres_changes", { event: "*", schema: "public", table: "config" }, refetch)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  useEffect(() => {
    if (config) {
      setTotalInput(String(config.total_cheeses ?? 0));
      setCapInput(String(config.per_cheese_cap ?? 20));
      setMinRatersInput(String(config.min_raters_to_qualify ?? 5));
    }
  }, [config]);

  async function saveConfig(patch: Partial<Config>) {
    setBusy("save");
    setErr(null);
    try {
      await patchConfig(patch);
      await refetch();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(null);
    }
  }

  async function resetEverything() {
    const phrase = prompt('Type "reset" to wipe all guests and tastings.');
    if (phrase !== "reset") return;
    setBusy("reset");
    setErr(null);
    try {
      await deleteAll("tastings");
      await deleteAll("guests");
      await patchConfig({
        tasting_open: false,
        results_revealed: false,
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

  const phaseLabel = config.tasting_open
    ? "TASTING · live"
    : config.results_revealed
      ? "RESULTS · revealed"
      : "SETUP";

  const qualifiedCount = perCheese.filter(
    (a) => a.count >= config.min_raters_to_qualify,
  ).length;
  const overCap = perCheese.filter((a) => a.count >= config.per_cheese_cap);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md px-6 pb-10">
      <NotebookHeader right={<span className="text-lab-red">{phaseLabel}</span>} />

      <div className="px-1 pt-4">
        <Tape rotate={-2}>host console</Tape>
        <h1 className="mt-3 font-mono text-[26px] font-bold leading-none text-ink">
          dashboard<span className="text-lab-red">_</span>
        </h1>
        <p className="mt-1 font-body text-[12px] text-ink-soft">
          Self-paced 3×3 tasting. Boards update in real time.
        </p>
      </div>

      {/* Stats */}
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="judges" value={guestCount} />
        <Stat label="tastings" value={tastingCount} />
        <Stat
          label="finished"
          value={completedJudges}
          sub={guestCount > 0 ? `/${guestCount}` : ""}
        />
      </div>

      {err && (
        <div className="mt-3 border-[1.5px] border-dashed border-lab-red p-3 font-mono text-[11px] leading-relaxed text-lab-red">
          ERROR — {err}
        </div>
      )}

      {/* Setup */}
      <Section title="01 · SETUP" figLabel="// FIG.S1 — PARAMETERS">
        <div className="space-y-3">
          <NumberRow
            label="total cream cheeses"
            value={totalInput}
            onChange={setTotalInput}
            onSave={() =>
              saveConfig({
                total_cheeses: Math.max(0, parseInt(totalInput || "0", 10)),
              })
            }
            busy={busy === "save"}
            min={1}
          />
          <NumberRow
            label="per-cheese soft cap"
            value={capInput}
            onChange={setCapInput}
            onSave={() =>
              saveConfig({
                per_cheese_cap: Math.max(1, parseInt(capInput || "20", 10)),
              })
            }
            busy={busy === "save"}
            min={1}
            help="warns when a cheese has been tasted by this many people"
          />
          <NumberRow
            label="min raters to qualify"
            value={minRatersInput}
            onChange={setMinRatersInput}
            onSave={() =>
              saveConfig({
                min_raters_to_qualify: Math.max(
                  1,
                  parseInt(minRatersInput || "5", 10),
                ),
              })
            }
            busy={busy === "save"}
            min={1}
            help="cheeses with fewer raters won't appear in the overall ranking"
          />
        </div>
      </Section>

      {/* Tasting toggle */}
      <Section title="02 · TASTING" figLabel="// FIG.S2 — OPEN / CLOSE">
        <div className="flex flex-wrap gap-2">
          {config.tasting_open ? (
            <Button
              variant="ghost"
              onClick={() => saveConfig({ tasting_open: false })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              CLOSE_TASTING
            </Button>
          ) : (
            <Button
              onClick={() => saveConfig({ tasting_open: true })}
              disabled={!!busy || config.total_cheeses < 1}
              className="!w-auto !px-4"
            >
              OPEN_TASTING
            </Button>
          )}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-ink-soft">
          status:{" "}
          <span className="text-ink">{config.tasting_open ? "open" : "closed"}</span>
        </div>
      </Section>

      {/* Results reveal */}
      <Section title="03 · RESULTS" figLabel="// FIG.S3 — REVEAL">
        <div className="flex flex-wrap gap-2">
          {config.results_revealed ? (
            <Button
              variant="ghost"
              onClick={() => saveConfig({ results_revealed: false })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              HIDE_RESULTS
            </Button>
          ) : (
            <Button
              onClick={() => saveConfig({ results_revealed: true })}
              disabled={!!busy}
              className="!w-auto !px-4"
            >
              REVEAL_RESULTS
            </Button>
          )}
        </div>
        <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-ink-soft">
          status:{" "}
          <span className="text-ink">{config.results_revealed ? "shown" : "hidden"}</span>{" "}
          · {qualifiedCount}/{perCheese.length} cheeses qualified ·{" "}
          {overCap.length} over cap
        </div>
      </Section>

      {/* Standings preview */}
      {perCheese.length > 0 && (
        <details className="mt-4 border-[1.5px] border-dashed border-ink-soft p-3">
          <summary className="cursor-pointer font-mono text-[11px] font-bold tracking-[0.14em] text-ink">
            ▾ per-cheese standings ({perCheese.length})
          </summary>
          <ol className="mt-2 space-y-1 font-mono text-[12px]">
            {perCheese.slice(0, 30).map((a) => {
              const isOverCap = a.count >= config.per_cheese_cap;
              const isQualified = a.count >= config.min_raters_to_qualify;
              return (
                <li
                  key={a.num}
                  className="flex items-center justify-between border-b border-dashed border-ink-soft/40 py-0.5"
                >
                  <span className="text-ink">
                    <span className="font-bold">{fmtId(a.num)}</span>
                    {isOverCap && (
                      <span className="ml-2 font-mono text-[9px] tracking-[0.12em] text-lab-red">
                        OVER_CAP
                      </span>
                    )}
                    {!isQualified && (
                      <span className="ml-2 font-mono text-[9px] tracking-[0.12em] text-ink-soft">
                        needs_more
                      </span>
                    )}
                  </span>
                  <span className="flex gap-3 font-bold text-ink">
                    <span>{a.avg.toFixed(2)}★</span>
                    <span>{a.count}n</span>
                  </span>
                </li>
              );
            })}
          </ol>
        </details>
      )}

      {/* Category standings */}
      {perCategory.size > 0 && (
        <details className="mt-2 border-[1.5px] border-dashed border-ink-soft p-3">
          <summary className="cursor-pointer font-mono text-[11px] font-bold tracking-[0.14em] text-ink">
            ▾ category standings
          </summary>
          <div className="mt-2 space-y-3 font-mono text-[11px]">
            {NOMINATIONS.map((nom) => {
              const rows = perCategory.get(nom.key) ?? [];
              return (
                <div key={nom.key}>
                  <div className="font-bold tracking-[0.1em] text-ink">{nom.label}</div>
                  <ol className="ml-1 mt-1 space-y-0.5">
                    {rows.slice(0, 5).map(([n, c], i) => (
                      <li key={n} className="flex justify-between text-ink-soft">
                        <span>
                          {String(i + 1).padStart(2, "0")} ·{" "}
                          <span className="font-bold text-ink">{fmtId(n)}</span>
                        </span>
                        <span className="font-bold text-ink">{c}</span>
                      </li>
                    ))}
                    {rows.length === 0 && (
                      <li className="text-ink-soft/60">// no nominations yet</li>
                    )}
                  </ol>
                </div>
              );
            })}
          </div>
        </details>
      )}

      {/* Status stamp */}
      {(config.tasting_open || config.results_revealed) && (
        <div className="mt-4 flex justify-center">
          {config.results_revealed ? (
            <Stamp label="RESULTS LIVE" color="green" />
          ) : (
            <Stamp label="TASTING LIVE" color="red" />
          )}
        </div>
      )}

      {/* Danger zone */}
      <Section title="04 · DANGER_ZONE" figLabel="// FIG.S4 — RESET">
        <Button variant="danger" onClick={resetEverything} disabled={!!busy}>
          ⚠ RESET_EVERYTHING
        </Button>
        <div className="mt-2 font-mono text-[10px] tracking-[0.14em] text-ink-soft">
          wipes guests + tastings. keeps config (total/cap/min). type &ldquo;reset&rdquo; to
          confirm.
        </div>
      </Section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
}: {
  label: string;
  value: number;
  sub?: string;
}) {
  return (
    <div
      className="border-[1.5px] border-ink bg-card p-2 text-center"
      style={{ boxShadow: "1px 1px 0 rgba(14,23,48,0.12)" }}
    >
      <div
        className="numeric font-mono text-[28px] font-bold leading-none text-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        {value}
        {sub && <span className="text-[14px] text-ink-soft">{sub}</span>}
      </div>
      <div className="mt-1 font-mono text-[9px] tracking-[0.16em] text-ink-soft">
        {label}
      </div>
    </div>
  );
}

function NumberRow({
  label,
  value,
  onChange,
  onSave,
  busy,
  min,
  help,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onSave: () => void;
  busy: boolean;
  min: number;
  help?: string;
}) {
  return (
    <div>
      <div className="font-mono text-[10px] tracking-[0.14em] text-ink-soft">{label}</div>
      <div className="mt-1 flex gap-2">
        <input
          type="number"
          inputMode="numeric"
          min={min}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="numeric min-h-[48px] flex-1 border-[1.5px] border-ink bg-transparent px-3 font-mono text-[20px] font-bold text-ink"
        />
        <Button onClick={onSave} disabled={busy} className="!w-auto !px-4 !min-h-[48px] !text-[12px]">
          SAVE
        </Button>
      </div>
      {help && (
        <div className="mt-1 font-mono text-[9px] tracking-[0.12em] text-ink-soft">{help}</div>
      )}
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
      <h2 className="mt-1 font-mono text-[16px] font-bold tracking-[0.14em] text-ink">
        {title}
      </h2>
      <div
        className="mt-3 border-[1.5px] border-dashed border-ink-soft p-3"
        style={{ background: "rgba(253,252,247,0.55)" }}
      >
        {children}
      </div>
    </section>
  );
}
