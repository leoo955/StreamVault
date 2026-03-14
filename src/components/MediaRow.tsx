"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import MediaCard, { MediaCardSkeleton } from "./MediaCard";
import { NormalizedMediaItem } from "@/lib/jellyfin/types";

interface MediaRowProps {
  title: string;
  items: NormalizedMediaItem[];
  loading?: boolean;
  href?: string;
  bannerUrl?: string;
}

export default function MediaRow({ title, items, loading, href, bannerUrl }: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="mb-10">
      {/* Saga Banner */}
      {bannerUrl && (
        <div className="relative w-full h-28 md:h-36 rounded-2xl overflow-hidden mb-4 bg-surface">
          <Image
            src={bannerUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6 flex items-center gap-3">
            <div
              className="w-1 h-8 rounded-full"
              style={{ background: "var(--gold-shimmer)" }}
            />
            <h2 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">{title}</h2>
          </div>
        </div>
      )}

      {/* Section header (only if no banner) */}
      {!bannerUrl && (
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-3">
            <div
              className="w-1 h-6 rounded-full"
              style={{ background: "var(--gold-shimmer)" }}
            />
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
          </div>

          {href && (
            <a
              href={href}
              className="text-sm text-text-secondary hover:text-gold transition-colors duration-200"
            >
              Voir tout →
            </a>
          )}
        </div>
      )}

      {/* Scrollable row */}
      <div className="relative group/row">
        {/* Left arrow - hidden on mobile */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-8 w-12 z-10 hidden md:flex items-center justify-center bg-gradient-to-r from-deep-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronLeft className="w-6 h-6 text-text-primary" />
        </button>

        {/* Right arrow - hidden on mobile */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-8 w-12 z-10 hidden md:flex items-center justify-center bg-gradient-to-l from-deep-black to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
        >
          <ChevronRight className="w-6 h-6 text-text-primary" />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pt-4 pb-6 px-1 scrollbar-hide"
        >
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <MediaCardSkeleton key={i} />)
            : items.map((item, i) => <MediaCard key={`${item.id}-${i}`} item={item} index={i} />)}
        </div>
      </div>
    </section>
  );
}
