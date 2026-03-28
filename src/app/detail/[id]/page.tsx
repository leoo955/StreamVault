"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Clock, Star, Calendar, Globe, ChevronDown, ChevronUp, Layers, Film } from "lucide-react";
import Link from "next/link";
import MediaRow from "@/components/MediaRow";
import { DetailSkeleton } from "@/components/Skeleton";
import { useI18n } from "@/lib/i18n";
import CommentsSection from "@/components/CommentsSection";
import StarRating from "@/components/StarRating";
import DownloadButton from "@/components/DownloadButton";
import ShareButton from "@/components/ShareButton";
import { useImageColors } from "@/hooks/useImageColors";

interface Episode {
  number: number;
  title: string;
  streamUrl: string;
  runtime: number;
  imageUrl?: string;
  overview?: string;
}

interface Season {
  number: number;
  episodes: Episode[];
}

interface MediaItem {
  id: string;
  title: string;
  overview: string;
  year: number;
  runtime: number;
  genres: string[];
  languages: string[];
  type: "Movie" | "Series";
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  communityRating?: number;
  tagline?: string;
  studios?: string[];
  seasons?: Season[];
  saga?: string;
  dateAdded: string;
  lastSeasonSaved?: number;
  lastEpisodeSaved?: number;
}

export default function DetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [item, setItem] = useState<MediaItem | null>(null);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSeason, setExpandedSeason] = useState<number | null>(1);
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    Promise.all([
      fetch(`/api/media/${id}`).then((r) => r.json()),
      fetch("/api/media").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()).catch(() => ({})),
      fetch("/api/progress").then((r) => r.json()).catch(() => ({ progress: [] })),
    ])
      .then(async ([detail, all, me, prog]) => {
        if (detail.item) {
          const mediaItem = detail.item as MediaItem;
          
          const userProg = prog.progress?.find((p: any) => p.mediaId === id);
          if (userProg) {
            mediaItem.lastSeasonSaved = userProg.seasonNum;
            mediaItem.lastEpisodeSaved = userProg.episodeNum;
          }

          setItem(detail.item);

            if (
              mediaItem.type === "Series" &&
              mediaItem.seasons &&
              mediaItem.seasons.some((s: Season) =>
                s.episodes.some((e: Episode) => !e.imageUrl)
              )
            ) {
              fetch(`/api/media/${id}/enrich-episodes`, { method: "POST" })
                .then((r) => r.json())
                .then((d) => {
                  if (d.enrichedCount > 0) {
                    fetch(`/api/media/${id}`)
                      .then((r) => r.json())
                      .then((refreshed) => {
                        if (refreshed.item) setItem(refreshed.item);
                      });
                  }
                })
                .catch(() => {});
            }
        }
        if (me.user) setCurrentUser(me.user);
        const allItems = all.items || [];
        // Prioritize same-saga then same-genre items
        const others = allItems.filter((i: MediaItem) => i.id !== id);
        const sameSaga = detail.item?.saga ? others.filter((i: MediaItem) => i.saga === detail.item.saga) : [];
        const rest = others.filter((i: MediaItem) => !sameSaga.find((s: MediaItem) => s.id === i.id));
        setSimilar([...sameSaga, ...rest].slice(0, 10));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const toNormalized = (i: MediaItem) => ({
    ...i, rating: 0, isPlayed: false, playbackPosition: 0, playbackDuration: 0, playbackPercent: 0, logoUrl: undefined,
  });

  // Must be called before any early returns (Rules of Hooks)
  const colors = useImageColors(item?.posterUrl);

  if (loading) return <DetailSkeleton />;

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">Média introuvable</p>
          <Link href="/" className="text-gold hover:text-gold-light">Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  const totalEpisodes = item.seasons?.reduce((sum, s) => sum + s.episodes.length, 0) || 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen pb-20"
      style={{
        background: `linear-gradient(to bottom, ${colors.darkMuted} 0%, var(--deep-black) 40%)`,
      }}
    >
      {/* Backdrop */}
      <div className="relative h-[50vh] w-full">
        {item.backdropUrl ? (
          <img src={item.backdropUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${colors.muted} 0%, ${colors.darkMuted} 100%)` }} />
        )}
        {/* Dynamic gradient overlays */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${colors.darkMuted} 0%, transparent 60%)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to right, ${colors.darkMuted}CC 0%, transparent 40%)` }} />
        <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-sm font-medium hover:bg-surface-hover transition-colors">
          <ArrowLeft className="w-4 h-4" /> Retour
        </Link>
      </div>

      {/* Content */}
      <div className="px-4 md:px-8 -mt-24 md:-mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Poster with dynamic glow */}
          <div
            className="w-40 h-60 md:w-56 md:h-80 mx-auto md:mx-0 rounded-2xl shrink-0 overflow-hidden shadow-2xl relative"
            style={{
              background: "var(--surface)",
              boxShadow: `0 0 40px ${colors.dominant}40, 0 20px 60px rgba(0,0,0,0.8)`,
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {item.posterUrl ? (
              <img src={item.posterUrl} alt={item.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted text-sm">Pas d&apos;image</div>
            )}
          </div>

          <div className="flex-1 pt-4 md:pt-16 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-extrabold mb-2 tracking-tight">{item.title}</h1>
            {item.tagline && <p className="text-gold italic mb-3 text-sm md:text-base opacity-90 tracking-wide">&quot;{item.tagline}&quot;</p>}
            
            <div className="flex justify-center md:justify-start mb-6">
              <StarRating mediaId={id} />
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-text-secondary mb-6 flex-wrap font-medium">
              {item.year > 0 && <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><Calendar className="w-3.5 h-3.5 text-gold" />{item.year}</span>}
              {item.runtime > 0 && <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg"><Clock className="w-3.5 h-3.5 text-gold" />{item.runtime} min</span>}
              {item.communityRating && item.communityRating > 0 && (
                <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg">
                  <Star className="w-3.5 h-3.5 text-gold" fill="currentColor" />
                  {item.communityRating.toFixed(1)}/10
                </span>
              )}
              <span className="px-3 py-1 rounded-lg bg-gold/10 text-gold border border-gold/20 font-bold uppercase tracking-widest text-[10px]">
                {item.type === "Movie" ? "Film" : "Série"}
              </span>
              {item.type === "Series" && totalEpisodes > 0 && (
                <span className="text-[11px] text-text-muted opacity-80 uppercase tracking-wider">
                  {item.seasons?.length} saison{(item.seasons?.length || 0) > 1 ? "s" : ""} • {totalEpisodes} épisodes
                </span>
              )}
            </div>

            {/* Genres */}
            {item.genres.length > 0 && (
              <div className="flex justify-center md:justify-start gap-2 mb-6 flex-wrap">
                {item.genres.map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-surface-light/30 border border-white/5">{g}</span>
                ))}
              </div>
            )}

            {/* Saga badge */}
            {item.saga && (
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                <Layers className="w-4 h-4 text-gold" />
                <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ background: "var(--gold-glow)", border: "1px solid var(--gold)", color: "var(--gold)" }}>
                  {item.saga}
                </span>
              </div>
            )}

            {item.overview && (
              <p className="text-text-secondary text-sm md:text-lg leading-relaxed mb-8 max-w-2xl mx-auto md:mx-0 opacity-90">
                {item.overview}
              </p>
            )}

            {/* Actions Row */}
            <div className="flex items-center justify-center md:justify-start gap-4 mt-8 flex-wrap">
              {/* Play button — for movies */}
              {item.type === "Movie" && item.streamUrl && (
                <Link href={`/watch/${item.id}`} className="w-full sm:w-auto">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-gold w-full flex items-center justify-center gap-3 py-4 px-8 text-lg">
                    <Play className="w-6 h-6" fill="currentColor" /> {t("detail.watch")}
                  </motion.button>
                </Link>
              )}

              {/* Play button — for series */}
              {item.type === "Series" && item.seasons && item.seasons.length > 0 && (
                <Link href={`/watch/${item.id}?s=${item.lastSeasonSaved || 1}&e=${item.lastEpisodeSaved || 1}`} className="w-full sm:w-auto">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn-gold w-full flex items-center justify-center gap-3 py-4 px-8 text-lg">
                    <Play className="w-6 h-6" fill="currentColor" /> {t("detail.watch")}
                  </motion.button>
                </Link>
              )}

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {/* Offline Download Button — for movies */}
                {item.type === "Movie" && item.streamUrl && (
                  <DownloadButton
                    className="flex-1 sm:flex-none justify-center py-4"
                    media={{
                      id: item.id,
                      title: item.title,
                      posterUrl: item.posterUrl,
                      streamUrl: item.streamUrl,
                      type: item.type,
                      downloadedAt: "",
                    }}
                  />
                )}
                <ShareButton title={item.title} mediaId={item.id} />
              </div>
            </div>

            {item.studios && item.studios.length > 0 && (
              <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--surface-light)" }}>
                <p className="text-xs text-text-muted uppercase tracking-wider mb-1">Studio</p>
                <p className="text-text-secondary text-sm">{item.studios.join(", ")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seasons & Episodes — for series */}
      {item.type === "Series" && item.seasons && item.seasons.length > 0 && (
        <div className="px-4 md:px-8 mt-12">
          <h2 className="text-xl font-bold mb-6">Saisons & Épisodes</h2>
          <div className="space-y-3">
            {item.seasons.map((season) => (
              <div key={season.number} className="rounded-xl overflow-hidden" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-surface-hover transition-colors"
                  onClick={() => setExpandedSeason(expandedSeason === season.number ? null : season.number)}
                >
                  <div className="flex items-center gap-3">
                    {expandedSeason === season.number ? <ChevronUp className="w-4 h-4 text-gold" /> : <ChevronDown className="w-4 h-4" />}
                    <span className="font-semibold">Saison {season.number}</span>
                    <span className="text-xs text-text-muted">{season.episodes.length} épisode{season.episodes.length > 1 ? "s" : ""}</span>
                  </div>
                </button>

                {expandedSeason === season.number && (
                  <div className="px-3 md:px-5 pb-4 space-y-3">
                    {season.episodes.map((ep) => {
                      const epImage = ep.imageUrl || item.backdropUrl;
                      const watchUrl = `/watch/${item.id}?s=${season.number}&e=${ep.number}`;
                      return (
                        <Link
                          key={ep.number}
                          href={ep.streamUrl ? watchUrl : "#"}
                          className={`block ${!ep.streamUrl ? "pointer-events-none opacity-50" : ""}`}
                        >
                          <div
                            className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 rounded-xl hover:bg-surface-hover transition-all group cursor-pointer"
                            style={{ background: "var(--deep-black)" }}
                          >
                            {/* Thumbnail */}
                            <div className="relative w-full sm:w-48 md:w-56 shrink-0 aspect-video rounded-lg overflow-hidden" style={{ background: "var(--surface-light)" }}>
                              {epImage ? (
                                <img
                                  src={epImage}
                                  alt={ep.title || `Épisode ${ep.number}`}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-8 h-8 text-text-muted/30" />
                                </div>
                              )}
                              {/* Episode number badge */}
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                                E{ep.number}
                              </div>
                              {/* Play overlay on hover */}
                              {ep.streamUrl && (
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--gold-shimmer)" }}>
                                    <Play className="w-4 h-4 text-deep-black ml-0.5" fill="currentColor" />
                                  </div>
                                </div>
                              )}
                              {/* Runtime badge */}
                              {ep.runtime > 0 && (
                                <div className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}>
                                  <Clock className="w-2.5 h-2.5" />
                                  {ep.runtime}min
                                </div>
                              )}
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0 py-1 flex items-start justify-between gap-4">
                              <div className="flex-1 pr-2">
                                <h4 className="text-sm font-semibold text-text-primary group-hover:text-gold transition-colors">
                                  {ep.title || `Épisode ${ep.number}`}
                                </h4>
                                {ep.overview && (
                                  <p className="text-xs text-text-muted mt-1.5 line-clamp-3 leading-relaxed">
                                    {ep.overview}
                                  </p>
                                )}
                              </div>
                              {ep.streamUrl && (
                                <DownloadButton
                                  className="shrink-0 mt-1"
                                  media={{
                                    id: `${item.id}-S${season.number}E${ep.number}`,
                                    title: `${item.title} - S${season.number}E${ep.number}: ${ep.title}`,
                                    posterUrl: epImage,
                                    streamUrl: ep.streamUrl,
                                    type: "Series",
                                    seasonNum: season.number,
                                    episodeNum: ep.number,
                                    downloadedAt: "",
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {similar.length > 0 && (
        <div className="px-8 mt-12">
          <MediaRow title={t("detail.similar")} items={similar.map(toNormalized)} />
        </div>
      )}

      {/* Comments section */}
      <div className="px-8 mt-8 pb-16 max-w-4xl">
        <CommentsSection
          mediaId={id}
          currentUserId={currentUser?.id}
          isAdmin={currentUser?.role === "admin"}
        />
      </div>
    </motion.div>
  );
}
