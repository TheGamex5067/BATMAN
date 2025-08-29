import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

// 🔐 Hardcoded GitHub API key — for personal use only
const apiKey = "balls";

export default function ChatPanel() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text) return;

   const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // 🧠 Pass the API key to your backend if needed
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({ messages: next })
      });

      if (!res.ok) {
        let msg = "";
        try {
          const j = await res.json();
          msg = j?.error || j?.message || "";
        } catch {
          try {
            msg = await res.text();
          } catch {
            /* ignore */
          }
        }

        if (!msg) msg = "AI not configured. Add an API key in environment variables.";
        if (/insufficient_quota|quota|billing/i.test(msg))
          msg = "OpenAI: insufficient quota/billing. Update plan or use another key.";

        setMessages(m => [...m, { role: "assistant", content: msg }]);
      } else {
        const data = await res.json();
        setMessages(m => [...m, { role: "assistant", content: data.reply }]);
      }
    } catch (e: any) {
      setMessages(m => [...m, { role: "assistant", content: e?.message || "Network error" }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-md border border-cyan-500/30 bg-black/40">
      <div className="px-3 py-2 text-[11px] uppercase tracking-wider text-cyan-300/90 border-b border-cyan-500/30">
        AI Assistant
      </div>
      <div className="p-3 space-y-2 max-h-80 overflow-auto">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "text-cyan-100" : "text-emerald-200"}>
            <span className="text-[10px] opacity-70 mr-2">{m.role === "user" ? "YOU" : "AI"}</span>
            <span className="whitespace-pre-wrap text-sm">{m.content}</span>
          </div>
        ))}
        {messages.length === 0 && (
          <div className="text-xs text-slate-400">
            Ask for outlines, ideas, or rewrites. Requires OpenAI or Anthropic key.
          </div>
        )}
      </div>
      <div className="border-t border-cyan-500/30 p-2 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the AI..."
          className="bg-black/40 border-cyan-500/30 text-cyan-100"
          onKeyDown={(e) => {
            if (e.key === "Enter") send();
          }}
        />
        <Button
          size="sm"
          onClick={send}
          disabled={loading}
          className="bg-cyan-600/80 hover:bg-cyan-600 text-white"
        >
          Send
        </Button>
      </div>
    </div>
  );
}