"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";

interface TrendingItem {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl: string;
  communityRating: number;
  rank: number;
  weeklyViews: number;
  type: string;
}

export default function TrendingRow({ items }: { items: TrendingItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (scrollRef.current) {
      const amount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({ left: dir === "left" ? -amount : amount, behavior: "smooth" });
    }
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5 px-1">
        <div className="w-1 h-6 rounded-full" style={{ background: "var(--gold-shimmer)" }} />
        <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
        <h2 className="text-xl font-bold text-text-primary">Tendances de la semaine</h2>
      </div>

      <div className="relative group/trending">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-0 bottom-0 w-12 z-10 hidden md:flex items-center justify-center bg-gradient-to-r from-deep-black to-transparent opacity-0 group-hover/trending:opacity-100 transition-opacity"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-0 bottom-0 w-12 z-10 hidden md:flex items-center justify-center bg-gradient-to-l from-deep-black to-transparent opacity-0 group-hover/trending:opacity-100 transition-opacity"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        <div ref={scrollRef} className="flex overflow-x-auto gap-4 md:gap-6 px-1 py-4 scrollbar-hide">
          {items.map((item, i) => (
            <Link key={item.id} href={`/detail/${item.id}`} className="shrink-0 group relative">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-end gap-0"
              >
                {/* Giant rank number */}
                <span
                  className="text-[100px] md:text-[140px] font-black leading-none select-none"
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "2px rgba(198, 165, 92, 0.4)",
                    marginRight: "-20px",
                    zIndex: 0,
                  }}
                >
                  {item.rank}
                </span>

                {/* Poster */}
                <div
                  className="relative w-[120px] md:w-[150px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl z-10 group-hover:scale-105 transition-transform duration-300"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  {/* Hover gold border */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-gold/50 transition-all duration-300" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
