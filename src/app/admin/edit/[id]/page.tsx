"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Save, Film, Tv, Plus, Trash2, ChevronDown, ChevronUp, Sparkles, X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function EditMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const isAdmin = useAdminAuth();
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);

  const [form, setForm] = useState({
    title: "",
    type: "Movie" as "Movie" | "Series" | "Anime",
    streamUrl: "",
    posterUrl: "",
    backdropUrl: "",
    overview: "",
    year: 2024,
    runtime: 0,
    genres: [] as string[],
    languages: [] as string[],
    communityRating: 0,
    tagline: "",
    studios: [] as string[],
    seasons: [] as Season[],
    saga: "",
  });

  const [bulkAddModal, setBulkAddModal] = useState<{isOpen: boolean, seasonNum: number, text: string}>({ isOpen: false, seasonNum: 0, text: "" });

  const handleBulkAdd = () => {
    if (!bulkAddModal.text.trim()) return;

    const lines = bulkAddModal.text.split("\n").map(l => l.trim()).filter(Boolean);
    
    setForm(prev => {
      return {
        ...prev,
        seasons: prev.seasons.map(s => {
          if (s.number !== bulkAddModal.seasonNum) return s;
          
          let nextEpNum = s.episodes.length > 0 ? Math.max(...s.episodes.map(e => e.number)) + 1 : 1;
          const newEpisodes = lines.map(url => ({
            number: nextEpNum++,
            title: `Épisode ${nextEpNum - 1}`,
            streamUrl: url,
            runtime: 0
          }));

          return { ...s, episodes: [...s.episodes, ...newEpisodes] };
        })
      };
    });

    setExpandedSeasons(prev => prev.includes(bulkAddModal.seasonNum) ? prev : [...prev, bulkAddModal.seasonNum]);
    setBulkAddModal({ isOpen: false, seasonNum: 0, text: "" });
  };

  const [studioInput, setStudioInput] = useState("");
  const [existingSagas, setExistingSagas] = useState<string[]>([]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch(`/api/media/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.item) {
          setForm({
            title: d.item.title || "",
            type: d.item.type || "Movie",
            streamUrl: d.item.streamUrl || "",
            posterUrl: d.item.posterUrl || "",
            backdropUrl: d.item.backdropUrl || "",
            overview: d.item.overview || "",
            year: d.item.year || 2024,
            runtime: d.item.runtime || 0,
            genres: d.item.genres || [],
            languages: d.item.languages || [],
            communityRating: d.item.communityRating || 0,
            tagline: d.item.tagline || "",
            studios: d.item.studios || [],
            seasons: d.item.seasons || [],
            saga: d.item.saga || "",
          });
        } else setError("Média introuvable");
      })
      .catch(() => setError("Erreur"))
      .finally(() => setLoading(false));

    // Load existing sagas
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        const sagas = [...new Set((d.items || []).map((i: any) => i.saga).filter(Boolean))] as string[];
        setExistingSagas(sagas);
      })
      .catch(() => {});
  }, [id, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = {
        ...form,
        type: form.type === "Anime" ? "Series" : form.type
      };

      const res = await fetch(`/api/media/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setTimeout(() => router.push("/admin"), 1500);
    } catch { setError("Erreur"); }
    finally { setSaving(false); }
  };

  const toggleGenre = (g: string) =>
    setForm((p) => ({ ...p, genres: p.genres.includes(g) ? p.genres.filter((x) => x !== g) : [...p.genres, g] }));

  const toggleLang = (l: string) =>
    setForm((p) => ({ ...p, languages: p.languages.includes(l) ? p.languages.filter((x) => x !== l) : [...p.languages, l] }));

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

  const removeSeason = (sNum: number) => {
    setForm((p) => ({ ...p, seasons: p.seasons.filter((s) => s.number !== sNum) }));
  };

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
    setForm((p) => ({
      ...p,
      seasons: p.seasons.map((s) => {
        if (s.number !== sNum) return s;
        return { ...s, episodes: s.episodes.filter((e) => e.number !== eNum) };
      }),
    }));
  };

  const updateEpisode = (sNum: number, eNum: number, field: keyof Episode, value: string | number) => {
    setForm((p) => ({
      ...p,
      seasons: p.seasons.map((s) => {
        if (s.number !== sNum) return s;
        return {
          ...s,
          episodes: s.episodes.map((e) =>
            e.number === eNum ? { ...e, [field]: value } : e
          ),
        };
      }),
    }));
  };

  const toggleSeason = (num: number) => {
    setExpandedSeasons((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const S = { background: "var(--surface)", border: "1px solid var(--surface-light)", color: "var(--text-primary)" };

  if (!isAdmin || loading) return (
    <div className="min-h-screen px-8 pt-8 max-w-3xl">
      {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-12 rounded-xl mb-4" />)}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-8 pt-8 pb-20 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 rounded-xl hover:bg-surface-hover transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
        <div>
          <h1 className="text-2xl font-bold">Modifier : {form.title}</h1>
          <p className="text-text-secondary text-sm">Modifiez les informations du média</p>
        </div>
      </div>

      {success && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-xl text-sm" style={{ background: "rgba(76,175,80,0.1)", border: "1px solid rgba(76,175,80,0.3)", color: "#4CAF50" }}>✅ Mis à jour ! Redirection...</motion.div>}

      {/* Bulk Add Modal */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div className="flex gap-3">
          {(["Movie", "Series", "Anime"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setForm((p) => ({ ...p, type: t }))}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: form.type === t ? "var(--gold)" : "var(--surface)", color: form.type === t ? "var(--deep-black)" : "var(--text-secondary)", border: `1px solid ${form.type === t ? "var(--gold)" : "var(--surface-light)"}` }}>
              {t === "Movie" ? <Film className="w-4 h-4" /> : t === "Series" ? <Tv className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              {t === "Movie" ? "Film" : t === "Series" ? "Série" : "Anime"}
            </button>
          ))}
        </div>

        {/* Title */}
        <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Titre</label><input type="text" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} required /></div>

        {/* Stream URL — only for movies */}
        {form.type === "Movie" && (
          <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Lien vidéo</label><input type="url" value={form.streamUrl} onChange={(e) => setForm((p) => ({ ...p, streamUrl: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} /></div>
        )}

        {/* Poster + Backdrop */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Affiche URL</label>
            <input type="url" value={form.posterUrl} onChange={(e) => setForm((p) => ({ ...p, posterUrl: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} />
            {form.posterUrl && <img src={form.posterUrl} alt="" className="mt-2 w-20 h-28 rounded-lg object-cover" />}
          </div>
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Fond URL</label>
            <input type="url" value={form.backdropUrl} onChange={(e) => setForm((p) => ({ ...p, backdropUrl: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} />
            {form.backdropUrl && <img src={form.backdropUrl} alt="" className="mt-2 w-full h-20 rounded-lg object-cover" />}
          </div>
        </div>

        {/* Synopsis */}
        <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Synopsis</label><textarea value={form.overview} onChange={(e) => setForm((p) => ({ ...p, overview: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none resize-none h-24" style={S} /></div>

        {/* Year + Runtime + Rating */}
        <div className="grid grid-cols-3 gap-4">
          <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Année</label><input type="number" value={form.year} onChange={(e) => setForm((p) => ({ ...p, year: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} /></div>
          <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Durée (min)</label><input type="number" value={form.runtime || ""} onChange={(e) => setForm((p) => ({ ...p, runtime: parseInt(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} /></div>
          <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Note /10</label><input type="number" value={form.communityRating || ""} onChange={(e) => setForm((p) => ({ ...p, communityRating: parseFloat(e.target.value) || 0 }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} step={0.1} min={0} max={10} /></div>
        </div>

        {/* Tagline */}
        <div><label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Slogan</label><input type="text" value={form.tagline} onChange={(e) => setForm((p) => ({ ...p, tagline: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} /></div>

        {/* Saga */}
        <div>
          <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
            Saga / Collection
            {form.saga && <span className="text-green-500 text-[10px]">✓ {form.saga}</span>}
          </label>
          <input type="text" value={form.saga} onChange={(e) => setForm((p) => ({ ...p, saga: e.target.value }))} className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} placeholder="Ex: MCU, Star Wars, Harry Potter..." />
          {existingSagas.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-text-muted">Sagas existantes :</span>
              {existingSagas.map((s) => (
                <button key={s} type="button" onClick={() => setForm((p) => ({ ...p, saga: s }))}
                  className="px-2.5 py-0.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: form.saga === s ? "var(--gold)" : "var(--surface)",
                    color: form.saga === s ? "var(--deep-black)" : "var(--text-secondary)",
                    border: `1px solid ${form.saga === s ? "var(--gold)" : "var(--surface-light)"}`,
                  }}>{s}</button>
              ))}
            </div>
          )}
        </div>

        {/* Genres */}
        <div>
          <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">Genres</label>
          <div className="flex flex-wrap gap-2">
            {GENRE_OPTIONS.map((g) => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ background: form.genres.includes(g) ? "var(--gold)" : "var(--surface)", color: form.genres.includes(g) ? "var(--deep-black)" : "var(--text-secondary)", border: `1px solid ${form.genres.includes(g) ? "var(--gold)" : "var(--surface-light)"}` }}>
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Langues */}
        <div>
          <label className="block text-xs text-text-muted mb-2 uppercase tracking-wider">Langues</label>
          <div className="flex flex-wrap gap-2">
            {LANGUAGE_OPTIONS.map((l) => (
              <button key={l} type="button" onClick={() => toggleLang(l)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                style={{ background: form.languages.includes(l) ? "var(--gold)" : "var(--surface)", color: form.languages.includes(l) ? "var(--deep-black)" : "var(--text-secondary)", border: `1px solid ${form.languages.includes(l) ? "var(--gold)" : "var(--surface-light)"}` }}>
                {l}
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
            <button type="button" onClick={addStudio} className="px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}><Plus className="w-4 h-4" /></button>
          </div>
          {form.studios.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.studios.map((s) => (
                <span key={s} className="px-3 py-1 rounded-lg text-xs flex items-center gap-1.5" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
                  {s} <button type="button" onClick={() => setForm((p) => ({ ...p, studios: p.studios.filter((x) => x !== s) }))} className="text-text-muted hover:text-danger">×</button>
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
              <button type="button" onClick={addSeason}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={{ background: "var(--gold)", color: "var(--deep-black)" }}>
                <Plus className="w-3 h-3" /> Ajouter une saison
              </button>
            </div>

            {form.seasons.length === 0 && (
              <div className="py-6 text-center rounded-xl flex flex-col items-center gap-3" style={{ background: "var(--surface)" }}>
                <p className="text-text-muted text-sm">Aucune saison. Cliquez sur ajouter ou importez en masse.</p>
                <div className="flex gap-3">
                  <button type="button" onClick={() => {
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
                  {/* Season header */}
                  <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => toggleSeason(season.number)}>
                    <div className="flex items-center gap-2">
                      {expandedSeasons.includes(season.number) ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4" />}
                      <span className="font-medium text-sm">Saison {season.number}</span>
                      <span className="text-xs text-text-muted">({season.episodes.length} épisodes)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={(e) => { e.stopPropagation(); setBulkAddModal({ isOpen: true, seasonNum: season.number, text: ""}); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-gold/20 text-gold transition-colors" style={{ border: "1px solid var(--gold)" }} title="Ajouter plusieurs épisodes d'un coup">
                        <Sparkles className="w-3 h-3" /> Masse
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); addEpisode(season.number); }}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs hover:bg-surface-hover transition-colors" style={{ border: "1px solid var(--surface-light)" }}>
                        <Plus className="w-3 h-3" /> Épisode
                      </button>
                      <button type="button" onClick={(e) => { e.stopPropagation(); removeSeason(season.number); }}
                        className="p-1 rounded-lg hover:bg-surface-hover transition-colors text-text-muted hover:text-danger">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Episodes list */}
                  {expandedSeasons.includes(season.number) && (
                    <div className="px-4 pb-3 space-y-2">
                      {season.episodes.length === 0 && (
                        <p className="text-text-muted text-xs py-2 text-center">Aucun épisode</p>
                      )}
                      {season.episodes.map((ep) => (
                        <div key={ep.number} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--deep-black)" }}>
                          <span className="text-xs text-text-muted w-8 shrink-0 text-center">E{ep.number}</span>
                          <input type="text" value={ep.title}
                            onChange={(e) => updateEpisode(season.number, ep.number, "title", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
                            style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                            placeholder="Titre de l'épisode" />
                          <input type="url" value={ep.streamUrl}
                            onChange={(e) => updateEpisode(season.number, ep.number, "streamUrl", e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg text-xs focus:outline-none"
                            style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                            placeholder="Lien vidéo" />
                          <input type="number" value={ep.runtime || ""}
                            onChange={(e) => updateEpisode(season.number, ep.number, "runtime", parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-2 rounded-lg text-xs focus:outline-none text-center"
                            style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                            placeholder="min" />
                          <button type="button" onClick={() => removeEpisode(season.number, ep.number)}
                            className="p-1 text-text-muted hover:text-danger transition-colors shrink-0">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(229,57,53,0.1)", border: "1px solid rgba(229,57,53,0.3)", color: "var(--danger)" }}>{error}</div>}

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={saving} className="btn-gold flex items-center gap-2 disabled:opacity-50">
            <Save className="w-4 h-4" />{saving ? "Sauvegarde..." : "Enregistrer"}
          </motion.button>
          <Link href="/admin"><button type="button" className="px-6 py-3 rounded-lg text-sm font-medium hover:bg-surface-hover" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>Annuler</button></Link>
        </div>
      </form>
    </motion.div>
  );
}
