// Shared bits: phone frame, status bar, interactive state hook.
// All directions share the same data so they feel like the SAME app
// in different skins.

const FLIGHT = [7, 14, 22, 31, 44, 58];

// Faux live leaderboard data (for screen 4)
const LEADERBOARD = [
  { num: 31, votes: 42, brand: "Tompkins Sq. Bakery" },
  { num: 22, votes: 38, brand: "Bagel Pub" },
  { num: 7,  votes: 31, brand: "Murray's Cheese" },
  { num: 44, votes: 24, brand: "Trader Joe's Whipped" },
  { num: 58, votes: 19, brand: "Philadelphia Original" },
  { num: 14, votes: 12, brand: "Russ &amp; Daughters" },
  { num: 3,  votes: 11, brand: "Whole Foods 365" },
  { num: 19, votes: 8,  brand: "Aldi Friendly Farms" },
];

function StatusBar({ color = "#111" }) {
  return (
    <div className="statusbar" style={{ color }}>
      <div className="time">9:41</div>
      <div className="right">
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <rect x="0" y="6" width="2" height="4" rx="0.5" fill="currentColor"/>
          <rect x="4" y="4" width="2" height="6" rx="0.5" fill="currentColor"/>
          <rect x="8" y="2" width="2" height="8" rx="0.5" fill="currentColor"/>
          <rect x="12" y="0" width="2" height="10" rx="0.5" fill="currentColor"/>
        </svg>
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
          <path d="M7 9 L1.5 3.5 Q7 -1 12.5 3.5 Z" fill="none" stroke="currentColor" strokeWidth="1"/>
          <circle cx="7" cy="8" r="1" fill="currentColor"/>
        </svg>
        <div className="battery" />
      </div>
    </div>
  );
}

function Phone({ children, bg = "#fff", color = "#111", notch = true }) {
  return (
    <div className="phone">
      <div className="phone-screen" style={{ background: bg }}>
        {notch && <div className="phone-notch" />}
        <StatusBar color={color} />
        <div style={{ position: "absolute", inset: 0, paddingTop: 38 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { FLIGHT, LEADERBOARD, StatusBar, Phone });
