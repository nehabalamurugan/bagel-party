// Direction 1 — Deli Counter
// NYC bagel-shop warmth. Cream paper, rye browns, mustard accent, pickle green.
// Numbers feel like torn butcher-counter tickets. Hand-drawn vintage type.

const deli = {
  paper: "#f4ead5",
  paperDark: "#ebdfc3",
  cream: "#faf6ec",
  rye: "#6b4423",
  ryeDark: "#3a2412",
  ink: "#2a1a0e",
  mustard: "#d4a017",
  pickle: "#5a7a3e",
  red: "#b8442f",
  display: '"Bowlby One SC", "Cooper Black", "Arial Black", sans-serif',
  serif: '"DM Serif Display", "Playfair Display", serif',
  body: '"Newsreader", "Source Serif Pro", Georgia, serif',
  hand: '"Caveat", "Marker Felt", cursive',
};

// Subtle paper-texture using stacked radial gradients (super cheap noise)
const paperTexture = {
  backgroundColor: deli.paper,
  backgroundImage: `radial-gradient(rgba(106,68,35,0.06) 1px, transparent 1px),
                    radial-gradient(rgba(106,68,35,0.05) 1px, transparent 1px)`,
  backgroundSize: "14px 14px, 23px 23px",
  backgroundPosition: "0 0, 7px 11px",
};

// A "deli ticket" — chunky rounded rect with notched corners + perforation
function DeliTicket({ num, size = 100, variant = "default", style = {}, onClick }) {
  const bg = variant === "selected" ? deli.mustard : deli.cream;
  const fg = variant === "selected" ? deli.ryeDark : deli.rye;
  const border = variant === "selected" ? deli.ryeDark : deli.rye;
  return (
    <div
      onClick={onClick}
      style={{
        width: size,
        height: size,
        background: bg,
        border: `2px solid ${border}`,
        borderRadius: 10,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: variant === "selected"
          ? `0 4px 0 ${deli.ryeDark}, 0 6px 14px rgba(58,36,18,0.18)`
          : `0 3px 0 ${deli.rye}, 0 5px 12px rgba(58,36,18,0.12)`,
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {/* perforated holes top/bottom */}
      <div style={{ position: "absolute", top: -2, left: 0, right: 0, height: 4, display: "flex", justifyContent: "space-around", pointerEvents: "none" }}>
        {[0,1,2,3,4,5].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: "50%", background: deli.paper, border: `1px solid ${border}` }} />)}
      </div>
      <div style={{ fontFamily: deli.body, fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: fg, opacity: 0.6, marginTop: 6 }}>No.</div>
      <div style={{ fontFamily: deli.display, fontSize: size * 0.45, lineHeight: 1, color: fg }}>{num}</div>
    </div>
  );
}

