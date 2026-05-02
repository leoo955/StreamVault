"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MediaCard } from "@/components/MediaCard";
import { Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useUser } from "@/lib/userProvider";
import { getTmdbImage } from "@/lib/utils";

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
      <div className="min-h-screen w-full flex items-center justify-center bg-deep-black">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-accent animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-deep-black px-8 md:px-12 lg:px-20 py-32">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="title-section text-4xl md:text-5xl lg:text-6xl mb-4"
          >
            Séries
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 label-refined"
          >
            Découvrez vos séries préférées
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher une série..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-64"
            />
          </div>
          <button className="frost-effect p-2.5 rounded-full hover:bg-white/10 transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </div>

      {series.length === 0 ? (
        <EmptyState 
          title="Aucune série trouvée" 
          description="Votre bibliothèque de séries est actuellement vide."
          isAdmin={user?.role === 'admin'}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {filteredSeries.map((show, i) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <MediaCard 
                id={show.id} 
                title={show.title} 
                posterUrl={getTmdbImage(show.posterPath, "w500")} 
                accentColor="#EAB308"
                type="series"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
