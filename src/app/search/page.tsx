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
    setQuery(e.target.value);
    setIsSearching(e.target.value.length > 0);
  };

  return (
    <div className="min-h-screen w-full bg-deep-black px-8 md:px-12 lg:px-20 py-32">
      
      {/* Search Input Section */}
      <div className="max-w-4xl mx-auto mb-20">
        <div className="relative group">
          <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-white/20 group-focus-within:text-accent transition-colors duration-500" />
          <input 
            type="text" 
            value={query}
            onChange={handleSearch}
            placeholder="Rechercher un film, une série, un acteur..." 
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-6 pl-16 pr-16 text-xl md:text-2xl font-display font-light focus:outline-none focus:border-white/20 focus:bg-white/[0.07] transition-all placeholder:text-white/10"
            autoFocus
          />
          {query && (
            <button 
              onClick={() => setQuery("")}
              className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6 text-white/40" />
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isSearching ? (
          <motion.div 
            key="suggestions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16"
          >
            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <TrendingUp className="w-5 h-5 text-accent" />
                <h3 className="label-refined text-white">Recherches populaires</h3>
              </div>
              <div className="flex flex-wrap gap-3">
                {TRENDING_SEARCHES.map(term => (
                  <button 
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-5 py-2.5 rounded-full bg-white/5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-all text-sm text-white/60 hover:text-white"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <History className="w-5 h-5 text-white/40" />
                <h3 className="label-refined text-white">Historique récent</h3>
              </div>
              <div className="space-y-4">
                {["Inception", "Blade Runner"].map(term => (
                  <div key={term} className="flex items-center justify-between group cursor-pointer">
                    <span className="text-white/40 group-hover:text-white transition-colors">{term}</span>
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all">
                      <X className="w-4 h-4" />
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
            className="space-y-12"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <h2 className="text-white/40 label-refined">
                Résultats pour <span className="text-white">"{query}"</span>
              </h2>
              <span className="text-white/20 text-xs uppercase tracking-widest">{MOCK_RESULTS.length} résultats trouvés</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
              {MOCK_RESULTS.map((movie, i) => (
                <MediaCard 
                  key={movie.id}
                  id={movie.id} 
                  title={movie.title} 
                  posterUrl={movie.poster} 
                  accentColor={movie.color}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
