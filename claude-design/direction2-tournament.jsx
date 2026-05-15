// Direction 2 — Tournament Brackets
// Dark mode scoreboard. Bold sans + numeric grotesks. Neon cyan + hot magenta.
// Numbers feel like jersey numbers. Leaderboard = ESPN bottom line.

const tourney = {
  bg: "#0a0e1a",
  panel: "#10162a",
  panel2: "#161d36",
  line: "#1f2a4a",
  text: "#e8ecff",
  textDim: "#8090b8",
  cyan: "#00f0d4",
  magenta: "#ff2e93",
  yellow: "#f5ff4d",
  win: "#22c98a",
  display: '"Anton", "Oswald", "Bebas Neue", Impact, sans-serif',
  ui: '"Space Grotesk", "Inter", system-ui, sans-serif',
  mono: '"JetBrains Mono", "SF Mono", monospace',
};

// Jersey-number tile
function Jersey({ num, size = 100, status = "default", style = {}, onClick }) {
  // status: default | selected | seed | dim
  let bg = tourney.panel;
  let fg = tourney.text;
  let glow = "0 0 0 0 transparent";
  let border = `1.5px solid ${tourney.line}`;
  if (status === "selected") {
    bg = tourney.cyan;
    fg = tourney.bg;
    glow = `0 0 32px rgba(0,240,212,0.55), 0 0 0 2px ${tourney.cyan} inset`;
    border = `1.5px solid ${tourney.cyan}`;
  } else if (status === "lead") {
    bg = tourney.panel;
    fg = tourney.magenta;
    glow = `0 0 24px rgba(255,46,147,0.45)`;
    border = `2px solid ${tourney.magenta}`;
  } else if (status === "dim") {
    fg = tourney.textDim;
  }
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        background: bg,
        border,
        borderRadius: 14,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: glow,
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* jersey stripe */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 4,
        background: status === "selected" ? tourney.bg : (status === "lead" ? tourney.magenta : tourney.line),
      }} />
      <div style={{
        fontFamily: tourney.mono, fontSize: 9, fontWeight: 700,
        letterSpacing: "0.16em", color: status === "selected" ? tourney.bg : tourney.textDim,
        marginTop: 8, opacity: status === "selected" ? 0.7 : 1,
      }}>
        SAMPLE
      </div>
      <div style={{
        fontFamily: tourney.display,
        fontSize: size * 0.62,
        lineHeight: 0.9,
        color: fg,
        letterSpacing: "-0.03em",
        marginTop: -2,
      }}>
        {String(num).padStart(2, "0")}
      </div>
    </div>
  );
}

function NeonRule({ color = tourney.cyan, w = "100%" }) {
  return (
    <div style={{
      height: 2, width: w,
      background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
      boxShadow: `0 0 8px ${color}`,
    }} />
  );
}

