"use client";

import React, { useEffect, useState } from "react";
import { HeroHeader } from "@/components/HeroHeader";
import { MediaRow } from "@/components/MediaRow";
import { EmptyState } from "@/components/EmptyState";
import { useUser } from "@/lib/userProvider";
import { formatRuntime, getYear, getTmdbImage } from "@/lib/utils";
import MaintenanceView from "./MaintenanceView";

export default function HomePage() {
  const { user } = useUser();
  const [media, setMedia] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  useEffect(() => {
    if (isMaintenanceMode) {
      setIsLoading(false);
      return;
    }
    const fetchMedia = async () => {
      try {
        const res = await fetch("/api/media");
        if (res.ok) {
          const data = await res.json();
          setMedia(data);
        }
      } catch (err) {
        console.error("Failed to fetch media", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMedia();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-deep-black">
        <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-accent animate-spin"></div>
      </div>
    );
  }

  if (isMaintenanceMode) {
    return <MaintenanceView />;
  }

  if (media.length === 0) {
    return (
      <div className="min-h-screen w-full bg-deep-black flex items-center justify-center">
        <EmptyState 
          title="Le catalogue est vide" 
          description="Il n'y a pas encore de contenu ici. Si vous cherchez un film ou une série en particulier, n'hésitez pas à en faire la demande !"
          isAdmin={user?.role === 'admin'}
        />
      </div>
    );
  }

  // Transform data for components
  const featured = media
    .slice()
    .sort((a, b) => (b.voteAverage || 0) - (a.voteAverage || 0))
    .slice(0, 5)
    .map(m => ({
      id: m.id,
      title: m.title,
      tagline: m.genres?.[0] || "Exclusivité",
      year: getYear(m.releaseDate),
      duration: formatRuntime(m.runtime),
      quality: "4K HDR",
      rating: m.voteAverage || 0,
      description: m.description || "",
      backdrop: getTmdbImage(m.backdropPath),
      color: "", // Dynamically handled by component
    }));

  const trending = media.slice(0, 10).map(m => ({
    id: m.id,
    title: m.title,
    poster: getTmdbImage(m.posterPath, "w500"),
    color: "",
  }));

  const movies = media.filter(m => m.type === 'movie').slice(0, 10).map(m => ({
    id: m.id,
    title: m.title,
    poster: getTmdbImage(m.posterPath, "w500"),
    color: "",
  }));

  const series = media.filter(m => m.type === 'series').slice(0, 10).map(m => ({
    id: m.id,
    title: m.title,
    poster: getTmdbImage(m.posterPath, "w500"),
    color: "",
  }));

  return (
    <div className="flex flex-col w-full bg-deep-black overflow-hidden">
      
      {/* ━━ Featured Hero ━━ */}
      <HeroHeader items={featured} />

      {/* ━━ Main Content Rows ━━ */}
      <div className="relative z-10 flex flex-col gap-24 pb-32 -mt-20 md:-mt-32">
        
        {/* Row 1: Recently Added / Trending */}
        <MediaRow 
          title="Récemment ajouté" 
          items={trending} 
          delay={0.1}
        />

        {/* Row 2: Movies */}
        {movies.length > 0 && (
          <MediaRow 
            title="Films" 
            items={movies} 
            delay={0.2}
          />
        )}

        {/* Row 3: Series */}
        {series.length > 0 && (
          <MediaRow 
            title="Séries" 
            items={series} 
            delay={0.3}
          />
        )}

      </div>

      {/* ━━ Global Footer ━━ */}
      <footer className="w-full border-t border-white/[0.04] bg-surface py-20 px-8 md:px-12 lg:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="title-hero text-2xl text-white/10 select-none">
            STREAM<span className="font-light">VAULT</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-4">
            {["À propos", "Conditions", "Confidentialité", "Contact"].map((link) => (
              <span key={link} className="label-refined hover:text-white cursor-pointer transition-colors duration-300">
                {link}
              </span>
            ))}
          </div>

          <div className="text-white/15 text-[10px] tracking-widest uppercase font-bold">
            © 2026 StreamVault · Premium Cinematic Streaming
          </div>
        </div>
      </footer>

    </div>
  );
}
