// Lab Notebook — interactive prototype
// 4-screen flow: intake → flight reveal → tasting panel → results
// State persists in localStorage; refresh keeps your place.

const { useState, useEffect, useRef, useMemo } = React;

// ─── Tokens ──────────────────────────────────────────────────────────────
const labTokens = {
  light: {
    paper: "#fdfcf7",
    ink: "#0e1730",
    inkSoft: "#3a4866",
    inkDim: "rgba(14,23,48,0.55)",
    grid: "rgba(70,110,160,0.18)",
    gridMinor: "rgba(70,110,160,0.08)",
    red: "#c4302b",
    yellow: "#ffe87a",
    green: "#5b8a45",
    blue: "#2a5fb3",
    cardBg: "rgba(253,252,247,0.92)",
    tapeBg: "rgba(255,232,122,0.85)",
  },
  dark: {
    paper: "#0e1424",
    ink: "#e6ecff",
    inkSoft: "#9fb0d6",
    inkDim: "rgba(230,236,255,0.55)",
    grid: "rgba(120,180,255,0.18)",
    gridMinor: "rgba(120,180,255,0.07)",
    red: "#ff5e57",
    yellow: "#ffe666",
    green: "#7dd97a",
    blue: "#7aa9ff",
    cardBg: "rgba(20,28,52,0.7)",
    tapeBg: "rgba(255,230,102,0.85)",
  },
};
const FONT = {
  mono: '"JetBrains Mono", ui-monospace, "SF Mono", monospace',
  hand: '"Caveat", "Marker Felt", cursive',
  body: '"Newsreader", Georgia, serif',
};

// Paper backgrounds for tweaks
function paperBg(variant, t) {
  if (variant === "graph") {
    return {
      backgroundColor: t.paper,
      backgroundImage: `
        linear-gradient(${t.grid} 1px, transparent 1px),
        linear-gradient(90deg, ${t.grid} 1px, transparent 1px),
        linear-gradient(${t.gridMinor} 1px, transparent 1px),
        linear-gradient(90deg, ${t.gridMinor} 1px, transparent 1px)`,
      backgroundSize: "40px 40px, 40px 40px, 8px 8px, 8px 8px",
    };
  }
  if (variant === "dot") {
    return {
      backgroundColor: t.paper,
      backgroundImage: `radial-gradient(${t.grid} 1.2px, transparent 1.4px)`,
      backgroundSize: "16px 16px",
    };
  }
  if (variant === "engineering") {
    return {
      backgroundColor: t.paper,
      backgroundImage: `
        linear-gradient(${t.grid} 1.5px, transparent 1.5px),
        linear-gradient(90deg, ${t.grid} 1.5px, transparent 1.5px),
        linear-gradient(${t.gridMinor} 1px, transparent 1px),
        linear-gradient(90deg, ${t.gridMinor} 1px, transparent 1px),
        linear-gradient(${t.gridMinor} 1px, transparent 1px),
        linear-gradient(90deg, ${t.gridMinor} 1px, transparent 1px),
        linear-gradient(${t.gridMinor} 1px, transparent 1px),
        linear-gradient(90deg, ${t.gridMinor} 1px, transparent 1px),
        linear-gradient(${t.gridMinor} 1px, transparent 1px),
        linear-gradient(90deg, ${t.gridMinor} 1px, transparent 1px)`,
      backgroundSize:
        "50px 50px, 50px 50px, 10px 10px, 10px 10px, 20px 20px, 20px 20px, 30px 30px, 30px 30px, 40px 40px, 40px 40px",
    };
  }
  return { backgroundColor: t.paper };
}

// Format a sample ID
function fmtId(num, format) {
  if (format === "smp") return `SMP-${String(num).padStart(3, "0")}`;
  if (format === "padded2") return String(num).padStart(2, "0");
  return String(num).padStart(3, "0");
}

// ─── Reusable bits ───────────────────────────────────────────────────────
function Tape({ children, color, rotate = -1.5, style = {}, t }) {
  return (
    <span style={{
      display: "inline-block",
      background: color || t.tapeBg,
      padding: "4px 14px",
      fontFamily: FONT.hand,
      fontSize: 18,
      color: "#1f1240",
      transform: `rotate(${rotate}deg)`,
      boxShadow: "0 1px 2px rgba(14,23,48,0.18)",
      ...style,
    }}>{children}</span>
  );
}