function DeliHeader({ title, subtitle }) {
  return (
    <div style={{ paddingTop: 10, textAlign: "center" }}>
      <div style={{ fontFamily: deli.body, fontSize: 10, fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase", color: deli.rye, opacity: 0.65 }}>
        — EST. THIS WEEKEND —
      </div>
      <div style={{ fontFamily: deli.display, fontSize: 26, lineHeight: 1, color: deli.ink, marginTop: 6, letterSpacing: "-0.01em" }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontFamily: deli.hand, fontSize: 18, color: deli.red, marginTop: 4, transform: "rotate(-1.5deg)" }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ---------- META CARD ----------
function Direction1Meta() {
  return (
    <div className="meta-card" style={{ background: deli.cream, color: deli.ink }}>
      <div>
        <div className="kicker" style={{ color: deli.rye, opacity: 0.7 }}>Direction 01</div>
        <h2 style={{ fontFamily: deli.display, fontSize: 28, lineHeight: 1.0, marginTop: 4, color: deli.ink }}>
          Deli<br/>Counter
        </h2>
        <div style={{ fontFamily: deli.hand, fontSize: 20, color: deli.red, marginTop: 4, transform: "rotate(-1.2deg)" }}>
          take a number!
        </div>
      </div>

      <div>
        <h3 style={{ color: deli.rye }}>Palette</h3>
        <div className="swatch-row">
          <div className="swatch" style={{ background: deli.paper }}><span>paper</span></div>
          <div className="swatch" style={{ background: deli.cream }}><span>cream</span></div>
          <div className="swatch" style={{ background: deli.rye }}><span>rye</span></div>
        </div>
        <div className="swatch-row" style={{ marginTop: 22 }}>
          <div className="swatch" style={{ background: deli.mustard }}><span>mustard</span></div>
          <div className="swatch" style={{ background: deli.pickle }}><span>pickle</span></div>
          <div className="swatch" style={{ background: deli.red }}><span>tomato</span></div>
        </div>
      </div>

      <div style={{ marginTop: 10 }}>
        <h3 style={{ color: deli.rye }}>Type</h3>
        <div className="type-line">
          <div style={{ fontFamily: deli.display, fontSize: 22, color: deli.ink, lineHeight: 1 }}>Bowlby One SC</div>
          <div className="name">Display · sign-painter chunk</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: deli.body, fontSize: 16, color: deli.ink }}>Newsreader</div>
          <div className="name">Body · warm editorial serif</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: deli.hand, fontSize: 20, color: deli.red, lineHeight: 1 }}>Caveat for asides</div>
          <div className="name">Accent · handwritten</div>
        </div>
      </div>

      <div>
        <h3 style={{ color: deli.rye }}>Why</h3>
        <p style={{ fontFamily: deli.body }}>
          The bagel context already lives here — paper signage, hand-lettered windows, ticket dispensers. The aesthetic carries the joke without explaining it.
        </p>
      </div>

      <div className="signature-box" style={{ background: deli.paper, fontFamily: deli.body }}>
        <div className="label" style={{ color: deli.rye }}>Signature detail</div>
        Numbers are torn-edge butcher tickets with perforation dots and a 3px drop shadow — they tear off the dispenser when tapped.
      </div>
    </div>
  );
}

// ---------- SCREEN 1: LANDING ----------
function DeliLanding() {
  return (
    <Phone bg={deli.paper} color={deli.ink}>
      <div style={{ ...paperTexture, position: "absolute", inset: 0, paddingTop: 38 }}>
        {/* awning stripes at top */}
        <div style={{
          height: 24,
          background: `repeating-linear-gradient(90deg, ${deli.red} 0 18px, ${deli.cream} 18px 36px)`,
          borderBottom: `2px solid ${deli.ryeDark}`,
        }} />
        <DeliHeader title="Schmear &amp; Schmooze" subtitle="a cream cheese inquiry" />
        <div style={{ fontFamily: deli.body, fontSize: 12, textAlign: "center", color: deli.rye, marginTop: 8, opacity: 0.75 }}>
          Bagel Compound №7 · Brooklyn · 2026
        </div>

        {/* divider */}
        <div style={{ margin: "18px 28px", borderTop: `1.5px dashed ${deli.rye}`, opacity: 0.5 }} />

        <div style={{ padding: "0 22px" }}>
          <div style={{ fontFamily: deli.body, fontSize: 16, fontWeight: 600, color: deli.ink, lineHeight: 1.3 }}>
            Hey there — what should we call you?
          </div>
          <div style={{ fontFamily: deli.body, fontSize: 12, color: deli.rye, marginTop: 4, opacity: 0.75 }}>
            Used only on the leaderboard. Be brave.
          </div>

          <div style={{
            marginTop: 14,
            background: deli.cream,
            border: `2px solid ${deli.rye}`,
            borderRadius: 10,
            padding: "14px 16px",
            fontFamily: deli.body,
            fontSize: 18,
            color: deli.ink,
            position: "relative",
          }}>
            Maya
            <span style={{ display: "inline-block", width: 2, height: 20, background: deli.ink, marginLeft: 3, verticalAlign: "-4px", animation: "blink 1s infinite" }} />
          </div>

          <button style={{
            marginTop: 18,
            width: "100%",
            height: 64,
            background: deli.mustard,
            border: `2px solid ${deli.ryeDark}`,
            borderRadius: 12,
            fontFamily: deli.display,
            fontSize: 20,
            color: deli.ryeDark,
            letterSpacing: "0.04em",
            boxShadow: `0 4px 0 ${deli.ryeDark}`,
            cursor: "pointer",
          }}>
            TAKE A NUMBER →
          </button>

          <div style={{ textAlign: "center", marginTop: 14, fontFamily: deli.hand, fontSize: 17, color: deli.pickle, transform: "rotate(-1deg)" }}>
            6 brands · 60 numbered cups · 1 winner
          </div>
        </div>

        {/* "now serving" ticker */}
        <div style={{
          position: "absolute", bottom: 22, left: 18, right: 18,
          background: deli.ryeDark, color: deli.cream,
          borderRadius: 10, padding: "10px 14px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          fontFamily: deli.body,
        }}>
          <div style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.7 }}>Now Serving</div>
          <div style={{ fontFamily: deli.display, fontSize: 22, color: deli.mustard }}>Guest 47</div>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 2: REVEAL ----------
