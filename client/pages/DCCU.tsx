import ConsoleLayout from "@/components/layout/ConsoleLayout";
import { HUDPanel } from "@/components/hud/HUDPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useAuth } from "@/state/auth";
import { useDCCU } from "@/state/dccu";
import { useSupabaseData } from "@/hooks/use-supabase-data";
import { Movie } from "@/shared/supabase";
import ScreenplayReader from "@/components/dccu/ScreenplayReader";
import { useState, useMemo } from "react";
import { Film, Users, Shirt, Box, Clock, Sparkles, ShieldAlert, Search } from "lucide-react";

export default function DCCU() {
  const { session } = useAuth();
  const isAlpha = session?.level === "ALPHA";
  const { data } = useDCCU();
  const { data: movies, loading, insertData, canModify } = useSupabaseData<Movie>('movies');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMovie, setNewMovie] = useState({
    title: '',
    year: new Date().getFullYear(),
    director: '',
    rating: 0,
    synopsis: '',
    clearance_level: 'DELTA' as const
  });

  const handleAddMovie = async () => {
    if (!newMovie.title.trim()) return;

    try {
      await insertData(newMovie);
      setNewMovie({
        title: '',
        year: new Date().getFullYear(),
        director: '',
        rating: 0,
        synopsis: '',
        clearance_level: 'DELTA'
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Failed to add movie:', error);
    }
  };

  const [tab, setTab] = useState<string>("movies");
  const title = useMemo(() =>
    tab === "movies" ? "Movies" :
    tab === "characters" ? "Characters" :
    tab === "suits" ? "Suits" :
    tab === "artifacts" ? "Artifacts & Technology" :
    tab === "timeline" ? "Timeline" :
    tab === "future" ? "Future Content" :
    "Alpha Notes"
  , [tab]);

  return (
    <ConsoleLayout>
      <div className="mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>DCCU</BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbPage className="text-cyan-200">{title}</BreadcrumbPage>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-2">
          <TabsList className="h-auto flex-col items-stretch bg-black/40 border border-cyan-500/30 rounded-md text-cyan-300/60">
            <NavTab value="movies" icon={Film} label="Movies" />
            <NavTab value="characters" icon={Users} label="Characters" />
            <NavTab value="suits" icon={Shirt} label="Suits" />
            <NavTab value="artifacts" icon={Box} label="Artifacts" />
            <NavTab value="timeline" icon={Clock} label="Timeline" />
            <NavTab value="future" icon={Sparkles} label="Future" />
            {isAlpha && <NavTab value="alpha" icon={ShieldAlert} label="Alpha Notes" />}
          </TabsList>
        </div>
        <div className="col-span-12 lg:col-span-10">
          <HeaderBar isAlpha={isAlpha} />
          <TabsContent value="movies"><MoviesSection isAlpha={isAlpha} movies={movies} loading={loading} canModify={canModify} showAddForm={showAddForm} setShowAddForm={setShowAddForm} newMovie={newMovie} setNewMovie={setNewMovie} handleAddMovie={handleAddMovie} /></TabsContent>
          <TabsContent value="characters"><CharactersSection isAlpha={isAlpha} /></TabsContent>
          <TabsContent value="suits"><SuitsSection isAlpha={isAlpha} /></TabsContent>
          <TabsContent value="artifacts"><ArtifactsSection isAlpha={isAlpha} /></TabsContent>
          <TabsContent value="timeline"><TimelineSection isAlpha={isAlpha} /></TabsContent>
          <TabsContent value="future"><FuturesSection isAlpha={isAlpha} /></TabsContent>
          {isAlpha && <TabsContent value="alpha"><AlphaNotesSection /></TabsContent>}
        </div>
      </Tabs>
    </ConsoleLayout>
  );
}

function NavTab({ value, icon: Icon, label }: { value: string; icon: any; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className="relative justify-start gap-2 pl-4 bg-transparent text-cyan-300/60 hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-0 data-[state=inactive]:bg-transparent data-[state=inactive]:ring-0 data-[state=active]:text-cyan-200 after:content-[''] after:absolute after:left-1 after:top-1/2 after:-translate-y-1/2 after:h-4 after:w-[3px] after:rounded-sm after:bg-cyan-400/60 after:opacity-0 data-[state=active]:after:opacity-100"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </TabsTrigger>
  );
}

function HeaderBar({ isAlpha }: { isAlpha: boolean }) {
  const [q, setQ] = useState("");
  return (
    <div className="mb-4 flex items-center justify-between">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-300/70" />
        <input placeholder={isAlpha ? "Search (try titles, roles, tags)" : "Search"} value={q} onChange={e=>setQ(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border border-cyan-500/30 bg-black/40 text-cyan-100 outline-none focus:ring-2 focus:ring-cyan-400/40" />
      </div>
      {isAlpha && (
        <div className="hidden md:flex items-center gap-2">
          <span className="text-xs text-cyan-300/80">Alpha Editing Mode</span>
          <div className="size-2 rounded-full bg-amber-400 animate-pulse" />
        </div>
      )}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">{children}</div>;
}

function EmptySlot({ label }: { label: string }) {
  return (
    <div className="h-28 rounded-xl border-2 border-dashed border-cyan-500/30 bg-black/20 hud-card flex items-center justify-center text-cyan-300/60 text-sm">
      {label}
    </div>
  );
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-cyan-500/30 bg-black/40 hud-card overflow-hidden">
      {children}
    </div>
  );
}

function Row({ title, subtitle, onClick, cta }: { title: string; subtitle?: string; onClick?: () => void; cta?: React.ReactNode }) {
  return (
    <div className="group flex items-center justify-between p-3 border-b border-cyan-500/20 hover:bg-cyan-500/10">
      <button className="text-left" onClick={onClick}>
        <div className="text-cyan-100 text-base">{title}</div>
        {subtitle && <div className="text-cyan-200/70 text-sm">{subtitle}</div>}
      </button>
      {cta}
    </div>
  );
}

// Sections

function MoviesSection({ isAlpha, movies, loading, canModify, showAddForm, setShowAddForm, newMovie, setNewMovie, handleAddMovie }: { isAlpha: boolean; movies: Movie[]; loading: boolean; canModify: boolean; showAddForm: boolean; setShowAddForm: (val: boolean) => void; newMovie: any; setNewMovie: (val: any) => void; handleAddMovie: () => Promise<void> }) {
  const { data, addMovie, updateMovie, removeMovie } = useDCCU();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [readerId, setReaderId] = useState<string | null>(null);
  const movie = useMemo(() => data.movies.find(m => m.id === editing) || null, [editing, data.movies]);
  const readerMovie = useMemo(() => data.movies.find(m => m.id === readerId) || null, [readerId, data.movies]);

  const slots = Math.max(6, movies.length || 0);

  return (
    <div className="space-y-4">
      <HUDPanel title="DCCU Movie Database" className="mb-6">
          {canModify && (
            <div className="mb-4 flex justify-end">
              <Button 
                onClick={() => setShowAddForm(!showAddForm)}
                className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
              >
                {showAddForm ? 'Cancel' : 'Add Movie'}
              </Button>
            </div>
          )}

          {showAddForm && (
            <div className="mb-6 p-4 border border-cyan-500/30 bg-slate-900/50 rounded">
              <h3 className="text-cyan-300 font-mono text-sm mb-3">New Movie Entry</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <Input
                  placeholder="Movie title"
                  value={newMovie.title}
                  onChange={(e) => setNewMovie(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-slate-800/50 border-cyan-500/30 text-cyan-100"
                />
                <Input
                  type="number"
                  placeholder="Year"
                  value={newMovie.year}
                  onChange={(e) => setNewMovie(prev => ({ ...prev, year: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-800/50 border-cyan-500/30 text-cyan-100"
                />
                <Input
                  placeholder="Director"
                  value={newMovie.director}
                  onChange={(e) => setNewMovie(prev => ({ ...prev, director: e.target.value }))}
                  className="bg-slate-800/50 border-cyan-500/30 text-cyan-100"
                />
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Rating (0-10)"
                  value={newMovie.rating}
                  onChange={(e) => setNewMovie(prev => ({ ...prev, rating: parseFloat(e.target.value) || 0 }))}
                  className="bg-slate-800/50 border-cyan-500/30 text-cyan-100"
                />
              </div>
              <Textarea
                placeholder="Synopsis"
                value={newMovie.synopsis}
                onChange={(e) => setNewMovie(prev => ({ ...prev, synopsis: e.target.value }))}
                className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 mb-3"
              />
              <Select 
                value={newMovie.clearance_level} 
                onValueChange={(value: any) => setNewMovie(prev => ({ ...prev, clearance_level: value }))}
              >
                <SelectTrigger className="bg-slate-800/50 border-cyan-500/30 text-cyan-100 mb-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DELTA">DELTA</SelectItem>
                  <SelectItem value="GAMMA">GAMMA</SelectItem>
                  <SelectItem value="BETA">BETA</SelectItem>
                  <SelectItem value="ALPHA">ALPHA</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                onClick={handleAddMovie}
                className="bg-green-500/20 text-green-300 border border-green-500/30"
              >
                Add Movie
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {loading ? (
              <div className="col-span-full text-center text-slate-400 py-8">Loading movie database...</div>
            ) : movies.length === 0 ? (
              <div className="col-span-full text-center text-slate-400 py-8">No movies available for your clearance level.</div>
            ) : (
              movies.map((movie) => (
                <div key={movie.id} className="p-4 border border-cyan-500/30 bg-slate-900/50 rounded">
                  <h3 className="text-cyan-300 font-mono text-sm mb-1">{movie.title}</h3>
                  <div className="text-xs text-slate-400 mb-2">
                    {movie.year} • Dir: {movie.director}
                  </div>
                  <div className="text-xs text-yellow-300 mb-2">
                    Rating: {movie.rating}/10
                  </div>
                  <p className="text-xs text-slate-300 mb-3 line-clamp-3">{movie.synopsis}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">CLEARANCE: {movie.clearance_level}</span>
                    {isAlpha && (
                      <button 
                        onClick={() => console.log('Load screenplay:', movie.title)}
                        className="text-cyan-300 hover:text-cyan-100 text-xs underline"
                      >
                        Load Script
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </HUDPanel>

        <HUDPanel title="DCCU Archives" className="mb-6">
          <div className="space-y-4">
            <div className="text-sm text-slate-300">
              DC Cinematic Universe database contains classified information about all Batman-related productions.
            </div>
            {isAlpha && (
              <button 
                onClick={() => console.log('Load Batman Begins screenplay')}
                className="text-cyan-300 hover:text-cyan-100 text-left text-sm underline"
              >
                Load Batman Begins Screenplay
              </button>
            )}
          </div>
        </HUDPanel>

      <Grid>
        {data.movies.map(m => (
          <CardShell key={m.id}>
            <Row title={m.title} subtitle={m.kind} onClick={() => (isAlpha ? setEditing(m.id) : setReaderId(m.id))} cta={<div className="flex gap-1">{m.kind === "screenplay" && (<Button size="sm" variant="ghost" className="border border-cyan-500/30 text-cyan-200" onClick={(e)=>{e.stopPropagation(); setReaderId(m.id);}}>Read</Button>)}{isAlpha && (<><Button size="sm" variant="ghost" className="border border-cyan-500/30 text-cyan-200" onClick={(e)=>{e.stopPropagation(); setEditing(m.id);}}>Edit</Button><Button size="sm" variant="destructive" className="text-rose-200" onClick={(e)=>{e.stopPropagation(); if (confirm('Delete movie?')) removeMovie(m.id);}}>Delete</Button></>)}</div>} />
          </CardShell>
        ))}
        {!isAlpha && Array.from({ length: Math.max(0, slots - data.movies.length) }).map((_, i) => (
          <EmptySlot key={i} label="Empty Slot – Add Entry (Alpha Only)" />
        ))}
        {isAlpha && (
          <button className="h-28 rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200 text-sm" onClick={() => setOpen(true)}>
            + Add Entry
          </button>
        )}
      </Grid>
      <MovieDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addMovie(v as any); setOpen(false); }} />
      {movie && <MovieDialog open={!!movie} onOpenChange={()=>setEditing(null)} initial={movie} editable={isAlpha} onSubmit={(v)=>{ updateMovie({ ...movie, ...v } as any); setEditing(null); }} onDelete={()=>{ removeMovie(movie.id); setEditing(null); }} />}
      {readerMovie && readerMovie.kind === "screenplay" && <ScreenplayReader movie={readerMovie as any} onClose={()=>setReaderId(null)} />}
    </div>
  );
}

function MovieDialog({ open, onOpenChange, initial, onSubmit, editable = true, onDelete }: { open: boolean; onOpenChange: (v: boolean)=>void; initial?: any; onSubmit: (v:{ title:string; kind:"summary"|"screenplay"; summary:string; screenplay?:string })=>void; editable?: boolean; onDelete?: ()=>void; }){
  const [title, setTitle] = useState(initial?.title||"");
  const [kind, setKind] = useState<"summary"|"screenplay">(initial?.kind||"summary");
  const [summary, setSummary] = useState(initial?.summary||"");
  const [screenplay, setScreenplay] = useState(initial?.screenplay||"");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-cyan-500/30 text-cyan-100 max-w-3xl"><DialogHeader><DialogTitle>{initial?"Movie":"New Movie"}</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Title"><input className="fld" value={title} onChange={e=>setTitle(e.target.value)} disabled={!editable} /></Field><Field label="Kind"><select className="fld" value={kind} onChange={e=>setKind(e.target.value as any)} disabled={!editable}><option value="summary">Summary</option><option value="screenplay">Screenplay</option></select></Field>{kind==="summary" && (<Field label="Summary"><textarea className="fld min-h-28" value={summary} onChange={e=>setSummary(e.target.value)} disabled={!editable} /></Field>)}{kind==="screenplay" && (<Field label="Screenplay"><textarea className="fld min-h-[50vh] font-mono" value={screenplay} onChange={e=>setScreenplay(e.target.value)} disabled={!editable} placeholder="INT. BATCAVE - NIGHT\n..." /></Field>)}<div className="flex justify-end gap-2">{initial && editable && <Button variant="destructive" onClick={onDelete}>Delete</Button>}{editable && <Button onClick={()=> title.trim() && onSubmit({ title: title.trim(), kind, summary, screenplay })}>{initial?"Save":"Create"}</Button>}</div></div></DialogContent></Dialog>
  );
}

function SuitsSection({ isAlpha }: { isAlpha: boolean }) {
  const { data, addSuit, updateSuit, removeSuit } = useDCCU();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string|null>(null); const item = useMemo(()=> data.suits.find(m=>m.id===editing) || null,[editing,data.suits]);
  const slots = Math.max(6, data.suits.length || 0);
  return (
    <div className="space-y-4">
      <Grid>
        {data.suits.map(m => (
          <CardShell key={m.id}>
            {m.imageData && (
              <div className="p-3 flex items-center justify-center bg-black/30 border-b border-cyan-500/20">
                <img src={m.imageData} alt={m.name} style={{ transform: `scale(${m.imageScale ?? 1})`, transformOrigin: "center", maxHeight: 180 }} className="object-contain" />
              </div>
            )}
            <Row title={`${m.name} • ${m.version}`} onClick={()=> isAlpha && setEditing(m.id)} cta={isAlpha && (<div className="flex gap-1"><Button size="sm" variant="ghost" className="border border-cyan-500/30 text-cyan-200" onClick={(e)=>{e.stopPropagation(); setEditing(m.id);}}>Edit</Button><Button size="sm" variant="destructive" className="text-rose-200" onClick={(e)=>{e.stopPropagation(); if (confirm('Delete suit?')) removeSuit(m.id);}}>Delete</Button></div>)} />
          </CardShell>
        ))}
        {!isAlpha && Array.from({ length: Math.max(0, slots - data.suits.length) }).map((_,i)=>(<EmptySlot key={i} label="Empty Slot – Add Entry (Alpha Only)" />))}
        {isAlpha && (<button className="h-28 rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200 text-sm" onClick={()=>setOpen(true)}>+ Add Entry</button>)}
      </Grid>
      <SuitDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addSuit(v as any); setOpen(false); }} />
      {item && <SuitDialog open={!!item} onOpenChange={()=>setEditing(null)} initial={item} editable={isAlpha} onSubmit={(v)=>{ updateSuit({ ...item, ...v } as any); setEditing(null); }} onDelete={()=>{ removeSuit(item.id); setEditing(null); }} />}
    </div>
  );
}
function SuitDialog({ open, onOpenChange, initial, onSubmit, editable = true, onDelete }: { open: boolean; onOpenChange: (v: boolean)=>void; initial?: any; onSubmit: (v:{ name:string; version:string; notes:string; imageData?:string; imageScale?:number })=>void; editable?: boolean; onDelete?: ()=>void; }) {
  const [name,setName]=useState(initial?.name||""); const [version,setVersion]=useState(initial?.version||"v1"); const [notes,setNotes]=useState(initial?.notes||"");
  const [imageData, setImageData] = useState<string>(initial?.imageData||"");
  const [imageScale, setImageScale] = useState<number>(initial?.imageScale||1);
  const onFile = (f?: File) => {
    if (!f) return; const reader = new FileReader(); reader.onload = () => setImageData(String(reader.result||"")); reader.readAsDataURL(f);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-cyan-500/30 text-cyan-100 max-w-2xl"><DialogHeader><DialogTitle>{initial?"Suit":"New Suit"}</DialogTitle></DialogHeader><div className="space-y-3">
      <Field label="Name"><input className="fld" value={name} onChange={e=>setName(e.target.value)} disabled={!editable} /></Field>
      <Field label="Version"><input className="fld" value={version} onChange={e=>setVersion(e.target.value)} disabled={!editable} /></Field>
      <Field label="Notes"><textarea className="fld min-h-28" value={notes} onChange={e=>setNotes(e.target.value)} disabled={!editable} /></Field>
      <Field label="Suit Image">
        <input type="file" accept="image/*" onChange={e=>onFile(e.target.files?.[0])} disabled={!editable} className="text-sm" />
        {imageData && (
          <div className="mt-3 rounded border border-cyan-500/20 p-3 bg-black/30">
            <div className="flex items-center justify-between text-xs text-cyan-200/80 mb-2"><span>Preview</span><span>Scale: {imageScale.toFixed(2)}x</span></div>
            <div className="flex items-center justify-center">
              <img src={imageData} alt="preview" style={{ transform:`scale(${imageScale})`, transformOrigin:"center", maxHeight:240 }} className="object-contain" />
            </div>
            <input type="range" min={0.4} max={2} step={0.05} value={imageScale} onChange={e=>setImageScale(parseFloat(e.target.value))} disabled={!editable} className="w-full mt-3" />
          </div>
        )}
      </Field>
      <div className="flex justify-end gap-2">{initial && editable && <Button variant="destructive" onClick={onDelete}>Delete</Button>}{editable && <Button onClick={()=> name.trim() && onSubmit({ name:name.trim(), version:version.trim(), notes, imageData, imageScale })}>{initial?"Save":"Create"}</Button>}</div>
    </div></DialogContent></Dialog>
  );
}

function CharactersSection({ isAlpha }: { isAlpha: boolean }) {
  const { data, addCharacter, updateCharacter, removeCharacter } = useDCCU();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string|null>(null); const item = useMemo(()=> data.characters.find(m=>m.id===editing) || null,[editing,data.characters]);
  const slots = Math.max(6, data.characters.length || 0);
  return (
    <div className="space-y-4">
      <Grid>
        {data.characters.map(m => (<CardShell key={m.id}><Row title={m.name} subtitle={m.role} onClick={()=> isAlpha && setEditing(m.id)} cta={isAlpha && (<div className='flex gap-1'><Button size='sm' variant='ghost' className='border border-cyan-500/30 text-cyan-200' onClick={(e)=>{e.stopPropagation(); setEditing(m.id);}}>Edit</Button><Button size='sm' variant='destructive' className='text-rose-200' onClick={(e)=>{e.stopPropagation(); if (confirm('Delete character?')) removeCharacter(m.id);}}>Delete</Button></div>)} /></CardShell>))}
        {!isAlpha && Array.from({ length: Math.max(0, slots - data.characters.length) }).map((_,i)=>(<EmptySlot key={i} label="Empty Slot – Add Entry (Alpha Only)" />))}
        {isAlpha && (<button className="h-28 rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200 text-sm" onClick={()=>setOpen(true)}>+ Add Entry</button>)}
      </Grid>
      <CharacterDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addCharacter(v as any); setOpen(false); }} />
      {item && <CharacterDialog open={!!item} onOpenChange={()=>setEditing(null)} initial={item} editable={isAlpha} onSubmit={(v)=>{ updateCharacter({ ...item, ...v } as any); setEditing(null); }} onDelete={()=>{ removeCharacter(item.id); setEditing(null); }} />}
    </div>
  );
}
function CharacterDialog({ open, onOpenChange, initial, onSubmit, editable = true, onDelete }: { open: boolean; onOpenChange: (v: boolean)=>void; initial?: any; onSubmit: (v:{ name:string; role:string; bio:string })=>void; editable?: boolean; onDelete?: ()=>void; }){ const [name,setName]=useState(initial?.name||""); const [role,setRole]=useState(initial?.role||""); const [bio,setBio]=useState(initial?.bio||""); return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-cyan-500/30 text-cyan-100"><DialogHeader><DialogTitle>{initial?"Character":"New Character"}</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Name"><input className="fld" value={name} onChange={e=>setName(e.target.value)} disabled={!editable} /></Field><Field label="Role"><input className="fld" value={role} onChange={e=>setRole(e.target.value)} disabled={!editable} /></Field><Field label="Bio"><textarea className="fld min-h-28" value={bio} onChange={e=>setBio(e.target.value)} disabled={!editable} /></Field><div className="flex justify-end gap-2">{initial && editable && <Button variant="destructive" onClick={onDelete}>Delete</Button>}{editable && <Button onClick={()=> name.trim() && onSubmit({ name:name.trim(), role:role.trim(), bio })}>{initial?"Save":"Create"}</Button>}</div></div></DialogContent></Dialog>); }

function ArtifactsSection({ isAlpha }: { isAlpha: boolean }) {
  const { data, addArtifact, updateArtifact, removeArtifact } = useDCCU();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string|null>(null); const item = useMemo(()=> data.artifacts.find(m=>m.id===editing) || null,[editing,data.artifacts]);
  const slots = Math.max(6, data.artifacts.length || 0);
  return (
    <div className="space-y-4">
      <Grid>
        {data.artifacts.map(m => (<CardShell key={m.id}><Row title={m.name} subtitle={m.type} onClick={()=> isAlpha && setEditing(m.id)} cta={isAlpha && (<div className='flex gap-1'><Button size='sm' variant='ghost' className='border border-cyan-500/30 text-cyan-200' onClick={(e)=>{e.stopPropagation(); setEditing(m.id);}}>Edit</Button><Button size='sm' variant='destructive' className='text-rose-200' onClick={(e)=>{e.stopPropagation(); if (confirm('Delete artifact?')) removeArtifact(m.id);}}>Delete</Button></div>)} /></CardShell>))}
        {!isAlpha && Array.from({ length: Math.max(0, slots - data.artifacts.length) }).map((_,i)=>(<EmptySlot key={i} label="Empty Slot – Add Entry (Alpha Only)" />))}
        {isAlpha && (<button className="h-28 rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200 text-sm" onClick={()=>setOpen(true)}>+ Add Entry</button>)}
      </Grid>
      <ArtifactDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addArtifact(v as any); setOpen(false); }} />
      {item && <ArtifactDialog open={!!item} onOpenChange={()=>setEditing(null)} initial={item} editable={isAlpha} onSubmit={(v)=>{ updateArtifact({ ...item, ...v } as any); setEditing(null); }} onDelete={()=>{ removeArtifact(item.id); setEditing(null); }} />}
    </div>
  );
}
function ArtifactDialog({ open, onOpenChange, initial, onSubmit, editable = true, onDelete }: { open: boolean; onOpenChange: (v: boolean)=>void; initial?: any; onSubmit: (v:{ name:string; type:string; description:string })=>void; editable?: boolean; onDelete?: ()=>void; }){ const [name,setName]=useState(initial?.name||""); const [type,setType]=useState(initial?.type||""); const [description,setDescription]=useState(initial?.description||""); return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-cyan-500/30 text-cyan-100"><DialogHeader><DialogTitle>{initial?"Artifact":"New Artifact"}</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Name"><input className="fld" value={name} onChange={e=>setName(e.target.value)} disabled={!editable} /></Field><Field label="Type"><input className="fld" value={type} onChange={e=>setType(e.target.value)} disabled={!editable} /></Field><Field label="Description"><textarea className="fld min-h-28" value={description} onChange={e=>setDescription(e.target.value)} disabled={!editable} /></Field><div className="flex justify-end gap-2">{initial && editable && <Button variant="destructive" onClick={onDelete}>Delete</Button>}{editable && <Button onClick={()=> name.trim() && onSubmit({ name:name.trim(), type:type.trim(), description })}>{initial?"Save":"Create"}</Button>}</div></div></DialogContent></Dialog>); }

function FuturesSection({ isAlpha }: { isAlpha: boolean }) {
  const { data, addFuture, updateFuture, removeFuture } = useDCCU();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string|null>(null); const item = useMemo(()=> data.futures.find(m=>m.id===editing) || null,[editing,data.futures]);
  const slots = Math.max(6, data.futures.length || 0);
  return (
    <div className="space-y-4">
      <Grid>
        {data.futures.map(m => (<CardShell key={m.id}><Row title={m.title} onClick={()=> isAlpha && setEditing(m.id)} cta={isAlpha && (<div className='flex gap-1'><Button size='sm' variant='ghost' className='border border-cyan-500/30 text-cyan-200' onClick={(e)=>{e.stopPropagation(); setEditing(m.id);}}>Edit</Button><Button size='sm' variant='destructive' className='text-rose-200' onClick={(e)=>{e.stopPropagation(); if (confirm('Delete item?')) removeFuture(m.id);}}>Delete</Button></div>)} /></CardShell>))}
        {!isAlpha && Array.from({ length: Math.max(0, slots - data.futures.length) }).map((_,i)=>(<EmptySlot key={i} label="Empty Slot – Add Entry (Alpha Only)" />))}
        {isAlpha && (<button className="h-28 rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200 text-sm" onClick={()=>setOpen(true)}>+ Add Entry</button>)}
      </Grid>
      <FutureDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addFuture(v as any); setOpen(false); }} />
      {item && <FutureDialog open={!!item} onOpenChange={()=>setEditing(null)} initial={item} editable={isAlpha} onSubmit={(v)=>{ updateFuture({ ...item, ...v } as any); setEditing(null); }} onDelete={()=>{ removeFuture(item.id); setEditing(null); }} />}
    </div>
  );
}
function FutureDialog({ open, onOpenChange, initial, onSubmit, editable = true, onDelete }: { open: boolean; onOpenChange: (v: boolean)=>void; initial?: any; onSubmit: (v:{ title:string; notes:string })=>void; editable?: boolean; onDelete?: ()=>void; }){ const [title,setTitle]=useState(initial?.title||""); const [notes,setNotes]=useState(initial?.notes||""); return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-cyan-500/30 text-cyan-100"><DialogHeader><DialogTitle>{initial?"Future Item":"New Future Item"}</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Title"><input className="fld" value={title} onChange={e=>setTitle(e.target.value)} disabled={!editable} /></Field><Field label="Notes"><textarea className="fld min-h-28" value={notes} onChange={e=>setNotes(e.target.value)} disabled={!editable} /></Field><div className="flex justify-end gap-2">{initial && editable && <Button variant="destructive" onClick={onDelete}>Delete</Button>}{editable && <Button onClick={()=> title.trim() && onSubmit({ title:title.trim(), notes })}>{initial?"Save":"Create"}</Button>}</div></div></DialogContent></Dialog>); }

function TimelineSection({ isAlpha }: { isAlpha: boolean }) {
  const { data, addTimeline, updateTimeline, removeTimeline } = useDCCU();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string|null>(null); const item = useMemo(()=> data.timeline.find(m=>m.id===editing) || null,[editing,data.timeline]);
  const slots = Math.max(6, data.timeline.length || 0);
  return (
    <div className="lg:grid lg:grid-cols-12 lg:gap-4">
      <div className="lg:col-span-8 space-y-4">
        <Grid>
          {data.timeline.map(m => (<CardShell key={m.id}><Row title={m.title} subtitle={m.date} onClick={()=>setEditing(m.id)} /></CardShell>))}
          {!isAlpha && Array.from({ length: Math.max(0, slots - data.timeline.length) }).map((_,i)=>(<EmptySlot key={i} label="Empty Slot – Add Entry (Alpha Only)" />))}
          {isAlpha && (<button className="h-28 rounded-xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 hover:bg-cyan-500/10 text-cyan-200 text-sm" onClick={()=>setOpen(true)}>+ Add Entry</button>)}
        </Grid>
      </div>
      <div className="lg:col-span-4 mt-4 lg:mt-0">
        <CardShell>
          <div className="p-3 text-cyan-200/80 text-sm border-b border-cyan-500/20">Timeline Panel</div>
          <div className="p-3 space-y-2">
            {data.timeline.length === 0 ? (
              <div className="h-24 rounded-xl border-2 border-dashed border-cyan-500/30 bg-black/20 hud-card flex items-center justify-center text-cyan-300/60 text-sm">No timeline nodes</div>
            ) : (
              data.timeline.map(e => (
                <div key={e.id} className='flex items-center justify-between text-sm text-cyan-100/90'><span>{e.date} — {e.title}</span>{isAlpha && (<div className='flex gap-1'><Button size='sm' variant='ghost' className='border border-cyan-500/30 text-cyan-200' onClick={()=>setEditing(e.id)}>Edit</Button><Button size='sm' variant='destructive' className='text-rose-200' onClick={()=>{ if (confirm('Delete event?')) removeTimeline(e.id); }}>Delete</Button></div>)}</div>
              ))
            )}
          </div>
        </CardShell>
      </div>
      <TimelineDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addTimeline(v as any); setOpen(false); }} />
      {item && <TimelineDialog open={!!item} onOpenChange={()=>setEditing(null)} initial={item} editable={isAlpha} onSubmit={(v)=>{ updateTimeline({ ...item, ...v } as any); setEditing(null); }} onDelete={()=>{ removeTimeline(item.id); setEditing(null); }} />}
    </div>
  );
}
function TimelineDialog({ open, onOpenChange, initial, onSubmit, editable = true, onDelete }: { open: boolean; onOpenChange: (v: boolean)=>void; initial?: any; onSubmit: (v:{ date:string; title:string; detail:string })=>void; editable?: boolean; onDelete?: ()=>void; }) { const [date,setDate]=useState(initial?.date||""); const [title,setTitle]=useState(initial?.title||""); const [detail,setDetail]=useState(initial?.detail||""); return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-cyan-500/30 text-cyan-100"><DialogHeader><DialogTitle>{initial?"Timeline Event":"New Timeline Event"}</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Date"><input className="fld" value={date} onChange={e=>setDate(e.target.value)} disabled={!editable} placeholder="YYYY-MM-DD" /></Field><Field label="Title"><input className="fld" value={title} onChange={e=>setTitle(e.target.value)} disabled={!editable} /></Field><Field label="Detail"><textarea className="fld min-h-28" value={detail} onChange={e=>setDetail(e.target.value)} disabled={!editable} /></Field><div className="flex justify-end gap-2">{initial && editable && <Button variant="destructive" onClick={onDelete}>Delete</Button>}{editable && <Button onClick={()=> title.trim() && onSubmit({ date:date.trim(), title:title.trim(), detail })}>{initial?"Save":"Create"}</Button>}</div></div></DialogContent></Dialog>); }

