"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, X, TrendingUp, History } from "lucide-react";
import { MediaCard } from "@/components/MediaCard";

const TRENDING_SEARCHES = [
  "Dune: Part Two",
  "The Last of Us",
  "Oppenheimer",
  "Arcane Season 2",
  "Interstellar",
  "The Bear"
];

const MOCK_RESULTS = [
  { id: "1", title: "Dune: Part Two", poster: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/8b8R8l88Qje9dn9OE8v03xP5X2h.jpg", color: "#B66A42" },
  { id: "5", title: "Interstellar", poster: "https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", color: "#3B82F6" },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setIsSearching(val.length > 0);
  };

  return (
    <div className="min-h-screen w-full bg-black px-8 md:px-12 lg:px-20 py-32 selection:bg-white selection:text-black">
      
      {/* Search Input Section */}
      <div className="max-w-4xl mx-auto mb-28">
        <div className="relative group">
          <SearchIcon className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-6 text-white/10 group-focus-within:text-white transition-colors duration-700" />
          <input 
            type="text" 
            value={query}
            onChange={handleSearch}
            placeholder="RECHERCHER UN FILM, UNE SÉRIE..." 
            className="w-full bg-white/[0.02] border border-white/5 rounded-3xl py-8 pl-20 pr-20 text-2xl md:text-3xl font-display font-light tracking-wide focus:outline-none focus:border-white/10 focus:bg-white/[0.04] transition-all duration-700 placeholder:text-white/5 uppercase"
            autoFocus
          />
          <AnimatePresence>
            {query && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => { setQuery(""); setIsSearching(false); }}
                className="absolute right-8 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-6 h-6 text-white/20" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div 
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-24"
          >
            {/* Trending Searches */}
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/30">Tendances</h3>
              </div>
              <div className="flex flex-wrap gap-4">
                {TRENDING_SEARCHES.map(term => (
                  <button 
                    key={term}
                    onClick={() => { setQuery(term); setIsSearching(true); }}
                    className="px-6 py-3 rounded-2xl bg-white/[0.03] border border-white/5 hover:border-white/20 hover:bg-white/[0.06] transition-all duration-500 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div className="space-y-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/30">Historique</h3>
              </div>
              <div className="flex flex-col gap-4">
                {["Inception", "Blade Runner"].map(term => (
                  <div key={term} className="flex items-center justify-between group cursor-pointer p-4 rounded-2xl hover:bg-white/[0.02] transition-all duration-500">
                    <div className="flex items-center gap-4">
                       <History size={14} className="text-white/10 group-hover:text-white/40 transition-colors" />
                       <span className="text-sm font-medium tracking-wide text-white/20 group-hover:text-white/60 transition-colors">{term}</span>
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 p-2 hover:text-white transition-all">
                      <X className="w-4 h-4 text-white/20" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-8">
              <h2 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/20">
                RÉSULTATS POUR <span className="text-white/60 ml-2">"{query.toUpperCase()}"</span>
              </h2>
              <span className="text-white/10 text-[9px] font-bold uppercase tracking-[0.2em]">{MOCK_RESULTS.length} ITEMS</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-10">
              {MOCK_RESULTS.map((movie, i) => (
                <MediaCard 
                  key={movie.id}
                  id={movie.id} 
                  title={movie.title} 
                  posterUrl={movie.poster} 
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
