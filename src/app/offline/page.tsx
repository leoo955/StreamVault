"use client";

import { WifiOff, DownloadCloud } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center mt-[-64px]" style={{ background: "var(--deep-black)" }}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-24 h-24 rounded-full flex items-center justify-center mb-8 relative"
        style={{ background: "var(--surface-light)", border: "2px solid var(--surface-hover)" }}
      >
        <WifiOff className="w-10 h-10 text-gold relative z-10" />
        <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: "var(--gold)" }} />
      </motion.div>

      <motion.h1 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-3xl md:text-5xl font-bold mb-4 tracking-tight"
      >
        Oups, connexion perdue.
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-text-secondary max-w-lg mb-10 text-lg leading-relaxed"
      >
        Il semblerait que vous soyez hors-ligne. Pas de panique, vos films et séries téléchargés vous attendent au chaud pour être visionnés sans internet !
      </motion.p>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Link href="/downloads">
          <button className="btn-gold px-8 py-3.5 rounded-xl font-bold text-lg flex items-center gap-3 shadow-[0_0_30px_rgba(198,165,92,0.3)] hover:shadow-[0_0_40px_rgba(198,165,92,0.5)] transition-shadow">
            <DownloadCloud className="w-6 h-6" />
            Aller vers Mes Téléchargements
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
