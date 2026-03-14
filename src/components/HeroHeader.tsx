"use client";

import { motion } from "framer-motion";
import { Play, Info } from "lucide-react";
import Link from "next/link";
import { NormalizedMediaItem } from "@/lib/jellyfin/types";

interface HeroHeaderProps {
  item?: NormalizedMediaItem;
  loading?: boolean;
}

export default function HeroHeader({ item, loading }: HeroHeaderProps) {
  if (loading || !item) {
    return <HeroSkeleton />;
  }

  const progressPercent = item.playbackPercent;
  const hasProgress = progressPercent > 0 && progressPercent < 100;

  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full overflow-hidden rounded-2xl">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${item.backdropUrl})` }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-deep-black/80 via-transparent to-transparent" />

      {/* Gold accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: "var(--gold-shimmer)" }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute bottom-0 left-0 right-0 p-10"
      >
        {/* Title */}
        <h1 className="text-5xl font-bold mb-3 max-w-2xl leading-tight">
          {item.title}
        </h1>

        {/* Meta info */}
        <div className="flex items-center gap-3 mb-4 text-sm text-text-secondary">
          {item.year > 0 && <span>{item.year}</span>}
          {item.runtime > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span>{item.runtime} min</span>
            </>
          )}
          {item.communityRating && (
            <>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span className="flex items-center gap-1">
                <span className="text-gold">★</span>
                {item.communityRating.toFixed(1)}
              </span>
            </>
          )}
          {item.genres.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-text-muted" />
              <span>{item.genres.slice(0, 3).join(" • ")}</span>
            </>
          )}
        </div>

        {/* Tagline or Overview */}
        {item.tagline ? (
          <p className="text-text-secondary text-base italic mb-6 max-w-xl">
            &ldquo;{item.tagline}&rdquo;
          </p>
        ) : (
          <p className="text-text-secondary text-base mb-6 max-w-xl line-clamp-2">
            {item.overview}
          </p>
        )}

        {/* Progress bar */}
        {hasProgress && (
          <div className="mb-5 max-w-md">
            <div className="h-1 rounded-full bg-surface-light overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "var(--gold-shimmer)" }}
              />
            </div>
            <p className="text-xs text-text-muted mt-1.5">
              {Math.round(progressPercent)}% regardé
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Link href={`/watch/${item.id}`}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gold flex items-center gap-2 text-base"
            >
              <Play className="w-5 h-5" fill="currentColor" />
              {hasProgress ? "Reprendre" : "Regarder Maintenant"}
            </motion.button>
          </Link>

          <Link href={`/detail/${item.id}`}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-6 py-3 rounded-lg text-base font-medium transition-all duration-200"
              style={{
                background: "rgba(245, 245, 245, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(245, 245, 245, 0.15)",
              }}
            >
              <Info className="w-5 h-5" />
              Plus d&apos;infos
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] min-h-[500px] max-h-[700px] w-full overflow-hidden rounded-2xl skeleton">
      <div className="absolute bottom-0 left-0 right-0 p-10 space-y-4">
        <div className="skeleton h-12 w-96 rounded-lg" />
        <div className="skeleton h-4 w-64 rounded" />
        <div className="skeleton h-4 w-80 rounded" />
        <div className="flex gap-3 mt-6">
          <div className="skeleton h-12 w-48 rounded-lg" />
          <div className="skeleton h-12 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
