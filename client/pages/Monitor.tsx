import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { HUDPanel, Gauge } from "@/components/hud/HUDPanel";
import { useAuth } from "@/state/auth";
import { useSite } from "@/state/site";
import { useEffect, useMemo, useRef, useState } from "react";

function bytesUsedLocalStorage(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)!;
    const v = localStorage.getItem(k) || "";
    total += k.length + v.length;
  }
  return total;
}

function percent(n: number, d: number) { return d ? Math.round((n / d) * 100) : 0; }

export default function Monitor() {
  const { session } = useAuth();
  const { audit } = useSite();
  const [tick, setTick] = useState(0);
  const start = useRef(Date.now());
  const [ls, setLs] = useState(() => bytesUsedLocalStorage());
  const maxLS = 5_000_000; // approx 5MB

  useEffect(() => {
    const id = setInterval(() => { setTick(t => t + 1); setLs(bytesUsedLocalStorage()); }, 1000);
    return () => clearInterval(id);
  }, []);

  const uptime = useMemo(() => {
    const ms = Date.now() - start.current;
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  }, [tick]);

  const online = navigator.onLine;
  const conn: any = (navigator as any).connection || {};

  return (
    <ConsoleLayout>
      <div className="space-y-4">
        <HUDPanel title="Systems Monitor">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded border border-cyan-500/30 p-3">
              <div className="text-[11px] uppercase tracking-wider text-cyan-300/90">Session</div>
              <div className="mt-2 text-sm text-cyan-100">{session?.codename}</div>
              <div className="text-xs text-slate-300">Level: {session?.level}</div>
              <div className="text-xs text-slate-300">Uptime: {uptime}</div>
            </div>
            <div className="rounded border border-cyan-500/30 p-3">
              <div className="text-[11px] uppercase tracking-wider text-cyan-300/90">Storage</div>
              <div className="mt-2 flex items-center gap-4">
                <Gauge value={percent(ls, maxLS)} label="LocalStorage" />
                <div className="text-xs text-slate-300">{(ls/1024).toFixed(1)} KB / {(maxLS/1024/1024).toFixed(1)} MB</div>
              </div>
            </div>
            <div className="rounded border border-cyan-500/30 p-3">
              <div className="text-[11px] uppercase tracking-wider text-cyan-300/90">Network</div>
              <div className="mt-2 text-sm text-cyan-100">{online ? "Online" : "Offline"}</div>
              {conn && (
                <div className="text-xs text-slate-300 mt-1">{conn.effectiveType ? `Type: ${conn.effectiveType}` : ""} {conn.downlink ? `Downlink: ${conn.downlink}Mb/s` : ""}</div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded border border-cyan-500/30">
            <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-cyan-300/90 border-b border-cyan-500/30">Audit Log</div>
            <div className="max-h-64 overflow-auto text-[12px]">
              {audit.slice().reverse().map(a => (
                <div key={a.id} className="grid grid-cols-12 gap-2 px-3 py-1 border-b border-cyan-500/10">
                  <div className="col-span-3 text-cyan-300/90">{new Date(a.ts).toLocaleString()}</div>
                  <div className="col-span-3 text-cyan-200/90">{a.actor}</div>
                  <div className="col-span-3 text-slate-200">{a.action}</div>
                  <div className="col-span-3 text-slate-400 truncate">{a.details}</div>
                </div>
              ))}
              {audit.length === 0 && <div className="p-3 text-slate-400">No audit entries.</div>}
            </div>
          </div>
        </HUDPanel>
      </div>
    </ConsoleLayout>
  );
}
