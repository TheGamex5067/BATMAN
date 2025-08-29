import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { HUDPanel } from "@/components/hud/HUDPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/state/auth";
import { useCreator } from "@/state/creator";
import ChatPanel from "@/components/ai/ChatPanel";
import { useMemo, useState } from "react";

function Toolbar({ onWrap, onInsert }: { onWrap: (left: string, right?: string) => void; onInsert: (text: string) => void }) {
  const btn = "border border-cyan-500/30 text-cyan-200 px-2 py-1 rounded text-xs hover:bg-cyan-500/10";
  return (
    <div className="flex flex-wrap gap-2">
      <button className={btn} onClick={() => onWrap("**", "**")}>Bold</button>
      <button className={btn} onClick={() => onWrap("*", "*")}>Italic</button>
      <button className={btn} onClick={() => onInsert("\n\n# Heading\n")} >H1</button>
      <button className={btn} onClick={() => onInsert("\n\n## Heading\n")} >H2</button>
      <button className={btn} onClick={() => onInsert("\n\n- ")} >List</button>
      <button className={btn} onClick={() => onInsert("\n\n> ")} >Quote</button>
    </div>
  );
}

function mdToHtml(md: string) {
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/\n/g, '<br />');
  html = html.replace(/(<li>.*<\/li>)/gims, '<ul>$1</ul>');
  return html;
}

export default function Creator() {
  const { session } = useAuth();
  const { docs, add, update, remove } = useCreator();
  const isAlpha = session?.level === "ALPHA";
  const [active, setActive] = useState<string>(() => docs[0]?.id || "");
  const doc = useMemo(() => docs.find(d => d.id === active) || null, [active, docs]);

  if (!isAlpha) return (
    <ConsoleLayout>
      <div className="space-y-4">
        <HUDPanel title="Creator Tools">
          <div className="rounded border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">Insufficient clearance. Alpha only.</div>
        </HUDPanel>
      </div>
    </ConsoleLayout>
  );

  return (
    <ConsoleLayout>
      <div className="space-y-4">
        <HUDPanel title="Creator Tools">
          <div className="grid md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-2">
              <div className="flex gap-2">
                <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={() => { const d = add("Untitled"); setActive(d.id); }}>New Doc</Button>
              </div>
              <div className="max-h-80 overflow-auto space-y-2">
                {docs.map(d => (
                  <button key={d.id} className={`w-full text-left px-2 py-1 rounded border ${d.id===active?"border-cyan-500/60 bg-cyan-500/10 text-cyan-100":"border-cyan-500/20 text-slate-300"}`} onClick={() => setActive(d.id)}>
                    <div className="text-sm">{d.title}</div>
                    <div className="text-[10px] text-slate-400">{new Date(d.updatedAt).toLocaleString()}</div>
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-6 space-y-2">
              <div className="flex items-center gap-2">
                <Input value={doc?.title || ""} onChange={(e)=> doc && update({ ...doc, title: e.target.value })} placeholder="Title" className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                {doc && <Button size="sm" variant="destructive" className="text-rose-200" onClick={()=> { if(confirm("Delete doc?")) { remove(doc.id); setActive(""); } }}>Delete</Button>}
              </div>
              <Toolbar onWrap={(l,r="")=>{
                const ta = document.getElementById("md-editor") as HTMLTextAreaElement | null; if(!ta) return; const { selectionStart:s, selectionEnd:e } = ta; const val = ta.value; const before = val.slice(0,s); const selected = val.slice(s,e); const after = val.slice(e); const next = `${before}${l}${selected}${r}${after}`; if(doc) update({ ...doc, content: next }); setTimeout(()=>{ ta.focus(); ta.selectionStart = s + l.length; ta.selectionEnd = e + l.length; },0);
              }} onInsert={(t)=>{ if(doc) update({ ...doc, content: (doc.content||"") + t }); }} />
              <Textarea id="md-editor" rows={18} value={doc?.content || ""} onChange={(e)=> doc && update({ ...doc, content: e.target.value })} className="bg-black/40 border-cyan-500/30 text-cyan-100 font-mono" />
            </div>
            <div className="md:col-span-3 space-y-2">
              <div className="rounded-md border border-cyan-500/30 bg-black/40">
                <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-cyan-300/90 border-b border-cyan-500/30">Preview</div>
                <div className="p-3 text-sm prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: mdToHtml(doc?.content || "") }} />
              </div>
              <ChatPanel />
            </div>
          </div>
        </HUDPanel>
      </div>
    </ConsoleLayout>
  );
}
