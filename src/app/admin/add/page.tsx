"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Film, Tv, Plus, Link as LinkIcon,
  Image as ImageIcon, Search, Sparkles, X, Trash2, ChevronDown, ChevronUp, DivideCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { NormalizedPerson } from "@/lib/db";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const GENRE_OPTIONS = [
  "Action", "Aventure", "Comédie", "Crime", "Documentaire", "Drame",
  "Fantastique", "Horreur", "Historique", "Mystère",
  "Romance", "Science-Fiction", "Thriller", "Guerre", "Animation",
];

const LANGUAGE_OPTIONS = [
  "Français", "English", "Español", "Deutsch", "Italiano",
  "Português", "日本語", "한국어", "中文", "العربية",
  "हिन्दी", "Русский", "Türkçe", "Nederlands", "Polski",
];

// Map country names to likely languages
const COUNTRY_TO_LANG: Record<string, string[]> = {
  "united states": ["English"],
  "united kingdom": ["English"],
  "canada": ["English", "Français"],
  "france": ["Français"],
  "germany": ["Deutsch"],
  "spain": ["Español"],
  "italy": ["Italiano"],
  "brazil": ["Português"],
  "portugal": ["Português"],
  "japan": ["日本語"],
  "south korea": ["한국어"],
  "china": ["中文"],
  "india": ["हिन्दी", "English"],
  "russia": ["Русский"],
  "turkey": ["Türkçe"],
  "mexico": ["Español"],
  "argentina": ["Español"],
  "australia": ["English"],
  "belgium": ["Français", "Nederlands"],
};

function guessLanguages(country: string): string[] {
  if (!country) return [];
  const parts = country.toLowerCase().split(",").map((s) => s.trim());
  const langs = new Set<string>();
  for (const part of parts) {
    const match = COUNTRY_TO_LANG[part];
    if (match) match.forEach((l) => langs.add(l));
  }
  return Array.from(langs);
}

interface Episode {
  number: number;
  title: string;
  streamUrl: string;
  runtime: number;
}

interface Season {
  number: number;
  episodes: Episode[];
}

interface TmdbResult {
  tmdbId: number;
  title: string;
  year: string;
  overview: string;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  runtime: number;
  genres: string[];
  country: string;
  moviedbId?: number;
}

