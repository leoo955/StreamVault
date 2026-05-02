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
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black relative overflow-hidden selection:bg-white selection:text-black">
      
      {/* Content Wrapper */}
      <div className="relative z-20 flex flex-col items-center w-full max-w-7xl px-6">
        
        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="font-display font-light text-4xl md:text-6xl text-white tracking-[0.15em] mb-20 md:mb-28 text-center uppercase"
        >
          Qui regarde ?
        </motion.h1>
        
        {/* Profiles Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-row flex-wrap justify-center items-center gap-8 md:gap-12 lg:gap-16"
        >
          {user.profiles && user.profiles.map((profile: any) => (
            <motion.div 
              key={profile.id} 
              variants={itemVariants}
              onClick={() => handleSelectProfile(profile.id)}
              className="group flex flex-col items-center cursor-pointer relative"
            >
              {/* Glass Circle Profile */}
              <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full frost-effect flex items-center justify-center overflow-hidden transition-all duration-500 group-hover:scale-105 group-hover:border-white/30 group-hover:shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/[0.02]">
                    <span className="text-5xl md:text-7xl font-light text-white/40 group-hover:text-white transition-colors duration-500 font-display">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Internal Reflection */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              </div>
              
              {/* Label */}
              <span className="mt-8 text-xs md:text-sm text-white/30 group-hover:text-white font-bold uppercase tracking-[0.4em] transition-all duration-500">
                {profile.name}
              </span>
            </motion.div>
          ))}
          
          {/* Add Button */}
          {(!user.profiles || user.profiles.length < 5) && (
            <motion.div 
              variants={itemVariants}
              onClick={(e) => {
                e.stopPropagation();
                setIsCreating(true);
              }}
              className="group flex flex-col items-center cursor-pointer relative"
            >
              <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border border-dashed border-white/10 flex items-center justify-center transition-all duration-500 group-hover:scale-105 group-hover:border-white/40 bg-white/0 group-hover:bg-white/[0.03]">
                <Plus strokeWidth={1} className="w-10 h-10 md:w-14 md:h-14 text-white/20 group-hover:text-white transition-all duration-500 group-hover:rotate-90" />
              </div>
              <span className="mt-8 text-xs md:text-sm text-white/20 group-hover:text-white font-bold uppercase tracking-[0.4em] transition-all duration-500">
                Ajouter
              </span>
            </motion.div>
          )}
          
        </motion.div>

        {/* Footer Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1.5 }}
          className="mt-28 md:mt-36"
        >
          <button className="px-10 py-3 rounded-full border border-white/5 text-white/20 text-[10px] tracking-[0.5em] uppercase hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-all duration-500">
            Gérer les profils
          </button>
        </motion.div>
        
      </div>

      {/* Creation Modal - Higher Z-Index */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-md bg-[#0C0C0C] border border-white/10 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => setIsCreating(false)}
                className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <h3 className="text-2xl md:text-3xl font-display font-light text-white mb-12 tracking-wide uppercase">Nouveau profil</h3>

              <form onSubmit={handleCreateProfile} className="space-y-12">
                <div className="space-y-4">
                  <label className="label-refined text-white/20 text-[10px]">Nom du profil</label>
                  <input 
                    autoFocus
                    type="text"
                    value={newProfileName}
                    onChange={(e) => setNewProfileName(e.target.value)}
                    placeholder="Ex: Invité, Enfants..."
                    className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-white/30 transition-all placeholder:text-white/10"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={!newProfileName.trim() || isSubmitting}
                  className="w-full bg-white text-black font-bold uppercase text-xs tracking-widest py-5 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
                >
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Créer le profil"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grain Overlay - Pointer Events None strictly applied */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.012] mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }} 
      />
    </div>
  );
}
