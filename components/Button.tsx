"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "danger";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className = "", children, disabled, ...rest }: Props) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 font-mono font-bold uppercase tracking-[0.22em] transition-all duration-150 active:scale-[0.99] disabled:cursor-not-allowed";
  const height = "min-h-[60px] px-6 text-[14px]";
  const styles: Record<Variant, string> = {
    primary: disabled
      ? "bg-ink-soft text-paper opacity-55"
      : "bg-ink text-paper hover:bg-[#1a253f]",
    ghost: "bg-transparent text-ink border-[1.5px] border-ink hover:bg-ink/5",
    danger: disabled ? "bg-ink-soft text-paper opacity-55" : "bg-lab-red text-paper hover:opacity-90",
  };
  return (
    <button disabled={disabled} className={`${base} ${height} ${styles[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
