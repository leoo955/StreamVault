"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Star, Bookmark, TrendingUp } from "lucide-react";
import Link from "next/link";

interface MediaItem {
  id: string;
  title: string;
  overview: string;
  year: number;
  runtime: number;
  genres: string[];
  type: "Movie" | "Series";
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  communityRating?: number;
  tagline?: string;
  saga?: string;
  dateAdded: string;
}

const POPULAR_SEARCHES = ["Marvel", "Star Wars", "One Piece", "Avengers", "Spider-Man", "Netflix", "Harry Potter"];

const GENRES = [
  "Action", "Aventure", "Animation", "Comédie",
  "Crime", "Documentaire", "Drame", "Familial",
  "Fantastique", "Histoire",
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const [query, setQuery] = useState(initialQuery);
  const [allItems, setAllItems] = useState<MediaItem[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all items on mount
  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        setAllItems(d.items || []);
        if (initialQuery) {
          filterItems(d.items || [], initialQuery);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filterItems = useCallback((items: MediaItem[], q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = items.filter(
      (i) =>
        i.title.toLowerCase().includes(lower) ||
        i.overview?.toLowerCase().includes(lower) ||
        i.genres.some((g) => g.toLowerCase().includes(lower)) ||
        i.saga?.toLowerCase().includes(lower)
    );
    setResults(filtered);
  }, []);

  useEffect(() => {
    filterItems(allItems, query);
  }, [query, allItems, filterItems]);

  const handleGenreClick = (genre: string) => {
    setQuery(genre);
    inputRef.current?.focus();
  };

  const hasResults = query.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[100] bg-deep-black overflow-y-auto">
      {/* Close button */}
      <button
        onClick={() => router.back()}
        className="fixed top-5 right-5 z-[110] w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
      >
        <X className="w-5 h-5 text-white" />
      </button>

      <div className="min-h-screen flex flex-col items-center px-4 pt-16 md:pt-24 pb-24">
        {/* ─── HERO TITLE ─── */}
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl font-black text-center mb-8"
        >
          Que regardons-nous{" "}
          <span
            style={{
              background: "linear-gradient(135deg, #FF6B35, #E53935, #C6A55C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            aujourd&apos;hui ?
          </span>
        </motion.h1>

        {/* ─── SEARCH BAR ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="w-full max-w-2xl relative mb-6"
        >
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Recherchez un film, une série, un animé..."
            className="w-full pl-14 pr-12 py-4 md:py-5 rounded-2xl text-base md:text-lg outline-none transition-all focus:ring-2 focus:ring-gold/40"
            style={{
              background: "rgba(30,30,30,0.8)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-primary)",
              backdropFilter: "blur(8px)",
            }}
            autoFocus
          />
          {query && (
            <button
              onClick={() => { setQuery(""); inputRef.current?.focus(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          )}
        </motion.div>

        {/* ─── CONTENT ─── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
            </div>
          ) : hasResults ? (
            /* ─── SEARCH RESULTS ─── */
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-7xl"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-text-muted mb-5">
                {results.length} résultat{results.length !== 1 ? "s" : ""} trouvé{results.length !== 1 ? "s" : ""}
              </p>

              {results.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
                  {results.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: Math.min(i * 0.03, 0.4) }}
                    >
                      <Link href={`/detail/${item.id}`}>
                        <div className="group relative rounded-xl overflow-hidden aspect-[2/3] cursor-pointer">
                          {item.posterUrl ? (
                            <img
                              src={item.posterUrl}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center" style={{ background: "var(--surface)" }}>
                              <span className="text-text-muted text-sm text-center px-2">{item.title}</span>
                            </div>
                          )}
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          {/* Info on hover */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                            <p className="text-xs font-bold text-white line-clamp-2">{item.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-text-muted">{item.year}</span>
                              {item.communityRating && (
                                <span className="flex items-center gap-0.5 text-[10px] text-gold">
                                  <Star className="w-2.5 h-2.5 fill-gold" />
                                  {item.communityRating.toFixed(1)}
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/70">
                                {item.type === "Movie" ? "Film" : "Série"}
                              </span>
                            </div>
                          </div>
                          {/* Rating badge */}
                          {item.communityRating && item.communityRating >= 7 && (
                            <div className="absolute top-2 left-2 flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
                              style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                              <Star className="w-2.5 h-2.5 fill-gold text-gold" />
                              <span className="text-gold">{item.communityRating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="w-16 h-16 text-text-muted/10 mx-auto mb-4" />
                  <p className="text-text-muted text-lg font-medium">Aucun résultat</p>
                  <p className="text-text-muted/50 text-sm mt-1">Essayez d&apos;autres mots-clés</p>
                </div>
              )}
            </motion.div>
          ) : (
            /* ─── DISCOVERY MODE ─── */
            <motion.div
              key="discovery"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl"
            >
              {/* Popular Searches */}
              <div className="text-center mb-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted mb-4">
                  Recherches Populaires
                </p>
                <div className="flex flex-wrap justify-center gap-2">
                  {POPULAR_SEARCHES.map((term) => (
                    <button
                      key={term}
                      onClick={() => setQuery(term)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:bg-white/10 hover:border-white/20"
                      style={{
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.03)",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Two column layout: Genres + Quick Access */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
                {/* Browse by Genre */}
                <div
                  className="md:col-span-3 p-5 rounded-2xl"
                  style={{ background: "rgba(20,20,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "var(--gold-glow)", color: "var(--gold)" }}>⊞</span>
                    Parcourir par Genre
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => handleGenreClick(genre)}
                        className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:bg-white/10"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.08)",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Access */}
                <div
                  className="md:col-span-2 p-5 rounded-2xl"
                  style={{ background: "rgba(20,20,20,0.6)", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-4">
                    Accès Rapide
                  </h3>
                  <div className="space-y-1">
                    <Link href="/">
                      <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <span className="text-sm text-text-secondary">Tout le catalogue</span>
                        <Search className="w-4 h-4 text-text-muted" />
                      </div>
                    </Link>
                    <Link href="/my-list">
                      <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <span className="text-sm text-text-secondary">Ma Watchlist</span>
                        <Bookmark className="w-4 h-4 text-text-muted" />
                      </div>
                    </Link>
                    <Link href="/trending">
                      <div className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                        <span className="text-sm text-text-secondary">Top 10</span>
                        <TrendingUp className="w-4 h-4 text-gold" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
