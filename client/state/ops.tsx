import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSite } from "@/state/site";

export type OpsStatus = "backlog" | "active" | "blocked" | "done";
export type OpsPriority = "low" | "medium" | "high";

export interface OpsTask {
  id: string;
  title: string;
  detail?: string;
  status: OpsStatus;
  priority: OpsPriority;
  createdAt: number;
  updatedAt: number;
}

interface OpsContextValue {
  tasks: OpsTask[];
  add: (t: Omit<OpsTask, "id" | "createdAt" | "updatedAt">) => OpsTask;
  update: (t: OpsTask) => void;
  remove: (id: string) => void;
  move: (id: string, status: OpsStatus) => void;
}

const STORAGE_KEY = "bat_ops_tasks_v1";
const OpsContext = createContext<OpsContextValue | null>(null);

export const OpsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { log } = useSite();
  const [tasks, setTasks] = useState<OpsTask[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const add = useCallback((t: Omit<OpsTask, "id" | "createdAt" | "updatedAt">) => {
    const now = Date.now();
    const task: OpsTask = { ...t, id: Math.random().toString(36).slice(2), createdAt: now, updatedAt: now };
    setTasks(prev => [...prev, task]);
    log("ops.add", task.title);
    return task;
  }, [log]);

  const update = useCallback((t: OpsTask) => {
    setTasks(prev => prev.map(x => x.id === t.id ? { ...t, updatedAt: Date.now() } : x));
    log("ops.update", t.title);
  }, [log]);

  const remove = useCallback((id: string) => {
    setTasks(prev => prev.filter(x => x.id !== id));
    log("ops.remove", id);
  }, [log]);

  const move = useCallback((id: string, status: OpsStatus) => {
    setTasks(prev => prev.map(x => x.id === id ? { ...x, status, updatedAt: Date.now() } : x));
    log("ops.move", `${id} -> ${status}`);
  }, [log]);

  const value = useMemo(() => ({ tasks, add, update, remove, move }), [tasks, add, update, remove, move]);

  return <OpsContext.Provider value={value}>{children}</OpsContext.Provider>;
};

export function useOps() {
  const ctx = useContext(OpsContext);
  if (!ctx) throw new Error("useOps must be used within OpsProvider");
  return ctx;
}