function AlphaNotesSection() {
  const { data, addAlphaNote, updateAlphaNote, removeAlphaNote } = useDCCU();
  const [open, setOpen] = useState(false); const [editing, setEditing] = useState<string|null>(null); const item = useMemo(()=> data.alphaNotes.find(m=>m.id===editing) || null,[editing,data.alphaNotes]);
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-amber-200 tracking-widest uppercase text-sm">Alpha Notes</h2>
        <Button size="sm" className="bg-amber-500/20 text-amber-200 border border-amber-400/40" onClick={()=>setOpen(true)}>Add Note</Button>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {data.alphaNotes.map(n => (
          <CardShell key={n.id}><Row title={n.title} onClick={()=>setEditing(n.id)} cta={<div className='flex gap-1'><Button size='sm' variant='ghost' className='border border-amber-400/40 text-amber-200' onClick={(e)=>{e.stopPropagation(); setEditing(n.id);}}>Edit</Button><Button size='sm' variant='destructive' className='text-rose-200' onClick={(e)=>{e.stopPropagation(); if (confirm('Delete note?')) removeAlphaNote(n.id); }}>Delete</Button></div>} /></CardShell>
        ))}
      </div>
      <AlphaNoteDialog open={open} onOpenChange={setOpen} onSubmit={(v)=>{ addAlphaNote(v as any); setOpen(false); }} />
      {item && <AlphaNoteDialog open={!!item} onOpenChange={()=>setEditing(null)} initial={item} onSubmit={(v)=>{ updateAlphaNote({ ...item, ...v } as any); setEditing(null); }} onDelete={()=>{ removeAlphaNote(item.id); setEditing(null); }} />}
    </div>
  );
}
function AlphaNoteDialog({ open, onOpenChange, initial, onSubmit, onDelete }: { open:boolean; onOpenChange:(v:boolean)=>void; initial?:any; onSubmit:(v:{ title:string; content:string })=>void; onDelete?:()=>void; }){ const [title,setTitle]=useState(initial?.title||""); const [content,setContent]=useState(initial?.content||""); return (<Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="bg-black/60 border-amber-400/40 text-amber-100 max-w-2xl"><DialogHeader><DialogTitle>{initial?"Note":"New Note"}</DialogTitle></DialogHeader><div className="space-y-3"><Field label="Title"><input className="fld" value={title} onChange={e=>setTitle(e.target.value)} /></Field><Field label="Content"><textarea className="fld min-h-60" value={content} onChange={e=>setContent(e.target.value)} /></Field><div className="flex justify-end gap-2">{initial && <Button variant="destructive" onClick={onDelete}>Delete</Button>}<Button onClick={()=> title.trim() && onSubmit({ title:title.trim(), content })}>{initial?"Save":"Create"}</Button></div></div></DialogContent></Dialog>); }

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm text-cyan-200/80">
      <span className="text-[11px] uppercase tracking-widest text-cyan-300/80">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

// Input field styles injection
const style = document.createElement("style");
style.innerHTML = `.fld{width:100%;background:rgba(0,0,0,.5);border:1px solid rgba(34,211,238,.3);color:#cffafe;padding:.6rem .8rem;border-radius:.6rem;outline:none} .fld:focus{box-shadow:0 0 0 2px rgba(34,211,238,.4)} textarea.fld{resize:vertical}`;
if (typeof document !== "undefined" && !document.getElementById("dccu-input-styles")) { style.id = "dccu-input-styles"; document.head.appendChild(style); }