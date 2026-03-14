"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SagaCard from "./SagaCard";
import { NormalizedMediaItem } from "@/lib/jellyfin/types";

interface SagaRowProps {
  sagas: Record<string, NormalizedMediaItem[]>;
}

export default function SagaRow({ sagas }: SagaRowProps) {
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

  const sagaEntries = Object.entries(sagas).filter(([_, items]) => items.length > 0);
  if (sagaEntries.length === 0) return null;

  return (
    <div className="relative group/saga-row mb-16 pt-4">
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-3">
           <div className="w-1.5 h-10 bg-gold rounded-full shimmer" />
           <h2 className="text-2xl md:text-4xl font-black text-white tracking-tight">
             Les <span className="text-gold">Sagas</span>
           </h2>
        </div>
        <button className="text-[10px] md:text-xs font-extrabold text-text-muted hover:text-gold transition-colors uppercase tracking-[0.2em]">
          Tout voir &rsaquo;
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 -top-8 -bottom-8 w-16 z-20 hidden md:flex items-center justify-center bg-gradient-to-r from-deep-black to-transparent opacity-0 group-hover/saga-row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-10 h-10 text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 -top-8 -bottom-8 w-16 z-20 hidden md:flex items-center justify-center bg-gradient-to-l from-deep-black to-transparent opacity-0 group-hover/saga-row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-10 h-10 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 md:gap-10 py-16 px-1 scrollbar-hide"
          style={{ overflowY: 'visible' }}
        >
          {sagaEntries.map(([sagaName, items]) => (
            <SagaCard key={sagaName} sagaName={sagaName} items={items} />
          ))}
        </div>
      </div>
    </div>
  );
}
