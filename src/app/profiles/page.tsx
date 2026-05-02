"use client";

import { useUser } from "@/lib/userProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Loader2 } from "lucide-react";

export default function ProfilesPage() {
  const { user, isLoading, refreshUser } = useUser();
  const router = useRouter();
  
  // UI State
  const [hoveredProfileId, setHoveredProfileId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProfileName, setNewProfileName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
      </div>
    );
  }

  const handleSelectProfile = (profileId: string) => {
    document.cookie = `selectedProfileId=${profileId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    router.push("/");
  };

  const handleCreateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newProfileName }),
      });

      if (res.ok) {
        setNewProfileName("");
        setIsCreating(false);
        await refreshUser();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de la création du profil");
      }
    } catch (err) {
      console.error(err);
      alert("Une erreur est survenue");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden selection:bg-white selection:text-black">
      
      {/* Cinematic Content */}
      <div className="z-10 flex flex-col items-center w-full max-w-7xl px-6">
        
        {/* Monolith Title */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-light text-5xl md:text-7xl lg:text-8xl text-white tracking-[0.1em] mb-24 md:mb-32 text-center"
        >
          Qui regarde ?
        </motion.h1>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-row flex-wrap justify-center items-center gap-10 md:gap-16 lg:gap-20"
        >
          {user.profiles && user.profiles.map((profile: any) => {
            const isDimmed = hoveredProfileId !== null && hoveredProfileId !== profile.id;
            const isFocused = hoveredProfileId === profile.id;

            return (
              <motion.div 
                key={profile.id} 
                variants={itemVariants}
                onMouseEnter={() => setHoveredProfileId(profile.id)}
                onMouseLeave={() => setHoveredProfileId(null)}
                onClick={() => handleSelectProfile(profile.id)}
                className="group flex flex-col items-center cursor-pointer relative"
              >
                {/* Monolith Squircle Avatar */}
                <div className={`
                  relative w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 
                  rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden mb-8 
                  transition-all duration-700 ease-luxury
                  ${isDimmed ? "opacity-30 scale-95 blur-[2px]" : "opacity-100 scale-100"}
                  ${isFocused ? "shadow-[0_0_80px_-20px_rgba(255,255,255,0.15)] ring-2 ring-white/20" : "ring-0 ring-transparent"}
                `}>
                  
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.name} 
                      className="w-full h-full object-cover transition-transform duration-1000 ease-luxury group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-light border border-white/5 flex items-center justify-center">
                      <span className="text-6xl md:text-8xl font-light text-white/30 font-display">
                        {profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  {/* Subtle Glass Reflection Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                </div>
                
                {/* Name Label */}
                <motion.span 
                  animate={{ opacity: isDimmed ? 0.2 : isFocused ? 1 : 0.4 }}
                  className="text-xs md:text-sm font-sans font-bold uppercase tracking-[0.3em] text-white transition-opacity duration-700"
                >
                  {profile.name}
                </motion.span>
              </motion.div>
            );
          })}
          
          {/* Add Profile Monolith */}
          {(!user.profiles || user.profiles.length < 5) && (
            <motion.div 
              variants={itemVariants}
              onClick={() => setIsCreating(true)}
              onMouseEnter={() => setHoveredProfileId('add-btn')}
              onMouseLeave={() => setHoveredProfileId(null)}
              className={`
                group flex flex-col items-center cursor-pointer
                transition-all duration-700 ease-luxury
                ${hoveredProfileId !== null && hoveredProfileId !== 'add-btn' ? "opacity-30 scale-95 blur-[2px]" : "opacity-100"}
              `}
            >
              <div className={`
                w-32 h-32 md:w-44 md:h-44 lg:w-56 lg:h-56 
                rounded-[2.5rem] md:rounded-[3.5rem] mb-8 
                flex items-center justify-center 
                transition-all duration-700 ease-luxury
                border border-dashed border-white/10 group-hover:border-white/40
                bg-white/0 group-hover:bg-white/5
                ${hoveredProfileId === 'add-btn' ? "shadow-[0_0_80px_-20px_rgba(255,255,255,0.1)] scale-105" : ""}
              `}>
                <Plus strokeWidth={1} className="w-12 h-12 md:w-20 md:h-20 text-white/20 group-hover:text-white transition-all duration-700 group-hover:rotate-90" />
              </div>
              <span className="text-xs md:text-sm font-sans font-bold uppercase tracking-[0.3em] text-white/40 group-hover:text-white transition-colors duration-700">
                Ajouter
              </span>
            </motion.div>
          )}
          
        </motion.div>

        {/* Global Footer Controls */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 1.5 }}
          className="mt-32 md:mt-40"
        >
          <button className="px-12 py-4 rounded-full border border-white/5 text-white/20 text-[10px] tracking-[0.4em] uppercase hover:text-white hover:border-white/20 transition-all duration-700 ease-luxury backdrop-blur-sm">
            Gérer les profils
          </button>
        </motion.div>
        
      </div>

      {/* Profile Creation Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-surface border border-white/10 rounded-[3rem] p-10 md:p-14 relative overflow-hidden"
            >
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-3xl font-display font-light text-white mb-12 tracking-wide">Nouveau profil</h3>

              <form onSubmit={handleCreateProfile} className="space-y-12">
                <div className="space-y-4">
                  <label className="label-refined text-white/20 text-[10px]">Nom du profil</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Ex: Invité, Enfants..."
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white text-lg focus:outline-none focus:border-white/20 transition-all placeholder:text-white/10"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!newProfileName.trim() || isSubmitting}
                  className="w-full btn-primary disabled:opacity-30 disabled:scale-100 flex justify-center py-5 rounded-2xl"
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : "Créer le profil"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Film Grain Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.015] mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }} 
      />
    </div>
  );
}
