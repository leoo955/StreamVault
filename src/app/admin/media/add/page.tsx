"use client";

import React, { useState } from "react";
import { Search, Film, Tv, Plus, Loader2, Check, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import * as utils from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function AdminAddMediaPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [type, setType] = useState<"movie" | "tv">("movie");
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<number[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}&type=${type}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const addMedia = async (item: any) => {
    setAddingId(item.id);
    try {
      // 1. Fetch full details from TMDB to get all genres/runtime
      const detailsRes = await fetch(`/api/tmdb/details?id=${item.id}&type=${type}`);
      const details = await detailsRes.json();

      // 2. Create in local DB
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tmdbId: item.id,
          type: type === "movie" ? "movie" : "series",
          title: details.title || details.name,
          description: details.overview,
          posterPath: details.poster_path,
          backdropPath: details.backdrop_path,
          releaseDate: details.release_date || details.first_air_date,
          genres: details.genres?.map((g: any) => g.name) || [],
          voteAverage: details.vote_average,
          runtime: details.runtime || (details.episode_run_time ? details.episode_run_time[0] : 0),
        }),
      });

      if (res.ok) {
        setAddedIds(prev => [...prev, item.id]);
      } else {
        const err = await res.json();
        alert(err.error || "Erreur lors de l'ajout");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-3 text-white/30 hover:text-white transition-colors uppercase font-black text-[10px] tracking-widest"
        >
          <ArrowLeft size={14} />
          Retour
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-display font-light text-4xl md:text-5xl text-white tracking-widest uppercase">
          Importer un Média
        </h2>
        <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[9px]">
          Recherche & Synchronisation via TMDB
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white/[0.02] border border-white/5 p-10 rounded-[2.5rem] space-y-10">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-6">
          <div className="flex bg-black rounded-2xl border border-white/5 p-1">
             <button 
               type="button"
               onClick={() => setType("movie")}
               className={`flex-1 flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === "movie" ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white/40"}`}
             >
               <Film size={14} />
               Films
             </button>
             <button 
               type="button"
               onClick={() => setType("tv")}
               className={`flex-1 flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${type === "tv" ? "bg-white text-black shadow-xl" : "text-white/20 hover:text-white/40"}`}
             >
               <Tv size={14} />
               Séries
             </button>
          </div>

          <div className="flex-1 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder={type === "movie" ? "TITRE DU FILM..." : "NOM DE LA SÉRIE..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-black border border-white/5 rounded-2xl py-4 pl-16 pr-8 text-xs font-bold tracking-widest text-white focus:outline-none focus:border-white/10 transition-all placeholder:text-white/5 uppercase"
            />
          </div>

          <button 
            type="submit"
            disabled={isSearching}
            className="bg-white text-black px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {isSearching ? <Loader2 className="animate-spin" size={16} /> : <Search size={16} />}
            Chercher
          </button>
        </form>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
        <AnimatePresence>
          {results.map((item, i) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="group flex flex-col gap-4"
            >
              <div className="relative aspect-[2/3] rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden transition-all duration-700 group-hover:scale-[1.02] group-hover:border-white/20">
                <img 
                  src={utils.getTmdbImage(item.poster_path, "w342")} 
                  className="w-full h-full object-cover" 
                  alt="" 
                />
                
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center gap-6 backdrop-blur-[2px]">
                   <p className="text-[10px] text-white/60 font-medium leading-relaxed line-clamp-4 uppercase tracking-tighter">
                     {item.overview}
                   </p>
                   
                   {addedIds.includes(item.id) ? (
                     <div className="flex items-center gap-2 text-green-500">
                        <Check size={16} />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]">Ajouté</span>
                     </div>
                   ) : (
                     <button 
                       onClick={() => addMedia(item)}
                       disabled={addingId === item.id}
                       className="bg-white text-black w-full py-3 rounded-xl font-black uppercase tracking-widest text-[9px] flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                     >
                       {addingId === item.id ? <Loader2 className="animate-spin" size={12} /> : <Plus size={12} />}
                       Importer
                     </button>
                   )}
                </div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-white/80 group-hover:text-white transition-colors uppercase tracking-tight line-clamp-1">
                  {item.title || item.name}
                </div>
                <div className="text-[9px] text-white/20 font-black uppercase tracking-widest">
                  {utils.getYear(item.release_date || item.first_air_date)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {results.length === 0 && !isSearching && query && (
        <div className="py-20 text-center text-white/10 font-black uppercase tracking-[0.4em] text-xs">
          Aucun résultat correspondant
        </div>
      )}
    </div>
  );
}
