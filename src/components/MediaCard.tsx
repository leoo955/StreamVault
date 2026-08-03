"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Plus, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useImageColors } from "@/hooks/useImageColors";
import { useRouter } from "next/navigation";

interface MediaCardProps {
  id: string;
  title: string;
  posterUrl: string;
  accentColor?: string;
  type?: "movie" | "series";
  studios?: string[];
}

/**
 * MediaCard component.
 * Features the signature "Vision" hover effect:
 * - Vertical lift (-6px)
 * - Dynamic accent glow
 * - Frosted glass action overlay
 */
export function MediaCard({ 
  id, 
  title, 
  posterUrl, 
  accentColor, 
  type = "movie",
  studios = []
}: MediaCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const extractedColors = useImageColors(posterUrl);
  
  const finalAccent = accentColor || extractedColors.dominant;
  const mainStudio = studios?.[0];

  const handleCardClick = () => {
    router.push(`/detail/${id}`);
  };

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/watch/${id}`);
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/detail/${id}`);
  };

  return (
    <motion.div
      className="relative shrink-0 w-[160px] md:w-[200px] lg:w-[220px] aspect-[2/3] group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleCardClick}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      {/* ── Dynamic Ambient Glow ── */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -inset-4 rounded-[2rem] pointer-events-none z-0"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
              background: `radial-gradient(circle at center, ${finalAccent}15 0%, transparent 70%)`,
              filter: "blur(20px)",
              boxShadow: `0 20px 50px -10px ${finalAccent}25`,
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Card Body ── */}
      <div className="relative w-full h-full rounded-xl md:rounded-2xl overflow-hidden bg-surface-light border border-white/5 z-10">
        
        {/* Studio Badge */}
        {mainStudio && (
          <div className="absolute top-3 right-3 z-40 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md">
            <span className="text-[7px] font-black text-white uppercase tracking-widest">{mainStudio}</span>
          </div>
        )}

        {/* Skeleton placeholder */}
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        {/* Poster image with subtle Ken Burns zoom on hover */}
        <motion.img
          src={posterUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
          animate={{ scale: isHovered ? 1.05 : 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* ── Hover Immersive Overlay ── */}
        <div
          className={cn(
            "absolute inset-0 z-20 flex flex-col justify-end p-5 transition-all duration-500",
            isHovered ? "opacity-100" : "opacity-0"
          )}
          style={{
            background: "linear-gradient(to top, #000 0%, rgba(0,0,0,0.4) 50%, transparent 100%)",
          }}
        >
          <motion.div
            animate={{ y: isHovered ? 0 : 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="label-refined text-[8px] font-black" style={{ color: finalAccent }}>{type === "movie" ? "FILM" : "SÉRIE"}</span>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">4K HDR</span>
            </div>
            
            <h4 className="font-display font-bold text-white text-sm md:text-base leading-tight mb-5 line-clamp-2 uppercase tracking-tight">
              {title}
            </h4>

            {/* Quick Actions — Frosted Glass style */}
            <div className="flex gap-2">
              <button
                onClick={handlePlayClick}
                className="flex-1 h-10 rounded-lg flex items-center justify-center transition-all duration-300 active:scale-95 text-black font-black text-[10px] tracking-widest"
                style={{ 
                  backgroundColor: finalAccent, 
                  boxShadow: isHovered ? `0 0 20px -5px ${finalAccent}` : "none" 
                }}
              >
                <Play size={14} fill="currentColor" />
              </button>
              
              <button 
                onClick={(e) => e.stopPropagation()}
                className="w-10 h-10 rounded-lg flex items-center justify-center frost-effect hover:bg-white/10 transition-all duration-300 active:scale-95"
              >
                <Plus size={16} className="text-white" />
              </button>
              
              <button 
                onClick={handleInfoClick}
                className="w-10 h-10 rounded-lg flex items-center justify-center frost-effect hover:bg-white/10 transition-all duration-300 active:scale-95"
              >
                <Info size={16} className="text-white" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Subtle dynamic border on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl md:rounded-2xl pointer-events-none z-30"
          animate={{
            borderColor: isHovered ? `${finalAccent}40` : "rgba(255,255,255,0.05)",
            borderWidth: isHovered ? "2px" : "1px",
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  );
}
