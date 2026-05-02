"use client";

import React from "react";
import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import { cn } from "@/lib/utils";

interface MediaItem {
  id: string;
  title: string;
  poster: string;
  color: string;
}

interface MediaRowProps {
  title: string;
  items: MediaItem[];
  delay?: number;
}

/**
 * MediaRow component.
 * Horizontal scrolling row of media cards with fade effects.
 */
export function MediaRow({ title, items, delay = 0 }: MediaRowProps) {
  return (
    <section className="px-8 md:px-12 lg:px-20">
      <div className="flex items-center justify-between mb-8">
        <motion.h3
          className="title-section"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay }}
        >
          {title}
        </motion.h3>
        <motion.button
          className="nav-link label-refined flex items-center gap-1.5 group"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: delay + 0.2 }}
        >
          Tout voir <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </motion.button>
      </div>

      {/* Row container with fade edges mask */}
      <div className="relative -mx-8 md:-mx-12 lg:-mx-20 px-8 md:px-12 lg:px-20 overflow-x-auto scrollbar-hide mask-edge-fade">
        <div className="flex gap-5 md:gap-7 pb-10">
          {items.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -100px 0px" }}
              transition={{ 
                duration: 0.8, 
                ease: [0.16, 1, 0.3, 1], 
                delay: delay + (i * 0.05) 
              }}
            >
              <MediaCard
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster}
                accentColor={movie.color}
              />
            </motion.div>
          ))}
          {/* Spacer for right padding in horizontal scroll */}
          <div className="min-w-[40px] md:min-w-[80px]" />
        </div>
      </div>
    </section>
  );
}
