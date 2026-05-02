"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Play, 
  Plus, 
  Star, 
  Clock, 
} from "lucide-react";
import { useImageColors } from "@/hooks/useImageColors";
import { ShareButton } from "@/components/ShareButton";
import { DownloadButton } from "@/components/DownloadButton";
import { MediaRow } from "@/components/MediaRow";
import * as utils from "@/lib/utils";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [media, setMedia] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { dominant: accentColor } = useImageColors(media ? utils.getTmdbImage(media.posterPath, "w500") : null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await fetch(`/api/media/${id}`);
        if (res.ok) {
          const data = await res.json();
          setMedia(data);
          
          // Fetch suggestions (same genre)
          const sugRes = await fetch(`/api/media`);
          if (sugRes.ok) {
            const allMedia = await sugRes.json();
            const filtered = allMedia
              .filter((m: any) => m.id !== id && m.genres.some((g: string) => data.genres.includes(g)))
              .slice(0, 10)
              .map((m: any) => ({
                id: m.id,
                title: m.title,
                poster: getTmdbImage(m.posterPath, "w500"),
                color: "", // Dynamically extracted by MediaRow/Card
              }));
            setSuggestions(filtered);
          }
        } else {
          router.replace("/");
        }
      } catch (err) {
        console.error("Failed to fetch media details", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchDetails();
  }, [id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-white animate-spin"></div>
      </div>
    );
  }

  if (!media) return null;

  return (
    <div className="flex flex-col w-full bg-black min-h-screen selection:bg-white selection:text-black" style={{ '--accent': accentColor } as React.CSSProperties}>
      
      {/* ━━ Immersive Hero Backdrop ━━ */}
      <section className="relative h-[85vh] w-full flex flex-col justify-end overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1.05 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${utils.getTmdbImage(media.backdropPath)}')` }}
          />
          
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-transparent to-transparent" />
          
          {/* Content Overlay */}
          <div className="relative z-10 px-8 md:px-12 lg:px-20 pb-20 max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Meta */}
              <div className="flex items-center gap-6 mb-8">
                <span className="px-3 py-1.5 rounded-md bg-white/5 backdrop-blur-xl text-[9px] font-black tracking-[0.2em] text-white/80 border border-white/10 uppercase">
                  4K HDR · ULTRA VISION
                </span>
                <div className="flex items-center gap-4 text-white/40 text-[10px] font-bold uppercase tracking-[0.3em]">
                  <div className="flex items-center gap-2">
                    <Star size={12} className="text-accent" fill="currentColor" />
                    <span className="text-white/80">{media.voteAverage?.toFixed(1) || "0.0"}</span>
                  </div>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span>{utils.getYear(media.releaseDate)}</span>
                  <span className="w-1 h-1 rounded-full bg-white/10" />
                  <span>{utils.formatRuntime(media.runtime)}</span>
                </div>
              </div>

            {/* Title */}
            <h1 className="font-display font-black italic uppercase text-6xl md:text-8xl lg:text-9xl mb-6 tracking-tighter text-white">
              {media.title}
            </h1>
            
            {/* Tagline / Genres */}
            <p className="text-accent font-display font-medium italic text-xl md:text-2xl mb-12 tracking-wide opacity-80">
              {media.genres?.join(" · ")}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-5">
              <button 
                onClick={() => router.push(`/watch/${media.id}`)}
                className="bg-white text-black h-16 px-12 rounded-2xl flex items-center gap-4 font-sans font-black uppercase tracking-[0.2em] text-xs hover:scale-105 active:scale-95 transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                style={{ backgroundColor: accentColor, color: '#000' }}
              >
                <Play size={20} fill="currentColor" />
                <span>Lecture</span>
              </button>
              
              <button className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white hover:bg-white/[0.08] transition-all duration-500 active:scale-95">
                <Plus size={24} />
              </button>

              <ShareButton title={media.title} className="h-16 px-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08]" />
              <DownloadButton mediaId={media.id} title={media.title} className="h-16 px-8 rounded-2xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.08]" isPremium={true} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━ Details Section ━━ */}
      <section className="px-8 md:px-12 lg:px-20 py-32 grid grid-cols-1 lg:grid-cols-3 gap-24">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-20">
          <div className="space-y-8">
            <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/20">Synopsis</h3>
            <p className="text-white/60 text-xl md:text-2xl leading-relaxed font-light tracking-tight max-w-4xl">
              {media.description || "Aucun synopsis disponible."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {media.studios?.length > 0 && (
              <div className="space-y-6">
                <h4 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/20">Studios</h4>
                <div className="flex flex-wrap gap-x-8 gap-y-4">
                  {media.studios.map((studio: string) => (
                    <span key={studio} className="text-white/50 text-sm font-medium tracking-wide uppercase">{studio}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cast */}
          {media.cast?.length > 0 && (
            <div className="space-y-12">
              <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/20">Distribution</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-10">
                {media.cast.slice(0, 10).map((person: any) => (
                  <div key={person.name} className="group cursor-pointer">
                    <div className="aspect-square rounded-3xl bg-white/[0.02] border border-white/5 mb-6 transition-all duration-700 group-hover:scale-105 group-hover:border-white/20 flex items-center justify-center overflow-hidden">
                      {person.profilePath ? (
                        <img 
                          src={utils.getTmdbImage(person.profilePath, "w185")} 
                          alt={person.name} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                      ) : (
                        <span className="text-white/10 font-display font-light text-4xl">{person.name.charAt(0)}</span>
                      )}
                    </div>
                    <p className="text-white/80 font-bold text-xs uppercase tracking-widest mb-1 transition-colors duration-500 group-hover:text-white">{person.name}</p>
                    <p className="text-white/20 text-[9px] uppercase tracking-[0.2em] font-medium">{person.character || person.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-12">
          <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-10">
            <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/20">Détails Techniques</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-white/15 uppercase tracking-[0.3em] text-[9px] font-bold mb-0.5">Catégorie</span>
                <span className="text-white/70 font-display font-medium italic text-lg">{media.type === 'movie' ? 'Film' : 'Série'}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-end">
                <span className="text-white/15 uppercase tracking-[0.3em] text-[9px] font-bold mb-0.5">Diffusion</span>
                <span className="text-white/70 font-sans font-bold uppercase tracking-widest text-xs">{media.releaseDate ? new Date(media.releaseDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-end">
                <span className="text-white/15 uppercase tracking-[0.3em] text-[9px] font-bold mb-0.5">Univers</span>
                <span className="text-white/70 font-display font-medium italic text-lg">{media.saga || "Indépendant"}</span>
              </div>
            </div>

            <button className="w-full h-14 rounded-2xl bg-white/[0.03] border border-white/5 text-[9px] text-white/30 font-black tracking-[0.4em] uppercase hover:bg-white/[0.08] hover:text-white transition-all duration-500 mt-4">
              Metadata Complète
            </button>
          </div>
        </div>
      </section>

      {/* ━━ Recommendations ━━ */}
      {suggestions.length > 0 && (
        <section className="pb-40">
          <MediaRow 
            title="Expériences Similaires" 
            items={suggestions} 
            delay={0.1}
          />
        </section>
      )}

    </div>
  );
}
