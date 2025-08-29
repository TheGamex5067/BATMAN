import React, { useRef } from "react";
import { cn } from "@/lib/utils";

export function HUDPanel({ title, children, className }: { title?: string; children?: React.ReactNode; className?: string }) {
  const delayRef = useRef<number>(0);
  if (delayRef.current === 0) delayRef.current = Math.floor(80 + Math.random() * 220);
  return (
    <div
      className={cn(
        "relative rounded-lg border border-cyan-500/40 bg-black/40 text-cyan-100 shadow-[0_0_60px_-30px_rgba(34,211,238,0.6)] hud-enter",
        className
      )}
      style={{ ["--d" as any]: `${delayRef.current}ms` } as React.CSSProperties}
    >
      {title && (
        <div className="px-3 py-2 text-[11px] tracking-widest text-cyan-300/90 border-b border-cyan-500/30 uppercase">
          {title}
        </div>
      )}
      <div className="p-3 text-xs">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-cyan-400/10" />
    </div>
  );
}

export function Gauge({ value = 60, label = "CPU" }: { value?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, value));
  const deg = (pct / 100) * 360;
  return (
    <div className="flex items-center gap-3">
      <div className="relative size-14">
        <svg viewBox="0 0 36 36" className="absolute inset-0">
          <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="rgba(34,211,238,0.15)" strokeWidth="2" />
          <path d="M18 2 a 16 16 0 1 1 0 32 a 16 16 0 1 1 0 -32" fill="none" stroke="rgba(34,211,238,0.9)" strokeWidth="2" strokeDasharray={`${deg} 360`} />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-[10px] text-cyan-300">{pct}%</div>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-cyan-300">{label}</div>
    </div>
  );
}
