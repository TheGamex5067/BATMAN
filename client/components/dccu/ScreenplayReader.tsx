import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Movie } from "@/state/dccu";
import { X, ZoomIn, ZoomOut, Printer } from "lucide-react";
import { useState } from "react";

export default function ScreenplayReader({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const [scale, setScale] = useState(1);
  const inc = () => setScale(s => Math.min(1.6, s + 0.1));
  const dec = () => setScale(s => Math.max(0.8, s - 0.1));

  const content = movie.screenplay || movie.summary || movie.synopsis || 'No content available.';

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col">
      <div className="flex items-center justify-between border-b border-cyan-500/40 bg-black/50 px-4 py-3">
        <div className="text-cyan-200 font-semibold tracking-widest uppercase">{movie.title}</div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" className="text-cyan-200" onClick={dec}><ZoomOut className="w-4 h-4"/></Button>
          <Button size="sm" variant="ghost" className="text-cyan-200" onClick={inc}><ZoomIn className="w-4 h-4"/></Button>
          <Button size="sm" variant="ghost" className="text-cyan-200" onClick={()=>window.print()}><Printer className="w-4 h-4"/></Button>
          <Button size="sm" variant="outline" className="border-rose-500/50 text-rose-300" onClick={onClose}><X className="w-4 h-4"/></Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <div className="mx-auto px-6" style={{ maxWidth: "72ch", transform: `scale(${scale})`, transformOrigin: "top center" }}>
          <article className="screenplay whitespace-pre-wrap text-cyan-100">
            {content}
          </article>
        </div>
      </div>
    </div>
  );
}
