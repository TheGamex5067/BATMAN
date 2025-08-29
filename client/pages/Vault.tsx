import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { HUDPanel } from "@/components/hud/HUDPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/state/auth";
import { useVault, VaultItem, VaultType } from "@/state/vault";
import { useMemo, useState } from "react";

function Tag({ t }: { t: string }) {
  return <span className="text-[10px] px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-200">{t}</span>;
}

export default function Vault() {
  const { session } = useAuth();
  const isAlpha = session?.level === "ALPHA";
  const { items, add, update, remove } = useVault();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<VaultType>("link");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [tags, setTags] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [editing, setEditing] = useState<string | null>(null);
  const item = useMemo(() => items.find(i => i.id === editing) || null, [editing, items]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return items.filter(i => {
      const hay = `${i.title} ${i.url ?? ""} ${i.tags.join(" ")}`.toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  async function handleAdd() {
    if (!isAlpha) return;
    if (!title.trim()) return;
    if (type === "link") {
      add({ type, title: title.trim(), url: url.trim(), tags: tags.split(",").map(s => s.trim()).filter(Boolean) });
      setTitle(""); setUrl(""); setTags("");
    } else if (file) {
      const base64 = await toBase64(file);
      add({ type, title: title.trim(), data: base64, mime: file.type, tags: tags.split(",").map(s => s.trim()).filter(Boolean) });
      setTitle(""); setTags(""); setFile(null);
    }
  }

  return (
    <ConsoleLayout>
      <div className="space-y-4">
        <HUDPanel title="Data Vault">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Input placeholder="Search" value={query} onChange={(e) => setQuery(e.target.value)} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
          </div>
          {isAlpha && (
            <div className="rounded-md border border-cyan-500/30 p-3 mb-3">
              <div className="text-[11px] uppercase tracking-wider text-cyan-300/90 border-b border-cyan-500/30 pb-1 mb-2">Add Item</div>
              <div className="grid md:grid-cols-2 gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300">Type</label>
                  <select value={type} onChange={(e) => setType(e.target.value as VaultType)} className="bg-black/40 border border-cyan-500/30 rounded px-2 py-1 text-cyan-100">
                    <option value="link">Link</option>
                    <option value="file">File</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-slate-300">Tags</label>
                  <Input placeholder="comma,separated,tags" value={tags} onChange={(e) => setTags(e.target.value)} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                </div>
                <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                {type === "link" ? (
                  <Input placeholder="https://..." value={url} onChange={(e) => setUrl(e.target.value)} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                ) : (
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} className="text-xs text-slate-300" />
                )}
              </div>
              <div className="mt-2">
                <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={handleAdd}>Add</Button>
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(i => (
              <div key={i.id} className="rounded-md border border-cyan-500/30 bg-black/40 p-3">
                <div className="flex items-center justify-between">
                  <div className="text-cyan-100 font-medium">{i.title}</div>
                  <div className="flex gap-1">
                    {isAlpha && <Button size="sm" variant="ghost" className="border border-cyan-500/30 text-cyan-200" onClick={() => setEditing(i.id)}>Edit</Button>}
                    {isAlpha && <Button size="sm" variant="destructive" className="text-rose-200" onClick={() => { if (confirm("Delete item?")) remove(i.id); }}>Delete</Button>}
                    {i.type === "link" && i.url && <a className="text-xs text-cyan-300 underline" href={i.url} target="_blank" rel="noreferrer">Open</a>}
                  </div>
                </div>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {i.tags.map(t => <Tag key={t} t={t} />)}
                </div>
                {i.type === "file" && i.data && (
                  <div className="mt-2 rounded border border-cyan-500/20 p-2 bg-black/30">
                    {i.mime?.startsWith("image/") ? (
                      <img src={i.data} alt={i.title} className="max-h-40 object-contain mx-auto" />
                    ) : (
                      <div className="text-xs text-slate-300">File stored ({i.mime || "unknown"}).</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {item && (
            <div className="mt-3 rounded-md border border-cyan-500/30 p-3">
              <div className="text-[11px] uppercase tracking-wider text-cyan-300/90 border-b border-cyan-500/30 pb-1 mb-2">Edit Item</div>
              <div className="grid md:grid-cols-2 gap-2">
                <Input value={item.title} onChange={(e) => update({ ...item, title: e.target.value })} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                <Input value={item.tags.join(", ")} onChange={(e) => update({ ...item, tags: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                {item.type === "link" && (
                  <Input value={item.url || ""} onChange={(e) => update({ ...item, url: e.target.value })} className="bg-black/40 border-cyan-500/30 text-cyan-100" />
                )}
              </div>
              <div className="mt-2 flex gap-2">
                <Button size="sm" className="bg-cyan-600/80 hover:bg-cyan-600 text-white" onClick={() => setEditing(null)}>Close</Button>
                <Button size="sm" variant="destructive" className="text-rose-200" onClick={() => { if (confirm("Delete item?")) { remove(item.id); setEditing(null); } }}>Delete</Button>
              </div>
            </div>
          )}
        </HUDPanel>
      </div>
    </ConsoleLayout>
  );
}

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
