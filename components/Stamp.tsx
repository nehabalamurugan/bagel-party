type Props = {
  label: string;
  color?: "red" | "green" | "blue";
  className?: string;
};

const COLORS = {
  red: "#c4302b",
  green: "#5b8a45",
  blue: "#2a5fb3",
};

export function Stamp({ label, color = "red", className = "" }: Props) {
  const c = COLORS[color];
  return (
    <span
      className={`animate-stamp-in inline-block font-mono text-[10px] font-bold tracking-[0.18em] ${className}`}
      style={{
        color: c,
        border: `2px solid ${c}`,
        padding: "3px 8px",
        background: "transparent",
      }}
    >
      {label}
    </span>
  );
}
