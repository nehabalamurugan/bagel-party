import { CSSProperties, ReactNode } from "react";

type Props = {
  children: ReactNode;
  rotate?: number;
  color?: string;
  className?: string;
  style?: CSSProperties;
};

export function Tape({ children, rotate = -1.5, color, className = "", style = {} }: Props) {
  return (
    <span
      className={`inline-block font-hand text-[18px] text-ink shadow-[0_1px_2px_rgba(14,23,48,0.18)] ${className}`}
      style={{
        background: color || "rgba(255,232,122,0.85)",
        padding: "4px 14px",
        transform: `rotate(${rotate}deg)`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
