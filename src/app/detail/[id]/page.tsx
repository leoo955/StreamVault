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
import { formatRuntime, getYear, getTmdbImage } from "@/lib/utils";

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [media, setMedia] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const { dominant: accentColor } = useImageColors(media ? getTmdbImage(media.posterPath, "w500") : null);

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
                color: "#EAB308",
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
      <div className="min-h-screen w-full flex items-center justify-center bg-deep-black">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-accent animate-spin"></div>
      </div>
    );
  }

  if (!media) return null;

  return (
    <div className="flex flex-col w-full bg-deep-black min-h-screen" style={{ '--accent': accentColor } as React.CSSProperties}>
      
      {/* ━━ Immersive Hero Backdrop ━━ */}
      <section className="relative h-[85vh] w-full flex flex-col justify-end overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${getTmdbImage(media.backdropPath)}')` }}
        />
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-black via-deep-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep-black/80 via-transparent to-transparent" />
        
        {/* Content Overlay */}
        <div className="relative z-10 px-8 md:px-12 lg:px-20 pb-20 max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Meta */}
            <div className="flex items-center gap-4 mb-6">
              <span className="px-2 py-1 rounded bg-white/10 backdrop-blur-md text-[10px] font-black tracking-widest text-white border border-white/10 uppercase">
                4K HDR
              </span>
              <div className="flex items-center gap-2 text-white/60 text-xs font-bold uppercase tracking-widest">
                <Star size={14} className="text-accent" fill="currentColor" />
                <span>{media.voteAverage?.toFixed(1) || "0.0"}</span>
                <span className="text-white/20">·</span>
                <span>{getYear(media.releaseDate)}</span>
                <span className="text-white/20">·</span>
                <span>{formatRuntime(media.runtime)}</span>
              </div>
            </div>

            {/* Title */}
            <h1 className="title-hero text-6xl md:text-8xl lg:text-9xl mb-4">
              {media.title}
            </h1>
            
            {/* Tagline / Genres */}
            <p className="text-accent font-display italic text-lg md:text-xl mb-8 tracking-wide">
              {media.genres?.join(" · ")}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-4">
              <button 
                onClick={() => router.push(`/watch/${media.id}`)}
                className="btn-primary h-14 px-10"
              >
                <Play size={20} fill="currentColor" />
                <span>REGARDER MAINTENANT</span>
              </button>
              
              <button className="btn-glass h-14 w-14 p-0 flex items-center justify-center">
                <Plus size={24} />
              </button>

              <ShareButton title={media.title} className="h-14 px-6" />
              <DownloadButton mediaId={media.id} title={media.title} className="h-14 px-6" isPremium={true} />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ━━ Details Section ━━ */}
      <section className="px-8 md:px-12 lg:px-20 py-20 grid grid-cols-1 lg:grid-cols-3 gap-20">
        
        {/* Left Column: Info */}
        <div className="lg:col-span-2 space-y-12">
          <div>
            <h3 className="label-refined mb-6 text-white">Synopsis</h3>
            <p className="text-white/70 text-lg leading-relaxed max-w-3xl">
              {media.description || "Aucun synopsis disponible."}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {media.studios?.length > 0 && (
              <div>
                <h4 className="label-refined mb-3">Studios</h4>
                <div className="flex flex-wrap gap-2">
                  {media.studios.map((studio: string) => (
                    <span key={studio} className="text-white/60 text-sm">{studio}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Cast (if available in JSON) */}
          {media.cast?.length > 0 && (
            <div>
              <h3 className="label-refined mb-8 text-white">Distribution principale</h3>
              <div className="flex flex-wrap gap-10">
                {media.cast.slice(0, 6).map((person: any) => (
                  <div key={person.name} className="group">
                    <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 mb-4 transition-transform group-hover:scale-110 flex items-center justify-center">
                      {person.profilePath ? (
                        <img 
                          src={getTmdbImage(person.profilePath, "w185")} 
                          alt={person.name} 
                          className="w-full h-full object-cover rounded-full" 
                        />
                      ) : (
                        <span className="text-white/20 font-bold">{person.name.charAt(0)}</span>
                      )}
                    </div>
                    <p className="text-white font-bold text-sm mb-1">{person.name}</p>
                    <p className="text-white/40 text-xs uppercase tracking-widest">{person.character || person.role}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sidebar Info */}
        <div className="space-y-12">
          <div className="glass-card p-8 space-y-8">
            <h3 className="label-refined text-white">Informations</h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Type</span>
                <span className="text-white capitalize">{media.type === 'movie' ? 'Film' : 'Série'}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Sortie</span>
                <span className="text-white">{media.releaseDate ? new Date(media.releaseDate).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="divider" />
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/40 uppercase tracking-widest text-[10px] font-bold">Saga</span>
                <span className="text-white">{media.saga || "Indépendant"}</span>
              </div>
            </div>

            <button className="w-full btn-glass py-4 text-[10px] font-black tracking-[0.2em] hover:bg-white/10">
              VOIR LES CRÉDITS COMPLETS
            </button>
          </div>
        </div>
      </section>

      {/* ━━ Recommendations ━━ */}
      {suggestions.length > 0 && (
        <section className="pb-32">
          <MediaRow 
            title="Dans le même genre" 
            items={suggestions} 
            delay={0.1}
          />
        </section>
      )}

    </div>
  );
}
