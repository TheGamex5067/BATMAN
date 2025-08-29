import { useEffect, useMemo, useState } from "react";
import { useAuth, AccessLevel } from "@/state/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, KeyRound } from "lucide-react";

export default function Login() {
  const { login, detectLevel, lockedUntil, failures, speak } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const level = useMemo<AccessLevel | null>(() => detectLevel(password) , [password, detectLevel]);
  const navigate = useNavigate();

  const remaining = useMemo(() => lockedUntil ? Math.max(0, lockedUntil - Date.now()) : 0, [lockedUntil]);

  useEffect(() => {
    if (level) speak(`Detected clearance ${level}`);
  }, [level, speak]);

  const [submitting, setSubmitting] = useState(false);
  const [shake, setShake] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [granted, setGranted] = useState(false);
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login("Operator", password);
      setGranted(true);
      setTimeout(() => navigate("/"), 1000);
    } catch (err: any) {
      if (err?.message === "LOCKED") setError("Failsafe lockdown engaged. Please wait.");
      else setError("Invalid credentials.");
      setShake(true);
      setTimeout(()=> setShake(false), 500);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bat-gradient text-cyan-100 flex items-center justify-center relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-bat-grid opacity-40" />
      <div className="pointer-events-none absolute inset-0 parallax-stars" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 scanline" />
      <div className="absolute inset-0 grid place-items-center opacity-25">
        <img src="https://cdn.builder.io/api/v1/image/assets%2F6ebefe0ef4f042e08fe13e44c421ca5a%2Fdad6bbd855c845deb240aa8df35b2e03?format=webp&width=1200" alt="Bat Emblem" className="w-[62vmin] max-w-[760px]" style={{ filter: "drop-shadow(0 0 28px rgba(34,211,238,0.75))" }} />
        <div className="hud-rings" />
      </div>
      <div className={cn("relative z-10 w-full max-w-md border border-cyan-500/40 bg-black/50 backdrop-blur-md rounded-xl p-6 shadow-[0_0_120px_-30px_rgba(34,211,238,0.8)]", shake && "animate-shake", granted && "card-out pointer-events-none")}>
        <div className="pointer-events-none absolute -inset-1 rounded-xl ring-1 ring-cyan-400/10" />
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold tracking-[0.3em] text-cyan-300">BATCAVE SECURE TERMINAL</h1>
          <p className="text-[11px] text-cyan-200/70 mt-1 tracking-widest">PROTOCOL: OMEGA • MK-II</p>
          <div className="mt-2 flex items-center justify-center gap-2 text-[10px]">
            <span className="badge">VOICE LINK</span>
            <span className="badge">ENCRYPTED</span>
            <span className="badge">BIOSCAN READY</span>
          </div>
        </header>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-cyan-200/70">Access Key</label>
            <div className="relative group mt-1">
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-cyan-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center gap-2 rounded-md border border-cyan-500/40 bg-black/60 px-3 py-2">
                <KeyRound className="h-4 w-4 text-cyan-300/80" />
                <input
                  type={reveal ? "text" : "password"}
                  className="w-full bg-transparent outline-none text-cyan-100 placeholder:text-slate-500 tracking-widest"
                  placeholder="Enter access key"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting || granted}
                />
                <button type="button" onClick={() => setReveal(v=>!v)} className="text-cyan-300/80 hover:text-cyan-200">
                  {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <span key={i} className={"h-1.5 w-3 rounded-sm " + (password.length >= i+1 ? "bg-cyan-400/70" : "bg-cyan-500/20")}></span>
                  ))}
                </div>
                <span className="text-[10px] text-cyan-300/80">{level ? `CLR ${level}` : "AWAITING"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-400">
              <span className="mr-2">Clearance:</span>
              <span className={cn("rounded px-2 py-1 border", level === "ALPHA" ? "border-amber-400/40 text-amber-300" : level ? "border-cyan-400/40 text-cyan-200" : "border-slate-600/40 text-slate-500")}>{level ?? "UNKNOWN"}</span>
            </div>
            <div className="text-cyan-300/80">ENCRYPTION: AES-256</div>
          </div>
          {error && <div className="text-rose-300 text-sm">{error}</div>}
          {remaining > 0 && (
            <div className="text-amber-300 text-xs">Lockdown: {Math.ceil(remaining/1000)}s remaining</div>
          )}
          <Button
            type="submit"
            className="w-full bg-cyan-600/80 hover:bg-cyan-600 text-white border border-cyan-400/40 btn-scan"
            disabled={remaining > 0 || submitting || granted}
          >
            {submitting ? "VERIFYING…" : "ENGAGE"}
          </Button>
          <div className="mt-2 text-[10px] text-cyan-300/70">
            <span className="opacity-70 mr-1">TERMINAL:</span>
            {level ? `Clearance detected: ${level}` : "Awaiting valid key sequence"}
          </div>
        </form>
        <p className="mt-2 text-[10px] text-slate-500 text-center">Failed attempts: {failures}</p>
      </div>
      {granted && (
        <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none">
          <div className="absolute inset-0 access-flash" />
          <div className="relative text-cyan-100 text-3xl md:text-5xl font-extrabold tracking-[0.35em] access-text">ACCESS GRANTED</div>
        </div>
      )}
    </div>
  );
}
