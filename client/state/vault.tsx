import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSite } from "@/state/site";

export type VaultType = "link" | "file";
export interface VaultItem {
  id: string;
  type: VaultType;
  title: string;
  tags: string[];
  url?: string;
  data?: string; // base64
  mime?: string;
  addedAt: number;
}

interface VaultContextValue {
  items: VaultItem[];
  add: (item: Omit<VaultItem, "id" | "addedAt">) => VaultItem;
  update: (item: VaultItem) => void;
  remove: (id: string) => void;
}

const STORAGE_KEY = "bat_vault_items_v1";
const VaultContext = createContext<VaultContextValue | null>(null);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { log } = useSite();
  const [items, setItems] = useState<VaultItem[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((item: Omit<VaultItem, "id" | "addedAt">) => {
    const v: VaultItem = { ...item, id: Math.random().toString(36).slice(2), addedAt: Date.now() };
    setItems(prev => [v, ...prev]);
    log("vault.add", v.title);
    return v;
  }, [log]);

  const update = useCallback((item: VaultItem) => {
    setItems(prev => prev.map(i => i.id === item.id ? item : i));
    log("vault.update", item.title);
  }, [log]);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    log("vault.remove", id);
  }, [log]);

  const value = useMemo(() => ({ items, add, update, remove }), [items, add, update, remove]);

  return <VaultContext.Provider value={value}>{children}</VaultContext.Provider>;
};

export function useVault() {
  const ctx = useContext(VaultContext);
  if (!ctx) throw new Error("useVault must be used within VaultProvider");
  return ctx;
}