function DeliReveal() {
  return (
    <Phone bg={deli.paper} color={deli.ink}>
      <div style={{ ...paperTexture, position: "absolute", inset: 0, paddingTop: 38 }}>
        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: deli.body, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: deli.rye, opacity: 0.7 }}>
            ← back
          </div>
          <div style={{ fontFamily: deli.body, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: deli.rye, opacity: 0.7 }}>
            step 1 of 2
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 14 }}>
          <div style={{ fontFamily: deli.hand, fontSize: 22, color: deli.red, transform: "rotate(-1.5deg)" }}>
            you're up, Maya —
          </div>
          <div style={{ fontFamily: deli.display, fontSize: 28, lineHeight: 1, color: deli.ink, marginTop: 4 }}>
            Your tasting flight
          </div>
          <div style={{ fontFamily: deli.body, fontSize: 12, color: deli.rye, marginTop: 6, opacity: 0.8 }}>
            Find these 6 cups. Taste in any order.
          </div>
        </div>

        {/* receipt-style ticket strip */}
        <div style={{
          margin: "18px 18px 0",
          background: deli.cream,
          border: `2px solid ${deli.rye}`,
          borderRadius: 14,
          padding: "16px 14px 18px",
          position: "relative",
        }}>
          <div style={{ textAlign: "center", fontFamily: deli.body, fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: deli.rye, opacity: 0.7, borderBottom: `1.5px dashed ${deli.rye}`, paddingBottom: 8, marginBottom: 14 }}>
            ★ Flight Ticket №0042 ★
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, justifyItems: "center" }}>
            {FLIGHT.map(n => <DeliTicket key={n} num={n} size={78} />)}
          </div>
          <div style={{ borderTop: `1.5px dashed ${deli.rye}`, marginTop: 14, paddingTop: 10, display: "flex", justifyContent: "space-between", fontFamily: deli.body, fontSize: 11, color: deli.rye, opacity: 0.8 }}>
            <div>6 SAMPLES</div>
            <div>VOTE TOP 2</div>
            <div>9:41 PM</div>
          </div>
        </div>

        <div style={{ padding: "0 22px", marginTop: 18 }}>
          <button style={{
            width: "100%",
            height: 64,
            background: deli.ryeDark,
            border: `2px solid ${deli.ryeDark}`,
            borderRadius: 12,
            fontFamily: deli.display,
            fontSize: 18,
            color: deli.mustard,
            letterSpacing: "0.04em",
            boxShadow: `0 4px 0 ${deli.ink}`,
            cursor: "pointer",
          }}>
            START TASTING →
          </button>
          <div style={{ textAlign: "center", marginTop: 10, fontFamily: deli.hand, fontSize: 16, color: deli.pickle, transform: "rotate(0.8deg)" }}>
            tip: cleanse with a pickle between cups
          </div>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 3: VOTING ----------
