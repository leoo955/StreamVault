"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Save, Film, Tv, Play, Image as ImageIcon, Sparkles, ChevronRight, Check
} from "lucide-react";
import Link from "next/link";

const S = {
  background: "var(--surface)",
  border: "1px solid var(--surface-light)",
};

interface SagaRow {
  name: string;
  bannerUrl: string;
  itemCount: number;
}

export default function AdminSagasPage() {
  const [sagas, setSagas] = useState<SagaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [mediaRes, metaRes] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/sagas")
      ]);
      const mediaData = await mediaRes.json();
      const metaData = await metaRes.json();

      const items = mediaData.items || [];
      const metas = metaData.sagas || [];

      // Extract unique sagas from media
      const sagaCounts: Record<string, number> = {};
      items.forEach((item: any) => {
        if (item.saga && item.saga.trim()) {
          const key = item.saga.trim();
          sagaCounts[key] = (sagaCounts[key] || 0) + 1;
        }
      });

      const rows: SagaRow[] = Object.entries(sagaCounts).map(([name, count]) => {
        const meta = metas.find((m: any) => m.name === name);
        return {
          name,
          itemCount: count,
          bannerUrl: meta ? meta.bannerUrl : ""
        };
      });

      setSagas(rows);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (name: string, url: string) => {
    setSaving(name);
    try {
      const res = await fetch("/api/sagas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bannerUrl: url })
      });
      if (res.ok) {
        setSagas(prev => prev.map(s => s.name === name ? { ...s, bannerUrl: url } : s));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(null);
    }
  };

  const filteredSagas = sagas.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-deep-black text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-6 mb-12">
          <Link href="/admin">
            <button className="p-3 rounded-2xl hover:bg-surface-light transition-all duration-300 group" style={S}>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </Link>
          <div>
            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-gold" />
              Gestion des Sagas
            </h1>
            <p className="text-text-muted mt-1">Personnalisez les bannières de vos collections de films et séries.</p>
          </div>
        </div>

        <div className="relative mb-8 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-gold transition-colors" />
          <input 
            type="text" 
            placeholder="Rechercher une saga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
            style={S}
          />
        </div>

        <div className="grid gap-6">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-44 rounded-3xl skeleton" />
            ))
          ) : filteredSagas.length === 0 ? (
            <div className="text-center py-20 bg-surface/30 rounded-3xl border border-dashed border-surface-light">
               <p className="text-text-muted">Aucune saga trouvée dans votre bibliothèque.</p>
            </div>
          ) : (
            filteredSagas.map((saga) => (
              <SagaEditorCard 
                key={saga.name} 
                saga={saga} 
                onUpdate={(url) => handleUpdate(saga.name, url)}
                isSaving={saving === saga.name}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function SagaEditorCard({ saga, onUpdate, isSaving }: { saga: SagaRow, onUpdate: (url: string) => void, isSaving: boolean }) {
  const [url, setUrl] = useState(saga.bannerUrl);
  const hasChanges = url !== saga.bannerUrl;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-1 rounded-3xl group" 
      style={{ ...S, background: "var(--surface)" }}
    >
      <div className="relative h-44 w-full rounded-[1.4rem] overflow-hidden mb-4 bg-black/40">
        {url ? (
          <img src={url} alt={saga.name} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
             <ImageIcon className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-4 left-6">
           <div className="flex items-center gap-2 mb-1">
             <span className="bg-gold text-deep-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">Collection</span>
             <span className="text-text-muted text-xs font-bold">{saga.itemCount} média{saga.itemCount > 1 ? 's' : ''}</span>
           </div>
           <h2 className="text-2xl font-black">{saga.name}</h2>
        </div>
      </div>

      <div className="px-5 pb-5 flex gap-3">
         <div className="relative flex-1">
            <input 
              type="text" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="URL de la bannière (TMDB ou lien direct)..."
              className="w-full px-4 py-3 pr-10 rounded-xl text-xs focus:outline-none transition-all"
              style={{ background: "var(--deep-black)", border: "1px solid var(--surface-light)" }}
            />
            {url && (
              <button 
                onClick={() => setUrl("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
         </div>
         <button 
           disabled={!hasChanges || isSaving}
           onClick={() => onUpdate(url)}
           className={`px-6 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 disabled:opacity-50 ${hasChanges ? 'bg-gold text-deep-black' : 'bg-surface-light text-text-muted'}`}
         >
           {isSaving ? (
              <div className="w-4 h-4 border-2 border-deep-black border-t-transparent rounded-full animate-spin" />
           ) : saga.bannerUrl && !hasChanges ? (
             <><Check className="w-4 h-4" /> Enregistré</>
           ) : (
             <><Save className="w-4 h-4" /> Sauvegarder</>
           )}
         </button>
      </div>
    </motion.div>
  );
}

function X({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
