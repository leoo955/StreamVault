"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface StudioCardProps {
  name: string;
  logoUrl: string;
  glowColor: string;
  background: string;
}

export default function StudioCard({ name, logoUrl, glowColor, background }: StudioCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative aspect-video w-[200px] md:w-[260px] rounded-2xl cursor-pointer overflow-hidden group shadow-2xl transition-all duration-300"
    >
      {/* Studio Specific Background */}
      <div 
        className="absolute inset-0 transition-all duration-500 group-hover:scale-110"
        style={{ background }}
      />
      
      {/* Subtle Pattern/Texture Overlay */}
      <div className="absolute inset-0 opacity-20 mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />

      {/* Dynamic Glow/Light Effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${glowColor}40 0%, transparent 70%)`,
        }}
      />

      {/* Scanline/Shimmer Effect */}
      <div className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite] pointer-events-none" />

      {/* Logo Container */}
      <div className="absolute inset-0 flex items-center justify-center p-6 md:p-10 z-10">
        <Image
          src={logoUrl}
          alt={name}
          fill
          unoptimized
          className="object-contain filter transition-all duration-500 group-hover:scale-110 drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] px-4"
        />
      </div>

      {/* Glass Finishing Touches */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-white/20 transition-colors duration-300 z-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/5 pointer-events-none" />
    </motion.div>
  );
}
