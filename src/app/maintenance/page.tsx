"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Construction, Timer, Mail, RefreshCw } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <main className="relative min-h-screen w-full bg-deep-black flex flex-col items-center justify-center overflow-hidden p-6">
      {/* Background Glows — Dynamic accents */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none opacity-50" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full pointer-events-none opacity-50" />

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center">
        
        {/* Logo/Branding */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1000, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex flex-col items-center"
        >
          <h1 className="title-hero text-6xl md:text-8xl text-white tracking-tighter">
            StreamVault
          </h1>
          <div className="h-0.5 w-24 bg-accent mt-4 shadow-[0_0_20px_var(--accent)]" />
        </motion.div>

        {/* Maintenance Panel */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 800, delay: 200, ease: [0.16, 1, 0.3, 1] }}
          className="glass-panel w-full p-8 md:p-12 flex flex-col items-center text-center space-y-10"
        >
          {/* Icon with animated ring */}
          <div className="relative">
            <div className="absolute inset-0 bg-accent/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-accent/10 border border-accent/20 text-accent mb-2">
              <Construction size={44} className="animate-pulse" />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="title-section text-white">
              Maintenance en cours
            </h2>
            <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
              Nous effectuons actuellement des mises à jour pour améliorer votre expérience. 
              StreamVault sera de retour très prochainement.
            </p>
          </div>

          <div className="divider opacity-20" />

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Timer size={20} />
              </div>
              <div>
                <p className="label-refined opacity-60 mb-1">Estimation</p>
                <p className="text-sm font-medium text-white">Environ 30 minutes</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-left">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Mail size={20} />
              </div>
              <div>
                <p className="label-refined opacity-60 mb-1">Support</p>
                <p className="text-sm font-medium text-white">support@streamvault.fr</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row gap-4 w-full justify-center">
            <button 
              onClick={() => window.location.reload()}
              className="btn-primary group"
            >
              <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-700" />
              Actualiser
            </button>
            <a 
              href="mailto:support@streamvault.fr"
              className="btn-glass"
            >
              Contactez-nous
            </a>
          </div>
        </motion.div>

        {/* Footer info */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1000, delay: 800 }}
          className="mt-12 flex flex-col items-center gap-4"
        >
          <p className="text-text-muted text-[10px] tracking-[0.3em] uppercase flex items-center gap-3">
            <span>OLED Cinematic Interface</span>
            <span className="w-1 h-1 rounded-full bg-white/20" />
            <span>Vision 1.0</span>
          </p>
        </motion.div>

      </div>

      {/* Cinematic lines */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent rotate-[-15deg]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[150%] h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent rotate-[-15deg]" />
      </div>
    </main>
  );
}
