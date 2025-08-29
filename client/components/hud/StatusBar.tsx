import { Gauge, HUDPanel } from "./HUDPanel";

export default function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const date = now.toLocaleDateString();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <HUDPanel className="enter-bottom">
        <div className="flex items-center gap-4">
          <Gauge value={36} label="RAM" />
          <Gauge value={60} label="CPU" />
          <Gauge value={97} label="SYS" />
        </div>
      </HUDPanel>
      <HUDPanel className="enter-bottom">
        <div className="text-center text-cyan-200 text-sm tracking-widest">{time}</div>
        <div className="text-center text-[11px] text-cyan-300/70">{date}</div>
      </HUDPanel>
      <HUDPanel className="enter-bottom">
        <div className="flex items-center justify-between text-[10px] text-cyan-300">
          <span>NET: ONLINE</span>
          <span>SECURE LINK</span>
          <span>v1.0</span>
        </div>
      </HUDPanel>
    </div>
  );
}

export function SideWidgets() {
  return (
    <div className="space-y-3">
      <HUDPanel className="enter-left" title="REGIONS">
        <div className="h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded" />
      </HUDPanel>
      <HUDPanel className="enter-left" title="WORLD MAP">
        <div className="h-24 bg-gradient-to-tr from-cyan-500/10 to-transparent rounded" />
      </HUDPanel>
      <HUDPanel className="enter-left" title="CALENDAR">
        <div className="h-24 grid place-items-center text-[10px] text-cyan-300/80">Jan • Mon</div>
      </HUDPanel>
    </div>
  );
}
