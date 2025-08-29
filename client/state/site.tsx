import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/state/auth";

export type FeatureKey = "ops" | "vault" | "monitor" | "dccu" | "creator";

export interface FeatureFlags {
  ops: boolean;
  vault: boolean;
  monitor: boolean;
  dccu: boolean;
  creator: boolean;
}

export interface SiteSettings {
  maintenance: boolean;
  announcement: string;
  features: FeatureFlags;
}

export interface AuditEntry {
  id: string;
  ts: number;
  actor: string;
  action: string;
  details?: string;
}

interface SiteContextValue {
  settings: SiteSettings;
  updateSettings: (patch: Partial<SiteSettings>) => void;
  toggleFeature: (key: FeatureKey, v?: boolean) => void;
  setAnnouncement: (text: string) => void;
  setMaintenance: (v: boolean) => void;
  audit: AuditEntry[];
  log: (action: string, details?: string) => void;
  clearAudit: () => void;
}

const DEFAULT_SETTINGS: SiteSettings = {
  maintenance: false,
  announcement: "",
  features: { ops: true, vault: true, monitor: true, dccu: true, creator: true },
};

const SETTINGS_KEY = "bat_site_settings_v1";
const AUDIT_KEY = "bat_site_audit_v1";

const SiteContext = createContext<SiteContextValue | null>(null);

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { session } = useAuth();
  const [settings, setSettings] = useState<SiteSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });
  const [audit, setAudit] = useState<AuditEntry[]>(() => {
    try {
      const raw = localStorage.getItem(AUDIT_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(AUDIT_KEY, JSON.stringify(audit.slice(-200)));
  }, [audit]);

  const log = useCallback((action: string, details?: string) => {
    const entry: AuditEntry = {
      id: Math.random().toString(36).slice(2),
      ts: Date.now(),
      actor: session?.codename ?? "SYSTEM",
      action,
      details,
    };
    setAudit(prev => [...prev.slice(-199), entry]);
  }, [session]);

  const updateSettings = useCallback((patch: Partial<SiteSettings>) => {
    setSettings(prev => {
      const next = { ...prev, ...patch, features: { ...prev.features, ...(patch.features || {}) } };
      return next;
    });
  }, []);

  const toggleFeature = useCallback((key: FeatureKey, v?: boolean) => {
    setSettings(prev => {
      const next = { ...prev, features: { ...prev.features, [key]: v ?? !prev.features[key] } };
      return next;
    });
    log("feature.toggle", key);
  }, [log]);

  const setAnnouncement = useCallback((text: string) => {
    setSettings(prev => ({ ...prev, announcement: text }));
    log("announcement.set", text.slice(0, 120));
  }, [log]);

  const setMaintenance = useCallback((v: boolean) => {
    setSettings(prev => ({ ...prev, maintenance: v }));
    log(v ? "maintenance.on" : "maintenance.off");
  }, [log]);

  const clearAudit = useCallback(() => {
    setAudit([]);
    log("audit.clear");
  }, [log]);

  const value = useMemo<SiteContextValue>(() => ({ settings, updateSettings, toggleFeature, setAnnouncement, setMaintenance, audit, log, clearAudit }), [settings, updateSettings, toggleFeature, setAnnouncement, setMaintenance, audit, log, clearAudit]);

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error("useSite must be used within SiteProvider");
  return ctx;
}
