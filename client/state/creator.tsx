import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface Doc {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

interface CreatorContextValue {
  docs: Doc[];
  add: (title?: string) => Doc;
  update: (doc: Doc) => void;
  remove: (id: string) => void;
}

const STORAGE_KEY = "bat_creator_docs_v1";
const CreatorContext = createContext<CreatorContextValue | null>(null);

export const CreatorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [docs, setDocs] = useState<Doc[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(docs)); }, [docs]);

  const add = useCallback((title = "Untitled") => {
    const d: Doc = { id: Math.random().toString(36).slice(2), title, content: "", updatedAt: Date.now() };
    setDocs(prev => [d, ...prev]);
    return d;
  }, []);

  const update = useCallback((doc: Doc) => {
    setDocs(prev => prev.map(d => d.id === doc.id ? { ...doc, updatedAt: Date.now() } : d));
  }, []);

  const remove = useCallback((id: string) => { setDocs(prev => prev.filter(d => d.id !== id)); }, []);

  const value = useMemo(() => ({ docs, add, update, remove }), [docs, add, update, remove]);

  return <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>;
};

export function useCreator() { const ctx = useContext(CreatorContext); if (!ctx) throw new Error("useCreator must be used within CreatorProvider"); return ctx; }