function DeliVote() {
  const selected = [22, 7];
  return (
    <Phone bg={deli.paper} color={deli.ink}>
      <div style={{ ...paperTexture, position: "absolute", inset: 0, paddingTop: 38 }}>
        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: deli.body, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: deli.rye, opacity: 0.7 }}>← back</div>
          <div style={{
            background: deli.pickle, color: deli.cream,
            fontFamily: deli.body, fontSize: 11, letterSpacing: "0.1em",
            padding: "4px 10px", borderRadius: 999,
          }}>2 / 2 picked</div>
        </div>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <div style={{ fontFamily: deli.display, fontSize: 24, lineHeight: 1.1, color: deli.ink }}>
            Pick your top two
          </div>
          <div style={{ fontFamily: deli.body, fontSize: 12, color: deli.rye, marginTop: 4, opacity: 0.8 }}>
            Tap a ticket to vote. Tap again to undo.
          </div>
        </div>

        <div style={{ padding: "18px 22px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {FLIGHT.map(n => (
              <DeliTicket
                key={n}
                num={n}
                size={120}
                variant={selected.includes(n) ? "selected" : "default"}
              />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22 }}>
          <button style={{
            width: "100%",
            height: 64,
            background: deli.mustard,
            border: `2px solid ${deli.ryeDark}`,
            borderRadius: 12,
            fontFamily: deli.display,
            fontSize: 18,
            color: deli.ryeDark,
            boxShadow: `0 4px 0 ${deli.ryeDark}`,
            cursor: "pointer",
          }}>
            LOCK IT IN
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 4: LEADERBOARD (TV) ----------
function DeliLeaderboard() {
  const top = LEADERBOARD.slice(0, 6);
  const max = top[0].votes;
  return (
    <div className="tv" style={{ ...paperTexture, background: deli.paper }}>
      {/* awning */}
      <div style={{
        height: 40,
        background: `repeating-linear-gradient(90deg, ${deli.red} 0 38px, ${deli.cream} 38px 76px)`,
        borderBottom: `3px solid ${deli.ryeDark}`,
      }} />
      <div style={{ padding: "20px 40px 0", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontFamily: deli.body, fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: deli.rye, opacity: 0.75 }}>
            — EST. THIS WEEKEND · BROOKLYN —
          </div>
          <div style={{ fontFamily: deli.display, fontSize: 44, lineHeight: 1, color: deli.ink, marginTop: 6 }}>
            Schmear &amp; Schmooze
          </div>
          <div style={{ fontFamily: deli.hand, fontSize: 24, color: deli.red, transform: "rotate(-1deg)", marginTop: 4 }}>
            live standings · ☕ keep tasting
          </div>
        </div>
        <div style={{ textAlign: "right", fontFamily: deli.body, color: deli.rye }}>
          <div style={{ fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", opacity: 0.65 }}>Votes cast</div>
          <div style={{ fontFamily: deli.display, fontSize: 36, color: deli.ink, lineHeight: 1 }}>185</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>of ~38 guests · 2 each</div>
        </div>
      </div>

      <div style={{ padding: "18px 40px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 32px" }}>
        {top.map((row, i) => {
          const pct = row.votes / max;
          const isLead = i === 0;
          return (
            <div key={row.num} style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ fontFamily: deli.display, fontSize: 28, color: isLead ? deli.red : deli.rye, opacity: isLead ? 1 : 0.7, width: 28, textAlign: "right" }}>
                {i + 1}
              </div>
              <DeliTicket num={row.num} size={64} variant={isLead ? "selected" : "default"} />
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: deli.body, fontSize: 13, color: deli.rye, opacity: 0.75 }}>{row.brand}</div>
                <div style={{ height: 10, background: deli.cream, border: `1.5px solid ${deli.rye}`, borderRadius: 6, marginTop: 4, overflow: "hidden", position: "relative" }}>
                  <div style={{
                    width: `${pct * 100}%`, height: "100%",
                    background: isLead ? deli.red : deli.rye,
                  }} />
                </div>
                <div style={{ fontFamily: deli.display, fontSize: 22, color: deli.ink, lineHeight: 1, marginTop: 4 }}>
                  {row.votes} <span style={{ fontFamily: deli.body, fontSize: 11, color: deli.rye, opacity: 0.7, letterSpacing: "0.1em" }}>VOTES</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

Object.assign(window, { Direction1Meta, DeliLanding, DeliReveal, DeliVote, DeliLeaderboard });
