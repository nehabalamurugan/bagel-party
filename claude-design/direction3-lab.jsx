// Direction 3 — Lab Notebook
// Graph-paper background, monospace fonts, dotted lines, handwritten annotations.
// Numbers are sample IDs. Voting feels like data entry on a tasting panel form.

const lab = {
  paper: "#fdfcf7",
  paperCool: "#f5f7fa",
  grid: "rgba(70,110,160,0.18)",
  gridMinor: "rgba(70,110,160,0.08)",
  ink: "#0e1730",
  inkSoft: "#3a4866",
  red: "#c4302b",
  yellow: "#ffe87a",
  green: "#5b8a45",
  blue: "#2a5fb3",
  mono: '"JetBrains Mono", "Space Mono", ui-monospace, "SF Mono", monospace',
  hand: '"Caveat", "Marker Felt", cursive',
  body: '"Newsreader", Georgia, serif',
};

// Graph paper background (5mm grid + 25mm thicker lines)
const graphPaper = {
  backgroundColor: lab.paper,
  backgroundImage: `
    linear-gradient(${lab.grid} 1px, transparent 1px),
    linear-gradient(90deg, ${lab.grid} 1px, transparent 1px),
    linear-gradient(${lab.gridMinor} 1px, transparent 1px),
    linear-gradient(90deg, ${lab.gridMinor} 1px, transparent 1px)
  `,
  backgroundSize: `40px 40px, 40px 40px, 8px 8px, 8px 8px`,
};

