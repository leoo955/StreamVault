"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import MediaCard from "@/components/MediaCard";
import { useI18n } from "@/lib/i18n";

const getSortOptions = (t: (k: string) => string) => [
  { label: t("home.recentlyAdded") || "Date d'ajout", value: "dateAdded" },
  { label: t("form.titleLabel") || "Titre", value: "title" },
  { label: t("form.rating") || "Note", value: "rating" },
  { label: t("form.year") || "Année", value: "year" },
];

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
  dateAdded: string;
}

export default function SeriesPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("dateAdded");
  const [showFilters, setShowFilters] = useState(false);
  const { t } = useI18n();
  const sortOptions = useMemo(() => getSortOptions(t), [t]);

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => {
        const all = d.items || [];
        setItems(all.filter((i: MediaItem) => i.type === "Series"));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const sortedItems = useMemo(() => {
    const sorted = [...items];
    switch (sortBy) {
      case "title": sorted.sort((a, b) => a.title.localeCompare(b.title)); break;
      case "rating": sorted.sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0)); break;
      case "year": sorted.sort((a, b) => b.year - a.year); break;
      default: sorted.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
    }
    return sorted;
  }, [items, sortBy]);

  const toNormalized = (item: MediaItem) => ({
    ...item, rating: 0, isPlayed: false, playbackPosition: 0, playbackDuration: 0, playbackPercent: 0, logoUrl: undefined,
  });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="min-h-screen px-8 pt-8 pb-20">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("nav.series")}</h1>
          <p className="text-text-secondary mt-1">{items.length} {t("admin.seriesCount").toLowerCase()}</p>
        </div>
        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all duration-200 hover:bg-surface-hover" style={{ background: showFilters ? "var(--gold-glow)" : "var(--surface)", border: `1px solid ${showFilters ? "var(--gold)" : "transparent"}` }}>
          <SlidersHorizontal className={`w-4 h-4 ${showFilters ? "text-gold" : ""}`} />
          <span className="text-sm font-medium">Filtres</span>
        </button>
      </div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 p-4 rounded-xl glass-card flex flex-wrap gap-4">
          <div>
            <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">Trier par</label>
            <div className="flex gap-2">
              {sortOptions.map((opt) => (
                <button key={opt.value} onClick={() => setSortBy(opt.value)} className="px-3 py-1.5 rounded-lg text-sm transition-all duration-200" style={{ background: sortBy === opt.value ? "var(--gold)" : "var(--surface)", color: sortBy === opt.value ? "var(--deep-black)" : "var(--text-secondary)", fontWeight: sortBy === opt.value ? 600 : 400 }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (<div key={i} className="skeleton aspect-[2/3] rounded-xl" />))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {sortedItems.map((item, i) => (<MediaCard key={item.id} item={toNormalized(item)} index={i} />))}
        </div>
      )}

      {!loading && sortedItems.length === 0 && (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">{t("home.emptyLibrary")}</p>
          <p className="text-text-muted text-sm mt-2"><a href="/admin/add" className="text-gold hover:text-gold-light">{t("home.addContent")}</a></p>
        </div>
      )}
    </motion.div>
  );
}
