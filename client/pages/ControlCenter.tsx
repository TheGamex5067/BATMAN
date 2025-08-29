import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { useAuth } from "@/state/auth";
import { useSite } from "@/state/site";
import { HUDPanel } from "@/components/hud/HUDPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export default function ControlCenter() {
  const { session } = useAuth();
  const { settings, toggleFeature, setAnnouncement, setMaintenance, log, clearAudit, audit } = useSite();
  const isAlpha = session?.level === "ALPHA";

  return (
    <ConsoleLayout>
      <div className="space-y-4">
        <HUDPanel title="Control Center">
          {!isAlpha ? (
            <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">
              Insufficient clearance. Alpha only.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <Section title="Global State">
                  <div className="flex items-center gap-3">
                    <Checkbox id="maint" checked={settings.maintenance} onCheckedChange={(v) => setMaintenance(Boolean(v))} />
                    <label htmlFor="maint" className="text-cyan-100 text-sm">Maintenance Mode</label>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">When enabled, non-Alpha users see a maintenance notice.</p>
                </Section>
                <Section title="Announcement Banner">
                  <Textarea
                    value={settings.announcement}
                    onChange={(e) => setAnnouncement(e.target.value)}
                    placeholder="Type announcement text"
                    className="bg-black/40 border-cyan-500/30 text-cyan-100"
                    rows={4}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-200" onClick={() => setAnnouncement("")}>Clear</Button>
                    <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={() => log("announcement.broadcast")}>Broadcast Ping</Button>
                  </div>
                </Section>
              </div>
              <div className="space-y-3">
                <Section title="Feature Access">
                  <ToggleRow id="ft-ops" label="Ops Board" checked={settings.features.ops} onChange={() => toggleFeature("ops")} />
                  <ToggleRow id="ft-vault" label="Data Vault" checked={settings.features.vault} onChange={() => toggleFeature("vault")} />
                  <ToggleRow id="ft-monitor" label="Systems Monitor" checked={settings.features.monitor} onChange={() => toggleFeature("monitor")} />
                  <ToggleRow id="ft-dccu" label="DCCU Hub" checked={settings.features.dccu} onChange={() => toggleFeature("dccu")} />
                </Section>
                <Section title="Audit Controls">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-200" onClick={clearAudit}>Clear Audit Log</Button>
                    <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-200" onClick={() => log("diagnostic.pulse")}>Diagnostic Pulse</Button>
                  </div>
                  <div className="mt-3 max-h-48 overflow-auto rounded border border-cyan-500/20">
                    {audit.slice().reverse().slice(0, 20).map(a => (
                      <div key={a.id} className="grid grid-cols-12 gap-2 text-[11px] px-2 py-1 border-b border-cyan-500/10">
                        <div className="col-span-3 text-cyan-300/90">{new Date(a.ts).toLocaleTimeString()}</div>
                        <div className="col-span-3 text-cyan-200/90">{a.actor}</div>
                        <div className="col-span-3 text-slate-200">{a.action}</div>
                        <div className="col-span-3 text-slate-400 truncate">{a.details}</div>
                      </div>
                    ))}
                    {audit.length === 0 && (
                      <div className="p-3 text-xs text-slate-400">No audit entries.</div>
                    )}
                  </div>
                </Section>
              </div>
            </div>
          )}
        </HUDPanel>
      </div>
    </ConsoleLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-cyan-500/30 p-3">
      <div className="text-[11px] uppercase tracking-wider text-cyan-300/90 border-b border-cyan-500/30 pb-1 mb-2">{title}</div>
      {children}
    </div>
  );
}

function ToggleRow({ id, label, checked, onChange }: { id: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <label htmlFor={id} className="text-sm text-cyan-100">{label}</label>
    </div>
  );
}