// Sample tile — paper card with dashed border and sample ID
function SampleCard({ num, size = 100, selected = false, rank, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        background: selected ? lab.yellow : "rgba(253,252,247,0.92)",
        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? lab.ink : lab.inkSoft}`,
        borderRadius: 4,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        cursor: onClick ? "pointer" : "default",
        padding: 8,
        boxSizing: "border-box",
        boxShadow: selected ? `2px 2px 0 ${lab.ink}` : `1px 1px 0 rgba(14,23,48,0.12)`,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontFamily: lab.mono, fontSize: 8, color: lab.inkSoft, letterSpacing: "0.1em" }}>
          SMP-ID
        </div>
        {rank && (
          <div style={{ fontFamily: lab.hand, fontSize: 18, color: lab.red, lineHeight: 1, transform: "rotate(-8deg)" }}>
            #{rank}
          </div>
        )}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{
          fontFamily: lab.mono,
          fontSize: size * 0.36,
          fontWeight: 700,
          color: lab.ink,
          letterSpacing: "-0.02em",
        }}>
          {String(num).padStart(3, "0")}
        </div>
      </div>
      <div style={{
        fontFamily: lab.mono, fontSize: 8, color: lab.inkSoft,
        letterSpacing: "0.06em", textAlign: "right",
      }}>
        n=1
      </div>
    </div>
  );
}

// Tape strip (washi tape, slightly rotated)
function Tape({ children, color = "rgba(255,232,122,0.85)", rotate = -1.5, style = {} }) {
  return (
    <div style={{
      display: "inline-block",
      background: color,
      padding: "4px 14px",
      fontFamily: lab.hand,
      fontSize: 16,
      color: lab.ink,
      transform: `rotate(${rotate}deg)`,
      boxShadow: "0 1px 2px rgba(14,23,48,0.12)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ---------- META CARD ----------
function Direction3Meta() {
  return (
    <div className="meta-card" style={{ ...graphPaper, color: lab.ink, padding: 22 }}>
      <div>
        <div style={{ fontFamily: lab.mono, fontSize: 10, letterSpacing: "0.18em", color: lab.inkSoft }}>// DIRECTION_03</div>
        <h2 style={{ fontFamily: lab.mono, fontSize: 26, lineHeight: 1.0, marginTop: 4, color: lab.ink, fontWeight: 700, letterSpacing: "-0.02em" }}>
          Lab<br/>Notebook
        </h2>
        <div style={{ marginTop: 8 }}>
          <Tape>a study in schmear</Tape>
        </div>
      </div>

      <div>
        <h3 style={{ color: lab.inkSoft, fontFamily: lab.mono }}>PALETTE</h3>
        <div className="swatch-row">
          <div className="swatch" style={{ background: lab.paper, border: `1px solid ${lab.grid}` }}><span>paper</span></div>
          <div className="swatch" style={{ background: lab.ink }}><span>ink</span></div>
          <div className="swatch" style={{ background: lab.inkSoft }}><span>graphite</span></div>
        </div>
        <div className="swatch-row" style={{ marginTop: 22 }}>
          <div className="swatch" style={{ background: lab.red }}><span>redline</span></div>
          <div className="swatch" style={{ background: lab.yellow }}><span>tape</span></div>
          <div className="swatch" style={{ background: lab.green }}><span>plot</span></div>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <h3 style={{ color: lab.inkSoft, fontFamily: lab.mono }}>TYPE</h3>
        <div className="type-line">
          <div style={{ fontFamily: lab.mono, fontSize: 18, fontWeight: 700, color: lab.ink, lineHeight: 1 }}>
            JetBrains_Mono
          </div>
          <div className="name">Display + UI · all data fields</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: lab.hand, fontSize: 22, color: lab.red, lineHeight: 1 }}>
            Caveat — margin notes!
          </div>
          <div className="name">Accent · pen annotations</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: lab.body, fontSize: 14, color: lab.ink }}>Newsreader for prose</div>
          <div className="name">Long-form copy only</div>
        </div>
      </div>

      <div>
        <h3 style={{ color: lab.inkSoft, fontFamily: lab.mono }}>WHY</h3>
        <p style={{ fontFamily: lab.body }}>
          A Stanford grad doing rigorous research on schmear is its own joke. The aesthetic delivers the punchline by treating bagels with absolute seriousness.
        </p>
      </div>

      <div className="signature-box" style={{ background: "transparent", border: `1.5px dashed ${lab.inkSoft}`, fontFamily: lab.mono, fontSize: 11 }}>
        <div className="label" style={{ color: lab.red }}>SIGNATURE</div>
        Voting screen IS a tasting panel form — sample IDs, free-text "notes" field that's actually empty, "submit specimens" CTA. Stamps annotate as you go.
      </div>
    </div>
  );
}

// ---------- SCREEN 1: SUBJECT INTAKE ----------
function LabLanding() {
  return (
    <Phone bg={lab.paper} color={lab.ink}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, ...graphPaper }}>
        {/* notebook binding holes on left */}
        <div style={{ position: "absolute", left: 8, top: 50, bottom: 20, width: 14, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
          {Array.from({length: 8}).map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", background: lab.paper, border: `1.5px solid ${lab.inkSoft}`, boxShadow: "inset 1px 1px 2px rgba(14,23,48,0.2)" }} />
          ))}
        </div>

        <div style={{ padding: "10px 22px 0 30px" }}>
          <div style={{ fontFamily: lab.mono, fontSize: 9, color: lab.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between" }}>
            <span>NOTEBOOK_07 / PG.014</span>
            <span>2026-05-17</span>
          </div>
          <div style={{ height: 1, background: lab.ink, marginTop: 4, opacity: 0.5 }} />

          <div style={{ marginTop: 14 }}>
            <Tape rotate={-2}>study no. 0042</Tape>
          </div>

          <div style={{ fontFamily: lab.mono, fontSize: 24, fontWeight: 700, color: lab.ink, marginTop: 12, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            schmear<br/>
            &amp;_schmooze<span style={{ color: lab.red }}>;</span>
          </div>
          <div style={{ fontFamily: lab.body, fontSize: 13, color: lab.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
            A blind sensory evaluation of cream cheese, conducted in a controlled Brooklyn apartment.
          </div>
          <div style={{ marginTop: 4, fontFamily: lab.hand, fontSize: 18, color: lab.red, transform: "rotate(-1deg)" }}>
            (also it's my birthday)
          </div>
        </div>

        <div style={{ padding: "20px 22px 0 30px" }}>
          <div style={{ fontFamily: lab.mono, fontSize: 10, color: lab.inkSoft, letterSpacing: "0.16em" }}>
            01 · SUBJECT_NAME
          </div>
          <div style={{
            marginTop: 6,
            borderBottom: `1.5px solid ${lab.ink}`,
            padding: "6px 0 4px",
            fontFamily: lab.mono,
            fontSize: 20,
            color: lab.ink,
            position: "relative",
          }}>
            Maya<span style={{ display: "inline-block", width: 2, height: 22, background: lab.red, marginLeft: 2, verticalAlign: "-4px" }} />
          </div>
          <div style={{ fontFamily: lab.hand, fontSize: 14, color: lab.green, marginTop: 4, transform: "rotate(-0.8deg)" }}>
            ← write legibly please
          </div>
        </div>

        <div style={{ padding: "16px 22px 0 30px" }}>
          <div style={{ fontFamily: lab.mono, fontSize: 10, color: lab.inkSoft, letterSpacing: "0.16em" }}>
            02 · CONSENT
          </div>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6, fontFamily: lab.mono, fontSize: 11, color: lab.ink, lineHeight: 1.5 }}>
            <span style={{ width: 14, height: 14, border: `1.5px solid ${lab.ink}`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginTop: 1 }}>
              <span style={{ fontFamily: lab.hand, color: lab.red, fontSize: 18, lineHeight: 0.6, marginTop: -3 }}>×</span>
            </span>
            <span>I understand bagels are an inadequate vehicle and I will use crackers as instructed.</span>
          </label>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 30, right: 22 }}>
          <button style={{
            width: "100%", height: 60,
            background: lab.ink, color: lab.paper,
            border: "none", borderRadius: 0,
            fontFamily: lab.mono, fontSize: 14, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase",
            cursor: "pointer",
          }}>
            ASSIGN_SAMPLES &gt;_
          </button>
          <div style={{ fontFamily: lab.mono, fontSize: 9, color: lab.inkSoft, marginTop: 6, textAlign: "center", letterSpacing: "0.14em" }}>
            randomized · double-blind · n=38 judges
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 2: SAMPLE ASSIGNMENT ----------
function LabReveal() {
  return (
    <Phone bg={lab.paper} color={lab.ink}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, ...graphPaper }}>
        <div style={{ padding: "10px 22px 0", fontFamily: lab.mono, fontSize: 9, color: lab.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between" }}>
          <span>← pg.014</span>
          <span>SUBJECT_042 / MAYA</span>
        </div>

        <div style={{ padding: "12px 22px 0" }}>
          <div style={{ fontFamily: lab.mono, fontSize: 10, color: lab.red, letterSpacing: "0.2em" }}>// FIG.1 — YOUR SAMPLES</div>
          <div style={{ fontFamily: lab.mono, fontSize: 22, fontWeight: 700, color: lab.ink, marginTop: 4, lineHeight: 1.05 }}>
            Specimen<br/>assignment_
          </div>
          <div style={{ fontFamily: lab.body, fontSize: 12, color: lab.inkSoft, marginTop: 6, lineHeight: 1.4 }}>
            Six labelled cups await on the table. IDs randomized at intake.
          </div>
        </div>

        <div style={{ padding: "16px 22px 0", position: "relative" }}>
          {/* the grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, position: "relative" }}>
            {FLIGHT.map((n, i) => (
              <div key={n} style={{ position: "relative" }}>
                <SampleCard num={n} size={84} />
                <div style={{
                  position: "absolute", top: -4, left: -4,
                  fontFamily: lab.mono, fontSize: 8, color: lab.inkSoft,
                  letterSpacing: "0.1em",
                }}>
                  fig.1.{i+1}
                </div>
              </div>
            ))}
          </div>

          {/* annotation arrow + note */}
          <div style={{ position: "absolute", right: -8, top: 6, fontFamily: lab.hand, fontSize: 16, color: lab.red, transform: "rotate(6deg)", textAlign: "right" }}>
            taste these →
          </div>
        </div>

        <div style={{ padding: "20px 22px 0" }}>
          <div style={{
            border: `1.5px dashed ${lab.inkSoft}`,
            padding: "10px 12px",
            fontFamily: lab.mono, fontSize: 10, color: lab.inkSoft,
            lineHeight: 1.6, letterSpacing: "0.04em",
          }}>
            <div style={{ color: lab.ink, fontWeight: 700, letterSpacing: "0.12em", marginBottom: 4 }}>PROTOCOL</div>
            01 → sip water (cleanse palate)<br/>
            02 → spread on water cracker<br/>
            03 → score on schmearability + flavor<br/>
            04 → return to console; submit top_2
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22 }}>
          <button style={{
            width: "100%", height: 60,
            background: lab.ink, color: lab.paper,
            border: "none", borderRadius: 0,
            fontFamily: lab.mono, fontSize: 14, fontWeight: 700,
            letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer",
          }}>
            BEGIN_PANEL &gt;_
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 3: TASTING PANEL ----------
function LabVote() {
  const selected = [22, 7];
  const rank = { 22: 1, 7: 2 };
  return (
    <Phone bg={lab.paper} color={lab.ink}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, ...graphPaper }}>
        <div style={{ padding: "10px 22px 0", fontFamily: lab.mono, fontSize: 9, color: lab.inkSoft, letterSpacing: "0.16em", display: "flex", justifyContent: "space-between" }}>
          <span>← pg.014</span>
          <span style={{ color: lab.red }}>TASTING_PANEL · 02/02</span>
        </div>

        <div style={{ padding: "10px 22px 0" }}>
          <div style={{ fontFamily: lab.mono, fontSize: 10, color: lab.red, letterSpacing: "0.2em" }}>// FIG.2 — SCORE_SHEET</div>
          <div style={{ fontFamily: lab.mono, fontSize: 22, fontWeight: 700, color: lab.ink, marginTop: 4, lineHeight: 1.1 }}>
            rank top two<span style={{ color: lab.red }}>_</span>
          </div>
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {FLIGHT.map(n => (
              <SampleCard
                key={n}
                num={n}
                size={120}
                selected={selected.includes(n)}
                rank={rank[n]}
              />
            ))}
          </div>
        </div>

        <div style={{ padding: "14px 22px 0" }}>
          <div style={{ fontFamily: lab.mono, fontSize: 10, color: lab.inkSoft, letterSpacing: "0.16em" }}>FREE_NOTES (optional)</div>
          <div style={{
            marginTop: 4,
            border: `1.5px solid ${lab.ink}`,
            background: "rgba(255,255,255,0.4)",
            padding: "8px 10px",
            fontFamily: lab.hand,
            fontSize: 16,
            color: lab.ink,
            minHeight: 38,
            lineHeight: 1.2,
          }}>
            #022 = tangy &amp; light. #007 = the platonic ideal of plain.
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22, display: "flex", gap: 8 }}>
          <button style={{
            flex: 1, height: 60,
            background: lab.ink, color: lab.paper,
            border: "none",
            fontFamily: lab.mono, fontSize: 13, fontWeight: 700,
            letterSpacing: "0.16em", textTransform: "uppercase", cursor: "pointer",
          }}>
            SUBMIT_SPECIMENS &gt;_
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 4: RESULTS (TV) ----------
function LabLeaderboard() {
  const top = LEADERBOARD.slice(0, 6);
  const max = top[0].votes;
  return (
    <div className="tv" style={{ ...graphPaper, color: lab.ink, fontFamily: lab.mono, position: "relative", background: lab.paper }}>
      {/* header */}
      <div style={{ padding: "18px 28px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 11, color: lab.inkSoft, letterSpacing: "0.18em" }}>// NOTEBOOK_07 / PG.014 / FIG.4</div>
          <div style={{ fontSize: 30, fontWeight: 700, color: lab.ink, marginTop: 4, letterSpacing: "-0.02em" }}>
            schmear &amp; schmooze<span style={{ color: lab.red }}>_</span>
          </div>
          <div style={{ fontFamily: lab.body, fontSize: 13, color: lab.inkSoft, marginTop: 2 }}>
            Preliminary results · n=185 votes · 6 specimens · double-blind
          </div>
        </div>
        <div>
          <Tape rotate={2}>updated 09:41 PM</Tape>
        </div>
      </div>

      <div style={{ padding: "18px 28px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Left — bar chart */}
        <div>
          <div style={{ fontSize: 10, color: lab.red, letterSpacing: "0.2em" }}>// FIG.4a — votes by sample ID</div>
          <div style={{ marginTop: 12, display: "flex", alignItems: "flex-end", gap: 10, height: 200, borderLeft: `1.5px solid ${lab.ink}`, borderBottom: `1.5px solid ${lab.ink}`, paddingLeft: 12, paddingBottom: 0, position: "relative" }}>
            {/* y axis label */}
            <div style={{ position: "absolute", left: -28, top: "50%", fontSize: 9, color: lab.inkSoft, letterSpacing: "0.14em", transform: "rotate(-90deg) translateX(50%)", transformOrigin: "left center" }}>VOTES →</div>
            {top.map((row, i) => {
              const h = (row.votes / max) * 175;
              const isLead = i === 0;
              return (
                <div key={row.num} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ fontSize: 11, color: lab.ink, fontWeight: 700 }}>{row.votes}</div>
                  <div style={{
                    width: "100%",
                    height: h,
                    background: isLead ? lab.red : lab.ink,
                    backgroundImage: isLead
                      ? `repeating-linear-gradient(45deg, transparent 0 4px, rgba(255,255,255,0.18) 4px 6px)`
                      : `repeating-linear-gradient(45deg, transparent 0 4px, rgba(253,252,247,0.12) 4px 6px)`,
                  }} />
                  <div style={{ fontSize: 11, color: lab.ink, fontWeight: 700, marginTop: 2, letterSpacing: "-0.02em" }}>{String(row.num).padStart(3,"0")}</div>
                </div>
              );
            })}
          </div>
          <div style={{ fontSize: 9, color: lab.inkSoft, marginTop: 4, letterSpacing: "0.14em", textAlign: "center" }}>SAMPLE ID →</div>
        </div>

        {/* Right — ranking table */}
        <div>
          <div style={{ fontSize: 10, color: lab.red, letterSpacing: "0.2em" }}>// TABLE.1 — ranked by total votes</div>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12, fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1.5px solid ${lab.ink}` }}>
                <th style={{ textAlign: "left", padding: "6px 4px", color: lab.inkSoft, fontWeight: 700, letterSpacing: "0.14em", fontSize: 9 }}>RNK</th>
                <th style={{ textAlign: "left", padding: "6px 4px", color: lab.inkSoft, fontWeight: 700, letterSpacing: "0.14em", fontSize: 9 }}>ID</th>
                <th style={{ textAlign: "left", padding: "6px 4px", color: lab.inkSoft, fontWeight: 700, letterSpacing: "0.14em", fontSize: 9 }}>SPECIMEN</th>
                <th style={{ textAlign: "right", padding: "6px 4px", color: lab.inkSoft, fontWeight: 700, letterSpacing: "0.14em", fontSize: 9 }}>n</th>
                <th style={{ textAlign: "right", padding: "6px 4px", color: lab.inkSoft, fontWeight: 700, letterSpacing: "0.14em", fontSize: 9 }}>%</th>
              </tr>
            </thead>
            <tbody>
              {LEADERBOARD.map((row, i) => {
                const pct = (row.votes / 185 * 100).toFixed(1);
                const isLead = i === 0;
                return (
                  <tr key={row.num} style={{ borderBottom: `1px dashed ${lab.inkSoft}`, opacity: i > 5 ? 0.5 : 1 }}>
                    <td style={{ padding: "6px 4px", color: isLead ? lab.red : lab.ink, fontWeight: 700 }}>{String(i+1).padStart(2,"0")}</td>
                    <td style={{ padding: "6px 4px", color: lab.ink, fontWeight: 700, letterSpacing: "-0.02em" }}>{String(row.num).padStart(3,"0")}</td>
                    <td style={{ padding: "6px 4px", fontFamily: lab.body, color: lab.ink }}>{row.brand}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", color: lab.ink, fontWeight: 700 }}>{row.votes}</td>
                    <td style={{ padding: "6px 4px", textAlign: "right", color: lab.inkSoft }}>{pct}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ marginTop: 10, fontFamily: lab.hand, fontSize: 16, color: lab.red, transform: "rotate(-1deg)" }}>
            P.S. sample 003 is whole foods 365. fascinating.
          </div>
        </div>
      </div>

      {/* corner stamp */}
      <div style={{
        position: "absolute", top: 22, right: 28,
        border: `2px solid ${lab.red}`,
        color: lab.red,
        padding: "4px 10px",
        fontFamily: lab.mono, fontSize: 11, fontWeight: 700,
        letterSpacing: "0.18em",
        transform: "rotate(6deg)",
        opacity: 0.85,
      }}>
        PRELIMINARY
      </div>
    </div>
  );
}

Object.assign(window, { Direction3Meta, LabLanding, LabReveal, LabVote, LabLeaderboard });
