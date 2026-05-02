"use client";

import React from 'react';
import { motion } from 'framer-motion';

export default function MaintenancePage() {
  return (
    <main className="min-h-screen w-full bg-deep-black flex flex-col items-center justify-center overflow-hidden selection:bg-white selection:text-black">
      
      {/* Content Container - Extreme Negative Space */}
      <div className="relative z-10 w-full max-w-4xl px-6 flex flex-col items-center text-center">
        
        {/* Typographic Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12"
        >
          <h1 className="font-display font-black italic uppercase text-6xl sm:text-8xl md:text-[10rem] leading-[0.85] tracking-tighter text-white opacity-90">
            StreamVault
          </h1>
        </motion.div>

        {/* Singular Minimalist Separator */}
        <motion.div 
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-12 h-[1px] bg-white/20 mb-16"
        />

        {/* Poetic Copy */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2.5, delay: 1.4, ease: "easeOut" }}
          className="space-y-8"
        >
          <h2 className="title-section text-white/70 font-light tracking-wide italic">
            Le silence avant le spectacle.
          </h2>
          <p className="font-sans text-white/30 max-w-md mx-auto text-sm md:text-base leading-relaxed font-light tracking-tight">
            Nos serveurs se synchronisent en coulisses. L'interface cinématique est en cours de recalibrage pour une immersion totale.
          </p>
        </motion.div>

        {/* Metadata - Far at the bottom, ultra-minimalist */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 2.5, ease: "easeOut" }}
          className="absolute bottom-12 left-0 right-0 flex justify-center gap-16 px-6"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="label-refined text-white/20">Statut</span>
            <span className="font-sans text-[10px] text-white/40 tracking-widest uppercase">Maintenance active</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="label-refined text-white/20">Support</span>
            <span className="font-sans text-[10px] text-white/40 tracking-widest uppercase">support@streamvault.fr</span>
          </div>
        </motion.div>

      </div>

      {/* Film Grain - Barely visible for cinematic texture, breaking the digital perfect black */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.02] mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }} 
      />

      {/* Subtle edge vignette */}
      <div className="pointer-events-none fixed inset-0 z-40 bg-gradient-to-b from-black via-transparent to-black opacity-40"></div>

    </main>
  );
}
