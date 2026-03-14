"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import StudioCard from "./StudioCard";

const STUDIOS = [
  {
    name: "Marvel",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Marvel_Logo.svg",
    glowColor: "#E62429",
  },
  {
    name: "DC",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/1/1c/DC_Comics_logo.svg",
    glowColor: "#0476F2",
  },
  {
    name: "Netflix",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg",
    glowColor: "#E50914",
  },
  {
    name: "Prime Video",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png",
    glowColor: "#00A8E1",
  },
  {
    name: "Star Wars",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Star_Wars_Logo.svg",
    glowColor: "#FFE81F",
  },
  {
    name: "Disney+",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg",
    glowColor: "#0063E5",
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
        <button className="text-[10px] md:text-xs font-bold text-text-muted hover:text-white transition-colors uppercase">
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
