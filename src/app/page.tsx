"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Play, Info, ChevronRight, ChevronLeft, TrendingUp, Clock, Sparkles, Film, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import MediaRow from "@/components/MediaRow";
import StudioRow from "@/components/StudioRow";
import SagaRow from "@/components/SagaRow";
import { HeroSkeleton, RowSkeleton } from "@/components/Skeleton";
import { useI18n } from "@/lib/i18n";

interface MediaItem {
  id: string;
  title: string;
  overview: string;
  year: number;
  runtime: number;
  genres: string[];
  type: "Movie" | "Series" | "Anime";
  posterUrl: string;
  backdropUrl: string;
  streamUrl: string;
  communityRating?: number;
  tagline?: string;
  saga?: string;
  playbackPercent?: number;
  dateAdded: string;
}

interface ProgressItem {
  mediaId: string;
  seasonNum?: number;
  episodeNum?: number;
  position: number;
  duration: number;
  updatedAt: string;
}

// Define NormalizedMediaItem based on the toNormalized function's return type
type NormalizedMediaItem = MediaItem & {
  rating: number;
  isPlayed: boolean;
  playbackPosition: number;
  playbackDuration: number;
  playbackPercent: number;
  logoUrl?: string;
};

export default function HomePage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [sagaMetas, setSagaMetas] = useState<{name: string, bannerUrl: string}[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const { t } = useI18n();
  const router = useRouter();

  const surpriseMe = () => {
    if (items.length === 0) return;
    const random = items[Math.floor(Math.random() * items.length)];
    router.push(`/watch/${random.id}`);
  };

  useEffect(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((d) => setItems(d.items || []))
      .catch(() => {})
      .finally(() => setLoading(false));

    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => setProgress(d.progress || []))
      .catch(() => {});

    fetch("/api/sagas")
      .then((r) => r.json())
      .then((d) => setSagaMetas(d.sagas || []))
      .catch(() => {});
  }, []);

  // Rotate hero every 8 seconds
  const heroPool = useMemo(() =>
    items.filter((i) => i.backdropUrl).slice(0, 6),
    [items]
  );

  useEffect(() => {
    if (heroPool.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroPool.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroPool]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeroSkeleton />
        <div className="px-4 md:px-8 space-y-10 pb-20">
          <RowSkeleton />
          <RowSkeleton />
        </div>
      </div>
    );
  }

  const movies = items.filter((i) => i.type === "Movie");
  const series = items.filter((i) => i.type === "Series");
  const latest = [...items].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );
  const hero = heroPool[heroIdx] || items[0] || null;

  // Top 10 by rating
  const top10 = [...items]
    .sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0))
    .slice(0, 10);

  // Genre groups
  const allGenres = [...new Set(items.flatMap((i) => i.genres))];
  const genreRows = allGenres
    .map((genre) => ({
      genre,
      items: items.filter((i) => i.genres.includes(genre)),
    }))
    .filter((g) => g.items.length >= 3)
    .slice(0, 5);

  // Saga groups
  const sagas: Record<string, NormalizedMediaItem[]> = {};
  items.forEach((item) => {
    if (item.saga && item.saga.trim()) {
      const key = item.saga.trim();
      if (!sagas[key]) sagas[key] = [];
      sagas[key].push(toNormalized(item));
    }
  });

  // Continue watching
  const continueItems = progress
    .filter((p) => p.position > 30 && p.duration > 0 && (p.position / p.duration) < 0.95)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .map((p) => {
      const item = items.find((i) => i.id === p.mediaId);
      if (!item) return null;
      return toNormalized({
        ...item,
        playbackPercent: Math.round((p.position / p.duration) * 100),
      });
    })
    .filter(Boolean) as ReturnType<typeof toNormalized>[];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* ─── HERO CAROUSEL ─── */}
      {hero && (
        <div className="relative h-[75vh] min-h-[500px] max-h-[750px] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-surface">
                <Image
                  src={hero.backdropUrl}
                  alt={hero.title}
                  fill
                  className="object-cover"
                  priority
                  sizes="100vw"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-black)] via-[var(--deep-black)]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--deep-black)]/90 via-transparent to-transparent" />

          {/* Vignette edges */}
          <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, var(--deep-black) 100%)" }} />

          {/* Hero Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id + "-content"}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="absolute bottom-0 left-0 right-0 p-6 md:p-12"
            >
              {/* Badge */}
              <div className="flex items-center gap-2 mb-3">
                {hero.type === "Movie" ? (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: "var(--gold)", color: "var(--deep-black)" }}>
                    <Film className="w-3 h-3" /> Film
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider"
                    style={{ background: "var(--gold)", color: "var(--deep-black)" }}>
                    <Tv className="w-3 h-3" /> Série
                  </span>
                )}
                {hero.communityRating && hero.communityRating > 0 && (
                  <span className="flex items-center gap-1 text-xs font-bold text-gold">
                    ★ {hero.communityRating.toFixed(1)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-black mb-3 max-w-2xl leading-[1.1] drop-shadow-2xl">
                {hero.title}
              </h1>

              {/* Meta */}
              <div className="flex items-center gap-3 mb-3 text-sm text-text-secondary flex-wrap">
                {hero.year > 0 && <span>{hero.year}</span>}
                {hero.runtime > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    <span>{hero.runtime} min</span>
                  </>
                )}
                {hero.genres.length > 0 && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-text-muted" />
                    <span>{hero.genres.slice(0, 3).join(" • ")}</span>
                  </>
                )}
              </div>

              {/* Overview */}
              <p className="text-sm md:text-base text-text-secondary mb-6 max-w-xl line-clamp-2 leading-relaxed">
                {hero.tagline ? `"${hero.tagline}"` : hero.overview}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <Link href={`/watch/${hero.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="btn-gold flex items-center gap-2 text-sm md:text-base"
                  >
                    <Play className="w-5 h-5" fill="currentColor" />
                    Regarder
                  </motion.button>
                </Link>
                <Link href={`/detail/${hero.id}`}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: "rgba(255,255,255,0.1)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <Info className="w-5 h-5" />
                    Plus d&apos;infos
                  </motion.button>
                </Link>
                <button
                  onClick={surpriseMe}
                  className="flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-all hover:scale-105"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <Shuffle className="w-4 h-4" />
                  Surprise
                </button>
              </div>
            </motion.div>
          </AnimatePresence>


        </div>
      )}

      {/* ─── CONTENT ROWS ─── */}
      <div className="px-4 md:px-8 space-y-8 pb-20 mt-4 relative z-10">
        {/* Studio Row (Disney Style) */}
        <StudioRow />

        {/* Saga Row (Les Sagas) */}
        <SagaRow sagas={sagas} />

        {/* Continue Watching */}
        {continueItems.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Reprendre</h3>
            </div>
            <MediaRow title="Continuer à regarder" items={continueItems} />
          </section>
        )}

        {/* Recently Added */}
        {latest.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Nouveau</h3>
            </div>
            <MediaRow
              title={t("home.recentlyAdded")}
              items={latest.map(toNormalized)}
            />
          </section>
        )}

        {/* Top 10 */}
        {top10.length >= 5 && (
          <section>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-gold" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-gold">Populaire</h3>
            </div>
            <MediaRow title="Top 10" items={top10.map(toNormalized)} />
          </section>
        )}

        {/* Movies */}
        {movies.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{movies.length} films</h3>
              </div>
              <Link href="/movies" className="text-xs text-text-muted hover:text-gold transition-colors flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <MediaRow title={t("nav.movies")} items={movies.map(toNormalized)} />
          </section>
        )}

        {/* Series */}
        {series.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-text-muted" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">{series.length} séries</h3>
              </div>
              <Link href="/series" className="text-xs text-text-muted hover:text-gold transition-colors flex items-center gap-1">
                Voir tout <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <MediaRow title={t("nav.series")} items={series.map(toNormalized)} />
          </section>
        )}

        {/* Genre Rows */}
        {genreRows.map(({ genre, items: genreItems }) => (
          <MediaRow
            key={genre}
            title={genre}
            items={genreItems.map(toNormalized)}
          />
        ))}

        {/* Saga rows are now handled by SagaRow above */}

        {/* Empty state */}
        {items.length === 0 && (
          <div className="text-center py-20">
            <p className="text-text-muted text-lg mb-2">{t("home.emptyLibrary")}</p>
            <p className="text-text-muted text-sm">
              {t("home.addContent")}{" "}
              <a href="/admin/add" className="text-gold hover:text-gold-light">
                {t("home.goToAdmin")}
              </a>
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function toNormalized(item: MediaItem) {
  return {
    ...item,
    rating: 0,
    isPlayed: false,
    playbackPosition: 0,
    playbackDuration: 0,
    playbackPercent: item.playbackPercent || 0,
    logoUrl: undefined,
  };
}
