"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Film, Tv, X, SlidersHorizontal, Clock, TrendingUp, Star } from "lucide-react";
import MediaCard from "@/components/MediaCard";

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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [allItems, setAllItems] = useState<MediaItem[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"" | "Movie" | "Series">("");
  const [genreFilter, setGenreFilter] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "year" | "recent">("relevance");
  const [showFilters, setShowFilters] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load all items + recent searches on mount
  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        setAllItems(d.items || []);
        if (initialQuery) {
          filterItems(d.items || [], initialQuery, typeFilter, genreFilter, sortBy);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Load recent searches from localStorage
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch {}
  }, []);

  const filterItems = useCallback(
    (items: MediaItem[], q: string, type: string, genre: string, sort: string) => {
      let filtered = [...items];

      // Text search
      if (q.trim()) {
        const lower = q.toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.title.toLowerCase().includes(lower) ||
            i.overview?.toLowerCase().includes(lower) ||
            i.genres.some((g) => g.toLowerCase().includes(lower)) ||
            i.saga?.toLowerCase().includes(lower)
        );
      }

      // Type filter
      if (type) {
        filtered = filtered.filter((i) => i.type === type);
      }

      // Genre filter
      if (genre) {
        filtered = filtered.filter((i) => i.genres.includes(genre));
      }

      // Sort
      switch (sort) {
        case "rating":
          filtered.sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0));
          break;
        case "year":
          filtered.sort((a, b) => b.year - a.year);
          break;
        case "recent":
          filtered.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
          break;
        default:
          // relevance = default order when no query, otherwise text-match order
          break;
      }

      setResults(filtered);
    },
    []
  );

  // Instant search — filter on every keystroke
  useEffect(() => {
    filterItems(allItems, query, typeFilter, genreFilter, sortBy);
  }, [query, typeFilter, genreFilter, sortBy, allItems, filterItems]);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(0, 8);
    setRecentSearches(updated);
    try { localStorage.setItem("recentSearches", JSON.stringify(updated)); } catch {}
  };

  const clearRecent = () => {
    setRecentSearches([]);
    try { localStorage.removeItem("recentSearches"); } catch {}
  };

  // Get genres from actual data
  const availableGenres = [...new Set(allItems.flatMap((i) => i.genres))].sort();

  // Trending: top rated items for discovery when no search
  const trending = [...allItems]
    .sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0))
    .slice(0, 12);

  // Recently added for discovery
  const recentlyAdded = [...allItems]
    .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
    .slice(0, 6);

  const hasActiveSearch = query.trim() || typeFilter || genreFilter;

  const toNormalized = (item: MediaItem) => ({
    ...item,
    rating: 0,
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: 0,
    logoUrl: undefined,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pt-24 pb-20 px-4 md:px-8"
    >
      {/* ─── SEARCH HEADER ─── */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-2xl font-bold mb-6">Recherche</h1>

        {/* Search Input */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-gold transition-colors" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && query.trim()) saveSearch(query.trim());
            }}
            placeholder="Titre, genre, saga..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl text-base outline-none transition-all focus:ring-2 focus:ring-gold/30"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-light)",
              color: "var(--text-primary)",
            }}
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {query && (
              <button
                onClick={() => { setQuery(""); inputRef.current?.focus(); }}
                className="p-1.5 rounded-lg hover:bg-surface-light transition-colors"
              >
                <X className="w-4 h-4 text-text-muted" />
              </button>
            )}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-1.5 rounded-lg transition-colors ${showFilters ? "bg-gold/10 text-gold" : "hover:bg-surface-light text-text-muted"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── FILTERS PANEL ─── */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div
                className="mt-3 p-4 rounded-xl space-y-4"
                style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
              >
                {/* Type filter */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Type</p>
                  <div className="flex gap-2">
                    {[
                      { value: "" as const, label: "Tout", icon: null },
                      { value: "Movie" as const, label: "Films", icon: Film },
                      { value: "Series" as const, label: "Séries", icon: Tv },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setTypeFilter(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          typeFilter === value
                            ? "text-deep-black font-bold"
                            : "text-text-secondary hover:bg-surface-light"
                        }`}
                        style={typeFilter === value ? { background: "var(--gold)" } : { background: "var(--deep-black)" }}
                      >
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Genre filter */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Genre</p>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setGenreFilter("")}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        !genreFilter ? "bg-gold/20 text-gold" : "text-text-muted hover:text-text-secondary"
                      }`}
                      style={!genreFilter ? {} : { background: "var(--deep-black)" }}
                    >
                      Tous
                    </button>
                    {availableGenres.map((g) => (
                      <button
                        key={g}
                        onClick={() => setGenreFilter(genreFilter === g ? "" : g)}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                          genreFilter === g
                            ? "bg-gold/20 text-gold border border-gold/30"
                            : "text-text-muted hover:text-text-secondary"
                        }`}
                        style={genreFilter !== g ? { background: "var(--deep-black)" } : {}}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Trier par</p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "relevance" as const, label: "Pertinence", icon: Search },
                      { value: "rating" as const, label: "Note", icon: Star },
                      { value: "year" as const, label: "Année", icon: Clock },
                      { value: "recent" as const, label: "Ajouté récemment", icon: TrendingUp },
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setSortBy(value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          sortBy === value
                            ? "bg-gold/15 text-gold border border-gold/20"
                            : "text-text-muted hover:text-text-secondary"
                        }`}
                        style={sortBy !== value ? { background: "var(--deep-black)" } : {}}
                      >
                        <Icon className="w-3 h-3" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── CONTENT ─── */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        </div>
      ) : hasActiveSearch ? (
        /* ─── SEARCH RESULTS ─── */
        <div className="max-w-7xl mx-auto">
          {/* Active filters summary */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-text-secondary text-sm">
              <span className="text-text-primary font-bold">{results.length}</span> résultat{results.length !== 1 ? "s" : ""}
              {query && <span className="text-text-muted"> pour &quot;{query}&quot;</span>}
            </p>
            {(typeFilter || genreFilter) && (
              <div className="flex items-center gap-2">
                {typeFilter && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold/10 text-gold">
                    {typeFilter === "Movie" ? "Films" : "Séries"}
                    <button onClick={() => setTypeFilter("")} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
                {genreFilter && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-gold/10 text-gold">
                    {genreFilter}
                    <button onClick={() => setGenreFilter("")} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {results.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {results.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.5) }}
                >
                  <MediaCard item={toNormalized(item)} index={i} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-text-muted/20 mx-auto mb-4" />
              <p className="text-text-muted text-lg font-medium">Aucun résultat</p>
              <p className="text-text-muted/60 text-sm mt-1">Essayez d&apos;autres mots-clés ou filtres</p>
            </div>
          )}
        </div>
      ) : (
        /* ─── DISCOVERY MODE (no active search) ─── */
        <div className="max-w-7xl mx-auto space-y-10">

          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-text-muted" />
                  <h3 className="text-sm font-bold text-text-muted">Recherches récentes</h3>
                </div>
                <button onClick={clearRecent} className="text-xs text-text-muted hover:text-gold transition-colors">
                  Effacer
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    onClick={() => { setQuery(term); saveSearch(term); }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm transition-all hover:bg-surface-light"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                  >
                    <Clock className="w-3 h-3 text-text-muted" />
                    {term}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Browse by Genre */}
          <section>
            <h3 className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Explorer par genre
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableGenres.slice(0, 10).map((genre) => {
                const genreItem = allItems.find((i) => i.genres.includes(genre) && i.backdropUrl);
                const count = allItems.filter((i) => i.genres.includes(genre)).length;
                return (
                  <button
                    key={genre}
                    onClick={() => { setGenreFilter(genre); setShowFilters(false); }}
                    className="relative h-24 rounded-xl overflow-hidden group cursor-pointer"
                  >
                    {genreItem?.backdropUrl ? (
                      <img
                        src={genreItem.backdropUrl}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="absolute inset-0" style={{ background: "var(--surface)" }} />
                    )}
                    <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-sm font-bold">{genre}</span>
                      <span className="text-[10px] text-text-muted mt-0.5">{count} titres</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Trending */}
          {trending.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tendances
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {trending.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <MediaCard item={toNormalized(item)} index={i} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Recently Added */}
          {recentlyAdded.length > 0 && (
            <section>
              <h3 className="text-sm font-bold text-text-muted mb-3 flex items-center gap-2">
                <Star className="w-4 h-4" />
                Ajoutés récemment
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {recentlyAdded.map((item, i) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <MediaCard item={toNormalized(item)} index={i} />
                  </motion.div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </motion.div>
  );
}
