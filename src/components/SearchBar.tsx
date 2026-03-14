"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Search, X, Clapperboard, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ id: string; title: string; type: string; posterUrl: string; year: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((d) => setResults((d.results || []).slice(0, 5)))
      .catch(() => {})
      .finally(() => setSearching(false));
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const openSearch = () => {
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const closeSearch = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  const goToResult = (id: string) => {
    router.push(`/detail/${id}`);
    closeSearch();
  };

  const goToFullSearch = () => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      closeSearch();
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Ctrl+K shortcut
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) closeSearch();
        else openSearch();
      }
      if (e.key === "Escape" && isOpen) closeSearch();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  return (
    <div className="relative flex justify-end" ref={containerRef}>
      <motion.div
        layout
        initial={false}
        animate={{
          width: isOpen ? "300px" : "64px",
          backgroundColor: isOpen ? "rgba(20, 20, 20, 0.9)" : "transparent",
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`flex items-center overflow-hidden rounded-full ${
          isOpen ? "backdrop-blur-md shadow-lg shadow-black/50 bg-surface/80" : ""
        }`}
        style={{ height: "40px" }}
      >
        {/* The Search Icon / Trigger */}
        <button
          onClick={isOpen ? goToFullSearch : openSearch}
          className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
            isOpen ? "text-gold" : "text-text-secondary hover:text-white"
          }`}
          style={{ marginLeft: "24px" }}
        >
          <Search className="w-5 h-5" />
        </button>

        {/* The Input Field */}
        <AnimatePresence>
          {isOpen && (
            <motion.input
              ref={inputRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && goToFullSearch()}
              placeholder="Film, série, réalisateur..."
              className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted !outline-none !ring-0 border-none pr-3"
            />
          )}
        </AnimatePresence>

        {/* Clear/Close Button and Shortcut Hint */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center pr-3 gap-2 flex-shrink-0"
            >
              {query ? (
                <button
                  onClick={() => {
                    setQuery("");
                    setResults([]);
                    inputRef.current?.focus();
                  }}
                  className="rounded-full bg-surface-light p-1 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              ) : (
                <kbd className="hidden md:inline-block text-[10px] px-1.5 py-0.5 rounded bg-surface/80 border border-surface-light text-text-muted font-mono tracking-widest uppercase">
                  ESC
                </kbd>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick results dropdown */}
      <AnimatePresence>
        {isOpen && (results.length > 0 || searching) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-3 w-[340px] z-50 glass-card-strong overflow-hidden shadow-2xl"
            style={{ border: "1px solid rgba(198, 165, 92, 0.2)" }}
          >
            {searching ? (
              <div className="p-6 text-center text-text-muted text-sm flex flex-col items-center">
                <div className="w-6 h-6 border-2 border-gold/20 border-t-gold rounded-full animate-spin mb-3" />
                <span className="animate-pulse">Recherche dans le coffre...</span>
              </div>
            ) : (
              <div className="py-2">
                <div className="px-4 py-2 text-xs font-semibold text-text-muted uppercase tracking-wider">
                  Résultats suggérés
                </div>
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => goToResult(item.id)}
                    className="flex items-center gap-4 w-full px-4 py-2.5 hover:bg-white/5 transition-colors text-left group"
                  >
                    <div className="relative w-10 h-14 rounded overflow-hidden flex-shrink-0 bg-surface-light">
                      {item.posterUrl ? (
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          {item.type === "Movie" ? <Clapperboard className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-gold transition-colors">
                        {item.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-surface text-text-secondary border border-surface-light">
                          {item.type === "Movie" ? "Film" : "Série"}
                        </span>
                        <span className="text-xs text-text-muted font-medium">
                          {item.year || "Inconnu"}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
                
                <div className="px-3 pt-2 mt-2 border-t border-white/5">
                  <button
                    onClick={goToFullSearch}
                    className="w-full py-2.5 rounded-lg text-sm font-medium text-gold hover:bg-gold/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Search className="w-4 h-4" />
                    Voir tous les résultats
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
