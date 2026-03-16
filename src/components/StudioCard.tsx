"use client";

import { motion } from "framer-motion";
import Image from "next/image";

interface StudioCardProps {
  name: string;
  logoUrl: string;
  glowColor: string;
}

export default function StudioCard({ name, logoUrl, glowColor }: StudioCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      className="relative aspect-video w-[180px] md:w-[240px] rounded-xl cursor-pointer overflow-hidden group transition-all duration-300 shadow-xl"
      style={{
        background: "rgba(255, 255, 255, 0.05)",
        backdropFilter: "blur(4px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Glow Effect on Hover */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow: `inset 0 0 20px ${glowColor}, 0 0 30px ${glowColor}40`,
        }}
      />

      {/* Logo Container */}
      <div className="absolute inset-0 flex items-center justify-center p-5 md:p-8">
        <Image
          src={logoUrl}
          alt={name}
          fill
          unoptimized
          className="object-contain filter transition-all duration-300 group-hover:brightness-110 drop-shadow-2xl px-2"
        />
      </div>

      {/* Glass Border overlay */}
      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-white/20 transition-colors duration-300" />
    </motion.div>
  );
}
