import type React from "react";
import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/state/auth";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { Module } from "@/shared/supabase";
import { useState } from "react";
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
  const { data: modules, loading, insertData, canModify } = useSupabaseData<Module>('modules');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newModule, setNewModule] = useState({
    name: '',
    description: '',
    clearance_level: 'DELTA' as const
  });

  const handleAddModule = async () => {
    if (!newModule.name.trim()) return;

    try {
      await insertData(newModule);
      setNewModule({ name: '', description: '', clearance_level: 'DELTA' });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add module:', error);
    }
  };

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
              {canModify && (
                <div className="mb-4 flex justify-end">
                  <Button 
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  >
                    {showAddForm ? 'Cancel' : 'Add Module'}
                  </Button>
                </div>
              )}

              {showAddForm && (
                <div className="mb-6 p-4 border border-cyan-500/30 bg-slate-900/50 rounded">
                  <h3 className="text-cyan-300 font-mono text-sm mb-3">New Module</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Module name"
                      value={newModule.name}
                      onChange={(e) => setNewModule(prev => ({ ...prev, name: e.target.value }))}
                      className="bg-slate-800/50 border-cyan-500/30 text-cyan-100"
                    />
                    <Textarea
                      placeholder="Description"
                      value={newModule.description}
                      onChange={(e) => setNewModule(prev => ({ ...prev, description: e.target.value }))}
                      className="bg-slate-800/50 border-cyan-500/30 text-cyan-100"
                    />
                    <Select 
                      value={newModule.clearance_level} 
                      onValueChange={(value: any) => setNewModule(prev => ({ ...prev, clearance_level: value }))}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-cyan-500/30 text-cyan-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DELTA">DELTA</SelectItem>
                        <SelectItem value="GAMMA">GAMMA</SelectItem>
                        <SelectItem value="BETA">BETA</SelectItem>
                        <SelectItem value="ALPHA">ALPHA</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={handleAddModule}
                    className="mt-3 bg-green-500/20 text-green-300 border border-green-500/30"
                  >
                    Add Module
                  </Button>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-2 text-center text-slate-400 py-8">Loading modules...</div>
                ) : modules.length === 0 ? (
                  <div className="col-span-2 text-center text-slate-400 py-8">No modules available for your clearance level.</div>
                ) : (
                  modules.map((mod) => (
                    <div key={mod.id} className="p-4 border border-cyan-500/30 bg-slate-900/50 rounded">
                      <h3 className="text-cyan-300 font-mono text-sm mb-2">{mod.name}</h3>
                      <p className="text-xs text-slate-300 mb-2">{mod.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400">CLEARANCE: {mod.clearance_level}</span>
                        <span className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-300">
                          ACTIVE
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
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