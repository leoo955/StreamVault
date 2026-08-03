"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Tv, Loader2, ListPlus, X, Save, Layers } from "lucide-react";
import * as utils from "@/lib/utils";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminSeriesPage() {
  const router = useRouter();
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Bulk State
  const [bulkSeries, setBulkSeries] = useState<any>(null);
  const [bulkSeason, setBulkSeason] = useState(1);
  const [bulkLinks, setBulkLinks] = useState("");
  const [isBulkSaving, setIsBulkSaving] = useState(false);

  const fetchSeries = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/media?type=series");
      if (res.ok) {
        const data = await res.json();
        setSeries(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  const deleteSeries = async (id: string) => {
    if (!confirm("Supprimer cette série ?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) fetchSeries();
      else alert("Échec de la suppression");
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkSave = async () => {
    if (!bulkSeries || !bulkLinks.trim() || isBulkSaving) return;
    setIsBulkSaving(true);
    try {
      // 1. Ensure Season exists (or create it)
      const seasonsRes = await fetch(`/api/media/${bulkSeries.id}/seasons`);
      const seasons = await seasonsRes.json();
      let season = seasons.find((s: any) => s.number === bulkSeason);
      
      if (!season) {
        const createSeasonRes = await fetch(`/api/media/${bulkSeries.id}/seasons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ number: bulkSeason })
        });
        season = await createSeasonRes.json();
      }

      // 2. Parse links and add episodes
      const links = bulkLinks.split("\n").map(l => l.trim()).filter(l => l !== "");
      
      for (let i = 0; i < links.length; i++) {
        await fetch(`/api/media/${bulkSeries.id}/seasons/${season.id}/episodes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: i + 1,
            title: `Épisode ${i + 1}`,
            streamUrl: links[i]
          })
        });
      }

      setBulkSeries(null);
      setBulkLinks("");
      fetchSeries();
      alert(`${links.length} épisodes ajoutés avec succès !`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout en masse");
    } finally {
      setIsBulkSaving(false);
    }
  };

  const filtered = series.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="font-display font-light text-4xl text-white tracking-widest uppercase flex items-center gap-6">
            <Tv className="text-white/20" size={32} />
            Gestion Séries
          </h2>
          <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[9px] ml-14">
            Collections Épisodiques & Saisons
          </p>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white transition-colors" />
              <input 
                type="text" 
                placeholder="RECHERCHER..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-12 pr-6 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white/10 transition-all w-64 placeholder:text-white/5"
              />
           </div>
           <button onClick={() => router.push('/admin/media/add')} className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
              <Plus size={14} />
              Ajouter
           </button>
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Affiche</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Titre</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Saisons</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Année</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && series.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-white/20" size={24} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-white/10 font-bold uppercase tracking-widest text-xs">
                  Aucune série trouvée
                </td>
              </tr>
            ) : filtered.map((s) => (
              <tr key={s.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-4">
                  <div className="w-10 h-14 rounded-lg bg-white/5 overflow-hidden border border-white/5">
                    <img src={utils.getTmdbImage(s.posterPath, "w92")} className="w-full h-full object-cover" alt="" />
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{s.title}</div>
                  <div className="text-[9px] text-white/20 uppercase tracking-widest">{s.genres?.join(", ")}</div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-mono text-white/40">{s._count?.seasons || 0} Saisons</span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-mono text-white/40">{utils.getYear(s.releaseDate)}</span>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setBulkSeries(s)}
                      className="p-2 rounded-lg bg-white/[0.03] border border-white/5 text-white/20 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2 px-3"
                    >
                      <ListPlus size={14} />
                      <span className="text-[8px] font-black uppercase tracking-widest">Bulk Add</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all">
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteSeries(s.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Add Modal */}
      <AnimatePresence>
        {bulkSeries && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-xl bg-[#0C0C0C] border border-white/10 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setBulkSeries(null)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
                 <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-xl bg-white/5">
                    <img src={utils.getTmdbImage(bulkSeries.posterPath, "w185")} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-light text-white mb-2 uppercase tracking-wide">Import Massif</h3>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] line-clamp-1">{bulkSeries.title}</p>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <label className="label-refined text-white/20 text-[10px]">Numéro de la Saison</label>
                  <div className="relative">
                    <Layers className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input 
                      type="number"
                      min="1"
                      value={bulkSeason}
                      onChange={(e) => setBulkSeason(parseInt(e.target.value) || 1)}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-16 pr-8 py-5 text-white focus:outline-none focus:border-white/20 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="label-refined text-white/20 text-[10px]">Liste des liens (1 par ligne)</label>
                  <textarea 
                    autoFocus
                    value={bulkLinks}
                    onChange={(e) => setBulkLinks(e.target.value)}
                    placeholder="https://serveur.com/ep1.mp4&#10;https://serveur.com/ep2.mp4"
                    rows={8}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-6 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10 font-mono text-xs leading-relaxed"
                  />
                  <p className="text-[9px] text-white/15 font-medium leading-relaxed uppercase tracking-tight">
                    Chaque ligne sera convertie en un épisode (Épisode 1, Épisode 2, etc.).
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                   <button 
                    onClick={() => setBulkSeries(null)}
                    className="flex-1 px-8 py-5 rounded-2xl border border-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] hover:bg-white/[0.03] transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleBulkSave}
                    disabled={isBulkSaving || !bulkLinks.trim()}
                    className="flex-[2] bg-white text-black font-black uppercase text-[10px] tracking-widest py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  >
                    {isBulkSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Importer les épisodes
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

