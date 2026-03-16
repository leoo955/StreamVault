"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Play, Info, ChevronRight, TrendingUp, Clock, Sparkles, Film, Tv } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import MediaRow from "@/components/MediaRow";
import StudioRow from "@/components/StudioRow";
import { HeroSkeleton, RowSkeleton } from "@/components/Skeleton";
import { useI18n } from "@/lib/i18n";
import { MediaItemSummary } from "@/lib/db";
import { useInView } from "react-intersection-observer";

// Lazy load components that are below the fold or complex
const SagaRow = dynamic(() => import("@/components/SagaRow"), {
  ssr: false
});

interface ProgressItem {
  mediaId: string;
  seasonNum?: number;
  episodeNum?: number;
  position: number;
  duration: number;
  updatedAt: string;
}

// Helper to wrap rows that should only render when visible AND data is ready
function DeferredRow({ 
  title, 
  items, 
  ready, 
  fallback = null,
  children
}: { 
  title: string; 
  items: any[]; 
  ready: boolean;
  fallback?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const { ref, inView } = useInView({ triggerOnce: true, rootMargin: "200px" });
  
  return (
    <div ref={ref}>
      {ready && inView ? (
        children || (items.length > 0 && <MediaRow title={title} items={items} />)
      ) : fallback}
    </div>
  );
}

export default function HomePage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [progress, setProgress] = useState<ProgressItem[]>([]);
  const [heroIdx, setHeroIdx] = useState(0);
  const { t } = useI18n();
  const router = useRouter();

  useEffect(() => {
    // 1. URGENT SEED FETCH (Just for Hero and first row)
    const urgentFetch = fetch("/api/media?summary=true&limit=12").then(r => r.json());
    const progressFetch = fetch("/api/progress").then(r => r.json());

    Promise.all([urgentFetch, progressFetch])
      .then(([mediaRes, progressRes]) => {
        const urgentItems = (mediaRes.items || []).map((i: any) => normalize(i, progressRes.progress || []));
        setItems(urgentItems);
        setProgress(progressRes.progress || []);
        setLoading(false);

        // 2. BACKGROUND FULL FETCH (Delay slightly to ensure UI is interactive)
        setTimeout(() => {
          fetch("/api/media?summary=true")
            .then(r => r.json())
            .then(d => {
              const allItems = (d.items || []).map((i: any) => normalize(i, progressRes.progress || []));
              setItems(allItems);
              setBackgroundReady(true);
            })
            .catch(() => {});
        }, 800);
      })
      .catch(() => setLoading(false));
  }, []);

  function normalize(item: MediaItemSummary, progressArr: ProgressItem[]) {
    const p = progressArr.find(x => x.mediaId === item.id);
    const playbackPercent = p && p.duration > 0 ? Math.round((p.position / p.duration) * 100) : 0;
    return {
      ...item,
      playbackPercent: playbackPercent > 95 ? 0 : playbackPercent,
      rating: 0,
      isPlayed: false,
      playbackPosition: p?.position || 0,
      playbackDuration: p?.duration || 0,
    } as any;
  }

  // Categories
  const movies = useMemo(() => items.filter(i => i.type === "Movie"), [items]);
  const series = useMemo(() => items.filter(i => i.type === "Series"), [items]);
  const heroPool = useMemo(() => items.filter(i => i.backdropUrl).slice(0, 8), [items]);
  
  const latest = useMemo(() => items.slice(0, 15), [items]);

  const top10 = useMemo(() => 
    [...items]
      .sort((a, b) => (b.communityRating || 0) - (a.communityRating || 0))
      .slice(0, 10),
    [items]
  );

  const sagas = useMemo(() => {
    const map: Record<string, any[]> = {};
    items.forEach((item) => {
      if (item.saga && item.saga.trim()) {
        const key = item.saga.trim();
        if (!map[key]) map[key] = [];
        map[key].push(item);
      }
    });
    return map;
  }, [items]);

  const genreRows = useMemo(() => {
    const allGenres = Array.from(new Set(items.flatMap(i => i.genres)));
    return allGenres
      .map(genre => ({
        genre,
        items: items.filter(i => i.genres.includes(genre))
      }))
      .filter(g => g.items.length >= 4)
      .slice(0, 6);
  }, [items]);

  const continueItems = useMemo(() => {
    return items.filter(i => i.playbackPercent > 0).slice(0, 12);
  }, [items]);

  useEffect(() => {
    if (heroPool.length <= 1) return;
    const interval = setInterval(() => {
      setHeroIdx((prev) => (prev + 1) % heroPool.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [heroPool]);

  const surpriseMe = useCallback(() => {
    if (items.length === 0) return;
    const random = items[Math.floor(Math.random() * items.length)];
    router.push(`/watch/${random.id}`);
  }, [items, router]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <HeroSkeleton />
        <div className="px-4 md:px-8 space-y-10 pb-20 mt-4">
          <RowSkeleton />
        </div>
      </div>
    );
  }

  const hero = heroPool[heroIdx] || items[0] || null;

  return (
    <div className="min-h-screen">
      {/* ─── HERO CAROUSEL ─── */}
      {hero && (
        <div className="relative h-[80vh] min-h-[500px] max-h-[850px] w-full overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="absolute inset-0"
            >
              <Image
                src={hero.backdropUrl}
                alt={hero.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
            </motion.div>
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-black)] via-[var(--deep-black)]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--deep-black)]/80 via-transparent to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20 z-10">
            <motion.div
              key={hero.id + "-info"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 rounded bg-gold text-deep-black text-[10px] font-black uppercase tracking-widest">
                  {hero.type === "Movie" ? "Film" : "Série"}
                </span>
                {hero.communityRating > 0 && (
                  <span className="text-gold font-bold text-sm">★ {hero.communityRating.toFixed(1)}</span>
                )}
              </div>

              <h1 className="text-4xl md:text-7xl font-black mb-4 max-w-4xl tracking-tighter leading-none italic uppercase drop-shadow-2xl">
                {hero.title}
              </h1>

              <p className="text-xs md:text-base text-text-secondary mb-8 max-w-2xl line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-md">
                {hero.overview}
              </p>

              <div className="flex items-center gap-4 flex-wrap">
                <Link href={`/watch/${hero.id}`} className="btn-gold flex items-center gap-2">
                  <Play className="w-5 h-5 fill-current" /> Regarder
                </Link>
                <Link href={`/detail/${hero.id}`} className="flex items-center gap-2 px-6 py-3 rounded-lg bg-surface-light/40 backdrop-blur-md border border-white/10 hover:bg-surface-light/60 transition-all text-sm font-bold">
                  <Info className="w-5 h-5" /> Infos
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      )}

      {/* ─── CONTENT ROWS ─── */}
      <div className="px-4 md:px-8 space-y-12 pb-24 -mt-20 relative z-20">
        <StudioRow />

        {/* URGENT: Recently Added & Continue Watching (if ready) */}
        {continueItems.length > 0 && <MediaRow title="Continuer à regarder" items={continueItems} />}
        {latest.length > 0 && <MediaRow title={t("home.recentlyAdded")} items={latest} />}

        {/* BACKGROUND: The rest is deferred */}
        {backgroundReady && Object.keys(sagas).length > 0 && (
          <DeferredRow 
            title="Les Sagas" 
            items={[]} // items not used for custom SagaRow
            ready={backgroundReady} 
            fallback={<RowSkeleton />} 
          >
             <SagaRow sagas={sagas} />
          </DeferredRow>
        )}

        <DeferredRow 
          title="Incontournables (Top 10)" 
          items={top10} 
          ready={backgroundReady} 
        />

        <DeferredRow 
          title={t("nav.movies")} 
          items={movies} 
          ready={backgroundReady} 
        />

        <DeferredRow 
          title={t("nav.series")} 
          items={series} 
          ready={backgroundReady} 
        />

        {genreRows.map(({ genre, items: genreItems }) => (
          <DeferredRow 
            key={genre}
            title={genre} 
            items={genreItems} 
            ready={backgroundReady} 
          />
        ))}

        {!loading && items.length === 0 && (
          <div className="text-center py-20 bg-surface/30 rounded-3xl border border-white/5 mx-auto max-w-4xl">
            <p className="text-text-muted text-lg">{t("home.emptyLibrary")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
