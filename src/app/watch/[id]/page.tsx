"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VideoPlayer from "@/components/VideoPlayer";

interface Episode {
  number: number;
  title: string;
  streamUrl: string;
  runtime: number;
}

interface Season {
  number: number;
  episodes: Episode[];
}

interface MediaItem {
  id: string;
  title: string;
  streamUrl: string;
  type: "Movie" | "Series" | "Anime";
  seasons?: Season[];
  moviedbId?: number;
  backdropUrl?: string;
  posterUrl?: string;
}

export default function WatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [item, setItem] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedPosition, setSavedPosition] = useState(0);
  const [subtitles, setSubtitles] = useState<{name: string, language: string, url: string}[]>([]);

  const seasonNum = parseInt(searchParams.get("s") || "0");
  const episodeNum = parseInt(searchParams.get("e") || "0");

  useEffect(() => {
    fetch(`/api/media/${id}`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => { 
        if (d.item) {
          setItem(d.item);
          
          // Fetch subtitles if TMDB ID exists
          console.log("TMDB ID for item:", d.item.moviedbId);
          if (d.item.moviedbId) {
            const type = d.item.type === "Series" ? "tv" : "movie";
            let subUrl = `/api/subtitles?tmdbId=${d.item.moviedbId}&type=${type}&lang=fr,en`;
            if (type === "tv" && seasonNum && episodeNum) {
              subUrl += `&season=${seasonNum}&episode=${episodeNum}`;
            }
            console.log("Fetching subtitles from:", subUrl);
            fetch(subUrl, { cache: "no-store" })
              .then((sr) => sr.json())
              .then((sd) => {
                console.log("Subtitle API response:", sd);
                setSubtitles(sd.subtitles || []);
              })
              .catch((err) => console.error("Error fetching subtitles:", err));
          } else {
            console.warn("No tmdbId found for this media item.");
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch saved progress
    fetch("/api/progress")
      .then((r) => r.json())
      .then((d) => {
        const progress = (d.progress || []).find(
          (p: { mediaId: string; seasonNum?: number; episodeNum?: number }) =>
            p.mediaId === id &&
            (!seasonNum || p.seasonNum === seasonNum) &&
            (!episodeNum || p.episodeNum === episodeNum)
        );
        if (progress) setSavedPosition(progress.position);
      })
      .catch(() => {});
  }, [id, seasonNum, episodeNum]);

  // Determine which stream URL to use
  let streamUrl = "";
  let displayTitle = "";

  if (item) {
    if (item.type === "Series" && seasonNum > 0 && episodeNum > 0 && item.seasons) {
      const season = item.seasons.find((s) => s.number === seasonNum);
      const episode = season?.episodes.find((e) => e.number === episodeNum);
      streamUrl = episode?.streamUrl || "";
      displayTitle = `${item.title} — S${seasonNum}E${episodeNum}${episode?.title ? ` : ${episode.title}` : ""}`;
    } else {
      streamUrl = item.streamUrl;
      displayTitle = item.title;
    }
  }

  // Compute next/prev episode info for series
  const getNextEpisode = useCallback((): { season: number; episode: number; title: string } | null => {
    if (!item?.seasons || (item.type !== "Series" && item.type !== "Anime") || seasonNum === 0) return null;

    const currentSeason = item.seasons.find((s) => s.number === seasonNum);
    if (!currentSeason) return null;

    // Check if next episode exists in current season
    const nextEpInSeason = currentSeason.episodes.find((e) => e.number === episodeNum + 1);
    if (nextEpInSeason) {
      return { season: seasonNum, episode: episodeNum + 1, title: nextEpInSeason.title };
    }

    // Check next season (episode 1)
    const nextSeason = item.seasons.find((s) => s.number === seasonNum + 1);
    if (nextSeason && nextSeason.episodes.length > 0) {
      const firstEp = nextSeason.episodes[0];
      return { season: seasonNum + 1, episode: firstEp.number, title: firstEp.title };
    }

    return null; // No more episodes
  }, [item, seasonNum, episodeNum]);

  const getPrevEpisode = useCallback((): { season: number; episode: number; title: string } | null => {
    if (!item?.seasons || (item.type !== "Series" && item.type !== "Anime") || seasonNum === 0) return null;

    const currentSeason = item.seasons.find((s) => s.number === seasonNum);
    if (!currentSeason) return null;

    // Check if previous episode exists in current season
    const prevEpInSeason = currentSeason.episodes.find((e) => e.number === episodeNum - 1);
    if (prevEpInSeason) {
      return { season: seasonNum, episode: episodeNum - 1, title: prevEpInSeason.title };
    }

    // Check previous season (last episode)
    const prevSeason = item.seasons.find((s) => s.number === seasonNum - 1);
    if (prevSeason && prevSeason.episodes.length > 0) {
      const lastEp = prevSeason.episodes[prevSeason.episodes.length - 1];
      return { season: seasonNum - 1, episode: lastEp.number, title: lastEp.title };
    }

    return null;
  }, [item, seasonNum, episodeNum]);

  const navigateToEpisode = useCallback((s: number, e: number) => {
    router.push(`/watch/${id}?s=${s}&e=${e}`);
  }, [id, router]);

  const nextEp = getNextEpisode();
  const prevEp = getPrevEpisode();

  const onNextEpisode = useCallback(() => {
    if (nextEp) navigateToEpisode(nextEp.season, nextEp.episode);
  }, [nextEp, navigateToEpisode]);

  const onPrevEpisode = useCallback(() => {
    if (prevEp) navigateToEpisode(prevEp.season, prevEp.episode);
  }, [prevEp, navigateToEpisode]);

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" style={{ marginLeft: 0 }}>
        <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center" style={{ marginLeft: 0 }}>
        <div className="text-center space-y-4 max-w-md">
          <h2 className="text-xl font-semibold text-text-primary">Aucun lien vidéo</h2>
          <p className="text-text-secondary text-sm">
            {item?.type === "Series"
              ? "Cet épisode n\u0027a pas de lien vidéo. Ajoutez-en un via le dashboard admin."
              : "Ce titre n\u0027a pas de lien vidéo. Ajoutez-en un via le dashboard admin."}
          </p>
          <a href={`/detail/${id}`} className="inline-block mt-4 px-6 py-2.5 rounded-lg text-sm font-medium" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
            ← Retour
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black" style={{ marginLeft: 0 }}>
      <VideoPlayer
        streamUrl={streamUrl}
        title={displayTitle}
        itemId={id}
        startPosition={savedPosition}
        seasonNum={seasonNum || undefined}
        episodeNum={episodeNum || undefined}
        subtitles={subtitles}
        nextEpisode={nextEp ? { label: `S${nextEp.season}E${nextEp.episode}${nextEp.title ? ` : ${nextEp.title}` : ""}`, onPlay: onNextEpisode, thumbnailUrl: item?.backdropUrl } : undefined}
        prevEpisode={prevEp ? { label: `S${prevEp.season}E${prevEp.episode}${prevEp.title ? ` : ${prevEp.title}` : ""}`, onPlay: onPrevEpisode, thumbnailUrl: item?.backdropUrl } : undefined}
      />
    </div>
  );
}
