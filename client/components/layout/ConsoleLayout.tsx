import { Link, NavLink } from "react-router-dom";
import { useAuth } from "@/state/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSite } from "@/state/site";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useEffect, useState } from "react";

export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const { session, logout, soundsEnabled, toggleSounds, voiceEnabled, toggleVoice } = useAuth();
  const { settings } = useSite();
  const isAlpha = session?.level === "ALPHA";
  const [enterOnce, setEnterOnce] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    try {
      const f = localStorage.getItem("bat_enter_once");
      if (f === "1") {
        setEnterOnce(true);
        localStorage.removeItem("bat_enter_once");
        const t = setTimeout(() => setEnterOnce(false), 1600);
        return () => clearTimeout(t);
      }
    } catch {}
  }, []);

  function handleLogout() {
    setLoggingOut(true);
    setTimeout(() => { logout(); }, 800);
  }

  return (
    <div className={cn("min-h-screen bg-bat-gradient text-slate-100 relative overflow-hidden", enterOnce && "enter-once")}>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "url('https://cdn.builder.io/api/v1/image/assets%2F6ebefe0ef4f042e08fe13e44c421ca5a%2F738e7f0597a049a197950e894a130e49?format=webp&width=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: loggingOut ? 0 : 0.25,
          transition: "opacity 400ms ease-out"
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 bg-bat-grid"
        style={{ opacity: loggingOut ? 0 : 0.4, transition: "opacity 400ms ease-out" }}
      />
      <header className="relative z-10 border-b border-cyan-500/30 bg-black/40 backdrop-blur-sm">
        <div className="container max-w-[1400px] flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" variant="ghost" className="md:hidden text-cyan-200">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-black/90 border-cyan-500/20 w-72">
                <div className="mt-8 space-y-1">
                  <NavStack isAlpha={isAlpha} />
                </div>
              </SheetContent>
            </Sheet>
            <Link to="/" className="font-extrabold tracking-widest text-cyan-300">
              BATCOMPUTER
            </Link>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="rounded border border-cyan-400/30 px-2 py-1 text-cyan-200/90">
              {session?.codename ?? "LOCKED"}
            </span>
            <span className={cn("rounded border px-2 py-1", session?.level === "ALPHA" ? "border-amber-400/40 text-amber-300" : "border-cyan-400/30 text-cyan-200/80")}>CLR {session?.level ?? "--"}</span>
            <Button size="sm" variant="ghost" onClick={() => toggleSounds()} className={cn(soundsEnabled ? "text-cyan-300" : "text-slate-400")}>{soundsEnabled ? "SND ON" : "SND OFF"}</Button>
            <Button size="sm" variant="ghost" onClick={() => toggleVoice()} className={cn(voiceEnabled ? "text-cyan-300" : "text-slate-400")}>{voiceEnabled ? "AI VOICE" : "MUTE"}</Button>
            <Button size="sm" variant="outline" onClick={handleLogout} className="border-rose-500/50 text-rose-300 hover:bg-rose-500/10">LOG OUT</Button>
          </div>
        </div>
        {(settings.announcement || settings.maintenance) && (
          <div className={cn("border-t py-2", settings.maintenance ? "border-amber-400/30 bg-amber-500/10" : "border-cyan-400/30 bg-cyan-500/5") }>
            <div className="container text-[12px] tracking-wide">
              {settings.maintenance && <span className="mr-3 text-amber-300">MAINTENANCE MODE</span>}
              <span className="text-cyan-100">{settings.announcement}</span>
            </div>
          </div>
        )}
      </header>
      <div className="relative z-10 container max-w-[1400px] grid grid-cols-12 gap-4 md:gap-6 py-4 md:py-6 justify-start items-start">
        <aside className="hidden md:block md:col-span-3 lg:col-span-2">
          <nav className="space-y-1">
            <NavStack isAlpha={isAlpha} />
          </nav>
        </aside>
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
      <div className="pointer-events-none absolute inset-0 hidden md:block" style={{ opacity: loggingOut ? 0 : 1, transition: "opacity 400ms ease-out" }}>
        <div className="absolute inset-0 scanline" />
        <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 0.25 }}>
          <div className="size-[50vmin] rounded-full bg-cyan-400/15 blur-3xl" />
        </div>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.35 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          <rect x="2" y="2" width="96" height="96" fill="none" stroke="rgba(34,211,238,0.35)" strokeWidth="0.6" />
          <rect x="6" y="6" width="88" height="88" fill="none" stroke="rgba(34,211,238,0.25)" strokeWidth="0.3" />
          <g stroke="rgba(34,211,238,0.6)" strokeWidth="0.8">
            <path d="M2 14 h10" />
            <path d="M2 20 h6" />
            <path d="M98 14 h-10" />
            <path d="M98 20 h-6" />
            <path d="M14 2 v10" />
            <path d="M20 2 v6" />
            <path d="M86 2 v10" />
            <path d="M80 2 v6" />
            <path d="M14 98 v-10" />
            <path d="M20 98 v-6" />
            <path d="M86 98 v-10" />
            <path d="M80 98 v-6" />
          </g>
        </svg>
      </div>
      {loggingOut && (
        <div className="fixed inset-0 z-50 grid place-items-center pointer-events-none">
          <div className="absolute inset-0 exit-flash" />
          <div className="relative text-rose-200 text-3xl md:text-5xl font-extrabold tracking-[0.3em] exit-text">SESSION TERMINATED</div>
        </div>
      )}
    </div>
  );
}

function NavStack({ isAlpha }: { isAlpha: boolean }) {
  const { settings } = useSite();
  return (
    <>
      <NavItem to="/" label="Mission Hub" />
      {(isAlpha || settings.features.dccu) && <NavItem to="/dccu" label="DCCU Hub" />}
      {(isAlpha || settings.features.ops) && <NavItem to="/ops" label="Ops Board" />}
      {(isAlpha || settings.features.vault) && <NavItem to="/vault" label="Data Vault" />}
      {(isAlpha || settings.features.monitor) && <NavItem to="/monitor" label="Systems Monitor" />}
      {(isAlpha || settings.features.creator) && <NavItem to="/creator" label="Creator Tools" />}
      <NavItem to="/control" label="Control Center" />
    </>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "block rounded border border-cyan-500/30 px-3 py-2 text-sm hover:bg-cyan-500/10",
        isActive ? "bg-cyan-500/10 text-cyan-200" : "text-slate-300",
      )}
      end
    >
      {label}
    </NavLink>
  );
}
