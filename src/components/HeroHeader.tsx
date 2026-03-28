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
    <div className="relative h-[60vh] sm:h-[70vh] min-h-[400px] md:min-h-[500px] max-h-[700px] w-full overflow-hidden rounded-2xl">
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
        className="absolute bottom-0 left-0 right-0 p-6 md:p-10"
      >
        {/* Title */}
        <h1 className="text-3xl md:text-5xl font-bold mb-3 max-w-full md:max-w-2xl leading-tight">
          {item.title}
        </h1>

        {/* Meta info */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-4 text-xs md:text-sm text-text-secondary font-medium">
          {item.year > 0 && <span className="bg-white/10 px-2 py-0.5 rounded">{item.year}</span>}
          {item.runtime > 0 && (
            <>
              <span className="hidden md:block w-1 h-1 rounded-full bg-text-muted" />
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
              <span className="opacity-80">{item.genres.slice(0, 2).join(" • ")}</span>
            </>
          )}
        </div>

        {/* Tagline or Overview */}
        {item.tagline ? (
          <p className="text-text-secondary text-sm md:text-base italic mb-6 max-w-xl opacity-90">
            &ldquo;{item.tagline}&rdquo;
          </p>
        ) : (
          <p className="text-text-secondary text-sm md:text-base mb-6 max-w-xl line-clamp-2 md:line-clamp-3 opacity-90">
            {item.overview}
          </p>
        )}

        {/* Progress bar */}
        {hasProgress && (
          <div className="mb-5 max-w-sm md:max-w-md">
            <div className="h-1 rounded-full bg-surface-light overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "var(--gold-shimmer)" }}
              />
            </div>
            <p className="text-[10px] md:text-xs text-text-muted mt-1.5 font-medium uppercase tracking-wider">
              {Math.round(progressPercent)}% regardé
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link href={`/watch/${item.id}`} className="flex-1 md:flex-none">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-gold w-full flex items-center justify-center gap-2 text-sm md:text-base py-2.5 md:py-3"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" />
              {hasProgress ? "Reprendre" : "Regarder"}
            </motion.button>
          </Link>

          <Link href={`/detail/${item.id}`} className="flex-1 md:flex-none">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base font-medium transition-all duration-200"
              style={{
                background: "rgba(245, 245, 245, 0.1)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(245, 245, 245, 0.15)",
              }}
            >
              <Info className="w-4 h-4 md:w-5 md:h-5" />
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
