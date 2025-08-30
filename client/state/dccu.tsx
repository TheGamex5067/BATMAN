import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { z } from "zod";

export const MovieSchema = z.object({ id: z.string(), title: z.string().min(1), kind: z.enum(["summary","screenplay"]).default("summary"), summary: z.string().default(""), screenplay: z.string().default(""), createdAt: z.number() });
export type Movie = z.infer<typeof MovieSchema>;
export const SuitSchema = z.object({ id: z.string(), name: z.string().min(1), version: z.string().default("v1"), notes: z.string().default(""), imageData: z.string().default(""), imageScale: z.number().default(1), createdAt: z.number() });
export type Suit = z.infer<typeof SuitSchema>;
export const CharacterSchema = z.object({ id: z.string(), name: z.string().min(1), role: z.string().default(""), bio: z.string().default(""), createdAt: z.number() });
export type Character = z.infer<typeof CharacterSchema>;
export const ArtifactSchema = z.object({ id: z.string(), name: z.string().min(1), type: z.string().default(""), description: z.string().default(""), createdAt: z.number() });
export type Artifact = z.infer<typeof ArtifactSchema>;
export const FutureSchema = z.object({ id: z.string(), title: z.string().min(1), notes: z.string().default(""), createdAt: z.number() });
export type Future = z.infer<typeof FutureSchema>;
export const TimelineSchema = z.object({ id: z.string(), date: z.string().default(""), title: z.string().min(1), detail: z.string().default(""), createdAt: z.number() });
export type Timeline = z.infer<typeof TimelineSchema>;
export const AlphaNoteSchema = z.object({ id: z.string(), title: z.string().min(1), content: z.string().default(""), createdAt: z.number() });
export type AlphaNote = z.infer<typeof AlphaNoteSchema>;

const StoreSchema = z.object({
  movies: z.array(MovieSchema),
  suits: z.array(SuitSchema),
  characters: z.array(CharacterSchema),
  artifacts: z.array(ArtifactSchema),
  futures: z.array(FutureSchema),
  timeline: z.array(TimelineSchema),
  alphaNotes: z.array(AlphaNoteSchema),
});
export type DCCUStore = z.infer<typeof StoreSchema>;

const STORAGE_KEY = "dccu_store_v1";

const defaultStore: DCCUStore = { movies: [], suits: [], characters: [], artifacts: [], futures: [], timeline: [], alphaNotes: [] };

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return String(Date.now()) + Math.random().toString(16).slice(2);
}

interface Ctx {
  data: DCCUStore;
  addMovie: (p: Omit<Movie, "id"|"createdAt">) => Movie;
  updateMovie: (m: Movie) => void;
  removeMovie: (id: string) => void;
  addSuit: (p: Omit<Suit, "id"|"createdAt">) => Suit;
  updateSuit: (s: Suit) => void;
  removeSuit: (id: string) => void;
  addCharacter: (p: Omit<Character, "id"|"createdAt">) => Character;
  updateCharacter: (c: Character) => void;
  removeCharacter: (id: string) => void;
  addArtifact: (p: Omit<Artifact, "id"|"createdAt">) => Artifact;
  updateArtifact: (a: Artifact) => void;
  removeArtifact: (id: string) => void;
  addFuture: (p: Omit<Future, "id"|"createdAt">) => Future;
  updateFuture: (f: Future) => void;
  removeFuture: (id: string) => void;
  addTimeline: (p: Omit<Timeline, "id"|"createdAt">) => Timeline;
  updateTimeline: (t: Timeline) => void;
  removeTimeline: (id: string) => void;
  addAlphaNote: (p: Omit<AlphaNote, "id"|"createdAt">) => AlphaNote;
  updateAlphaNote: (n: AlphaNote) => void;
  removeAlphaNote: (id: string) => void;
}

const DCCUContext = createContext<Ctx | null>(null);

export const useDCCU = () => {
  const ctx = useContext(DCCUContext);
  if (!ctx) throw new Error("useDCCU must be used within DCCUProvider");
  return ctx;
};

export const DCCUProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [data, setData] = useState<DCCUStore>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultStore;
      return StoreSchema.parse(JSON.parse(raw));
    } catch {
      return defaultStore;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const add = useCallback(<T extends {id:string; createdAt:number}>(key: keyof DCCUStore, item: Omit<T, "id"|"createdAt">) => {
    const newItem = { ...(item as any), id: uid(), createdAt: Date.now() } as T;
    setData(d => ({ ...d, [key]: [...(d[key] as any[]), newItem] }));
    return newItem;
  }, []);
  const update = useCallback(<T extends {id:string}>(key: keyof DCCUStore, item: T) => {
    setData(d => ({ ...d, [key]: (d[key] as any[]).map(x => x.id === (item as any).id ? item : x) }));
  }, []);
  const remove = useCallback((key: keyof DCCUStore, id: string) => {
    setData(d => ({ ...d, [key]: (d[key] as any[]).filter((x:any) => x.id !== id) }));
  }, []);

  const ctx: Ctx = useMemo(() => ({
    data,
    addMovie: p => add<Movie>("movies", p as any),
    updateMovie: m => update<Movie>("movies", m),
    removeMovie: id => remove("movies", id),
    addSuit: p => add<Suit>("suits", p as any),
    updateSuit: s => update<Suit>("suits", s),
    removeSuit: id => remove("suits", id),
    addCharacter: p => add<Character>("characters", p as any),
    updateCharacter: c => update<Character>("characters", c),
    removeCharacter: id => remove("characters", id),
    addArtifact: p => add<Artifact>("artifacts", p as any),
    updateArtifact: a => update<Artifact>("artifacts", a),
    removeArtifact: id => remove("artifacts", id),
    addFuture: p => add<Future>("futures", p as any),
    updateFuture: f => update<Future>("futures", f),
    removeFuture: id => remove("futures", id),
    addTimeline: p => add<Timeline>("timeline", p as any),
    updateTimeline: t => update<Timeline>("timeline", t),
    removeTimeline: id => remove("timeline", id),
    addAlphaNote: p => add<AlphaNote>("alphaNotes", p as any),
    updateAlphaNote: n => update<AlphaNote>("alphaNotes", n),
    removeAlphaNote: id => remove("alphaNotes", id),
  }), [data, add, update, remove]);

  return <DCCUContext.Provider value={ctx}>{children}</DCCUContext.Provider>;
};

export function useDCCU() {
  const ctx = useContext(DCCUContext);
  if (!ctx) throw new Error("useDCCU must be used within DCCUProvider");
  return ctx;
}
