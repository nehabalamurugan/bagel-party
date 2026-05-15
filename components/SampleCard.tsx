"use client";

import { CSSProperties } from "react";
import { fmtId } from "@/lib/format";

type Props = {
  num: number;
  size?: number;
  selected?: boolean;
  rank?: number | null;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
};

export function SampleCard({
  num,
  size = 100,
  selected = false,
  rank,
  onClick,
  disabled = false,
  className = "",
  style = {},
}: Props) {
  const interactive = !!onClick && !disabled;
  return (
    <div
      onClick={interactive ? onClick : undefined}
      className={`relative select-none transition-transform duration-100 ${
        interactive ? "cursor-pointer active:scale-[0.98]" : ""
      } ${disabled && !selected ? "opacity-50" : ""} ${className}`}
      style={{
        width: size,
        height: size,
        background: selected ? "#ffe87a" : "rgba(253,252,247,0.92)",
        border: `1.5px ${selected ? "solid" : "dashed"} ${selected ? "#0e1730" : "#3a4866"}`,
        borderRadius: 4,
        padding: 8,
        boxShadow: selected
          ? "2px 2px 0 #0e1730"
          : "1px 1px 0 rgba(14,23,48,0.12)",
        transform: selected ? "translate(-1px,-1px)" : "none",
        ...style,
      }}
    >
      <div className="flex items-center justify-between">
        <div className="font-mono text-[8px] tracking-[0.1em] text-ink-soft">SMP-ID</div>
        {rank != null && (
          <div
            key={`rank-${rank}`}
            className="animate-stamp-in font-hand leading-none text-lab-red"
            style={{ fontSize: 22 }}
          >
            #{rank}
          </div>
        )}
      </div>
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center">
        <div
          className="font-mono font-bold leading-none text-ink"
          style={{ fontSize: size * 0.36, letterSpacing: "-0.02em" }}
        >
          {fmtId(num)}
        </div>
      </div>
      <div className="absolute bottom-2 left-2 right-2 flex justify-between font-mono text-[8px] tracking-[0.06em] text-ink-soft">
        <span>n=1</span>
        {selected ? <span className="text-lab-red">✓</span> : <span>·</span>}
      </div>
    </div>
  );
}
