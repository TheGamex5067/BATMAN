import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export type AccessLevel = "DELTA" | "GAMMA" | "BETA" | "ALPHA";

const PASSWORDS: Record<AccessLevel, string> = {
  DELTA: "DarkAlley",
  GAMMA: "HiddenPulse",
  BETA: "ShadowLock",
  ALPHA: "Brother_Eye",
};

interface Session {
  username: string;
  level: AccessLevel;
  codename: string;
  ts: number;
}

interface AuthContextValue {
  session: Session | null;
  lockedUntil: number | null;
  failures: number;
  soundsEnabled: boolean;
  voiceEnabled: boolean;
  login: (username: string, password: string) => Promise<Session>;
  logout: () => void;
  toggleSounds: (v?: boolean) => void;
  toggleVoice: (v?: boolean) => void;
  detectLevel: (password: string) => AccessLevel | null;
  speak: (text: string) => void;
  beep: (type: "ok" | "error" | "warn") => void;
  justLoggedIn: boolean;
  consumeJustLoggedIn: () => boolean;
}

const STORAGE_KEY = "bat_auth_session_v1";
const LOCK_KEY = "bat_auth_lock_v1";
const FAIL_KEY = "bat_auth_fail_v1";

const AuthContext = createContext<AuthContextValue | null>(null);

function makeCodename(level: AccessLevel): string {
  if (level === "ALPHA") return "Batman";
  const bank = ["Warden", "Sentinel", "Specter", "Rook", "Vigil", "Cipher", "Aegis"]; 
  const tag = bank[Math.floor(Math.random() * bank.length)];
  return `${tag}-${level}`;
}

function useAudio() {
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-US";
    utter.rate = 0.9;
    utter.pitch = 0.4;
    utter.volume = 0.8;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utter);
  }, [voiceEnabled]);

  const beep = useCallback((type: "ok" | "error" | "warn") => {
    if (!soundsEnabled || typeof window === "undefined") return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    const freq = type === "ok" ? 660 : type === "warn" ? 440 : 220;
    o.frequency.value = freq;
    g.gain.value = 0.0001;
    o.connect(g);
    g.connect(ctx.destination);
    o.start();
    const dur = 0.12;
    const now = ctx.currentTime;
    g.gain.exponentialRampToValueAtTime(0.3, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.stop(now + dur + 0.02);
  }, [soundsEnabled]);

  return { soundsEnabled, setSoundsEnabled, voiceEnabled, setVoiceEnabled, speak, beep };
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch { return null; }
  });
  const [lockedUntil, setLockedUntil] = useState<number | null>(() => {
    const v = localStorage.getItem(LOCK_KEY); return v ? Number(v) : null;
  });
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const [failures, setFailures] = useState<number>(() => Number(localStorage.getItem(FAIL_KEY) || 0));

  const { soundsEnabled, setSoundsEnabled, voiceEnabled, setVoiceEnabled, speak, beep } = useAudio();

  useEffect(() => {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  }, [session]);

  useEffect(() => {
    if (lockedUntil) localStorage.setItem(LOCK_KEY, String(lockedUntil));
    else localStorage.removeItem(LOCK_KEY);
  }, [lockedUntil]);

  useEffect(() => {
    localStorage.setItem(FAIL_KEY, String(failures));
  }, [failures]);

  const detectLevel = useCallback((password: string): AccessLevel | null => {
    const trimmed = password.trim();
    const found = (Object.keys(PASSWORDS) as AccessLevel[]).find(l => PASSWORDS[l] === trimmed);
    return found ?? null;
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const now = Date.now();
    if (lockedUntil && now < lockedUntil) {
      beep("error");
      speak("Lockdown engaged. Access denied.");
      throw new Error("LOCKED");
    }
    const level = detectLevel(password);
    if (!username.trim() || !level) {
      const newFails = failures + 1;
      setFailures(newFails);
      if (newFails >= 3) {
        const lockMs = Math.min(60000, 10000 * newFails); // escalating up to 60s
        const until = now + lockMs;
        setLockedUntil(until);
      }
      beep("error");
      speak("Invalid credentials.");
      throw new Error("INVALID");
    }
    const s: Session = { username: username.trim(), level, codename: makeCodename(level), ts: now };
    setSession(s);
    setFailures(0);
    setLockedUntil(null);
    setJustLoggedIn(true);
    try { localStorage.setItem("bat_enter_once", "1"); } catch {}
    beep("ok");
    speak(level === "ALPHA" ? "Access granted. Welcome back, Batman." : `Access granted. Clearance ${level}.`);
    return s;
  }, [detectLevel, failures, lockedUntil, beep, speak]);

  const logout = useCallback(() => {
    setSession(null);
    beep("warn");
    speak("Session terminated. Console locked.");
  }, [beep, speak]);

  const toggleSounds = useCallback((v?: boolean) => setSoundsEnabled(v ?? !soundsEnabled), [soundsEnabled, setSoundsEnabled]);
  const toggleVoice = useCallback((v?: boolean) => setVoiceEnabled(v ?? !voiceEnabled), [voiceEnabled, setVoiceEnabled]);

  const consumeJustLoggedIn = useCallback(() => {
    if (justLoggedIn) { setJustLoggedIn(false); return true; }
    return false;
  }, [justLoggedIn]);

  const value = useMemo<AuthContextValue>(() => ({
    session, lockedUntil, failures, soundsEnabled, voiceEnabled, login, logout, toggleSounds, toggleVoice, detectLevel, speak, beep, justLoggedIn, consumeJustLoggedIn,
  }), [session, lockedUntil, failures, soundsEnabled, voiceEnabled, login, logout, toggleSounds, toggleVoice, detectLevel, speak, beep, justLoggedIn, consumeJustLoggedIn]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
