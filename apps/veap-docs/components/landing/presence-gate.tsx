"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";

const STAGE_COPY: Record<string, string> = {
  Preparing: "Preparing",
  Loading: "Loading",
  Building: "Building",
  Warming: "Warming",
  Almost: "Almost",
  Ready: "Ready",
};

/** Frame-rate independent ease (ms time-constant) z oryginalnego AtroUI */
function damp(current: number, target: number, lambda: number, dtMs: number) {
  return current + (target - current) * (1 - Math.exp(-dtMs / lambda));
}

export interface PresenceGateProps {
  durationSeconds?: number;
  isReady?: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export function PresenceGate({
  durationSeconds = 2.2,
  isReady,
  onComplete,
  children,
}: PresenceGateProps) {
  const [open, setOpen] = useState(false);
  const [gateGone, setGateGone] = useState(false);
  const [label, setLabel] = useState("Preparing");
  const [labelKey, setLabelKey] = useState(0);

  const fillRef = useRef<HTMLDivElement>(null);
  const pctRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  const milestoneRef = useRef(0.05);
  const displayRef = useRef(0);
  const openRef = useRef(open);
  const finishingRef = useRef(false);
  const startRef = useRef(0);
  // eslint-disable-next-line react-hooks/refs
  openRef.current = open;

  // Bezpośrednia aktualizacja w DOM (60-120 FPS bez re-renderów Reacta)
  const paintBar = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(100, pct));
    if (fillRef.current) {
      fillRef.current.style.transform = `scaleX(${clamped / 100})`;
    }
    if (pctRef.current) {
      pctRef.current.textContent = `${Math.round(clamped)}%`;
    }
    if (barRef.current) {
      barRef.current.setAttribute("aria-valuenow", String(Math.round(clamped)));
    }
  }, []);

  const finish = useCallback(() => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    milestoneRef.current = 1;
    setLabel("Ready");
    setLabelKey((k) => k + 1);
    window.setTimeout(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.setTimeout(() => setOpen(true), 200);
        });
      });
    }, 300);
  }, []);

  // Obsługa prefers-reduced-motion
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      paintBar(100);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOpen(true);
      setGateGone(true);
      onComplete?.();
    }
  }, [paintBar, onComplete]);

  // Ręczne wywołanie zakończenia jeśli przekazano isReady
  useEffect(() => {
    if (isReady && !finishingRef.current) {
      finish();
    }
  }, [isReady, finish]);

  // Pętla animacji
  useEffect(() => {
    if (gateGone) return;

    startRef.current = performance.now();
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(40, now - last);
      last = now;

      const elapsed = (now - startRef.current) / 1000;
      const progressRatio = Math.min(1, elapsed / durationSeconds);

      // Dynamiczne przełączanie oryginalnych etapów tekstu
      let stage = "Preparing";
      if (progressRatio >= 0.88) stage = "Almost";
      else if (progressRatio >= 0.65) stage = "Warming";
      else if (progressRatio >= 0.4) stage = "Building";
      else if (progressRatio >= 0.15) stage = "Loading";

      setLabel((prev) => {
        const next = STAGE_COPY[stage] ?? stage;
        if (prev === next) return prev;
        setLabelKey((k) => k + 1);
        return next;
      });

      let target = Math.max(milestoneRef.current, progressRatio);

      if (finishingRef.current || openRef.current) {
        target = 1;
      } else {
        target = Math.min(target, 0.95);
      }

      const lambda = finishingRef.current || openRef.current ? 85 : 150;
      const next = damp(displayRef.current, target * 100, lambda, dt);
      displayRef.current = next;
      paintBar(next);

      if (progressRatio >= 1 && !finishingRef.current) {
        finish();
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationSeconds, finish, gateGone, paintBar]);

  useEffect(() => {
    if (!open) return;
    displayRef.current = 100;
    paintBar(100);
    const t = window.setTimeout(() => {
      setGateGone(true);
      onComplete?.();
    }, 1100);
    return () => window.clearTimeout(t);
  }, [open, paintBar, onComplete]);

  return (
    <div
      className={`presence-hero relative min-h-svh  dark:text-white ${open ? "presence-hero--open" : ""}`}
    >
      <div
        className="presence-hero-void pointer-events-none fixed inset-0"
        aria-hidden
      />

      <div
        className={`relative z-10 ${!open ? "presence-hero-stage--sealed" : ""}`}
      >
        {children}
      </div>

      {!gateGone ? (
        <div
          className={`presence-gate fixed inset-0 z-50 flex flex-col items-center justify-center px-5 ${
            open ? "presence-gate--out" : ""
          }`}
          aria-hidden={open}
        >
          <div className="presence-gate-inner flex w-full max-w-xs flex-col items-center gap-9 sm:max-w-sm">
            <div className="presence-gate-brand flex flex-col items-center gap-3 text-center">
              <img src="/logos/logo-dark.svg" alt="" className="h-8 w-8" />
              <span className="font-runde text-primary text-2xl font-bold tracking-tight">
                veap
              </span>
            </div>

            <div
              ref={barRef}
              className="w-full space-y-3.5"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-label={label}
            >
              <div className="presence-gate-track h-1 rounded w-full overflow-hidden bg-secondary dark:bg-white/12">
                <div
                  ref={fillRef}
                  className="presence-gate-fill h-full origin-left bg-accent"
                  style={{ transform: "scaleX(0)" }}
                />
              </div>
              <div className="flex items-center justify-between gap-3 font-mono text-[10px] tracking-[0.16em] text-white/45 uppercase">
                <span
                  key={labelKey}
                  className="presence-gate-label  text-primary dark:text-white/35"
                >
                  {label}
                </span>
                <span
                  ref={pctRef}
                  className="tabular-nums text-primary dark:text-white/35"
                >
                  0%
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
