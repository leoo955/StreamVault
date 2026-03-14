"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { NormalizedMediaItem } from "@/lib/jellyfin/types";
import { useState, useRef, useEffect, useCallback } from "react";

interface MediaCardProps {
  item: NormalizedMediaItem;
  index?: number;
}

export default function MediaCard({ item, index = 0 }: MediaCardProps) {
  const hasProgress = item.playbackPercent > 0 && item.playbackPercent < 100;
  const [hovered, setHovered] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Start preview after 600ms of hover
  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (item.streamUrl) {
      hoverTimerRef.current = setTimeout(() => {
        setShowPreview(true);
      }, 1500);
    }
  }, [item.streamUrl]);

  const handleMouseLeave = useCallback(() => {
    setHovered(false);
    setShowPreview(false);
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (showPreview && videoRef.current && item.streamUrl) {
      videoRef.current.src = item.streamUrl.includes(".m3u8")
        ? `/api/proxy?url=${encodeURIComponent(item.streamUrl)}`
        : item.streamUrl;
      videoRef.current.muted = true;
      videoRef.current.currentTime = 60; // start at 1 min to skip intros
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {}); // ignore autoplay errors
      }
    }
  }, [showPreview, item.streamUrl]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group relative shrink-0 w-[160px] md:w-[220px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link href={`/detail/${item.id}`}>
        {/* Poster */}
        <motion.div
          animate={hovered ? { scale: 1.05, y: -8 } : { scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative aspect-[2/3] rounded-xl overflow-hidden cursor-pointer"
          style={{
            boxShadow: hovered ? "0 20px 50px rgba(0,0,0,0.7)" : "0 4px 20px rgba(0,0,0,0.4)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          {/* Static Poster image */}
          <div className="absolute inset-0 bg-surface">
            <Image
              src={item.posterUrl}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 160px, 220px"
            />
          </div>

          {/* Hover preview video */}
          <AnimatePresence>
            {showPreview && item.streamUrl && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 z-10"
              >
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                  loop
                  crossOrigin="anonymous"
                />
                {/* Subtle gradient overlay on video */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20`} />

          {/* Play button (on hover) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={hovered ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center z-30"
          >
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: "var(--gold-shimmer)",
                boxShadow: "0 0 30px rgba(198, 165, 92, 0.4)",
              }}
            >
              <Play className="w-5 h-5 text-deep-black ml-0.5" fill="currentColor" />
            </div>
          </motion.div>

          {/* Rating badge */}
          {item.communityRating && (
            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold glass-card z-40">
              <Star className="w-3 h-3 text-gold" fill="currentColor" />
              <span>{item.communityRating.toFixed(1)}</span>
            </div>
          )}

          {/* Progress bar */}
          {hasProgress && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-surface-light/50 z-40">
              <div
                className="h-full rounded-r-full"
                style={{
                  width: `${item.playbackPercent}%`,
                  background: "var(--gold-shimmer)",
                }}
              />
            </div>
          )}

          {/* Gold border on hover */}
          <div
            className="absolute inset-0 rounded-xl border border-transparent group-hover:border-gold/40 transition-all duration-300 z-40"
          />
        </motion.div>

        {/* Title & Meta */}
        <div className="mt-3 px-1">
          <h3 className="text-sm font-medium text-text-primary truncate group-hover:text-gold transition-colors duration-200">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
            {item.year > 0 && <span>{item.year}</span>}
            {item.runtime > 0 && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                <span>{item.runtime}min</span>
              </>
            )}
            {item.communityRating && (
              <>
                <span className="w-0.5 h-0.5 rounded-full bg-text-muted" />
                <span className="flex items-center gap-0.5 text-gold">
                  <Star className="w-2.5 h-2.5" fill="currentColor" />
                  {item.communityRating.toFixed(1)}
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Skeleton variant
export function MediaCardSkeleton() {
  return (
    <div className="shrink-0 w-[160px] md:w-[220px]">
      <div className="skeleton aspect-[2/3] rounded-xl" />
      <div className="mt-3 px-1 space-y-2">
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
    </div>
  );
}
