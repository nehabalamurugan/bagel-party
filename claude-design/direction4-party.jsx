// Direction 4 — Party Banner
// Loud, joyful, birthday energy. Bright colors, balloons, confetti, big rounded type.
// Numbers go on party banners / favor tags. Maximally fun.

const party = {
  pink: "#ff4d8b",
  yellow: "#ffd23f",
  blue: "#4d9eff",
  lime: "#b8e62a",
  purple: "#7a3aff",
  red: "#ff5b3a",
  cream: "#fff7e3",
  ink: "#1f1240",
  display: '"Bagel Fat One", "Lobster", "Fredoka", sans-serif',
  body: '"Fredoka", "Nunito", system-ui, sans-serif',
};

// Confetti svg backdrop — randomly distributed colored shapes
function Confetti({ density = 30, opacity = 0.7 }) {
  const colors = [party.pink, party.yellow, party.blue, party.lime, party.purple, party.red];
  const shapes = [];
  // Deterministic pseudo-random so it's stable across renders
  let s = 1;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < density; i++) {
    const x = rng() * 100;
    const y = rng() * 100;
    const r = rng() * 360;
    const c = colors[Math.floor(rng() * colors.length)];
    const k = rng();
    let el;
    if (k < 0.35) {
      el = <rect key={i} x={x} y={y} width="2.2" height="0.7" rx="0.3" fill={c} transform={`rotate(${r} ${x+1} ${y+0.5})`} />;
    } else if (k < 0.7) {
      el = <circle key={i} cx={x} cy={y} r="0.6" fill={c} />;
    } else {
      el = <polygon key={i} points={`${x},${y} ${x+1.4},${y+0.4} ${x+0.7},${y+1.4}`} fill={c} transform={`rotate(${r} ${x+0.7} ${y+0.7})`} />;
    }
    shapes.push(el);
  }
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none"
         style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity, pointerEvents: "none" }}>
      {shapes}
    </svg>
  );
}

// A favor-tag number — pennant/triangle shape with a rope and big rounded number
function FavorTag({ num, size = 110, accent = party.pink, selected = false, onClick, style = {} }) {
  const W = size, H = size * 1.15;
  return (
    <div onClick={onClick} style={{ width: W, height: H, position: "relative", cursor: onClick ? "pointer" : "default", ...style }}>
      {/* rope */}
      <div style={{
        position: "absolute", top: 0, left: "50%", width: 1.5, height: 12,
        background: party.ink, transform: "translateX(-50%)",
      }} />
      {/* rope knot */}
      <div style={{
        position: "absolute", top: 9, left: "50%", width: 8, height: 8,
        borderRadius: "50%", background: party.ink, transform: "translateX(-50%)",
      }} />
      {/* tag body */}
      <div style={{
        position: "absolute", top: 14, left: 0, right: 0, bottom: 0,
        background: selected ? accent : party.cream,
        border: `3px solid ${party.ink}`,
        borderRadius: "14px 14px 14px 14px",
        clipPath: "polygon(0 0, 100% 0, 100% 80%, 50% 100%, 0 80%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: selected ? `0 6px 0 ${party.ink}` : `0 4px 0 ${party.ink}`,
        transform: selected ? "scale(1.04)" : "scale(1)",
        transition: "transform .15s",
      }}>
        <div style={{
          fontFamily: party.body, fontSize: 10, fontWeight: 700,
          color: selected ? party.cream : party.ink, opacity: 0.7,
          letterSpacing: "0.14em", marginTop: -4,
        }}>
          NO.
        </div>
        <div style={{
          fontFamily: party.display,
          fontSize: size * 0.55,
          color: selected ? party.cream : party.ink,
          lineHeight: 0.9,
          marginTop: 2,
        }}>
          {num}
        </div>
      </div>
      {selected && (
        <div style={{
          position: "absolute", top: 6, right: -6,
          background: party.yellow,
          border: `2.5px solid ${party.ink}`,
          width: 26, height: 26, borderRadius: "50%",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: party.display, fontSize: 16, color: party.ink, lineHeight: 1,
          boxShadow: `0 2px 0 ${party.ink}`,
        }}>
          ✓
        </div>
      )}
    </div>
  );
}

