import type React from "react";
import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { useAuth } from "@/state/auth";
import { Button } from "@/components/ui/button";
import StatusBar, { SideWidgets } from "@/components/hud/StatusBar";
import { HUDPanel } from "@/components/hud/HUDPanel";

function ModuleCard({ title, children, actions }: { title: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <section className="mb-6 rounded-xl border border-cyan-500/30 bg-black/40 p-4 shadow-[0_0_60px_-30px_rgba(34,211,238,0.6)]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-cyan-200 tracking-wide font-semibold">{title}</h2>
        {actions}
      </div>
      <div className="text-sm text-slate-300">{children}</div>
    </section>
  );
}

export default function Dashboard() {
  const { session } = useAuth();
  const level = session?.level ?? "DELTA";
  const isAlpha = level === "ALPHA";
  const isBetaPlus = level === "ALPHA" || level === "BETA";

  return (
    <ConsoleLayout>
      <div className="space-y-6">
        <StatusBar />
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-3">
            <div className="space-y-3">
              <SideWidgets />
            </div>
          </div>
          <div className="col-span-12 lg:col-span-6 relative">
            <HUDPanel className="enter-bottom" title="Mission Hub">
              <Empty text="No missions configured." alphaNote="Alpha may add missions and alerts." />
            </HUDPanel>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <HUDPanel className="enter-left" title="Surveillance Network">
                <Empty text="No feeds, patterns, or models available." alphaNote="Alpha populates feeds and prediction models." />
              </HUDPanel>
              <HUDPanel className="enter-right" title="Character & Case Files">
                <Empty text="Dossiers and case files are empty." alphaNote="Alpha fills dossiers and reports." />
              </HUDPanel>
            </div>
            <div className="mt-3 grid md:grid-cols-2 gap-3">
              <HUDPanel className="enter-left" title="Communications Hub">
                <Empty text="No contacts or messages present." alphaNote="Alpha adds contacts and comm logs." />
              </HUDPanel>
              <HUDPanel className="enter-right" title="Research & Intel">
                <Empty text="No intel sources configured." alphaNote="Alpha aggregates sources and classified feeds." />
              </HUDPanel>
            </div>
          </div>
          <div className="col-span-12 lg:col-span-3 space-y-3">
            <HUDPanel className="enter-right" title="Bat-Operations Control">
              <Empty text="No inventory or deployments listed." alphaNote="Alpha manages gadgets, vehicles, and diagnostics." />
            </HUDPanel>
            <HUDPanel className="enter-right" title="Specialized Batman Features">
              <Empty text="No profiles, protocols, or trainings defined." alphaNote="Alpha creates profiles and contingency protocols." />
            </HUDPanel>
            <HUDPanel className="enter-right" title="Timeline System">
              <Empty text="Timeline is empty." alphaNote="Alpha records events and arcs over time." />
            </HUDPanel>
            <HUDPanel className="enter-right" title="DCCU Creative Hub">
              <Empty text="No movies, suits, characters, or artifacts yet." alphaNote="Alpha curates DCCU databases and notes." />
            </HUDPanel>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  );
}

function Empty({ text, alphaNote }: { text: string; alphaNote: string }) {
  return (
    <div className="rounded border border-slate-600/40 p-4">
      <p className="text-cyan-100/90">{text}</p>
      <p className="text-xs text-slate-400 mt-2">{alphaNote}</p>
    </div>
  );
}

function Actions({ isAlpha, betaPlus }: { isAlpha: boolean; betaPlus?: boolean }) {
  return (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20" disabled={!isAlpha}>
        Add
      </Button>
      <Button size="sm" variant="ghost" className="border border-cyan-500/30 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20" disabled={!isAlpha && !betaPlus}>
        Tools
      </Button>
    </div>
  );
}
