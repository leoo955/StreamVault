"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shuffle, Play, Info, ChevronRight, TrendingUp, Clock, Sparkles, Film, Tv, Plus } from "lucide-react";
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
      lastSeasonSaved: p?.seasonNum,
      lastEpisodeSaved: p?.episodeNum,
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
        <div className="relative h-[100vh] w-full overflow-hidden">
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

          <div className="absolute inset-0 bg-gradient-to-t from-[var(--deep-black)] via-[var(--deep-black)]/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--deep-black)]/70 via-transparent to-transparent" />

          {/* Hero Info — bottom left */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20 z-10">
            <motion.div
              key={hero.id + "-info"}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl"
            >
              {/* Match badge */}
              {hero.communityRating > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider" style={{ background: 'var(--gold)', color: 'var(--deep-black)' }}>
                    ★ Match {Math.round(hero.communityRating * 10)}%
                  </span>
                </div>
              )}

              {/* Logo-style title */}
              {hero.logoUrl ? (
                <img
                  src={hero.logoUrl}
                  alt={hero.title}
                  className="h-20 md:h-32 lg:h-40 object-contain object-left mb-4 drop-shadow-2xl max-w-full"
                />
              ) : (
                <h1 className="text-3xl md:text-6xl lg:text-7xl font-black mb-4 tracking-tighter leading-none italic uppercase drop-shadow-2xl">
                  {hero.title}
                </h1>
              )}

              <p className="text-xs md:text-sm text-text-secondary mb-6 line-clamp-2 md:line-clamp-3 leading-relaxed drop-shadow-md">
                {hero.overview}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <Link 
                  href={hero.type === "Series" ? `/watch/${hero.id}?s=${hero.lastSeasonSaved || 1}&e=${hero.lastEpisodeSaved || 1}` : `/watch/${hero.id}`} 
                  className="btn-gold flex items-center gap-2 text-sm md:text-base"
                >
                  <Play className="w-5 h-5 fill-current" /> Regarder
                </Link>
                <Link href={`/detail/${hero.id}`} className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-lg bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/20 transition-all text-sm font-bold">
                  + Watchlist
                </Link>
              </div>

              {/* Hero dots indicator */}
              {heroPool.length > 1 && (
                <div className="flex items-center gap-1.5 mt-6">
                  {heroPool.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setHeroIdx(i)}
                      className="transition-all duration-300"
                      style={{
                        width: i === heroIdx ? '24px' : '8px',
                        height: '4px',
                        borderRadius: '2px',
                        background: i === heroIdx ? 'var(--gold)' : 'rgba(255,255,255,0.3)',
                      }}
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* À suivre — bottom right */}
          {heroPool.length > 1 && (
            <div className="absolute bottom-8 right-6 md:bottom-14 md:right-12 z-10 hidden md:flex items-end gap-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2 mr-2">À suivre</span>
              {heroPool
                .filter((_, i) => i !== heroIdx)
                .slice(0, 3)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setHeroIdx(heroPool.indexOf(item))}
                    className="group relative w-28 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-gold/60 transition-all"
                  >
                    <Image
                      src={item.backdropUrl}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="120px"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors" />
                    <span className="absolute bottom-1 left-1.5 right-1 text-[9px] font-bold line-clamp-1 drop-shadow-lg">
                      {item.title}
                    </span>
                  </button>
                ))}
            </div>
          )}
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

        {/* Media Request CTA (Bottom) */}
        {!loading && items.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-20 py-16 px-8 rounded-[2.5rem] bg-gradient-to-br from-gold/10 via-surface/40 to-surface/20 border border-gold/10 text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gold/5 blur-3xl group-hover:bg-gold/10 transition-colors duration-700" />
            <div className="relative z-10">
              <Sparkles className="w-10 h-10 text-gold mx-auto mb-6 animate-pulse" />
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">VOUS NE TROUVEZ PAS VOTRE BONHEUR ?</h2>
              <p className="text-text-muted max-w-xl mx-auto mb-10 text-sm md:text-base leading-relaxed">
                Notre catalogue s&apos;agrandit chaque jour grâce à vous. Demandez-nous n&apos;importe quel film ou série, et nous ferons de notre mieux pour l&apos;ajouter rapidement.
              </p>
              <Link href="/requests">
                <button className="btn-gold px-10 py-4 text-base font-black uppercase tracking-widest flex items-center gap-3 mx-auto shadow-2xl shadow-gold/20 hover:scale-105 transition-transform">
                  <Plus className="w-5 h-5" /> Faire une demande
                </button>
              </Link>
            </div>
          </motion.div>
        )}

        {!loading && items.length === 0 && (
          <div className="text-center py-24 bg-surface/30 rounded-[3rem] border border-white/5 mx-auto max-w-4xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gold/5 blur-2xl" />
            <div className="relative z-10">
              <Film className="w-16 h-16 text-white/10 mx-auto mb-6" />
              <p className="text-text-muted text-xl mb-8 font-medium">{t("home.emptyLibrary")}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/requests">
                  <button className="btn-gold px-8 py-3.5 flex items-center gap-2 font-bold">
                    <Plus className="w-5 h-5" /> Demander un film
                  </button>
                </Link>
                {/* Fallback to admin if user is admin */}
                <Link href="/admin">
                  <button className="px-8 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 transition-all font-bold">
                    Aller au dashboard
                  </button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