function SampleCard({ num, size = 100, selected = false, rank, onClick, t, idFormat, showStamps }) {
  const id = fmtId(num, idFormat);
  return (
    <div
      onClick={onClick}
      style={{
        width: size, height: size,
        background: selected ? t.yellow : t.cardBg,
        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? t.ink : t.inkSoft}`,
        borderRadius: 4,
        position: "relative",
        cursor: onClick ? "pointer" : "default",
        padding: 8,
        boxShadow: selected ? `2px 2px 0 ${t.ink}` : `1px 1px 0 rgba(14,23,48,0.12)`,
        transition: "transform .12s, background .18s",
        transform: selected ? "translate(-1px,-1px)" : "none",
        userSelect: "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 8, color: t.inkSoft, letterSpacing: "0.1em" }}>
          SMP-ID
        </div>
        {rank && showStamps && (
          <div className="stamp-in" key={`rank-${rank}`} style={{
            fontFamily: FONT.hand, fontSize: 22, color: t.red,
            lineHeight: 1,
          }}>
            #{rank}
          </div>
        )}
      </div>
      <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", textAlign: "center" }}>
        <div style={{
          fontFamily: FONT.mono,
          fontSize: size * (idFormat === "smp" ? 0.18 : (idFormat === "padded2" ? 0.42 : 0.34)),
          fontWeight: 700,
          color: selected ? t.ink : t.ink,
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}>
          {id}
        </div>
      </div>
      <div style={{
        position: "absolute", bottom: 8, left: 8, right: 8,
        display: "flex", justifyContent: "space-between",
        fontFamily: FONT.mono, fontSize: 8, color: t.inkSoft,
        letterSpacing: "0.06em",
      }}>
        <span>n=1</span>
        {selected ? <span style={{ color: t.red }}>✓</span> : <span>·</span>}
      </div>
    </div>
  );
}

// Status bar
function StatusBar({ color }) {
  return (
    <div className="statusbar" style={{ color }}>
      <div>9:41</div>
      <div className="right">
        <svg width="16" height="11" viewBox="0 0 14 10" fill="none">
          <rect x="0" y="6" width="2" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="4" width="2" height="6" rx="0.5" fill="currentColor"/>
          <rect x="8" y="2" width="2" height="8" rx="0.5" fill="currentColor"/>
          <rect x="12" y="0" width="2" height="10" rx="0.5" fill="currentColor"/>
        </svg>
        <svg width="16" height="11" viewBox="0 0 14 10" fill="none">
          <path d="M7 9 L1.5 3.5 Q7 -1 12.5 3.5 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="7" cy="8" r="1" fill="currentColor"/>
        </svg>
        <div className="battery" />
      </div>
    </div>
  );
}

// ─── Data ────────────────────────────────────────────────────────────────
const BRANDS = [
  "Tompkins Sq. Bakery",
  "Bagel Pub",
  "Murray's Cheese",
  "Trader Joe's Whipped",
  "Philadelphia Original",
  "Russ & Daughters",
  "Whole Foods 365",
  "Aldi Friendly Farms",
];

// Stable PRNG so refresh gives same flight per "session id"
function seededRandom(seed) {
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) | 0;
  return () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

function pickFlight(seed) {
  const rng = seededRandom(seed);
  const all = Array.from({ length: 60 }, (_, i) => i + 1);
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  return all.slice(0, 6).sort((a, b) => a - b);
}

// Seeded leaderboard so it feels stable + plausible
function initialLeaderboard() {
  return [
    { num: 31, votes: 42, brand: "Tompkins Sq. Bakery" },
    { num: 22, votes: 38, brand: "Bagel Pub" },
    { num: 7,  votes: 31, brand: "Murray's Cheese" },
    { num: 44, votes: 24, brand: "Trader Joe's Whipped" },
    { num: 58, votes: 19, brand: "Philadelphia Original" },
    { num: 14, votes: 12, brand: "Russ & Daughters" },
    { num: 3,  votes: 11, brand: "Whole Foods 365" },
    { num: 19, votes: 8,  brand: "Aldi Friendly Farms" },
  ];
}

const STORE_KEY = "schmear.lab.state.v1";

// ─── Tweaks defaults ─────────────────────────────────────────────────────
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "darkMode": false,
  "paper": "graph",
  "idFormat": "padded3",
  "showStamps": true,
  "liveTicker": true
}/*EDITMODE-END*/;

// ─── Main app ────────────────────────────────────────────────────────────
function LabApp() {
  const [tweaks, setTweak] = (typeof useTweaks === "function") ? useTweaks(TWEAK_DEFAULTS) : [TWEAK_DEFAULTS, () => {}];
  const t = tweaks.darkMode ? labTokens.dark : labTokens.light;

  // Load persisted state
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {
      screen: "intake",
      name: "",
      consent: false,
      flight: null,
      picks: [],
      notes: "",
      submitted: false,
      finalists: null,
      awards: {},
      awardsSubmitted: false,
      sessionSeed: String(Math.floor(Math.random() * 1e9)),
    };
  });

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    document.body.classList.toggle("dark", !!tweaks.darkMode);
  }, [tweaks.darkMode]);

  const setS = (patch) => setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));

  const go = (screen) => setS({ screen });

  const reset = () => setS({
    screen: "intake",
    name: "",
    consent: false,
    flight: null,
    picks: [],
    notes: "",
    submitted: false,
    finalists: null,
    awards: {},
    awardsSubmitted: false,
    sessionSeed: String(Math.floor(Math.random() * 1e9)),
  });

  // Compute flight on demand
  const flight = useMemo(() => {
    if (state.flight) return state.flight;
    return pickFlight(state.sessionSeed);
  }, [state.flight, state.sessionSeed]);

  const screenProps = {
    state, setS, go, reset, flight, t, tweaks, ...{
      tape: (props) => <Tape t={t} {...props} />,
    },
  };

  return (
    <>
      <div className="stage">
        <div className="crumb" style={{ color: t.inkDim }}>
          // SCHMEAR &amp; SCHMOOZE · LAB NOTEBOOK · PROTOTYPE_v1
        </div>
        <div className="phone">
          <div className="phone-screen" style={{ background: t.paper }}>
            <div className="phone-notch" />
            <StatusBar color={t.ink} />
            <div style={{ position: "absolute", inset: 0, paddingTop: 44, ...paperBg(tweaks.paper, t) }}>
              {state.screen === "intake"  && <Intake {...screenProps} />}
              {state.screen === "reveal"  && <Reveal {...screenProps} />}
              {state.screen === "vote"    && <Vote   {...screenProps} />}
              {state.screen === "results" && <Results {...screenProps} />}
              {state.screen === "round2"  && <Round2 {...screenProps} />}
              {state.screen === "awards"  && <Awards {...screenProps} />}
            </div>
          </div>
        </div>
        <div className="crumb" style={{ color: t.inkDim, maxWidth: 380 }}>
          {state.screen === "intake"  && "01/06 · subject intake · enter name + consent"}
          {state.screen === "reveal"  && "02/06 · sample assignment · review specimens"}
          {state.screen === "vote"    && "03/06 · tasting panel · tap to rank top two"}
          {state.screen === "results" && "04/06 · results · live vote tally"}
          {state.screen === "round2"  && "05/06 · round 02 · award superlatives"}
          {state.screen === "awards"  && "06/06 · awards ceremony · the final ballot"}
        </div>
      </div>

      <Tweaks tweaks={tweaks} setTweak={setTweak} />
    </>
  );
}

// ─── Screens ─────────────────────────────────────────────────────────────

function Intake({ state, setS, go, t, tweaks }) {
  const canGo = state.name.trim().length > 0 && state.consent;
  const [shake, setShake] = useState(false);

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden" }}>
      {/* binding holes */}
      <div style={{ position: "absolute", left: 10, top: 56, bottom: 26, width: 16, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: t.paper, border: `1.5px solid ${t.inkSoft}`, boxShadow: "inset 1px 1px 2px rgba(14,23,48,0.18)" }} />
        ))}
      </div>

      <div style={{ padding: "12px 26px 0 36px" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between" }}>
          <span>NOTEBOOK_07 / PG.014</span>
          <span>{new Date().toLocaleDateString("en-CA")}</span>
        </div>
        <div style={{ height: 1, background: t.ink, marginTop: 4, opacity: 0.5 }} />

        <div style={{ marginTop: 18 }}>
          <Tape rotate={-2} t={t}>study no. 0042</Tape>
        </div>

        <div style={{ fontFamily: FONT.mono, fontSize: 30, fontWeight: 700, color: t.ink, marginTop: 14, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          schmear<br/>
          &amp;_schmooze<span style={{ color: t.red }}>;</span>
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 14, color: t.inkSoft, marginTop: 8, lineHeight: 1.4 }}>
          A blind sensory evaluation of cream cheese, conducted in a controlled Brooklyn apartment.
        </div>
        {tweaks.showStamps && (
          <div style={{ marginTop: 6, fontFamily: FONT.hand, fontSize: 20, color: t.red, transform: "rotate(-1deg)" }}>
            (also it's my birthday)
          </div>
        )}
      </div>

      <div style={{ padding: "20px 26px 0 36px" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.inkSoft, letterSpacing: "0.16em" }}>
          01 · SUBJECT_NAME
        </div>
        <div className={shake ? "shake" : ""} style={{
          marginTop: 6,
          borderBottom: `1.5px solid ${t.ink}`,
          display: "flex", alignItems: "center",
        }}>
          <input
            value={state.name}
            onChange={(e) => setS({ name: e.target.value.slice(0, 24) })}
            placeholder="enter name"
            style={{
              background: "transparent",
              border: "none",
              width: "100%",
              padding: "8px 0 6px",
              fontFamily: FONT.mono,
              fontSize: 22,
              color: t.ink,
              caretColor: t.red,
            }}
          />
        </div>
        {state.name.trim().length === 0 && tweaks.showStamps && (
          <div style={{ fontFamily: FONT.hand, fontSize: 15, color: t.green, marginTop: 4, transform: "rotate(-0.8deg)" }}>
            ← write legibly please
          </div>
        )}
      </div>

      <div style={{ padding: "16px 26px 0 36px" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.inkSoft, letterSpacing: "0.16em" }}>
          02 · CONSENT
        </div>
        <label
          onClick={() => setS({ consent: !state.consent })}
          style={{ display: "flex", alignItems: "flex-start", gap: 10, marginTop: 8, fontFamily: FONT.mono, fontSize: 12, color: t.ink, lineHeight: 1.5, cursor: "pointer" }}>
          <span style={{
            width: 18, height: 18, border: `1.8px solid ${t.ink}`,
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            marginTop: 1, flex: "0 0 18px",
            background: state.consent ? t.yellow : "transparent",
          }}>
            {state.consent && (
              <span style={{ fontFamily: FONT.hand, color: t.red, fontSize: 24, lineHeight: 0.6, marginTop: -3 }}>×</span>
            )}
          </span>
          <span>I understand bagels are an inadequate vehicle and I will use water crackers as instructed.</span>
        </label>
      </div>

      <div style={{ position: "absolute", bottom: 26, left: 36, right: 26 }}>
        <button
          disabled={!canGo}
          onClick={() => {
            if (!canGo) {
              setShake(true);
              setTimeout(() => setShake(false), 350);
              return;
            }
            setS({ flight: pickFlight(state.sessionSeed + state.name) });
            go("reveal");
          }}
          style={{
            width: "100%", height: 64,
            background: canGo ? t.ink : t.inkSoft,
            color: t.paper,
            border: "none", borderRadius: 0,
            fontFamily: FONT.mono, fontSize: 15, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: canGo ? "pointer" : "not-allowed",
            opacity: canGo ? 1 : 0.6,
            transition: "background .2s, opacity .2s",
          }}>
          ASSIGN_SAMPLES &gt;_
        </button>
        <div style={{ fontFamily: FONT.mono, fontSize: 9, color: t.inkSoft, marginTop: 8, textAlign: "center", letterSpacing: "0.14em" }}>
          randomized · double-blind · n=38 judges
        </div>
      </div>
    </div>
  );
}

function Reveal({ state, go, flight, t, tweaks }) {
  return (
    <div style={{ height: "100%", position: "relative" }}>
      <div style={{ padding: "12px 26px 0", fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between" }}>
        <button onClick={() => go("intake")} style={{ background: "transparent", border: "none", color: t.inkSoft, fontFamily: FONT.mono, cursor: "pointer", padding: 0 }}>
          ← pg.014
        </button>
        <span>SUBJECT_{String(Math.floor(parseInt(state.sessionSeed || "0", 10) % 999)).padStart(3, "0")} / {state.name.toUpperCase()}</span>
      </div>

      <div style={{ padding: "14px 26px 0" }} className="fade-up">
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.red, letterSpacing: "0.22em" }}>// FIG.1 — YOUR SAMPLES</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 26, fontWeight: 700, color: t.ink, marginTop: 4, lineHeight: 1.05, letterSpacing: "-0.02em" }}>
          specimen<br/>
          assignment_
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 13, color: t.inkSoft, marginTop: 8, lineHeight: 1.4 }}>
          Six labelled cups await on the table. IDs were randomized at intake — neither you nor I know which brand is which.
        </div>
      </div>

      <div style={{ padding: "18px 26px 0", position: "relative" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {flight.map((n, i) => (
            <div
              key={n}
              className="fade-up"
              style={{ position: "relative", animationDelay: `${i * 80}ms` }}
            >
              <SampleCard num={n} size={96} t={t} idFormat={tweaks.idFormat} showStamps={tweaks.showStamps} />
              <div style={{
                position: "absolute", top: -6, left: -2,
                fontFamily: FONT.mono, fontSize: 8, color: t.inkSoft,
                letterSpacing: "0.1em",
              }}>
                fig.1.{i + 1}
              </div>
            </div>
          ))}
        </div>
        {tweaks.showStamps && (
          <div style={{ position: "absolute", right: 14, top: -2, fontFamily: FONT.hand, fontSize: 18, color: t.red, transform: "rotate(6deg)" }}>
            taste these →
          </div>
        )}
      </div>

      <div style={{ padding: "22px 26px 0" }}>
        <div style={{
          border: `1.5px dashed ${t.inkSoft}`,
          padding: "12px 14px",
          fontFamily: FONT.mono, fontSize: 11, color: t.inkSoft,
          lineHeight: 1.7, letterSpacing: "0.04em",
        }}>
          <div style={{ color: t.ink, fontWeight: 700, letterSpacing: "0.14em", marginBottom: 6 }}>PROTOCOL</div>
          01 → sip water (cleanse palate)<br/>
          02 → spread on water cracker<br/>
          03 → score on schmearability + flavor<br/>
          04 → return to console; submit top_2
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 26, left: 26, right: 26 }}>
        <button
          onClick={() => go("vote")}
          style={{
            width: "100%", height: 64,
            background: t.ink, color: t.paper,
            border: "none", borderRadius: 0,
            fontFamily: FONT.mono, fontSize: 15, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: "pointer",
          }}>
          BEGIN_PANEL &gt;_
        </button>
      </div>
    </div>
  );
}

function Vote({ state, setS, go, flight, t, tweaks }) {
  const onTap = (n) => {
    setS((s) => {
      const exists = s.picks.indexOf(n);
      let next;
      if (exists >= 0) next = s.picks.filter(x => x !== n);
      else if (s.picks.length < 2) next = [...s.picks, n];
      else next = s.picks;
      return { picks: next };
    });
  };

  const ready = state.picks.length === 2;
  const counter = `${state.picks.length}/2`;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 26px 0", fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between", alignItems: "center", flex: "0 0 auto" }}>
        <button onClick={() => go("reveal")} style={{ background: "transparent", border: "none", color: t.inkSoft, fontFamily: FONT.mono, cursor: "pointer", padding: 0 }}>
          ← fig.1
        </button>
        <span style={{
          background: ready ? t.yellow : "transparent",
          color: ready ? t.ink : t.red,
          padding: "3px 8px",
          border: ready ? `1.5px solid ${t.ink}` : "none",
          transition: "background .2s",
        }}>
          TASTING_PANEL · {counter}
        </span>
      </div>

      <div style={{ padding: "10px 26px 0", flex: "0 0 auto" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.red, letterSpacing: "0.22em" }}>// FIG.2 — SCORE_SHEET</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 700, color: t.ink, marginTop: 2, lineHeight: 1.05 }}>
          rank top two<span style={{ color: t.red }}>_</span>
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
          tap to pick (first tap = #1, second = #2). tap again to undo.
        </div>
      </div>

      <div style={{ padding: "12px 26px 0", flex: "1 1 auto", minHeight: 0 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {flight.map((n) => {
            const idx = state.picks.indexOf(n);
            const rank = idx >= 0 ? idx + 1 : null;
            return (
              <SampleCard
                key={n}
                num={n}
                size={118}
                selected={idx >= 0}
                rank={rank}
                onClick={() => onTap(n)}
                t={t}
                idFormat={tweaks.idFormat}
                showStamps={tweaks.showStamps}
              />
            );
          })}
        </div>
      </div>

      <div style={{ padding: "10px 26px 0", flex: "0 0 auto" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em" }}>FREE_NOTES (optional)</div>
        <textarea
          value={state.notes}
          onChange={(e) => setS({ notes: e.target.value.slice(0, 140) })}
          placeholder="observations..."
          rows={1}
          style={{
            marginTop: 4,
            width: "100%",
            border: `1.5px solid ${t.ink}`,
            background: "transparent",
            padding: "7px 10px",
            fontFamily: FONT.hand,
            fontSize: 16,
            color: t.ink,
            lineHeight: 1.2,
            resize: "none",
            caretColor: t.red,
            display: "block",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div style={{ padding: "12px 26px 18px", flex: "0 0 auto" }}>
        <button
          disabled={!ready}
          onClick={() => { setS({ submitted: true }); go("results"); }}
          style={{
            width: "100%", height: 58,
            background: ready ? t.ink : t.inkSoft,
            color: t.paper,
            border: "none",
            fontFamily: FONT.mono, fontSize: 14, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: ready ? "pointer" : "not-allowed",
            opacity: ready ? 1 : 0.55,
            transition: "background .2s, opacity .2s",
          }}>
          SUBMIT_SPECIMENS &gt;_
        </button>
      </div>
    </div>
  );
}

function Results({ state, setS, go, reset, t, tweaks }) {
  // Seed leaderboard from base, then add user's votes
  const [board, setBoard] = useState(() => {
    const base = initialLeaderboard();
    const map = new Map(base.map(r => [r.num, { ...r }]));
    state.picks.forEach((n) => {
      if (map.has(n)) map.get(n).votes += 1;
      else map.set(n, { num: n, votes: 1, brand: BRANDS[(n * 3) % BRANDS.length] });
    });
    return Array.from(map.values()).sort((a, b) => b.votes - a.votes);
  });
  const [highlight, setHighlight] = useState(null);

  // Live ticker — every few seconds bump a random sample
  useEffect(() => {
    if (!tweaks.liveTicker) return;
    const id = setInterval(() => {
      setBoard(prev => {
        const pickIdx = Math.floor(Math.random() * Math.min(6, prev.length));
        const target = prev[pickIdx].num;
        setHighlight(target);
        setTimeout(() => setHighlight(null), 1400);
        const next = prev.map(r => r.num === target ? { ...r, votes: r.votes + 1 } : r);
        return next.sort((a, b) => b.votes - a.votes);
      });
    }, 3200);
    return () => clearInterval(id);
  }, [tweaks.liveTicker]);

  const totalVotes = board.reduce((s, r) => s + r.votes, 0);
  const max = board[0]?.votes || 1;

  return (
    <div style={{ height: "100%", position: "relative", overflow: "hidden" }}>
      <div style={{ padding: "12px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em" }}>
        <span>NOTEBOOK_07 / PG.015</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {tweaks.liveTicker && <span style={{ width: 6, height: 6, borderRadius: "50%", background: t.red, boxShadow: `0 0 6px ${t.red}` }} />}
          LIVE · n={totalVotes}
        </span>
      </div>

      <div style={{ padding: "8px 24px 0" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.red, letterSpacing: "0.22em" }}>// FIG.4 — PRELIMINARY RESULTS</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 24, fontWeight: 700, color: t.ink, marginTop: 4, lineHeight: 1.05 }}>
          standings_
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: t.inkSoft, marginTop: 4 }}>
          Thanks {state.name || "subject"} — your votes are in. The board updates as more judges submit.
        </div>
      </div>

      {/* user's picks reminder */}
      <div style={{ padding: "12px 24px 0" }}>
        <div style={{
          display: "flex", gap: 10, alignItems: "center",
          padding: "8px 10px",
          border: `1.5px dashed ${t.green}`,
          fontFamily: FONT.mono, fontSize: 11, color: t.inkSoft,
        }}>
          <span style={{ color: t.green, fontWeight: 700, letterSpacing: "0.12em" }}>YOUR_VOTES</span>
          {state.picks.map((n, i) => (
            <span key={n} style={{ color: t.ink, fontWeight: 700 }}>
              #{i+1} → {fmtId(n, tweaks.idFormat)}
            </span>
          ))}
        </div>
      </div>

      {/* leaderboard */}
      <div style={{ padding: "14px 24px 0", display: "flex", flexDirection: "column", gap: 6 }}>
        {board.slice(0, 7).map((row, i) => {
          const pct = row.votes / max;
          const isYour = state.picks.includes(row.num);
          const isLead = i === 0;
          const isHi = highlight === row.num;
          return (
            <div
              key={row.num}
              className={isHi ? "row-tick" : ""}
              style={{
                display: "grid",
                gridTemplateColumns: "22px 50px 1fr 38px",
                gap: 8,
                alignItems: "center",
                fontFamily: FONT.mono, fontSize: 12,
                padding: "4px 6px",
                borderBottom: `1px dashed ${t.inkSoft}`,
                position: "relative",
                transition: "background .3s",
              }}
            >
              <div style={{ color: isLead ? t.red : t.inkSoft, fontWeight: 700 }}>
                {String(i + 1).padStart(2, "0")}
              </div>
              <div style={{ color: t.ink, fontWeight: 700, letterSpacing: "-0.02em" }}>
                {fmtId(row.num, tweaks.idFormat)}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: FONT.body, fontSize: 12, color: t.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row.brand} {isYour && <span style={{ fontFamily: FONT.hand, color: t.green, fontSize: 14 }}>· yours</span>}
                </div>
                <div style={{ height: 6, background: "rgba(14,23,48,0.07)", marginTop: 2, position: "relative", overflow: "hidden" }}>
                  <div
                    key={`bar-${row.num}-${row.votes}`}
                    className="bar-grow"
                    style={{
                      width: `${pct * 100}%`,
                      height: "100%",
                      background: isLead ? t.red : (isYour ? t.green : t.ink),
                      backgroundImage: `repeating-linear-gradient(45deg, transparent 0 4px, rgba(253,252,247,0.18) 4px 6px)`,
                      transition: "width .8s cubic-bezier(.2,.7,.3,1)",
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right", color: t.ink, fontWeight: 700 }}>
                {row.votes}
              </div>
            </div>
          );
        })}
      </div>

      {/* stamp */}
      {tweaks.showStamps && (
        <div className="stamp-in" style={{
          position: "absolute", top: 76, right: 18,
          border: `2px solid ${t.red}`,
          color: t.red,
          padding: "3px 8px",
          fontFamily: FONT.mono, fontSize: 10, fontWeight: 700,
          letterSpacing: "0.18em",
          background: "transparent",
        }}>
          SUBMITTED
        </div>
      )}

      <div style={{ position: "absolute", bottom: 14, left: 24, right: 24, display: "flex", flexDirection: "column", gap: 6 }}>
        <button
          onClick={() => {
            const top3 = board.slice(0, 3).map(r => r.num);
            setS({ finalists: top3, screen: "round2" });
          }}
          style={{
            width: "100%", height: 50,
            background: t.ink, color: t.paper,
            border: "none",
            fontFamily: FONT.mono, fontSize: 13, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
          }}>
          OPEN ROUND_02 — AWARDS &gt;_
        </button>
        <button
          onClick={reset}
          style={{
            width: "100%", height: 36,
            background: "transparent", color: t.inkSoft,
            border: `1px solid ${t.inkSoft}`,
            fontFamily: FONT.mono, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em", textTransform: "uppercase", cursor: "pointer",
          }}>
          new_subject &gt;_
        </button>
      </div>
    </div>
  );
}

// ─── Round 2: Awards ─────────────────────────────────────────────────────
const CATEGORIES = [
  { key: "wildest",     label: "Wildest concept",          short: "wildest_concept",     icon: "✦", accent: "blue"   },
  { key: "execution",   label: "Best execution",           short: "best_execution",      icon: "★", accent: "green"  },
  { key: "sellable",    label: "Most likely to sell",      short: "most_likely_to_sell", icon: "$", accent: "ink"    },
  { key: "crime",       label: "Biggest crime vs. dairy",  short: "crime_against_dairy", icon: "⚠", accent: "red"    },
  { key: "favorite",    label: "Personal favorite",        short: "personal_favorite",   icon: "♥", accent: "red"    },
];

function Round2({ state, setS, go, t, tweaks }) {
  const finalists = state.finalists || [];
  const awards = state.awards || {};
  const completed = CATEGORIES.filter(c => awards[c.key] != null).length;
  const ready = completed === CATEGORIES.length;

  const assign = (key, num) => {
    setS((s) => {
      const next = { ...(s.awards || {}) };
      if (next[key] === num) delete next[key];
      else next[key] = num;
      return { awards: next };
    });
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* header */}
      <div style={{ padding: "12px 24px 0", fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between", flex: "0 0 auto" }}>
        <button onClick={() => go("results")} style={{ background: "transparent", border: "none", color: t.inkSoft, fontFamily: FONT.mono, cursor: "pointer", padding: 0 }}>← pg.015</button>
        <span style={{
          color: ready ? t.ink : t.red,
          background: ready ? t.yellow : "transparent",
          border: ready ? `1.5px solid ${t.ink}` : "none",
          padding: "2px 8px",
        }}>
          AWARDS · {completed}/{CATEGORIES.length}
        </span>
      </div>

      <div style={{ padding: "10px 24px 0", flex: "0 0 auto" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.red, letterSpacing: "0.22em" }}>// FIG.5 — SUPERLATIVE BALLOT</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 22, fontWeight: 700, color: t.ink, marginTop: 2, lineHeight: 1.0 }}>
          round_02<span style={{ color: t.red }}>_</span>
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: t.inkSoft, marginTop: 2, lineHeight: 1.35 }}>
          The 3 finalists, ranked by category. One sample can win multiple titles — we don't judge (yet).
        </div>
      </div>

      {/* Finalists strip — pinned reference */}
      <div style={{ padding: "10px 24px 0", flex: "0 0 auto" }}>
        <div style={{
          border: `1.5px dashed ${t.inkSoft}`,
          padding: "8px 10px",
          display: "flex", alignItems: "center", gap: 10,
          background: tweaks.darkMode ? "rgba(20,28,52,0.4)" : "rgba(253,252,247,0.55)",
        }}>
          <div style={{ fontFamily: FONT.mono, fontSize: 9, color: t.red, letterSpacing: "0.18em", writingMode: "vertical-rl", transform: "rotate(180deg)", height: 50, display: "flex", alignItems: "center" }}>
            FINALISTS
          </div>
          <div style={{ flex: 1, display: "flex", gap: 8, justifyContent: "space-around" }}>
            {finalists.map((n, i) => (
              <div key={n} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              }}>
                <div style={{ fontFamily: FONT.mono, fontSize: 8, color: t.inkSoft, letterSpacing: "0.1em" }}>
                  F.{i+1}
                </div>
                <div style={{
                  fontFamily: FONT.mono, fontSize: 18, fontWeight: 700, color: t.ink,
                  background: t.cardBg, border: `1.5px solid ${t.ink}`,
                  padding: "2px 8px", minWidth: 46, textAlign: "center",
                  letterSpacing: "-0.02em",
                }}>
                  {fmtId(n, tweaks.idFormat)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Categories */}
      <div style={{ padding: "8px 24px 0", flex: "1 1 auto", display: "flex", flexDirection: "column", gap: 6, overflow: "auto" }}>
        {CATEGORIES.map((cat, i) => {
          const chosen = awards[cat.key];
          const isCrime = cat.key === "crime";
          const accentColor = isCrime ? t.red : (cat.accent === "green" ? t.green : (cat.accent === "blue" ? t.blue : t.ink));
          return (
            <div key={cat.key} style={{
              borderBottom: `1px dashed ${t.inkSoft}`,
              paddingBottom: 6,
              opacity: chosen ? 1 : 0.95,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{
                  fontFamily: FONT.mono, fontSize: 9.5, fontWeight: 700,
                  color: accentColor, letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}>
                  05{String.fromCharCode(0x61 + i)} · {cat.short}
                </div>
                {chosen && tweaks.showStamps && (
                  <span className="stamp-in" key={`stamp-${cat.key}-${chosen}`} style={{
                    fontFamily: FONT.hand, fontSize: 14, color: accentColor,
                    transform: "rotate(-2deg)",
                  }}>
                    ↳ {fmtId(chosen, tweaks.idFormat)}
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                {finalists.map((n) => {
                  const selected = chosen === n;
                  return (
                    <button
                      key={n}
                      onClick={() => assign(cat.key, n)}
                      style={{
                        flex: 1, height: 44,
                        background: selected ? (isCrime ? t.red : (cat.accent === "green" ? t.green : (cat.accent === "blue" ? t.blue : t.ink))) : "transparent",
                        color: selected ? t.paper : t.ink,
                        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? accentColor : t.inkSoft}`,
                        fontFamily: FONT.mono, fontSize: 13, fontWeight: 700,
                        letterSpacing: "-0.01em",
                        cursor: "pointer",
                        position: "relative",
                        transition: "background .15s, color .15s",
                      }}
                    >
                      {fmtId(n, tweaks.idFormat)}
                      {isCrime && selected && (
                        <span style={{
                          position: "absolute", inset: 0,
                          background: `repeating-linear-gradient(45deg, transparent 0 6px, rgba(253,252,247,0.16) 6px 8px)`,
                          pointerEvents: "none",
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: "10px 24px 16px", flex: "0 0 auto" }}>
        <button
          disabled={!ready}
          onClick={() => { setS({ awardsSubmitted: true }); go("awards"); }}
          style={{
            width: "100%", height: 56,
            background: ready ? t.ink : t.inkSoft,
            color: t.paper,
            border: "none",
            fontFamily: FONT.mono, fontSize: 13, fontWeight: 700,
            letterSpacing: "0.22em", textTransform: "uppercase",
            cursor: ready ? "pointer" : "not-allowed",
            opacity: ready ? 1 : 0.55,
          }}>
          CERTIFY_BALLOT &gt;_
        </button>
      </div>
    </div>
  );
}

// ─── Awards recap ────────────────────────────────────────────────────────
function Awards({ state, reset, go, t, tweaks }) {
  const awards = state.awards || {};
  const finalists = state.finalists || [];

  // Brand pseudo-lookup so the recap can name names (joke: revealing the
  // "crime against dairy" feels good)
  const brandFor = (num) => {
    const list = initialLeaderboard();
    const hit = list.find(r => r.num === num);
    return hit ? hit.brand : BRANDS[(num * 3) % BRANDS.length];
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "12px 24px 0", fontFamily: FONT.mono, fontSize: 10, color: t.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between", flex: "0 0 auto" }}>
        <button onClick={() => go("round2")} style={{ background: "transparent", border: "none", color: t.inkSoft, fontFamily: FONT.mono, cursor: "pointer", padding: 0 }}>← pg.016</button>
        <span>NOTEBOOK_07 / PG.017</span>
      </div>

      <div style={{ padding: "10px 24px 0", flex: "0 0 auto", position: "relative" }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 11, color: t.red, letterSpacing: "0.22em" }}>// FIG.6 — FINAL TITLES</div>
        <div style={{ fontFamily: FONT.mono, fontSize: 26, fontWeight: 700, color: t.ink, marginTop: 2, lineHeight: 1.0 }}>
          the awards_
        </div>
        <div style={{ fontFamily: FONT.body, fontSize: 12, color: t.inkSoft, marginTop: 2 }}>
          Certified by judge <span style={{ color: t.ink, fontFamily: FONT.mono, fontWeight: 700 }}>{state.name || "anon"}</span>. Recorded in perpetuity (or until I clear localStorage).
        </div>

        {tweaks.showStamps && (
          <div className="stamp-in" style={{
            position: "absolute", top: 8, right: 18,
            border: `2px solid ${t.green}`,
            color: t.green,
            padding: "3px 8px",
            fontFamily: FONT.mono, fontSize: 10, fontWeight: 700,
            letterSpacing: "0.18em",
            background: "transparent",
          }}>
            CERTIFIED
          </div>
        )}
      </div>

      {/* Award cards */}
      <div style={{ padding: "12px 22px 0", flex: "1 1 auto", display: "flex", flexDirection: "column", gap: 8, overflow: "auto" }}>
        {CATEGORIES.map((cat) => {
          const num = awards[cat.key];
          const isCrime = cat.key === "crime";
          const accent = isCrime ? t.red : (cat.accent === "green" ? t.green : (cat.accent === "blue" ? t.blue : t.ink));
          return (
            <div key={cat.key} className="fade-up" style={{
              border: `1.5px solid ${t.ink}`,
              padding: "8px 10px",
              position: "relative",
              background: tweaks.darkMode ? "rgba(20,28,52,0.4)" : "rgba(253,252,247,0.7)",
              boxShadow: `2px 2px 0 ${accent}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: FONT.mono, fontSize: 9, color: t.inkSoft, letterSpacing: "0.18em", textTransform: "uppercase" }}>
                    {cat.short}
                  </div>
                  <div style={{
                    fontFamily: FONT.mono, fontSize: 16, fontWeight: 700, color: accent,
                    marginTop: 2, lineHeight: 1.05,
                  }}>
                    {cat.label}
                  </div>
                </div>
                <div style={{
                  fontFamily: FONT.mono, fontSize: 22, fontWeight: 700,
                  color: t.ink, letterSpacing: "-0.02em",
                  background: t.cardBg,
                  border: `1.5px solid ${accent}`,
                  padding: "1px 8px",
                  marginLeft: 8,
                }}>
                  {fmtId(num, tweaks.idFormat)}
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 6 }}>
                <div style={{ fontFamily: FONT.body, fontSize: 12, color: t.ink, fontStyle: "italic" }}>
                  {brandFor(num)}
                  <span style={{ fontFamily: FONT.mono, fontSize: 9, color: t.inkSoft, marginLeft: 6, letterSpacing: "0.12em" }}>
                    (revealed)
                  </span>
                </div>
                {isCrime && tweaks.showStamps && (
                  <div style={{ fontFamily: FONT.hand, fontSize: 14, color: t.red, transform: "rotate(-3deg)" }}>
                    so sorry to your cows
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "10px 24px 16px", flex: "0 0 auto", display: "flex", gap: 8 }}>
        <button
          onClick={() => go("round2")}
          style={{
            flex: 1, height: 44,
            background: "transparent", color: t.ink,
            border: `1.5px solid ${t.ink}`,
            fontFamily: FONT.mono, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
          }}>
          edit_ballot
        </button>
        <button
          onClick={reset}
          style={{
            flex: 1, height: 44,
            background: t.ink, color: t.paper,
            border: "none",
            fontFamily: FONT.mono, fontSize: 11, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
          }}>
          new_subject &gt;_
        </button>
      </div>
    </div>
  );
}

// ─── Tweaks panel ────────────────────────────────────────────────────────
function Tweaks({ tweaks, setTweak }) {
  if (typeof TweaksPanel !== "function") return null;
  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="LOOK">
        <TweakToggle
          label="Dark mode"
          value={tweaks.darkMode}
          onChange={(v) => setTweak("darkMode", v)}
        />
        <TweakRadio
          label="Paper"
          value={tweaks.paper}
          options={[
            { label: "Graph", value: "graph" },
            { label: "Dot", value: "dot" },
            { label: "Eng", value: "engineering" },
            { label: "Blank", value: "blank" },
          ]}
          onChange={(v) => setTweak("paper", v)}
        />
      </TweakSection>
      <TweakSection label="SAMPLES">
        <TweakRadio
          label="ID format"
          value={tweaks.idFormat}
          options={[
            { label: "007", value: "padded3" },
            { label: "07", value: "padded2" },
            { label: "SMP-007", value: "smp" },
          ]}
          onChange={(v) => setTweak("idFormat", v)}
        />
      </TweakSection>
      <TweakSection label="VIBE">
        <TweakToggle
          label="Handwritten stamps"
          value={tweaks.showStamps}
          onChange={(v) => setTweak("showStamps", v)}
        />
        <TweakToggle
          label="Live ticker on results"
          value={tweaks.liveTicker}
          onChange={(v) => setTweak("liveTicker", v)}
        />
      </TweakSection>
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<LabApp />);
