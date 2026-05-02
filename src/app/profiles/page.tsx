"use client";

import { useUser } from "@/lib/userProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function ProfilesPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-[#000000]">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
      </div>
    );
  }

  const handleSelectProfile = (profileId: string) => {
    // Stockage dans un cookie pour que le serveur et le client y aient accès
    document.cookie = `selectedProfileId=${profileId}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
    router.push("/");
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.9 },
    show: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        type: "spring", 
        stiffness: 200, 
        damping: 20 
      }
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#000000] relative overflow-hidden font-sans">
      
      {/* Éclairage d'ambiance cinématique */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-white/[0.02] blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[400px] bg-white/[0.015] blur-[100px] rounded-full pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center w-full max-w-6xl px-6">
        
        {/* Titre Animé avec la typo Outfit */}
        <motion.h1 
          initial={{ opacity: 0, y: -20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl md:text-5xl lg:text-6xl text-white font-light tracking-[0.05em] mb-16 md:mb-24 text-center drop-shadow-2xl"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Qui regarde ?
        </motion.h1>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-row flex-wrap justify-center items-center gap-6 md:gap-10 lg:gap-14"
        >
          {user.profiles && user.profiles.map((profile: any) => (
            <motion.div 
              key={profile.id} 
              variants={itemVariants}
              onClick={() => handleSelectProfile(profile.id)}
              className="group flex flex-col items-center cursor-pointer"
            >
              {/* Conteneur Avatar : Effet iOS / VisionOS squircle */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden mb-6 transition-all duration-500 ease-out group-hover:scale-105 group-hover:-translate-y-2 group-hover:shadow-[0_20px_40px_-10px_rgba(255,255,255,0.15)] ring-2 ring-transparent group-hover:ring-white/40 group-hover:ring-offset-4 ring-offset-[#000000]">
                
                {profile.avatarUrl ? (
                  <img 
                    src={profile.avatarUrl} 
                    alt={profile.name} 
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-white/[0.03] backdrop-blur-xl border border-white/10 flex items-center justify-center">
                    <span className="text-5xl md:text-7xl font-light text-white/50 group-hover:text-white transition-colors duration-500 drop-shadow-lg" style={{ fontFamily: "var(--font-outfit)" }}>
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Voile assombrissant initial (Netflix style) */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-transparent transition-colors duration-500"></div>
                
                {/* Reflet de verre intérieur au hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
              </div>
              
              {/* Nom du profil */}
              <span className="text-base md:text-xl text-white/50 group-hover:text-white font-medium tracking-wide transition-colors duration-500">
                {profile.name}
              </span>
            </motion.div>
          ))}
          
          {/* Bouton Ajouter */}
          {(!user.profiles || user.profiles.length < 5) && (
            <motion.div 
              variants={itemVariants}
              className="group flex flex-col items-center cursor-pointer"
            >
              <div className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-[1.5rem] md:rounded-[2rem] mb-6 flex items-center justify-center transition-all duration-500 ease-out group-hover:scale-105 border border-dashed border-white/20 group-hover:border-white/60 bg-white/0 group-hover:bg-white/[0.03] backdrop-blur-md">
                <Plus strokeWidth={1} className="w-10 h-10 md:w-14 md:h-14 text-white/30 group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-90" />
              </div>
              <span className="text-base md:text-xl text-white/50 group-hover:text-white font-medium tracking-wide transition-colors duration-500">
                Ajouter
              </span>
            </motion.div>
          )}
          
        </motion.div>

        {/* Bouton Gérer les profils */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-20 md:mt-28"
        >
          <button className="px-8 py-3 rounded-full border border-white/10 text-white/40 text-xs md:text-sm tracking-[0.2em] uppercase hover:text-white hover:border-white/40 hover:bg-white/[0.03] transition-all duration-500 ease-out hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-sm">
            Gérer les profils
          </button>
        </motion.div>
        
      </div>
    </div>
  );
}



