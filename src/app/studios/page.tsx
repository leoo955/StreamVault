"use client";

import React from "react";
import { motion } from "framer-motion";

export default function StudiosPage() {
  return (
    <div className="min-h-screen w-full bg-deep-black flex items-center justify-center">
      <div className="text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="title-hero text-4xl md:text-6xl text-white/20 mb-4"
        >
          STUDIOS DE PRODUCTION
        </motion.h1>
        <p className="text-white/40 label-refined">Prochainement disponible</p>
      </div>
    </div>
  );
}
