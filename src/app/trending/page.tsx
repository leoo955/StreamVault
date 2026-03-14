"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import MediaRow from "@/components/MediaRow";
import { RowSkeleton } from "@/components/Skeleton";
import { useI18n } from "@/lib/i18n";

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

export default function TrendingPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toNormalized = (i: MediaItem) => ({
    ...i, rating: 0, isPlayed: false, playbackPosition: 0, playbackDuration: 0, playbackPercent: 0, logoUrl: undefined,
  });

  const topRated = [...items].sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0));
  const newest = [...items].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-8 pt-8 pb-20">
      <h1 className="text-3xl font-bold mb-8">{t("nav.trending")}</h1>

      {loading ? (
        <div className="space-y-10">
          <RowSkeleton />
          <RowSkeleton />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-text-muted text-lg">{t("home.emptyLibrary")}</p>
          <p className="text-text-muted text-sm mt-2">
            <a href="/admin/add" className="text-gold hover:text-gold-light">{t("home.addContent")}</a>
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {topRated.length > 0 && <MediaRow title={t("trending.topRated")} items={topRated.map(toNormalized)} />}
          {newest.length > 0 && <MediaRow title={t("trending.newest")} items={newest.map(toNormalized)} />}
        </div>
      )}
    </motion.div>
  );
}
