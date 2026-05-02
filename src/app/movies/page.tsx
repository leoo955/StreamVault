"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MediaCard } from "@/components/MediaCard";
import { Search, Filter } from "lucide-react";
import { EmptyState } from "@/components/EmptyState";
import { useUser } from "@/lib/userProvider";
import { getTmdbImage } from "@/lib/utils";

export default function MoviesPage() {
  const { user } = useUser();
  const [movies, setMovies] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await fetch("/api/media?type=movie");
        if (res.ok) {
          const data = await res.json();
          setMovies(data);
        }
      } catch (err) {
        console.error("Failed to fetch movies", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const filteredMovies = movies.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            Films
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-white/40 label-refined"
          >
            Explorez votre bibliothèque de films
          </motion.p>
        </div>

        {/* Filters & Search */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-hover:text-white/60 transition-colors" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
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

      {movies.length === 0 ? (
        <EmptyState 
          title="Aucun film trouvé" 
          description="Vous n'avez pas encore ajouté de films à votre bibliothèque."
          isAdmin={user?.role === 'admin'}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {filteredMovies.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <MediaCard 
                id={movie.id} 
                title={movie.title} 
                posterUrl={getTmdbImage(movie.posterPath, "w500")} 
                accentColor="#EAB308"
                type="movie"
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
