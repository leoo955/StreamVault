"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MediaCard } from "@/components/MediaCard";
import { Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useUser } from "@/lib/userProvider";
import * as utils from "@/lib/utils";

export default function SeriesPage() {
  const { user } = useUser();
  const [series, setSeries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const res = await fetch("/api/media?type=series");
        if (res.ok) {
          const data = await res.json();
          setSeries(data);
        }
      } catch (err) {
        console.error("Failed to fetch series", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeries();
  }, []);

  const filteredSeries = series.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black px-8 md:px-12 lg:px-20 py-32 selection:bg-white selection:text-black">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-24">
        <div className="space-y-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display font-light text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.1em] uppercase"
          >
            Séries
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.4 }}
            className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white"
          >
            Collections Épisodiques
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-white transition-colors duration-500" />
            <input 
              type="text" 
              placeholder="RECHERCHER..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/[0.03] border border-white/5 rounded-2xl py-4 pl-14 pr-8 text-[11px] font-bold tracking-widest focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all duration-700 w-72 placeholder:text-white/10"
            />
          </div>
          <button onClick={() => alert('Filtres à venir')} className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/30 hover:text-white hover:border-white/20 hover:bg-white/[0.06] transition-all duration-700">            <Filter size={20} />
          </button>
        </div>
      </div>

      {series.length === 0 ? (
        <EmptyState 
          title="Le catalogue est vide" 
          description="Votre bibliothèque de séries est prête à accueillir de nouvelles aventures."
          isAdmin={user?.role === 'admin'}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-8 md:gap-10 pb-32">
          {filteredSeries.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <MediaCard 
                id={show.id} 
                title={show.title} 
                posterUrl={utils.getTmdbImage(show.posterPath, "w500")} 
                type="series"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
