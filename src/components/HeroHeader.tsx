"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageColors } from "@/hooks/useImageColors";
import { useRouter } from "next/navigation";

interface HeroItem {
  id: string;
  title: string;
  tagline: string;
  year: string;
  duration: string;
  quality: string;
  rating: number;
  description: string;
  backdrop: string;
  color: string;
}

interface HeroHeaderProps {
  items: HeroItem[];
  autoPlayInterval?: number;
}

/**
 * HeroHeader component.
 * Displays a cinematic carousel of featured movies/series.
 * Occupies 100vh with immersive gradients.
 */
export function HeroHeader({ items, autoPlayInterval = 10000 }: HeroHeaderProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const hero = items[index];
  const colors = useImageColors(hero?.backdrop);

  const nextHero = useCallback(() => {
    setIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const timer = setInterval(nextHero, autoPlayInterval);
    return () => clearInterval(timer);
  }, [nextHero, autoPlayInterval]);

  if (!hero) return null;

  return (
    <section 
      className="relative h-screen w-full flex flex-col justify-end overflow-hidden"
      style={{ '--accent': colors.dominant } as React.CSSProperties}
    >
      {/* Backdrop images with crossfade & Ken Burns effect */}
      <AnimatePresence mode="wait">
        <motion.div
          key={hero.id}
          initial={{ opacity: 0, scale: 1.15 }}
          animate={{ 
            opacity: 1, 
            scale: 1,
            transition: { 
              duration: 2, 
              ease: [0.16, 1, 0.3, 1],
              scale: { duration: 15, ease: "linear" } // Slow zoom out (Ken Burns)
            } 
          }}
          exit={{ opacity: 0, transition: { duration: 1 } }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${hero.backdrop}')` }}
        />
      </AnimatePresence>

      {/* Cinematic Gradients — vertical + horizontal */}
      {/* Bottom -> Top gradient */}
      <div className="absolute inset-0 hero-gradient-v" />
      {/* Left -> Right gradient */}
      <div className="absolute inset-0 hero-gradient-h w-full md:w-3/4" />
      
      {/* Subtle accent glow at the bottom left */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[500px] opacity-20 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 15% 100%, ${colors.dominant}66 0%, transparent 70%)` }}
      />

      {/* Content */}
      <div className="relative z-10 px-8 md:px-12 lg:px-20 pb-32 md:pb-40 w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, y: 60, filter: "blur(10px)" }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              filter: "blur(0px)",
              transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }
            }}
            exit={{ opacity: 0, y: -20, filter: "blur(5px)", transition: { duration: 0.5 } }}
            className="max-w-3xl"
          >
            {/* Meta badges */}
            <div className="flex items-center flex-wrap gap-4 mb-6">
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase border border-white/10 bg-white/5 backdrop-blur-md text-white/80"
              >
                {hero.tagline}
              </motion.span>
              <div className="flex items-center gap-3 text-white/60 text-xs font-bold tracking-widest uppercase">
                <div className="flex items-center gap-1.5">
                  <Star size={14} className="text-accent" fill="currentColor" />
                  <span className="text-white">{hero.rating}</span>
                </div>
                <span className="text-white/20">·</span>
                <span>{hero.year}</span>
                <span className="text-white/20">·</span>
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>{hero.duration}</span>
                </div>
                <span className="text-white/20">·</span>
                <span className="px-1.5 py-0.5 rounded border border-white/20 text-[9px]">{hero.quality}</span>
              </div>
            </div>

            {/* Title — cinematic uppercase italic */}
            <h2 className="title-hero text-6xl md:text-8xl lg:text-9xl mb-8 whitespace-pre-line">
              {hero.title}
            </h2>

            {/* Description */}
            <p className="text-base md:text-lg text-white/70 font-normal leading-relaxed mb-12 max-w-lg drop-shadow-lg line-clamp-3 md:line-clamp-4">
              {hero.description}
            </p>

            {/* Action buttons */}
            <div className="flex flex-row items-center gap-5">
              <button 
                onClick={() => router.push(`/watch/${hero.id}`)}
                className="btn-primary group"
              >
                <Play size={22} fill="currentColor" className="group-hover:scale-110 transition-transform" />
                <span>REGARDER</span>
              </button>
              <button onClick={() => router.push('/my-list')} className="btn-glass group">
                <Plus size={22} className="group-hover:rotate-90 transition-transform" />
                <span>MA LISTE</span>
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot indicators — thin and elegant */}
        <div className="absolute bottom-12 right-8 md:right-12 flex gap-3">
          {items.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setIndex(i)}
              className={cn(
                "dot-indicator",
                i === index ? "active" : ""
              )}
            />
          ))}
        </div>

        {/* Scrolling hint */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 opacity-20 hover:opacity-50 transition-opacity cursor-pointer"
          onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
        >
          <span className="text-[9px] uppercase tracking-[0.3em] font-bold">Explorer</span>
          <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
