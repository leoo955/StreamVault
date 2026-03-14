"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen() {
  const [mounted, setMounted] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Check if we already showed the animation in this session
    const hasSeenSplash = sessionStorage.getItem("splash_v3_fixed");
    if (hasSeenSplash) {
      return; // Don't show
    }

    setShow(true);

    // Set timer to hide the splash screen and mark it as seen
    const timer = setTimeout(() => {
      setShow(false);
      sessionStorage.setItem("splash_v3_fixed", "true");
    }, 4500); // 4.5 seconds for a dynamic but not too long intro

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
          style={{ margin: 0 }}
        >
          {/* Background Ambient Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.2, 0], scale: [0.8, 1.2, 1.5] }}
            transition={{ duration: 4, ease: "easeOut" }}
            className="absolute rounded-full w-[600px] h-[600px] blur-[120px] pointer-events-none"
            style={{ background: "radial-gradient(circle, var(--gold) 0%, transparent 70%)" }}
          />

          {/* Main Logo Text Animation */}
          <div className="relative flex items-center justify-center">
            {/* The "SV" Logo Monogram Equivalent */}
            <motion.div
              initial={{ opacity: 0, strokeDasharray: "0 1000", fill: "rgba(198, 165, 92, 0)" }}
              animate={{ 
                opacity: [0, 1, 1], 
                strokeDasharray: ["0 1000", "1000 0"], 
                fill: ["rgba(198, 165, 92, 0)", "rgba(198, 165, 92, 0)", "#C6A55C"] 
              }}
              transition={{ 
                duration: 3, 
                times: [0, 0.6, 1], 
                ease: "easeInOut" 
              }}
              className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]"
            >
              <svg viewBox="0 0 100 100" fill="none" stroke="var(--gold)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                {/* Custom S path */}
                <path d="M 70 30 C 70 20, 30 20, 30 35 C 30 50, 70 50, 70 65 C 70 80, 30 80, 30 70" />
                {/* Custom V path */}
                <path d="M 40 20 L 50 80 L 80 20" />
              </svg>
            </motion.div>
          </div>

          {/* Brand Name Text revealing from below */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2, duration: 0.8, ease: "easeOut" }}
            className="mt-6 flex flex-col items-center"
          >
            <h1 className="text-3xl md:text-5xl font-bold tracking-[0.2em] text-white uppercase" style={{ textShadow: "0 0 10px rgba(255,255,255,0.3)" }}>
              Stream<span className="text-gold">Vault</span>
            </h1>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ delay: 2.5, duration: 0.8, ease: "circOut" }}
              className="h-0.5 bg-gradient-to-r from-transparent via-gold to-transparent mt-3"
            />
          </motion.div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