export default function AddMediaPage() {
  const isAdmin = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // TMDB search
  const [tmdbResults, setTmdbResults] = useState<TmdbResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [searchMode, setSearchMode] = useState<"Movie" | "Series" | "Anime">("Movie");

  const [form, setForm] = useState({
    title: "",
    type: "Movie" as "Movie" | "Series" | "Anime",
    streamUrl: "",
    posterUrl: "",
    backdropUrl: "",
    overview: "",
    year: new Date().getFullYear(),
    runtime: 0,
    genres: [] as string[],
    communityRating: 0,
    tagline: "",
    studios: [] as string[],
    languages: [] as string[],
    seasons: [] as Season[],
    saga: "",
    moviedbId: undefined as number | undefined,
    director: "",
    cast: [] as NormalizedPerson[],
    subtitles: [] as { lang: string; url: string }[],
  });

  const [linkResults, setLinkResults] = useState<{provider: string, url: string, quality: string, type: string}[]>([]);
  const [findingLinks, setFindingLinks] = useState(false);

  const [bulkAddModal, setBulkAddModal] = useState<{isOpen: boolean, seasonNum: number, text: string}>({ isOpen: false, seasonNum: 0, text: "" });

  // Pre-fill streamUrl from query param (used by Chrome extension)
  useEffect(() => {
    const urlStreamUrl = searchParams.get("streamUrl");
    if (urlStreamUrl) {
      setForm(prev => ({ ...prev, streamUrl: urlStreamUrl }));
    }
  }, [searchParams]);

  const [studioInput, setStudioInput] = useState("");
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // TMDB auto-search when title changes
  const handleTitleChange = (value: string) => {
    setForm((p) => ({ ...p, title: value }));

    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (value.length < 2) {
      setTmdbResults([]);
      setShowResults(false);
      return;
    }

    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const apiUrl = searchMode === "Anime"
          ? `/api/anime/search?q=${encodeURIComponent(value)}`
          : `/api/tmdb/search?q=${encodeURIComponent(value)}&type=${searchMode === "Series" ? "tv" : "movie"}`;
        
        const res = await fetch(apiUrl);
        const data = await res.json();
        if (data.results) {
          setTmdbResults(data.results);
          setShowResults(true);
        }
      } catch {}
      setSearching(false);
    }, 500);
  };

  // Load existing media to auto-detect sagas
  const [existingMedia, setExistingMedia] = useState<{ title: string; saga?: string }[]>([]);
  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => setExistingMedia((d.items || []).filter((i: any) => i.saga)))
      .catch(() => {});
  }, []);

  // Auto-detect saga from TMDB keywords or existing media
  const detectSaga = (title: string, keywords: string[] = []): string => {
    // 0. Check TMDB keywords for exact saga/collection tags
    for (const kw of keywords) {
      const lower = kw.toLowerCase();
      if (lower.includes("collection") || lower.includes("universe")) {
        // Format nicely: "marvel cinematic universe (mcu)" -> "Marvel Cinematic Universe (MCU)"
        return kw
          .split(" ")
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
          .replace(/Mcu/i, "MCU")
          .replace(/Dceu/i, "DCEU");
      }
    }

    if (!title || existingMedia.length === 0) return "";
    const titleWords = title.toLowerCase().split(/[\s:,\-–']+/).filter((w) => w.length > 2);
    
    // 1. Built-in "Magic" Dictionary for famous sagas
    const FAMOUS_SAGAS: Record<string, string[]> = {
      "Marvel Cinematic Universe (MCU)": ["iron man", "avengers", "thor", "captain america", "hulk", "black panther", "doctor strange", "spider-man", "ant-man", "guardians of the galaxy", "wolverine", "deadpool"],
      "Star Wars": ["star wars", "jedi", "sith", "mandalorian", "boba fett", "andor", "rogue one", "clone wars", "luke skywalker"],
      "Harry Potter": ["harry potter", "fantastic beasts", "animaux fantastiques"],
      "DC Universe": ["batman", "superman", "wonder woman", "justice league", "aquaman", "flash", "joker", "harley quinn", "suicide squad"],
      "Le Seigneur des Anneaux": ["lord of the rings", "seigneur des anneaux", "hobbit", "rings of power"],
      "Fast & Furious": ["fast and furious", "fast & furious", "hobbs and shaw"],
      "Matrix": ["matrix", "reloaded", "revolutions", "resurrections"],
      "Jurassic Park": ["jurassic park", "jurassic world"],
      "X-Men": ["x-men", "wolverine", "deadpool", "apocalypse", "days of future past"],
      "Mission Impossible": ["mission impossible", "mission: impossible"],
      "James Bond": ["james bond", "casino royale", "skyfall", "spectre", "no time to die", "quantum of solace", "goldeneye"],
      "Transformers": ["transformers", "bumblebee"],
      "Hunger Games": ["hunger games", "catching fire", "mockingjay", "songbirds and snakes"],
      "Twilight": ["twilight", "new moon", "eclipse", "breaking dawn"],
      "Pirates des Caraïbes": ["pirates of the caribbean", "pirates des caraïbes"],
    };

    const titleLower = title.toLowerCase();
    for (const [sagaName, keywords] of Object.entries(FAMOUS_SAGAS)) {
      if (keywords.some((kw) => titleLower.includes(kw))) {
        return sagaName;
      }
    }

    // 2. Fallback: match with user's existing combinations
    let bestMatch = "";
    let bestScore = 0;
    for (const item of existingMedia) {
      if (!item.saga) continue;
      const itemWords = item.title.toLowerCase().split(/[\s:,\-–']+/).filter((w) => w.length > 2);
      const common = titleWords.filter((w) => itemWords.includes(w)).length;
      if (common > bestScore) {
        bestScore = common;
        bestMatch = item.saga;
      }
    }
    return bestScore >= 1 ? bestMatch : "";
  };

  // Fill form from search result
  const selectTmdbResult = async (result: TmdbResult) => {
    let fetchedKeywords: string[] = [];
    if (result.moviedbId) {
      try {
        const kRes = await fetch(`/api/tmdb/keywords?tmdbId=${result.moviedbId}`);
        const kData = await kRes.json();
        fetchedKeywords = kData.keywords || [];
      } catch (e) {}
    }

    const autoSaga = detectSaga(result.title, fetchedKeywords);

    let director = "";
    let cast: any[] = [];
    let fetchedSeasons: any[] = [];
    try {
      const cRes = await fetch(`/api/tmdb/credits?tmdbId=${result.tmdbId}&type=${searchMode === "Series" ? "tv" : "movie"}`);
      const cData = await cRes.json();
      director = cData.director || "";
      cast = cData.cast || [];

      if (searchMode === "Series" || searchMode === "Anime") {
         const autoId = result.tmdbId; // Note: api/tmdb/search maps imdb_id -> tmdbId
         const dbId = result.moviedbId || "";
         const sRes = await fetch(`/api/tmdb/seasons?id=${autoId}&tmdbId=${dbId}`);
         const sData = await sRes.json();
         if (sData.seasons) fetchedSeasons = sData.seasons;
      }
    } catch (e) {}

    setForm((p) => ({
      ...p,
      title: result.title,
      overview: result.overview || p.overview,
      year: parseInt(result.year) || p.year,
      posterUrl: result.posterUrl || p.posterUrl,
      backdropUrl: result.backdropUrl || p.backdropUrl,
      communityRating: Math.round(result.rating * 10) / 10 || p.communityRating,
      runtime: result.runtime || p.runtime,
      genres: result.genres?.length > 0 ? result.genres : p.genres,
      languages: result.country ? guessLanguages(result.country) : p.languages,
      saga: autoSaga || p.saga,
      moviedbId: result.moviedbId || p.moviedbId,
      director: director || p.director,
      cast: cast.length > 0 ? cast : p.cast,
      seasons: fetchedSeasons.length > 0 ? fetchedSeasons : p.seasons,
    }));
    
    if (fetchedSeasons.length > 0) {
       setExpandedSeasons(fetchedSeasons.map(s => s.number));
    }
    setShowResults(false);
    setTmdbResults([]);
    
    // Auto-discovery of links
    handleFindLinks(result.title, result.moviedbId || result.tmdbId, searchMode);
  };

  const handleFindLinks = async (title: string, tmdbId?: number, type?: string) => {
    const finalTmdbId = tmdbId || form.moviedbId;
    const finalType = type || form.type;

    setFindingLinks(true);
    setLinkResults([]);
    try {
      let url = `/api/tmdb/search-links?q=${encodeURIComponent(title)}`;
      if (finalTmdbId) url += `&tmdbId=${finalTmdbId}`;
      if (finalType) url += `&type=${finalType}`;

      const res = await fetch(url);
      const data = await res.json();
      setLinkResults(data.links || []);
    } catch {}
    setFindingLinks(false);
  };

  const toggleGenre = (genre: string) => {
    setForm((p) => ({
      ...p,
      genres: p.genres.includes(genre)
        ? p.genres.filter((g) => g !== genre)
        : [...p.genres, genre],
    }));
  };

  const addStudio = () => {
    if (studioInput.trim() && !form.studios.includes(studioInput.trim())) {
      setForm((p) => ({ ...p, studios: [...p.studios, studioInput.trim()] }));
      setStudioInput("");
    }
  };

  // Season/Episode management
  const addSeason = () => {
    const num = form.seasons.length > 0 ? Math.max(...form.seasons.map((s) => s.number)) + 1 : 1;
    setForm((p) => ({ ...p, seasons: [...p.seasons, { number: num, episodes: [] }] }));
    setExpandedSeasons((prev) => [...prev, num]);
  };
  const removeSeason = (sNum: number) => setForm((p) => ({ ...p, seasons: p.seasons.filter((s) => s.number !== sNum) }));
  const addEpisode = (sNum: number) => {
    setForm((p) => ({
      ...p,
      seasons: p.seasons.map((s) => {
        if (s.number !== sNum) return s;
        const eNum = s.episodes.length > 0 ? Math.max(...s.episodes.map((e) => e.number)) + 1 : 1;
        return { ...s, episodes: [...s.episodes, { number: eNum, title: "", streamUrl: "", runtime: 0 }] };
      }),
    }));
  };
  const removeEpisode = (sNum: number, eNum: number) => {
    setForm((p) => ({ ...p, seasons: p.seasons.map((s) => s.number !== sNum ? s : { ...s, episodes: s.episodes.filter((e) => e.number !== eNum) }) }));
  };
  const updateEpisode = (sNum: number, eNum: number, field: keyof Episode, value: string | number) => {
    setForm((p) => ({ ...p, seasons: p.seasons.map((s) => s.number !== sNum ? s : { ...s, episodes: s.episodes.map((e) => e.number === eNum ? { ...e, [field]: value } : e) }) }));
  };
  const toggleSeason = (num: number) => setExpandedSeasons((prev) => prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]);

  const handleBulkAdd = () => {
    if (!bulkAddModal.text.trim()) return;
    const urls = bulkAddModal.text.split("\n").map(l => l.trim()).filter(Boolean);
    
    setForm((p) => ({
      ...p,
      seasons: p.seasons.map((s) => {
        if (s.number !== bulkAddModal.seasonNum) return s;
        
        let existingEps = [...s.episodes].sort((a, b) => a.number - b.number);
        const newEpisodes = [];
        
        for (let i = 0; i < urls.length; i++) {
           if (i < existingEps.length) {
              // Populate existing episode length sequentially
              existingEps[i].streamUrl = urls[i];
           } else {
              // Append new episode if we exceed what's already mapped
              const lastNum = existingEps.length > 0 ? existingEps[existingEps.length - 1].number : 0;
              const newNum = lastNum + (i - existingEps.length + 1);
              newEpisodes.push({
                 number: newNum,
                 title: `Épisode ${newNum}`,
                 streamUrl: urls[i],
                 runtime: 24
              });
           }
        }
        return { ...s, episodes: [...existingEps, ...newEpisodes] };
      }),
    }));
    setBulkAddModal({ isOpen: false, seasonNum: 0, text: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      // Map 'Anime' back to 'Series' for the database
      const payload = {
        ...form,
        type: form.type === "Anime" ? "Series" : form.type
      };
      
      const res = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch { setError("Erreur lors de l'ajout"); }
    finally { setLoading(false); }
  };

  const S = {
    background: "var(--surface)",
    border: "1px solid var(--surface-light)",
    color: "var(--text-primary)",
  };

  if (!isAdmin) return <div className="fixed inset-0 z-[200] bg-deep-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-8 pt-8 pb-20 max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-hover transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Ajouter un média</h1>
          <p className="text-text-secondary text-sm flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            Les affiches et infos sont récupérées automatiquement via TMDB
          </p>
        </div>
      </div>

      {success && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl text-sm" style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", color: "#4CAF50" }}>
          ✅ Média ajouté avec succès ! Redirection...
        </motion.div>
      )}

      {/* Bulk Add Modal */}
      <AnimatePresence>
        {bulkAddModal.isOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-lg p-6 rounded-2xl shadow-2xl" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Ajout en masse (Saison {bulkAddModal.seasonNum})</h3>
                <button type="button" onClick={() => setBulkAddModal({ isOpen: false, seasonNum: 0, text: "" })} className="p-1 rounded-lg hover:bg-surface-light"><X className="w-5 h-5"/></button>
              </div>
              <p className="text-sm text-text-muted mb-4">Collez vos liens vidéo ci-dessous (un lien par ligne). Le système créera automatiquement les épisodes correspondants.</p>
              <textarea
                value={bulkAddModal.text}
                onChange={(e) => setBulkAddModal(p => ({ ...p, text: e.target.value }))}
                className="w-full h-48 px-4 py-3 rounded-xl text-sm focus:outline-none resize-none font-mono mb-4 custom-scrollbar"
                style={S}
                placeholder="https://zebi.../S1/E1/master.m3u8&#10;https://zebi.../S1/E2/master.m3u8&#10;https://..."
              />
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setBulkAddModal({ isOpen: false, seasonNum: 0, text: "" })} className="px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-surface-light transition-colors" style={{ border: "1px solid var(--surface-light)" }}>Annuler</button>
                <button type="button" onClick={handleBulkAdd} className="px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2" style={{ background: "var(--gold)", color: "var(--deep-black)" }}>
                  <Sparkles className="w-4 h-4"/>
                  Générer {bulkAddModal.text.split("\n").filter(l => l.trim()).length} Épisodes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type selector */}
        <div>
          <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">Type / Base de données</label>
          <div className="flex gap-3 flex-wrap">
            {(["Movie", "Series", "Anime"] as const).map((t) => (
              <button key={t} type="button" onClick={() => {
                  setSearchMode(t);
                  setForm((p) => ({ ...p, type: t }));
                }}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  background: searchMode === t ? "var(--gold)" : "var(--surface)",
                  color: searchMode === t ? "var(--deep-black)" : "var(--text-secondary)",
                  border: `1px solid ${searchMode === t ? "var(--gold)" : "var(--surface-light)"}`,
                }}>
                {t === "Movie" ? <Film className="w-4 h-4" /> : t === "Series" ? <Tv className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                {t === "Movie" ? "Film" : t === "Series" ? "Série" : "Anime (Kitsu)"}
              </button>
            ))}
          </div>
        </div>

        {/* Title with Auto autocomplete */}
        <div className="relative" ref={resultsRef}>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <Search className="w-3 h-3" /> Titre * — recherche auto {searchMode === "Anime" ? "Kitsu" : "TMDB"}
          </label>
          <div className="relative">
            <input type="text" value={form.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              onFocus={() => tmdbResults.length > 0 && setShowResults(true)}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S}
              placeholder="Tapez un titre pour chercher..." required />
            {searching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Dropdown */}
          <AnimatePresence>
            {showResults && tmdbResults.length > 0 && (
              <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl max-h-80 overflow-y-auto"
                style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
                <div className="p-2 text-xs text-text-muted flex items-center justify-between border-b border-surface-light mb-1">
                  <span className="flex items-center gap-1"><Sparkles className="w-3 h-3 text-gold" /> Résultats {searchMode === "Anime" ? "Kitsu" : "TMDB"}</span>
                  <button type="button" onClick={() => setShowResults(false)}><X className="w-3 h-3 hover:text-white" /></button>
                </div>
                {tmdbResults.map((r) => (
                  <button key={r.tmdbId} type="button" onClick={() => selectTmdbResult(r)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover transition-colors text-left">
                    {r.posterUrl ? (
                      <img src={r.posterUrl} alt="" className="w-10 h-14 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-14 rounded-lg bg-surface-light shrink-0 flex items-center justify-center">
                        <Film className="w-4 h-4 text-text-muted" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      <p className="text-xs text-text-muted">
                        {r.year && `${r.year} • `}
                        {r.rating > 0 && `⭐ ${r.rating.toFixed(1)}`}
                      </p>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stream URL — only for movies */}
        {form.type === "Movie" && (<div>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            <LinkIcon className="w-3 h-3" /> Lien vidéo *
          </label>
          <input type="url" value={form.streamUrl} onChange={(e) => setForm((p) => ({ ...p, streamUrl: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S}
            placeholder="https://exemple.com/film.mp4" required />
          <p className="text-xs text-text-muted mt-1">URL directe vers le fichier vidéo</p>
        </div>)}

        {/* Poster + Backdrop URLs — auto-filled */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" /> Affiche
              {form.posterUrl && <span className="text-green-500 text-[10px]">✓ auto</span>}
            </label>
            <input type="url" value={form.posterUrl} onChange={(e) => setForm((p) => ({ ...p, posterUrl: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} placeholder="Auto-rempli via TMDB" />
            {form.posterUrl && (
              <img src={form.posterUrl} alt="Poster" className="mt-2 w-20 h-28 rounded-lg object-cover" />
            )}
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3 h-3" /> Fond
              {form.backdropUrl && <span className="text-green-500 text-[10px]">✓ auto</span>}
            </label>
            <input type="url" value={form.backdropUrl} onChange={(e) => setForm((p) => ({ ...p, backdropUrl: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} placeholder="Auto-rempli via TMDB" />
            {form.backdropUrl && (
              <img src={form.backdropUrl} alt="Backdrop" className="mt-2 w-full h-20 rounded-lg object-cover" />
            )}
          </div>
        </div>

        {/* Overview */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Synopsis</label>
          <textarea value={form.overview} onChange={(e) => setForm((p) => ({ ...p, overview: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none h-24" style={S}
            placeholder="Auto-rempli via TMDB" />
        </div>

        {/* Year + Runtime + Rating */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Année</label>
            <input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} min={1900} max={2100} />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Durée (min)</label>
            <input type="number" value={form.runtime || ""} onChange={(e) => setForm((p) => ({ ...p, runtime: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} min={0} />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Note /10</label>
            <input type="number" value={form.communityRating || ""} onChange={(e) => setForm((p) => ({ ...p, communityRating: parseFloat(e.target.value) || 0 }))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} min={0} max={10} step={0.1} />
          </div>
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Slogan</label>
          <input type="text" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} />
        </div>

        {/* Saga */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            Saga / Collection
            {form.saga && <span className="text-green-500 text-[10px]">✓ {form.saga}</span>}
          </label>
          <input type="text" value={form.saga} onChange={(e) => setForm((p) => ({ ...p, saga: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S}
            placeholder="Ex: MCU, Star Wars, Harry Potter..." />
          {/* Quick-pick existing sagas */}
          {(() => {
            const sagaNames = [...new Set(existingMedia.map((m) => m.saga).filter(Boolean))] as string[];
            if (sagaNames.length === 0) return null;
            return (
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs text-text-muted">Sagas existantes :</span>
                {sagaNames.map((s) => (
                  <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, saga: s }))}
                    className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-all"
                    style={{
                      background: form.saga === s ? "var(--gold)" : "var(--surface)",
                      color: form.saga === s ? "var(--deep-black)" : "var(--text-secondary)",
                      border: `1px solid ${form.saga === s ? "var(--gold)" : "var(--surface-light)"}`,
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            );
          })()}
        </div>

        {/* Director & Cast */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Réalisateur</label>
            <input type="text" value={form.director} onChange={(e) => setForm((p) => ({ ...p, director: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} placeholder="Auto-rempli via TMDB" />
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Casting ({form.cast.length})</label>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {form.cast.length === 0 && <p className="text-xs text-text-muted py-3">Aucun acteur chargé</p>}
              {form.cast.map((actor, i) => (
                <div key={i} className="flex-shrink-0 flex flex-col items-center gap-1 w-16">
                  {actor.imageUrl ? (
                    <img src={actor.imageUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-surface-light" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center text-[10px] text-text-muted">No Pic</div>
                  )}
                  <span className="text-[10px] text-center truncate w-full">{actor.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Genres */}
        <div>
          <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((genre) => (
              <button key={genre} type="button" onClick={() => toggleGenre(genre)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: form.genres.includes(genre) ? "var(--gold)" : "var(--surface)",
                  color: form.genres.includes(genre) ? "var(--deep-black)" : "var(--text-secondary)",
                  border: `1px solid ${form.genres.includes(genre) ? "var(--gold)" : "var(--surface-light)"}`,
                }}>
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Langues */}
        <div>
          <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider flex items-center gap-1.5">
            Langues
            {form.languages.length > 0 && <span className="text-green-500 text-[10px]">✓ auto</span>}
          </label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((lang) => (
              <button key={lang} type="button"
                onClick={() => setForm((p) => ({
                  ...p,
                  languages: p.languages.includes(lang)
                    ? p.languages.filter((l) => l !== lang)
                    : [...p.languages, lang],
                }))}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: form.languages.includes(lang) ? "var(--gold)" : "var(--surface)",
                  color: form.languages.includes(lang) ? "var(--deep-black)" : "var(--text-secondary)",
                  border: `1px solid ${form.languages.includes(lang) ? "var(--gold)" : "var(--surface-light)"}`,
                }}>
                {lang}
              </button>
            ))}
          </div>
        </div>

        {/* Studios */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Studios</label>
          <div className="flex gap-2">
            <input type="text" value={studioInput} onChange={(e) => setStudioInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStudio(); } }}
              className="flex-1 px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} placeholder="Nom du studio" />
            <button type="button" onClick={addStudio}
              className="px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {form.studios.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.studios.map((s) => (
                <span key={s} className="px-3 py-1 rounded-lg text-xs flex items-center gap-1.5"
                  style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
                  {s}
                  <button type="button" onClick={() => setForm((p) => ({ ...p, studios: p.studios.filter((x) => x !== s) }))}
                    className="text-text-muted hover:text-danger transition-colors">×</button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Seasons & Episodes — for Series & Anime */}
        {(form.type === "Series" || form.type === "Anime") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs text-text-muted uppercase tracking-wider">Saisons & Épisodes</label>
              <button type="button" onClick={addSeason} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium" style={{ background: "var(--gold)", color: "var(--deep-black)" }}><Plus className="w-3 h-3" /> Ajouter une saison</button>
            </div>
            {form.seasons.length === 0 && (
              <div className="py-6 text-center rounded-xl flex flex-col items-center gap-3" style={{ background: "var(--surface)" }}>
                <p className="text-text-muted text-sm">Aucune saison. Cliquez pour en ajouter une ou importez en masse.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => {
                    // Create season 1 if it doesn't exist, then open modal
                    setForm(p => ({ ...p, seasons: [{ number: 1, episodes: [] }]}));
                    setExpandedSeasons([1]);
                    setBulkAddModal({ isOpen: true, seasonNum: 1, text: "" });
                  }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium transition-colors hover:bg-gold/20 text-gold" style={{ border: "1px solid var(--gold)" }}>
                    <Sparkles className="w-4 h-4" /> Masse (Saison 1)
                  </button>
                </div>
              </div>
            )}
            <div className="space-y-3">
              {form.seasons.map((season) => (
                <div key={season.number} className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => toggleSeason(season.number)}>
                    <div className="flex items-center gap-2">
                      {expandedSeasons.includes(season.number) ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4" />}
                      <span className="font-medium text-sm">Saison {season.number}</span>
                      <span className="text-xs text-text-muted">({season.episodes.length} épisodes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setBulkAddModal({ isOpen: true, seasonNum: season.number, text: ""}); }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-gold/20 text-gold transition-colors" style={{ border: "1px solid var(--gold)" }} title="Ajouter plusieurs épisodes d'un coup"><Sparkles className="w-3 h-3" /> Masse</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); addEpisode(season.number); }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-surface-hover" style={{ border: "1px solid var(--surface-light)" }}><Plus className="w-3 h-3" /> Épisode</button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeSeason(season.number); }} className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  {expandedSeasons.includes(season.number) && (
                    <div className="px-4 pb-3 space-y-2">
                      {season.episodes.length === 0 && <p className="text-text-muted text-xs py-2 text-center">Aucun épisode</p>}
                      {season.episodes.map((ep) => (
                        <div key={ep.number} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--deep-black)" }}>
                          <span className="text-xs text-text-muted w-8 shrink-0 text-center">E{ep.number}</span>
                          <input type="text" value={ep.title} onChange={(e) => updateEpisode(season.number, ep.number, "title", e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }} placeholder="Titre" />
                          <input type="url" value={ep.streamUrl} onChange={(e) => updateEpisode(season.number, ep.number, "streamUrl", e.target.value)} className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }} placeholder="Lien vidéo" />
                          <input type="number" value={ep.runtime || ""} onChange={(e) => updateEpisode(season.number, ep.number, "runtime", parseInt(e.target.value) || 0)} className="w-16 px-2 py-2 rounded-lg text-xs focus:outline-none text-center" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }} placeholder="min" />
                          <button type="button" onClick={() => removeEpisode(season.number, ep.number)} className="p-1 text-text-muted hover:text-danger shrink-0"><Trash2 className="w-3 h-3" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Link Discovery */}
        <div className="p-5 rounded-2xl" style={{ background: "rgba(255,193,7,0.05)", border: "1px solid rgba(255,193,7,0.2)" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-gold">
              <Sparkles className="w-4 h-4" /> Auto-Scraper : Liens de Streaming
            </h3>
            <button type="button" onClick={() => handleFindLinks(form.title, form.moviedbId, form.type)} disabled={findingLinks || !form.title}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/10 hover:bg-gold/20 text-gold transition-colors disabled:opacity-50">
              {findingLinks ? "Recherche..." : "Scanner à nouveau"}
            </button>
          </div>
          
          {findingLinks && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-text-muted">Recherche des meilleures sources...</p>
            </div>
          )}

          {!findingLinks && linkResults.length === 0 && (
            <p className="text-xs text-text-muted py-4 text-center">Aucun lien trouvé automatiquement. Tapez un titre pour scanner.</p>
          )}

          {!findingLinks && linkResults.length > 0 && (
            <div className="space-y-2">
              {linkResults.map((link, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-white mb-0.5">{link.provider}</span>
                    <span className="text-[10px] text-text-muted truncate max-w-[200px]">{link.url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-light text-text-muted">{link.quality}</span>
                    <button type="button" onClick={() => {
                        if (form.type === "Movie") {
                          setForm(p => ({ ...p, streamUrl: link.url }));
                        } else {
                          if ((link as any).urlTemplate) {
                            let newSeasons = [...form.seasons];
                            for (let s of newSeasons) {
                              for (let e of s.episodes) {
                                e.streamUrl = (link as any).urlTemplate.replace("{S}", s.number.toString()).replace("{E}", e.number.toString());
                              }
                            }
                            setForm(p => ({ ...p, seasons: newSeasons }));
                          } else {
                            // old fallback for single URL or manual search
                            if (!expandedSeasons.includes(1)) {
                              setExpandedSeasons(prev => [...prev, 1]);
                            }
                          }
                        }
                      }} 
                      className="px-3 py-1 rounded-lg text-[11px] font-bold bg-gold text-deep-black hover:scale-105 transition-transform">
                      {(link as any).urlTemplate ? "Générer Tous" : "Utiliser"}
                    </button>
                    {link.type === "Search" && (
                      <a href={link.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-surface-light transition-colors text-text-muted">
                        <LinkIcon className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="p-3 rounded-lg text-sm"
            style={{ background: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.3)", color: "var(--danger)" }}>
            {error}
          </motion.div>
        )}

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={loading}
            className="btn-gold flex items-center gap-2 disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {loading ? "Ajout en cours..." : "Ajouter le média"}
          </motion.button>
          <Link href="/admin">
            <button type="button" className="px-6 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-surface-hover"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
              Annuler
            </button>
          </Link>
        </div>
      </form>
    </motion.div>
  );
}