// Balloon decoration
function Balloon({ color, x, y, size = 36, tilt = 0 }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${tilt}deg)`, pointerEvents: "none" }}>
      <div style={{
        width: size, height: size * 1.15,
        background: color,
        border: `2.5px solid ${party.ink}`,
        borderRadius: "50% 50% 50% 50% / 55% 55% 45% 45%",
        position: "relative",
      }}>
        {/* highlight */}
        <div style={{ position: "absolute", top: "18%", left: "22%", width: "22%", height: "26%", background: "rgba(255,255,255,0.55)", borderRadius: "50%" }} />
        {/* knot */}
        <div style={{ position: "absolute", bottom: -7, left: "50%", transform: "translateX(-50%)", width: 0, height: 0, borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: `5px solid ${party.ink}` }} />
      </div>
      {/* string */}
      <div style={{ position: "absolute", top: size * 1.15 + 2, left: "50%", width: 1.2, height: size * 0.8, background: party.ink, transform: "translateX(-50%)" }} />
    </div>
  );
}

// Bunting banner — colored triangle pennants on a string
function Bunting({ width = 320, pennants = 8, style = {} }) {
  const colors = [party.pink, party.yellow, party.blue, party.lime, party.red, party.purple];
  return (
    <svg viewBox={`0 0 ${pennants * 30} 36`} preserveAspectRatio="none" style={{ width, height: 32, display: "block", ...style }}>
      <path d={`M 0 4 Q ${pennants*15} 18 ${pennants*30} 4`} stroke={party.ink} strokeWidth="1" fill="none" />
      {Array.from({ length: pennants }).map((_, i) => {
        const c = colors[i % colors.length];
        const cx = (i + 0.5) * 30;
        const t = i / (pennants - 1);
        const cy = 4 + Math.sin(Math.PI * t) * 6;
        return (
          <g key={i} transform={`translate(${cx - 11} ${cy})`}>
            <polygon points="0,0 22,0 11,22" fill={c} stroke={party.ink} strokeWidth="1.4" />
          </g>
        );
      })}
    </svg>
  );
}

// ---------- META CARD ----------
function Direction4Meta() {
  return (
    <div className="meta-card" style={{ background: party.cream, color: party.ink, position: "relative", overflow: "hidden" }}>
      <Confetti density={40} opacity={0.45} />
      <div style={{ position: "relative" }}>
        <div className="kicker" style={{ color: party.pink }}>Direction 04</div>
        <h2 style={{ fontFamily: party.display, fontSize: 38, lineHeight: 0.95, marginTop: 4, color: party.ink }}>
          Party<br/>Banner!
        </h2>
        <div style={{ fontFamily: party.body, fontWeight: 600, fontSize: 14, color: party.pink, marginTop: 4 }}>
          🎉 maximally fun, no regrets
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <h3 style={{ color: party.ink, opacity: 0.6 }}>Palette</h3>
        <div className="swatch-row">
          <div className="swatch" style={{ background: party.pink }}><span>pink</span></div>
          <div className="swatch" style={{ background: party.yellow }}><span>yolk</span></div>
          <div className="swatch" style={{ background: party.blue }}><span>sky</span></div>
        </div>
        <div className="swatch-row" style={{ marginTop: 22 }}>
          <div className="swatch" style={{ background: party.lime }}><span>lime</span></div>
          <div className="swatch" style={{ background: party.purple }}><span>grape</span></div>
          <div className="swatch" style={{ background: party.cream, border: `1px solid rgba(0,0,0,0.1)` }}><span>cream</span></div>
        </div>
      </div>

      <div style={{ marginTop: 10, position: "relative" }}>
        <h3 style={{ color: party.ink, opacity: 0.6 }}>Type</h3>
        <div className="type-line">
          <div style={{ fontFamily: party.display, fontSize: 28, color: party.ink, lineHeight: 1 }}>Bagel Fat One</div>
          <div className="name">Display · literally a font called Bagel</div>
        </div>
        <div className="type-line" style={{ marginTop: 8 }}>
          <div style={{ fontFamily: party.body, fontSize: 16, color: party.ink, fontWeight: 600 }}>Fredoka — round &amp; warm</div>
          <div className="name">Body · rounded, friendly</div>
        </div>
      </div>

      <div style={{ position: "relative" }}>
        <h3 style={{ color: party.ink, opacity: 0.6 }}>Why</h3>
        <p style={{ fontFamily: party.body, fontWeight: 500 }}>
          Two parties in one — graduation + birthday. The aesthetic refuses to take itself seriously and that IS the joke.
        </p>
      </div>

      <div className="signature-box" style={{ background: party.pink, color: party.cream, fontFamily: party.body, fontWeight: 600, position: "relative" }}>
        <div className="label" style={{ color: party.yellow }}>Signature</div>
        Every number lives on a die-cut party favor tag. On submit, confetti bursts. Balloons drift across the leaderboard background.
      </div>
    </div>
  );
}

// ---------- SCREEN 1: WELCOME ----------
function PartyLanding() {
  return (
    <Phone bg={party.cream} color={party.ink}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, overflow: "hidden" }}>
        <Confetti density={50} opacity={0.55} />

        {/* bunting */}
        <div style={{ position: "absolute", top: 42, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <Bunting width={290} pennants={9} />
        </div>

        {/* balloons */}
        <Balloon color={party.pink} x={20} y={80} size={36} tilt={-8} />
        <Balloon color={party.yellow} x={250} y={92} size={32} tilt={6} />
        <Balloon color={party.blue} x={42} y={138} size={26} tilt={4} />

        <div style={{ padding: "108px 22px 0", textAlign: "center", position: "relative" }}>
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 13, color: party.purple, letterSpacing: "0.14em", textTransform: "uppercase" }}>
            🎂 BIRTHDAY · 🎓 GRADUATION · 🥯 BAGELS
          </div>
          <div style={{
            fontFamily: party.display,
            fontSize: 50,
            lineHeight: 0.92,
            color: party.ink,
            marginTop: 10,
            letterSpacing: "-0.01em",
          }}>
            <span style={{ color: party.pink }}>Schmear</span><br/>
            &amp; <span style={{ color: party.blue }}>Schmooze</span>!
          </div>
          <div style={{ fontFamily: party.body, fontSize: 14, color: party.ink, marginTop: 10, fontWeight: 500, opacity: 0.8 }}>
            you made it. now help me<br/>find the best cream cheese.
          </div>
        </div>

        <div style={{ padding: "20px 22px 0", position: "relative" }}>
          <div style={{
            background: party.cream,
            border: `3px solid ${party.ink}`,
            borderRadius: 16,
            padding: "16px 18px",
            boxShadow: `0 4px 0 ${party.ink}`,
            position: "relative",
          }}>
            <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 11, color: party.ink, opacity: 0.6, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              YOUR NAME
            </div>
            <div style={{ fontFamily: party.display, fontSize: 26, color: party.ink, lineHeight: 1, marginTop: 4 }}>
              Maya<span style={{ display: "inline-block", width: 3, height: 26, background: party.pink, marginLeft: 4, verticalAlign: "-4px" }} />
            </div>
          </div>

          <button style={{
            marginTop: 16,
            width: "100%", height: 70,
            background: party.pink,
            color: party.cream,
            border: `3px solid ${party.ink}`,
            borderRadius: 18,
            fontFamily: party.display,
            fontSize: 24,
            letterSpacing: "0.01em",
            cursor: "pointer",
            boxShadow: `0 5px 0 ${party.ink}`,
          }}>
            🎉 give me my flight!
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 2: YOUR FLIGHT ----------
function PartyReveal() {
  return (
    <Phone bg={party.cream} color={party.ink}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, overflow: "hidden" }}>
        <Confetti density={35} opacity={0.45} />

        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 13, color: party.ink, opacity: 0.6 }}>← back</div>
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 12, color: party.purple, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            step 1 of 2
          </div>
        </div>

        <div style={{ padding: "8px 22px 0", textAlign: "center" }}>
          <div style={{ fontFamily: party.body, fontSize: 13, color: party.pink, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            🎀 your party flight 🎀
          </div>
          <div style={{
            fontFamily: party.display,
            fontSize: 32,
            color: party.ink,
            marginTop: 4,
            lineHeight: 0.95,
          }}>
            taste these six,<br/>
            <span style={{ color: party.blue }}>vote your faves</span>
          </div>
        </div>

        {/* tags on a string */}
        <div style={{ padding: "10px 14px 0", position: "relative" }}>
          {/* dashed clothesline */}
          <svg viewBox="0 0 300 4" preserveAspectRatio="none" style={{ position: "absolute", top: 18, left: 14, right: 14, width: "calc(100% - 28px)", height: 8 }}>
            <line x1="0" y1="2" x2="300" y2="2" stroke={party.ink} strokeWidth="1" strokeDasharray="3 4" />
          </svg>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, justifyItems: "center", paddingTop: 4 }}>
            {FLIGHT.slice(0,3).map((n, i) => (
              <FavorTag key={n} num={n} size={84} accent={[party.pink, party.yellow, party.blue][i]} />
            ))}
          </div>
          <svg viewBox="0 0 300 4" preserveAspectRatio="none" style={{ position: "absolute", top: 138, left: 14, right: 14, width: "calc(100% - 28px)", height: 8 }}>
            <line x1="0" y1="2" x2="300" y2="2" stroke={party.ink} strokeWidth="1" strokeDasharray="3 4" />
          </svg>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, justifyItems: "center", paddingTop: 8 }}>
            {FLIGHT.slice(3,6).map((n, i) => (
              <FavorTag key={n} num={n} size={84} accent={[party.lime, party.purple, party.red][i]} />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22 }}>
          <div style={{
            background: party.yellow,
            border: `3px solid ${party.ink}`,
            borderRadius: 14,
            padding: "10px 14px",
            fontFamily: party.body, fontSize: 12, color: party.ink, fontWeight: 600,
            textAlign: "center",
            marginBottom: 12,
            boxShadow: `0 3px 0 ${party.ink}`,
          }}>
            💡 spread on a cracker, sip water between, NO PEEKING.
          </div>
          <button style={{
            width: "100%", height: 66,
            background: party.lime, color: party.ink,
            border: `3px solid ${party.ink}`, borderRadius: 18,
            fontFamily: party.display, fontSize: 22,
            boxShadow: `0 5px 0 ${party.ink}`, cursor: "pointer",
          }}>
            let's eat! →
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 3: PICK TOP 2 ----------
function PartyVote() {
  const selected = [22, 7];
  const tagColors = [party.pink, party.yellow, party.blue, party.lime, party.purple, party.red];
  return (
    <Phone bg={party.cream} color={party.ink}>
      <div style={{ position: "absolute", inset: 0, paddingTop: 38, overflow: "hidden" }}>
        <Confetti density={28} opacity={0.4} />

        <div style={{ padding: "10px 22px 0", display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 13, color: party.ink, opacity: 0.6 }}>← back</div>
          <div style={{
            background: party.lime, color: party.ink,
            fontFamily: party.body, fontWeight: 700, fontSize: 12,
            padding: "4px 10px", borderRadius: 999,
            border: `2px solid ${party.ink}`,
          }}>
            2 of 2 picked ✨
          </div>
        </div>

        <div style={{ padding: "8px 22px 0", textAlign: "center" }}>
          <div style={{
            fontFamily: party.display, fontSize: 28, lineHeight: 0.95, color: party.ink,
          }}>
            <span style={{ color: party.pink }}>tap two</span> tags!
          </div>
          <div style={{ fontFamily: party.body, fontSize: 12, color: party.ink, opacity: 0.7, fontWeight: 500, marginTop: 4 }}>
            your favorites of the six. trust your tongue.
          </div>
        </div>

        <div style={{ padding: "14px 18px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, justifyItems: "center" }}>
            {FLIGHT.map((n, i) => (
              <FavorTag
                key={n}
                num={n}
                size={120}
                accent={tagColors[i]}
                selected={selected.includes(n)}
              />
            ))}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 18, left: 22, right: 22 }}>
          <button style={{
            width: "100%", height: 66,
            background: party.pink, color: party.cream,
            border: `3px solid ${party.ink}`, borderRadius: 18,
            fontFamily: party.display, fontSize: 22,
            boxShadow: `0 5px 0 ${party.ink}`, cursor: "pointer",
          }}>
            🎉 cast my vote! 🎉
          </button>
        </div>
      </div>
    </Phone>
  );
}

// ---------- SCREEN 4: LIVE (TV) ----------
function PartyLeaderboard() {
  const top = LEADERBOARD.slice(0, 6);
  const max = top[0].votes;
  const tagColors = [party.pink, party.yellow, party.blue, party.lime, party.purple, party.red];
  return (
    <div className="tv" style={{ background: party.cream, color: party.ink, position: "relative", overflow: "hidden" }}>
      <Confetti density={70} opacity={0.5} />

      {/* corner balloons */}
      <Balloon color={party.pink} x={28} y={62} size={44} tilt={-8} />
      <Balloon color={party.yellow} x={70} y={48} size={32} tilt={5} />
      <Balloon color={party.blue} x={680} y={62} size={44} tilt={6} />
      <Balloon color={party.lime} x={638} y={48} size={32} tilt={-4} />

      {/* bunting */}
      <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <Bunting width={500} pennants={14} />
      </div>

      <div style={{ paddingTop: 50, textAlign: "center", position: "relative" }}>
        <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 14, color: party.purple, letterSpacing: "0.18em", textTransform: "uppercase" }}>
          🥯 BAGEL COMPOUND №7 · LIVE 🥯
        </div>
        <div style={{
          fontFamily: party.display,
          fontSize: 64,
          color: party.ink,
          lineHeight: 0.9,
          marginTop: 4,
        }}>
          <span style={{ color: party.pink }}>schmear</span> &amp; <span style={{ color: party.blue }}>schmooze</span>
        </div>
      </div>

      {/* podium row */}
      <div style={{ position: "relative", padding: "18px 28px 0", display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 28 }}>
        {/* 2nd */}
        <div style={{ textAlign: "center" }}>
          <FavorTag num={top[1].num} size={80} accent={tagColors[1]} selected={true} />
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 12, color: party.ink, marginTop: 8 }}>{top[1].brand}</div>
          <div style={{ fontFamily: party.display, fontSize: 26, color: party.ink, lineHeight: 1 }}>{top[1].votes}</div>
        </div>
        {/* 1st (taller) */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: party.display, fontSize: 18, color: party.pink, marginBottom: 2 }}>★ winner so far ★</div>
          <FavorTag num={top[0].num} size={120} accent={tagColors[0]} selected={true} />
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 14, color: party.ink, marginTop: 8 }}>{top[0].brand}</div>
          <div style={{ fontFamily: party.display, fontSize: 36, color: party.pink, lineHeight: 1 }}>{top[0].votes}</div>
        </div>
        {/* 3rd */}
        <div style={{ textAlign: "center" }}>
          <FavorTag num={top[2].num} size={80} accent={tagColors[2]} selected={true} />
          <div style={{ fontFamily: party.body, fontWeight: 700, fontSize: 12, color: party.ink, marginTop: 8 }}>{top[2].brand}</div>
          <div style={{ fontFamily: party.display, fontSize: 26, color: party.ink, lineHeight: 1 }}>{top[2].votes}</div>
        </div>
      </div>

      {/* runners up */}
      <div style={{ position: "absolute", bottom: 14, left: 28, right: 28 }}>
        <div style={{
          background: "rgba(255,255,255,0.6)",
          border: `2.5px solid ${party.ink}`,
          borderRadius: 14,
          padding: "8px 14px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: `0 3px 0 ${party.ink}`,
        }}>
          <div style={{ fontFamily: party.display, fontSize: 14, color: party.purple }}>also tasty:</div>
          {top.slice(3).map((row, i) => (
            <div key={row.num} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: tagColors[i+3],
                border: `2px solid ${party.ink}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: party.display, fontSize: 13, color: party.ink,
              }}>
                {row.num}
              </div>
              <div style={{ fontFamily: party.body, fontWeight: 600, fontSize: 12, color: party.ink }}>
                {row.brand.split(" ")[0]} · <span style={{ color: party.pink }}>{row.votes}</span>
              </div>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontFamily: party.body, fontWeight: 700, fontSize: 12, color: party.ink, opacity: 0.6 }}>
            185 votes · 38 guests · keep tasting! 🥯
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Direction4Meta, PartyLanding, PartyReveal, PartyVote, PartyLeaderboard });
