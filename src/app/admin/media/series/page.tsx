"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit3, Tv, Loader2 } from "lucide-react";
import * as utils from "@/lib/utils";

export default function AdminSeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

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
    </div>
  );
}
