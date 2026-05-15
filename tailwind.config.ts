import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#fdfcf7",
        "paper-cool": "#f5f7fa",
        ink: "#0e1730",
        "ink-soft": "#3a4866",
        "ink-dim": "rgba(14,23,48,0.55)",
        grid: "rgba(70,110,160,0.18)",
        "grid-minor": "rgba(70,110,160,0.08)",
        lab: {
          red: "#c4302b",
          yellow: "#ffe87a",
          green: "#5b8a45",
          blue: "#2a5fb3",
        },
        card: "rgba(253,252,247,0.92)",
        tape: "rgba(255,232,122,0.85)",
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', "ui-monospace", '"SF Mono"', "monospace"],
        hand: ['"Caveat"', '"Marker Felt"', "cursive"],
        body: ['"Newsreader"', "Georgia", "serif"],
      },
      letterSpacing: {
        wider2: "0.16em",
        widest2: "0.22em",
      },
      animation: {
        "fade-up": "fadeUp 0.35s cubic-bezier(.2,.7,.3,1) both",
        "stamp-in": "stampIn 0.5s cubic-bezier(.5,1.6,.4,1) both",
        "bar-grow": "barGrow 1.2s cubic-bezier(.2,.7,.3,1) both",
        "row-tick": "tickPulse 1.4s ease-out",
        shake: "shake 0.35s ease-in-out",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        stampIn: {
          "0%": { opacity: "0", transform: "scale(2) rotate(0deg)" },
          "60%": { opacity: "1", transform: "scale(0.92) rotate(6deg)" },
          "100%": { opacity: "0.92", transform: "scale(1) rotate(6deg)" },
        },
        barGrow: {
          "0%": { width: "0%" },
        },
        tickPulse: {
          "0%": { backgroundColor: "rgba(196,48,43,0)" },
          "20%": { backgroundColor: "rgba(196,48,43,0.18)" },
          "100%": { backgroundColor: "rgba(196,48,43,0)" },
        },
        shake: {
          "0%,100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