// ---------- META CARD ----------
function Direction2Meta() {
  return (
    <div className="meta-card" style={{ background: tourney.bg, color: tourney.text }}>
      <div>
        <div className="kicker" style={{ color: tourney.cyan, opacity: 0.9 }}>Direction 02</div>
        <h2 style={{ fontFamily: tourney.display, fontSize: 38, lineHeight: 0.95, marginTop: 4, color: tourney.text, letterSpacing: "-0.01em", textTransform: "uppercase" }}>
          Tournament<br/>Brackets
        </h2>
        <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.cyan, marginTop: 8, letterSpacing: "0.16em" }}>
          // 6 SEEDS · ONE CHAMPION
        </div>
      </div>

      <div>
        <h3 style={{ color: tourney.textDim }}>Palette</h3>
        <div className="swatch-row">
          <div className="swatch" style={{ background: tourney.bg, border: `1px solid ${tourney.line}` }}><span style={{color: tourney.textDim}}>void</span></div>
          <div className="swatch" style={{ background: tourney.panel, border: `1px solid ${tourney.line}` }}><span style={{color: tourney.textDim}}>panel</span></div>
          <div className="swatch" style={{ background: tourney.text }}><span style={{color: tourney.textDim}}>chalk</span></div>
        </div>
        <div className="swatch-row" style={{ marginTop: 22 }}>
          <div className="swatch" style={{ background: tourney.cyan }}><span style={{color: tourney.textDim}}>cyan</span></div>
          <div className="swatch" style={{ background: tourney.magenta }}><span style={{color: tourney.textDim}}>mag</span></div>
          <div className="swatch" style={{ background: tourney.yellow }}><span style={{color: tourney.textDim}}>flash</span></div>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <h3 style={{ color: tourney.textDim }}>Type</h3>
        <div className="type-line">
          <div style={{ fontFamily: tourney.display, fontSize: 26, color: tourney.text, lineHeight: 1, textTransform: "uppercase" }}>ANTON 88</div>
          <div className="name" style={{ color: tourney.textDim }}>Display · jersey condensed</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: tourney.ui, fontSize: 14, color: tourney.text }}>Space Grotesk</div>
          <div className="name" style={{ color: tourney.textDim }}>UI · grotesk neutral</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: tourney.mono, fontSize: 12, color: tourney.cyan, letterSpacing: "0.1em" }}>JETBRAINS_MONO_07</div>
          <div className="name" style={{ color: tourney.textDim }}>Accent · stat-block mono</div>
        </div>
      </div>

      <div>
        <h3 style={{ color: tourney.textDim }}>Why</h3>
        <p style={{ color: tourney.text, opacity: 0.85 }}>
          You're literally crowning a winner — lean into it. Dark scoreboard is also the most legible from a phone in dim party lighting.
        </p>
      </div>

      <div className="signature-box" style={{ background: tourney.panel, color: tourney.text, fontFamily: tourney.ui }}>
        <div className="label" style={{ color: tourney.cyan, letterSpacing: "0.2em" }}>SIGNATURE</div>
        Selected cups get a real neon glow (box-shadow + inset border). Leaderboard ticks a CRT scanline overlay so it reads as a broadcast feed on the TV.
      </div>
    </div>
  );
}

