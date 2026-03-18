"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StudioCard from "./StudioCard";

const STUDIOS = [
  {
    name: "Marvel",
    logoUrl: "/studios/marvel.svg",
    glowColor: "#E62429",
    background: "linear-gradient(135deg, #E62429 0%, #B3191E 100%)",
  },
  {
    name: "DC",
    logoUrl: "/studios/dc.svg",
    glowColor: "#0476F2",
    background: "linear-gradient(135deg, #0476F2 0%, #004694 100%)",
  },
  {
    name: "Netflix",
    logoUrl: "/studios/netflix.svg",
    glowColor: "#E50914",
    background: "linear-gradient(135deg, #E50914 0%, #000000 100%)",
  },
  {
    name: "Prime Video",
    logoUrl: "/studios/prime.png",
    glowColor: "#00A8E1",
    background: "linear-gradient(135deg, #00A8E1 0%, #003049 100%)",
  },
  {
    name: "Star Wars",
    logoUrl: "/studios/starwars.svg",
    glowColor: "#FFE81F",
    background: "linear-gradient(135deg, #111111 0%, #333333 100%)",
  },
  {
    name: "Disney+",
    logoUrl: "/studios/disney.svg",
    glowColor: "#0063E5",
    background: "linear-gradient(135deg, #0063E5 0%, #001242 100%)",
  },
];

export default function StudioRow() {
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
    <div className="relative group/studio-row mt-4 mb-8">
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-[10px] md:text-sm font-black uppercase tracking-[0.2em] text-text-muted">
          Franchises & Studios
        </h2>
        <button className="text-[11px] md:text-xs font-bold text-text-muted hover:text-white transition-colors uppercase bg-white/5 md:bg-transparent px-2 py-1 rounded-md">
          Voir plus &rsaquo;
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 -top-4 -bottom-4 w-12 z-20 hidden md:flex items-center justify-center bg-gradient-to-r from-deep-black to-transparent opacity-0 group-hover/studio-row:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 -top-4 -bottom-4 w-12 z-20 hidden md:flex items-center justify-center bg-gradient-to-l from-deep-black to-transparent opacity-0 group-hover/studio-row:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6 text-white" />
        </button>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 md:gap-6 py-8 px-1 scrollbar-hide mask-fade-edges"
          style={{ overflowY: 'visible' }}
        >
          {STUDIOS.map((studio) => (
            <StudioCard key={studio.name} {...studio} />
          ))}
        </div>
      </div>
    </div>
  );
}
