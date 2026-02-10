"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SplitPaneProps = {
  storageKey?: string;           // persist divider position
  minLeftPct?: number;           // default 25
  minRightPct?: number;          // default 25
  initialLeftPct?: number;       // default 50
  left: React.ReactNode;
  right: React.ReactNode;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function SplitPane({
  storageKey = "spv.splitpane.v1",
  minLeftPct = 25,
  minRightPct = 25,
  initialLeftPct = 50,
  left,
  right,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const saved = useMemo(() => {
    if (typeof window === "undefined") return null;
    const v = window.localStorage.getItem(storageKey);
    const n = v ? Number(v) : NaN;
    return Number.isFinite(n) ? n : null;
  }, [storageKey]);

  const [leftPct, setLeftPct] = useState<number>(saved ?? initialLeftPct);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, String(leftPct));
  }, [leftPct, storageKey]);

  function onPointerDown(e: React.PointerEvent) {
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const el = containerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = (x / rect.width) * 100;

    const maxLeft = 100 - minRightPct;
    const next = clamp(pct, minLeftPct, maxLeft);
    setLeftPct(next);
  }

  function onPointerUp() {
    setDragging(false);
  }

  // Use CSS grid so both panes scroll independently.
  const template = `${leftPct}% 10px ${100 - leftPct}%`;

  return (
    <div
      ref={containerRef}
      className="h-full w-full grid"
      style={{ gridTemplateColumns: template }}
    >
      <div className="h-full overflow-auto border-r bg-background">
        {left}
      </div>

      {/* Divider */}
      <div
        role="separator"
        aria-orientation="vertical"
        className={[
          "h-full cursor-col-resize select-none",
          "bg-border hover:bg-muted transition",
          dragging ? "bg-muted" : "",
        ].join(" ")}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        {/* tiny handle */}
        <div className="h-full flex items-center justify-center">
          <div className="h-10 w-1 rounded-full bg-muted-foreground/30" />
        </div>
      </div>

      <div className="h-full overflow-auto bg-background">
        {right}
      </div>
    </div>
  );
}