// ---------- SCREEN 1: CHECK IN ----------
function TourneyLanding() {
  return (
    <Phone bg={tourney.bg} color={tourney.text}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, color: tourney.text, fontFamily: tourney.ui }}>
        {/* status strip */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: tourney.win, boxShadow: `0 0 8px ${tourney.win}` }} />
            <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.16em" }}>LIVE · CHECK IN</div>
          </div>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.16em" }}>SEASON 01</div>
        </div>

        <div style={{ padding: "8px 22px 0" }}>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.cyan, letterSpacing: "0.2em" }}>// THE MAIN EVENT</div>
          <div style={{
            fontFamily: tourney.display,
            fontSize: 56,
            lineHeight: 0.88,
            letterSpacing: "-0.02em",
            color: tourney.text,
            marginTop: 8,
            textTransform: "uppercase",
          }}>
            Schmear<br/>
            <span style={{ color: tourney.magenta, textShadow: `0 0 18px rgba(255,46,147,0.4)` }}>&amp;</span> <span style={{ WebkitTextStroke: `1.5px ${tourney.cyan}`, color: "transparent" }}>Schmooze</span>
          </div>
          <div style={{ marginTop: 10 }}>
            <NeonRule color={tourney.cyan} />
          </div>
          <div style={{ fontFamily: tourney.ui, fontSize: 13, color: tourney.textDim, marginTop: 10, lineHeight: 1.4 }}>
            6 seeded cream cheeses. 38 judges. One champion. Step into the bracket.
          </div>
        </div>

        <div style={{ padding: "22px 22px 0" }}>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.18em" }}>NAME ON JERSEY</div>
          <div style={{
            marginTop: 8,
            background: tourney.panel,
            border: `1.5px solid ${tourney.line}`,
            borderBottom: `2px solid ${tourney.cyan}`,
            borderRadius: 12,
            padding: "16px 18px",
            fontFamily: tourney.display,
            fontSize: 26,
            color: tourney.text,
            letterSpacing: "0.02em",
            textTransform: "uppercase",
          }}>
            MAYA<span style={{ display: "inline-block", width: 2, height: 28, background: tourney.cyan, marginLeft: 4, verticalAlign: "-4px" }} />
          </div>

          <button style={{
            marginTop: 18,
            width: "100%",
            height: 68,
            background: tourney.cyan,
            border: "none",
            borderRadius: 12,
            fontFamily: tourney.display,
            fontSize: 24,
            color: tourney.bg,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            cursor: "pointer",
            boxShadow: `0 0 32px rgba(0,240,212,0.45)`,
          }}>
            ENTER THE BRACKET ▸
          </button>

          <div style={{ marginTop: 14, display: "flex", justifyContent: "space-between", fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.12em" }}>
            <div>JUDGES · 47</div>
            <div>VOTES · 168</div>
            <div>ETA · 23m</div>
          </div>
        </div>

        {/* bottom ticker */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: tourney.magenta, color: tourney.bg,
          padding: "10px 14px",
          fontFamily: tourney.display,
          fontSize: 14,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>SAMPLE 31 +14</span>
          <span style={{ opacity: 0.7 }}>·</span>
          <span>SAMPLE 22 +9</span>
          <span style={{ opacity: 0.7 }}>·</span>
          <span style={{ fontFamily: tourney.mono, fontSize: 11 }}>LIVE</span>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 2: ROSTER DROP ----------
function TourneyReveal() {
  return (
    <Phone bg={tourney.bg} color={tourney.text}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, color: tourney.text, fontFamily: tourney.ui }}>
        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between", fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.18em" }}>
          <div>◂ BACK</div>
          <div style={{ color: tourney.cyan }}>JUDGE #042</div>
        </div>

        <div style={{ padding: "10px 22px 0", textAlign: "center" }}>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.cyan, letterSpacing: "0.22em" }}>// YOUR DRAFT</div>
          <div style={{ fontFamily: tourney.display, fontSize: 36, lineHeight: 0.95, marginTop: 6, textTransform: "uppercase", letterSpacing: "-0.01em" }}>
            The Starting<br/>Lineup
          </div>
          <div style={{ fontFamily: tourney.ui, fontSize: 12, color: tourney.textDim, marginTop: 8 }}>
            Six seeded cups. Find them on the counter.
          </div>
        </div>

        <div style={{ padding: "20px 22px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
            {FLIGHT.map((n, i) => (
              <div key={n} style={{ position: "relative" }}>
                <Jersey num={n} size={84} />
                <div style={{
                  position: "absolute", top: -6, right: -6,
                  background: tourney.yellow, color: tourney.bg,
                  fontFamily: tourney.display, fontSize: 11,
                  width: 22, height: 22, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>{i+1}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "20px 22px 0" }}>
          <div style={{
            background: tourney.panel,
            border: `1px solid ${tourney.line}`,
            borderLeft: `3px solid ${tourney.cyan}`,
            borderRadius: 8,
            padding: "12px 14px",
            fontFamily: tourney.mono,
            fontSize: 11,
            color: tourney.textDim,
            lineHeight: 1.6,
            letterSpacing: "0.04em",
          }}>
            <div style={{ color: tourney.cyan, letterSpacing: "0.18em", marginBottom: 4 }}>// RULES</div>
            01 · TASTE ALL SIX IN ANY ORDER<br/>
            02 · CLEANSE WITH WATER BETWEEN<br/>
            03 · PICK YOUR TOP TWO TO ADVANCE
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22 }}>
          <button style={{
            width: "100%", height: 64,
            background: tourney.cyan, color: tourney.bg,
            fontFamily: tourney.display, fontSize: 22, letterSpacing: "0.04em",
            border: "none", borderRadius: 12, textTransform: "uppercase",
            boxShadow: `0 0 28px rgba(0,240,212,0.4)`, cursor: "pointer",
          }}>
            TIP OFF ▸
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 3: CAST VOTE ----------
function TourneyVote() {
  const selected = [22, 7];
  return (
    <Phone bg={tourney.bg} color={tourney.text}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, color: tourney.text, fontFamily: tourney.ui }}>
        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.18em" }}>◂ BACK</div>
          <div style={{
            background: tourney.cyan, color: tourney.bg,
            fontFamily: tourney.display, fontSize: 12, letterSpacing: "0.06em",
            padding: "4px 10px", borderRadius: 4, textTransform: "uppercase",
          }}>
            02 / 02 LOCKED
          </div>
        </div>

        <div style={{ padding: "10px 22px 0" }}>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.magenta, letterSpacing: "0.2em" }}>// FINAL TWO</div>
          <div style={{ fontFamily: tourney.display, fontSize: 28, lineHeight: 0.95, marginTop: 4, textTransform: "uppercase" }}>
            Crown Your<br/>Champions
          </div>
        </div>

        <div style={{ padding: "16px 22px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {FLIGHT.map(n => (
              <Jersey
                key={n}
                num={n}
                size={120}
                status={selected.includes(n) ? "selected" : "default"}
              />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22 }}>
          <div style={{
            display: "flex", gap: 8, marginBottom: 10,
            fontFamily: tourney.mono, fontSize: 10, letterSpacing: "0.14em",
          }}>
            <div style={{ flex: 1, padding: "10px 12px", background: tourney.panel, border: `1.5px solid ${tourney.cyan}`, borderRadius: 8, color: tourney.cyan }}>
              SEED · 22 ✓
            </div>
            <div style={{ flex: 1, padding: "10px 12px", background: tourney.panel, border: `1.5px solid ${tourney.cyan}`, borderRadius: 8, color: tourney.cyan }}>
              SEED · 07 ✓
            </div>
          </div>
          <button style={{
            width: "100%", height: 64,
            background: tourney.magenta, color: tourney.text,
            fontFamily: tourney.display, fontSize: 22, letterSpacing: "0.04em",
            border: "none", borderRadius: 12, textTransform: "uppercase",
            boxShadow: `0 0 28px rgba(255,46,147,0.45)`, cursor: "pointer",
          }}>
            SUBMIT FINAL ▸
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 4: SCOREBOARD (TV) ----------
function TourneyLeaderboard() {
  const top = LEADERBOARD.slice(0, 6);
  const max = top[0].votes;
  return (
    <div className="tv" style={{ background: tourney.bg, color: tourney.text, fontFamily: tourney.ui, position: "relative" }}>
      {/* scanline overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0 1px, transparent 1px 3px)`,
        zIndex: 5,
      }} />
      {/* top bar */}
      <div style={{
        height: 50, borderBottom: `1px solid ${tourney.line}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 24px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            background: tourney.magenta, color: tourney.bg,
            fontFamily: tourney.display, fontSize: 14, letterSpacing: "0.08em",
            padding: "4px 10px", borderRadius: 3, textTransform: "uppercase",
          }}>LIVE</div>
          <div style={{ fontFamily: tourney.display, fontSize: 22, letterSpacing: "0.01em", textTransform: "uppercase" }}>
            SCHMEAR &amp; SCHMOOZE — ROUND 01
          </div>
        </div>
        <div style={{ display: "flex", gap: 18, fontFamily: tourney.mono, fontSize: 11, color: tourney.textDim, letterSpacing: "0.14em" }}>
          <div>JUDGES · 47</div>
          <div>VOTES · 185</div>
          <div style={{ color: tourney.cyan }}>BKLYN · 09:41 PM</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 28, padding: "22px 28px" }}>
        {/* podium */}
        <div>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.cyan, letterSpacing: "0.2em", marginBottom: 10 }}>// LEADERBOARD</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {top.map((row, i) => {
              const pct = row.votes / max;
              const isLead = i === 0;
              return (
                <div key={row.num} style={{
                  display: "grid", gridTemplateColumns: "32px 64px 1fr 70px", alignItems: "center", gap: 12,
                  background: isLead ? "rgba(255,46,147,0.08)" : tourney.panel,
                  border: `1px solid ${isLead ? tourney.magenta : tourney.line}`,
                  borderRadius: 8, padding: "8px 12px",
                }}>
                  <div style={{ fontFamily: tourney.display, fontSize: 22, color: isLead ? tourney.magenta : tourney.textDim, textAlign: "center" }}>
                    {String(i+1).padStart(2,"0")}
                  </div>
                  <Jersey num={row.num} size={48} status={isLead ? "lead" : "default"} />
                  <div>
                    <div style={{ fontFamily: tourney.ui, fontSize: 13, color: tourney.text, fontWeight: 600 }}>{row.brand}</div>
                    <div style={{ height: 6, background: tourney.bg, borderRadius: 3, marginTop: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct*100}%`, height: "100%", background: isLead ? tourney.magenta : tourney.cyan }} />
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontFamily: tourney.display, fontSize: 26, color: tourney.text, letterSpacing: "-0.02em" }}>
                    {row.votes}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* big champ display */}
        <div>
          <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.magenta, letterSpacing: "0.2em", marginBottom: 10 }}>// CURRENT CHAMPION</div>
          <div style={{
            background: tourney.panel, borderRadius: 14, padding: 20,
            border: `2px solid ${tourney.magenta}`, position: "relative",
            boxShadow: `0 0 40px rgba(255,46,147,0.25)`,
            height: 282,
            display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontFamily: tourney.mono, fontSize: 9, color: tourney.textDim, letterSpacing: "0.18em" }}>SEED</div>
                <div style={{ fontFamily: tourney.display, fontSize: 110, lineHeight: 0.85, color: tourney.text, letterSpacing: "-0.03em" }}>31</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: tourney.mono, fontSize: 9, color: tourney.textDim, letterSpacing: "0.18em" }}>VOTES</div>
                <div style={{ fontFamily: tourney.display, fontSize: 56, color: tourney.magenta, lineHeight: 0.9 }}>42</div>
              </div>
            </div>

            <div>
              <div style={{ fontFamily: tourney.ui, fontSize: 16, color: tourney.text, fontWeight: 600 }}>Tompkins Sq. Bakery</div>
              <div style={{ fontFamily: tourney.mono, fontSize: 10, color: tourney.cyan, letterSpacing: "0.14em", marginTop: 4 }}>+4 ON LAST 5 VOTES</div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, fontFamily: tourney.mono, fontSize: 10, color: tourney.textDim, letterSpacing: "0.1em" }}>
              <div><div style={{ color: tourney.text, fontSize: 16, fontFamily: tourney.display }}>22.7%</div>SHARE</div>
              <div><div style={{ color: tourney.text, fontSize: 16, fontFamily: tourney.display }}>+11</div>VS #2</div>
              <div><div style={{ color: tourney.text, fontSize: 16, fontFamily: tourney.display }}>91%</div>RETN</div>
            </div>
          </div>
        </div>
      </div>

      {/* ticker */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 32,
        background: tourney.panel, borderTop: `1px solid ${tourney.line}`,
        display: "flex", alignItems: "center", paddingLeft: 12, gap: 18,
        fontFamily: tourney.mono, fontSize: 11, letterSpacing: "0.12em", color: tourney.textDim,
        overflow: "hidden",
      }}>
        <span style={{ background: tourney.cyan, color: tourney.bg, padding: "2px 8px", borderRadius: 2, fontWeight: 700 }}>NOW</span>
        <span><b style={{color: tourney.text}}>31</b> +2</span>
        <span><b style={{color: tourney.text}}>22</b> +1</span>
        <span><b style={{color: tourney.text}}>07</b> +1</span>
        <span><b style={{color: tourney.text}}>44</b> —</span>
        <span><b style={{color: tourney.text}}>58</b> +1</span>
        <span><b style={{color: tourney.text}}>14</b> —</span>
        <span style={{ marginLeft: "auto", marginRight: 14, color: tourney.cyan }}>· bagels until 11 PM ·</span>
      </div>
    </div>
  );
}

Object.assign(window, { Direction2Meta, TourneyLanding, TourneyReveal, TourneyVote, TourneyLeaderboard });
