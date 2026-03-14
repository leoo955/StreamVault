"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background styling for 404 */}
      <div className="absolute inset-0 bg-deep-black z-0" />
      <div
        className="absolute inset-0 pointer-events-none opacity-30 z-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, var(--gold-dark) 0%, transparent 60%)",
          filter: "blur(80px)"
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 text-center flex flex-col items-center"
      >
        <div className="flex items-center gap-4 mb-8">
          <img src="/icon-192.png" alt="StreamVault Logo" className="w-16 h-16 object-contain drop-shadow-lg rounded-full overflow-hidden" />
          <span className="text-4xl font-bold gold-text">StreamVault</span>
        </div>

        <h1 className="text-8xl md:text-9xl font-black text-transparent bg-clip-text mb-4"
            style={{ backgroundImage: "var(--gold-shimmer)", WebkitBackgroundClip: "text" }}>
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary mb-6">
          Oups ! Vous vous êtes perdu(e) dans le vide intersidéral.
        </h2>
        
        <p className="text-text-secondary max-w-lg mx-auto mb-10">
          La page que vous recherchez semble ne pas exister. Elle a peut-être été déplacée, supprimée, ou n'a jamais existé.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-gold flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Retour à l'accueil
            </motion.button>
          </Link>
          
          <Link href="/movies">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="glass-card flex items-center justify-center gap-2 px-6 py-3 font-semibold text-text-primary hover:text-gold transition-colors w-full sm:w-auto"
            >
              <Compass className="w-5 h-5" />
              Explorer les films
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
