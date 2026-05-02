"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Film, Loader2, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import * as utils from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Edit State
  const [editingMovie, setEditingMovie] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [streamUrl, setStreamUrl] = useState("");

  const fetchMovies = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/media?type=movie");
      if (res.ok) {
        const data = await res.json();
        setMovies(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const deleteMovie = async (id: string) => {
    if (!confirm("Supprimer ce film ?")) return;
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) fetchMovies();
      else alert("Échec de la suppression");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (movie: any) => {
    setEditingMovie(movie);
    setStreamUrl(movie.streamUrl || "");
  };

  const saveChanges = async () => {
    if (!editingMovie || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/media/${editingMovie.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ streamUrl }),
      });
      if (res.ok) {
        setEditingMovie(null);
        fetchMovies();
      } else {
        alert("Erreur lors de la sauvegarde");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = movies.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="font-display font-light text-4xl text-white tracking-widest uppercase flex items-center gap-6">
            <Film className="text-white/20" size={32} />
            Gestion Films
          </h2>
          <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[9px] ml-14">
            Base de données cinématographique
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
           <button className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
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
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Année</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Statut</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && movies.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <Loader2 className="animate-spin mx-auto text-white/20" size={24} />
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-white/10 font-bold uppercase tracking-widest text-xs">
                  Aucun média trouvé
                </td>
              </tr>
            ) : filtered.map((movie) => (
              <tr key={movie.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-4">
                  <div className="w-10 h-14 rounded-lg bg-white/5 overflow-hidden border border-white/5">
                    <img src={utils.getTmdbImage(movie.posterPath, "w92")} className="w-full h-full object-cover" alt="" />
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{movie.title}</div>
                  <div className="text-[9px] text-white/20 uppercase tracking-widest">{movie.genres?.join(", ")}</div>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-mono text-white/40">{utils.getYear(movie.releaseDate)}</span>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <div className={cn("w-1 h-1 rounded-full", movie.streamUrl ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]")} />
                    <span className={cn("text-[9px] font-bold uppercase tracking-widest", movie.streamUrl ? "text-green-500/60" : "text-red-500/60")}>
                      {movie.streamUrl ? "Prêt" : "Pas de lien"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(movie)}
                      className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteMovie(movie.id)}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editingMovie && (
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
                onClick={() => setEditingMovie(null)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
                 <div className="w-16 h-24 rounded-lg overflow-hidden border border-white/10 shrink-0 shadow-xl">
                    <img src={utils.getTmdbImage(editingMovie.posterPath, "w185")} className="w-full h-full object-cover" alt="" />
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-light text-white mb-2 uppercase tracking-wide">Configuration Vidéo</h3>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] line-clamp-1">{editingMovie.title}</p>
                 </div>
              </div>

              <div className="space-y-12">
                <div className="space-y-4">
                  <label className="label-refined text-white/20 text-[10px]">Lien de streaming (URL)</label>
                  <input 
                    autoFocus
                    type="text"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                    placeholder="https://serveur.com/film.mp4"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
                  />
                  <p className="text-[9px] text-white/15 font-medium leading-relaxed uppercase tracking-tight">
                    Le lecteur supporte les formats .mp4, .mkv et les flux HLS (.m3u8).
                  </p>
                </div>

                <div className="flex gap-4">
                   <button 
                    onClick={() => setEditingMovie(null)}
                    className="flex-1 px-8 py-5 rounded-2xl border border-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] hover:bg-white/[0.03] transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="flex-[2] bg-white text-black font-black uppercase text-[10px] tracking-widest py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Enregistrer
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
