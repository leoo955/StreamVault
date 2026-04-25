"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Clock, CheckCircle2, XCircle, Trash2, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n";

interface MediaRequest {
  id: string;
  title: string;
  type: "Movie" | "Series";
  tmdbId?: number;
  status: "PENDING" | "FULFILLED" | "REJECTED";
  note?: string;
  createdAt: string;
}

interface SearchResult {
  tmdbId: number;
  title: string;
  type: "Movie" | "Series";
  year: string;
  posterUrl: string;
  overview: string;
}

export default function RequestsPage() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (val: string) => {
    setSearchQuery(val);
    if (val.length < 2) {
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    setIsSearching(true);
    setSearchError(null);
    try {
      const res = await fetch(`/api/requests/search?q=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setSearchResults(data.results || []);
    } catch (error: any) {
      console.error("Search failed", error);
      setSearchError(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const submitRequest = async (item: SearchResult) => {
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: item.title,
          type: item.type,
          tmdbId: item.tmdbId
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setSearchQuery("");
        setSearchResults([]);
        fetchRequests();
      } else {
        const text = await res.text();
        console.error("Submission failed:", text);
        alert(`Erreur: ${text}`);
      }
    } catch (error) {
      console.error("Failed to submit request", error);
      alert("Erreur de connexion lors de la demande.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <main className="flex-1 p-8 pt-24 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-black mb-2 tracking-tight">DEMANDES</h1>
              <p className="text-text-muted">Partage tes idées, on les ajoute pour toi.</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn-gold flex items-center gap-2 group whitespace-nowrap"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              Nouvelle Demande
            </button>
          </header>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-white/5 animate-pulse" />)}
             </div>
          ) : requests.length === 0 ? (
             <div className="flex flex-col items-center justify-center pt-20 text-center">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                   <List className="w-10 h-10 text-white/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">Aucune demande trouvée</h3>
                <p className="text-text-muted mb-8">N'hésite pas à nous demander tes films et séries préférés.</p>
                <button onClick={() => setIsModalOpen(true)} className="px-6 py-2.5 rounded-xl glass-card hover:bg-white/10 transition-colors">
                   Faire une demande
                </button>
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map((req) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={req.id}
                  className="glass-card p-6 rounded-2xl relative group overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    {req.status === "PENDING" && <Clock className="w-5 h-5 text-gold animate-pulse" />}
                    {req.status === "FULFILLED" && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                    {req.status === "REJECTED" && <XCircle className="w-5 h-5 text-red-500" />}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                     <span className="px-2 py-0.5 rounded text-[10px] bg-white/10 uppercase tracking-widest font-bold text-text-muted">
                        {req.type === "Movie" ? "Film" : "Série"}
                     </span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-1 pr-8 truncate">{req.title}</h3>
                  <p className="text-xs text-text-muted mb-4">
                    Demandé le {new Date(req.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                  </p>

                  {req.note && (
                    <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-text-secondary italic">
                      &quot;{req.note}&quot;
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 h-1 bg-gold transition-all duration-500" 
                       style={{ width: req.status === "FULFILLED" ? "100%" : req.status === "PENDING" ? "30%" : "100%" }} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-surface border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-8 pb-4">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black">QU'EST-CE QU'ON AJOUTE ?</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-white/10">
                    <Trash2 className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Chercher un film ou une série..."
                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto px-8 pb-8 custom-scrollbar">
                {isSearching ? (
                  <div className="flex flex-col items-center py-10 gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-gold border-t-transparent animate-spin" />
                    <p className="text-sm text-text-muted italic">Récupération des données...</p>
                  </div>
                ) : searchError ? (
                  <div className="py-10 text-center text-red-500/80 bg-red-500/5 rounded-2xl border border-red-500/10">
                    <p className="text-sm font-bold mb-1">Oups ! Une erreur est survenue</p>
                    <p className="text-xs opacity-70">{searchError}</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-4">
                     {searchResults.map((item) => (
                        <div 
                          key={item.tmdbId}
                          onClick={() => submitRequest(item)}
                          className="flex gap-4 p-3 rounded-2xl hover:bg-white/5 transition-all cursor-pointer group border border-transparent hover:border-white/10"
                        >
                          <div className="w-16 h-24 rounded-lg overflow-hidden bg-white/5 shrink-0 shadow-lg">
                            {item.posterUrl ? (
                              <img src={item.posterUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-700">NO IMG</div>
                            )}
                          </div>
                          <div className="flex-1 py-1">
                            <h4 className="font-bold text-lg group-hover:text-gold transition-colors">{item.title}</h4>
                            <div className="flex items-center gap-2 text-xs text-text-muted mt-1 uppercase tracking-wider font-semibold">
                              <span>{item.type === "Movie" ? "Film" : "Série"}</span>
                              {item.year && <span>• {item.year}</span>}
                            </div>
                            <p className="text-[11px] text-text-secondary line-clamp-2 mt-2 leading-relaxed">{item.overview}</p>
                          </div>
                          <div className="flex items-center">
                            <Plus className="w-6 h-6 text-gold opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                     ))}
                  </div>
                ) : searchQuery.length > 2 ? (
                  <div className="py-10 text-center text-text-muted italic">
                    Aucun résultat pour &quot;{searchQuery}&quot;
                  </div>
                ) : (
                   <div className="py-20 text-center">
                      <p className="text-sm text-text-muted">Commence à taper le titre pour voir les suggestions.</p>
                   </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
