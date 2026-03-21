"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Plus, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { NormalizedMediaItem } from "@/lib/jellyfin/types";

interface SagaCardProps {
  sagaName: string;
  items: NormalizedMediaItem[];
}

export default function SagaCard({ sagaName, items }: SagaCardProps) {
  const [hovered, setHovered] = useState(false);
  const firstItem = items[0];
  if (!firstItem) return null;

  return (
    <motion.div
      layout
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative shrink-0 w-[180px] md:w-[240px] cursor-pointer"
    >
      {/* Base Card (Poster) */}
      <motion.div 
        layout
        className="relative aspect-[2/3] rounded-xl overflow-hidden border border-white/5 shadow-lg group"
      >
        <Image
          src={firstItem.posterUrl}
          alt={sagaName}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 180px, 240px"
        />
        
        {/* SAGA Badge */}
        <div className="absolute top-2 left-2 z-10 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10">
          <span className="text-[8px] font-black uppercase tracking-tighter text-white/90">SAGA</span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        <div className="absolute bottom-2 left-0 right-0 px-2 text-center">
            <p className="text-[10px] font-bold text-white uppercase truncate drop-shadow-lg">{sagaName}</p>
        </div>
      </motion.div>

      {/* Expanded Overlay on Hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1.15, y: -20 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute inset-0 z-50 rounded-xl overflow-hidden shadow-2xl shadow-black/80"
            style={{
                background: "#141414",
                border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            {/* Expanded Backdrop */}
            <div className="relative h-2/3 w-full">
              <Image
                src={firstItem.backdropUrl || firstItem.posterUrl}
                alt={sagaName}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              
              {/* Close button for mobile/touch feel */}
              <button className="absolute top-2 right-2 p-1 rounded-full bg-black/40 text-white/60 hover:text-white">
                <X className="w-4 h-4" />
              </button>

              <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-center px-4">
                    <h3 className="text-xs md:text-sm font-black uppercase text-white leading-tight drop-shadow-xl">
                      {sagaName}
                    </h3>
                    <p className="text-[9px] text-text-muted mt-1">{firstItem.year}</p>
                 </div>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <Link href={firstItem.type === "Series" ? `/watch/${firstItem.id}?s=${(firstItem as any).lastSeasonSaved || 1}&e=${(firstItem as any).lastEpisodeSaved || 1}` : `/watch/${firstItem.id}`}>
                <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg bg-white text-black font-black text-[11px] uppercase hover:bg-white/90 transition-colors shadow-lg">
                  <Play className="w-4 h-4" fill="currentColor" />
                  Lecture
                </button>
              </Link>
              
              <div className="flex gap-3">
                <Link href={`/detail/${firstItem.id}`} className="flex-1">
                  <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 text-white font-bold text-[9px] uppercase hover:bg-white/20 transition-all border border-white/5">
                    <Info className="w-4 h-4" />
                    Détails
                  </button>
                </Link>
                <button className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/10 text-white font-bold text-[9px] uppercase hover:bg-white/20 transition-all border border-white/5">
                  <Plus className="w-4 h-4" />
                  Ma Liste
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
