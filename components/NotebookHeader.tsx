import { ReactNode } from "react";

type Props = {
  pageId: string;
  right?: ReactNode;
};

export function NotebookHeader({ pageId: _pageId, right }: Props) {
  // The "NOTEBOOK_07 / PG.0xx" strip was removed. Status pills (the `right`
  // slot, e.g. "TASTING_PANEL · 1/2") still render so guests/admins can see
  // progress. When there's nothing on the right, render nothing at all.
  if (!right) return null;
  return (
    <div className="px-7 pt-4">
      <div className="flex items-center justify-end font-mono text-[10px] tracking-[0.16em] text-ink-soft">
        {right}
      </div>
      <div className="mt-1 h-px bg-ink/50" />
    </div>
  );
}

export function FigLabel({ children, color = "red" }: { children: ReactNode; color?: "red" | "ink" }) {
  return (
    <div
      className={`font-mono text-[11px] tracking-[0.22em] ${
        color === "red" ? "text-lab-red" : "text-ink-soft"
      }`}
    >
      {children}
    </div>
  );
}

export function BindingHoles() {
  return (
    <div className="pointer-events-none absolute bottom-6 left-2 top-12 flex w-4 flex-col justify-around">
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 w-2.5 rounded-full border-[1.5px] border-ink-soft bg-paper shadow-[inset_1px_1px_2px_rgba(14,23,48,0.18)]"
        />
      ))}
    </div>
  );
}
