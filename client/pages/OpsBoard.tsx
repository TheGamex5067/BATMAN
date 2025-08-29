import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { HUDPanel } from "@/components/hud/HUDPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/state/auth";
import { OpsPriority, OpsStatus, useOps } from "@/state/ops";
import { useState, useMemo } from "react";

function Column({ title, status, children }: { title: string; status: OpsStatus; children: React.ReactNode }) {
  return (
    <div className="rounded border border-cyan-500/30">
      <div className="px-3 py-1 text-[11px] tracking-wider uppercase border-b border-cyan-500/30 text-cyan-300/90">{title}</div>
      <div className="p-2 space-y-2 min-h-[120px]">{children}</div>
    </div>
  );
}

export default function OpsBoard() {
  const { session } = useAuth();
  const { tasks, add, update, remove, move } = useOps();
  const isAlpha = session?.level === "ALPHA";
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", detail: "", priority: "medium" as OpsPriority, status: "backlog" as OpsStatus });
  const [editing, setEditing] = useState<string | null>(null);
  const task = useMemo(() => tasks.find(t => t.id === editing) || null, [editing, tasks]);

  const sections: { key: OpsStatus; title: string }[] = [
    { key: "backlog", title: "Backlog" },
    { key: "active", title: "Active" },
    { key: "blocked", title: "Blocked" },
    { key: "done", title: "Done" },
  ];

  return (
    <ConsoleLayout>
      <div className="space-y-4">
        <HUDPanel title="Ops Board">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-slate-300">Track tasks and operations.</div>
            {isAlpha && (
              <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={() => setOpen(true)}>+ New Task</Button>
            )}
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {sections.map(s => (
              <Column key={s.key} title={s.title} status={s.key}>
                {tasks.filter(t => t.status === s.key).map(t => (
                  <div key={t.id} className="rounded-md border border-cyan-500/30 bg-black/40 p-2">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-cyan-100 text-sm">{t.title}</div>
                      <span className={
                        t.priority === "high" ? "text-rose-300 text-[10px]" : t.priority === "medium" ? "text-amber-300 text-[10px]" : "text-emerald-300 text-[10px]"
                      }>{t.priority.toUpperCase()}</span>
                    </div>
                    {t.detail && <div className="mt-1 text-[12px] text-slate-300 whitespace-pre-wrap">{t.detail}</div>}
                    <div className="mt-2 flex items-center gap-2">
                      {isAlpha && (
                        <>
                          <Button size="sm" variant="ghost" className="border border-cyan-500/30 text-cyan-200" onClick={() => setEditing(t.id)}>Edit</Button>
                          <Button size="sm" variant="destructive" className="text-rose-200" onClick={() => { if (confirm("Delete task?")) remove(t.id); }}>Delete</Button>
                        </>
                      )}
                      {(["backlog","active","blocked","done"] as OpsStatus[]).filter(x => x !== t.status).map(st => (
                        <Button key={st} size="sm" variant="outline" className="border-cyan-500/30 text-cyan-200" onClick={() => move(t.id, st)}>{st}</Button>
                      ))}
                    </div>
                  </div>
                ))}
              </Column>
            ))}
          </div>
        </HUDPanel>

        {open && (
          <div className="rounded-lg border border-cyan-500/40 bg-black/60 p-4">
            <div className="text-sm text-cyan-200 mb-2">New Task</div>
            <div className="grid gap-2">
              <Input placeholder="Title" value={draft.title} onChange={(e) => setDraft(d => ({ ...d, title: e.target.value }))} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
              <Textarea placeholder="Details" rows={4} value={draft.detail} onChange={(e) => setDraft(d => ({ ...d, detail: e.target.value }))} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
              <div className="flex items-center gap-3 text-xs">
                <label className="text-slate-300">Priority</label>
                <select value={draft.priority} onChange={(e) => setDraft(d => ({ ...d, priority: e.target.value as OpsPriority }))} className="bg-black/40 border border-cyan-500/30 rounded px-2 py-1 text-cyan-100">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <label className="text-slate-300 ml-4">Status</label>
                <select value={draft.status} onChange={(e) => setDraft(d => ({ ...d, status: e.target.value as OpsStatus }))} className="bg-black/40 border border-cyan-500/30 rounded px-2 py-1 text-cyan-100">
                  <option value="backlog">Backlog</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={() => { if (!draft.title.trim()) return; add({ title: draft.title.trim(), detail: draft.detail, priority: draft.priority, status: draft.status }); setOpen(false); setDraft({ title: "", detail: "", priority: "medium", status: "backlog" }); }}>Create</Button>
                <Button size="sm" variant="outline" className="border-cyan-500/40 text-cyan-200" onClick={() => setOpen(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        )}

        {task && (
          <div className="rounded-lg border border-cyan-500/40 bg-black/60 p-4">
            <div className="text-sm text-cyan-200 mb-2">Edit Task</div>
            <div className="grid gap-2">
              <Input value={task.title} onChange={(e) => update({ ...task, title: e.target.value })} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
              <Textarea rows={4} value={task.detail} onChange={(e) => update({ ...task, detail: e.target.value })} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
              <div className="flex items-center gap-3 text-xs">
                <label className="text-slate-300">Priority</label>
                <select value={task.priority} onChange={(e) => update({ ...task, priority: e.target.value as OpsPriority })} className="bg-black/40 border border-cyan-500/30 rounded px-2 py-1 text-cyan-100">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <label className="text-slate-300 ml-4">Status</label>
                <select value={task.status} onChange={(e) => update({ ...task, status: e.target.value as OpsStatus })} className="bg-black/40 border border-cyan-500/30 rounded px-2 py-1 text-cyan-100">
                  <option value="backlog">Backlog</option>
                  <option value="active">Active</option>
                  <option value="blocked">Blocked</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="flex gap-2">
                <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={() => setEditing(null)}>Close</Button>
                <Button size="sm" variant="destructive" className="text-rose-200" onClick={() => { if (confirm("Delete task?")) { remove(task.id); setEditing(null); } }}>Delete</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ConsoleLayout>
  );
}
