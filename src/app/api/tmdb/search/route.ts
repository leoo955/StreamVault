import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

// 100% gratuit, aucune clé API, aucun compte
// Utilise l'API Cinemeta (Stremio) pour chercher films/séries
// Enrichit les résultats avec les détails complets (description, note, genres)

const CINEMETA = "https://v3-cinemeta.strem.io";

interface SearchResult {
  tmdbId: string;
  title: string;
  year: string;
  overview: string;
  rating: number;
  posterUrl: string;
  backdropUrl: string;
  runtime: number;
  genres: string[];
  country: string;
  moviedbId?: number;
}

// Fetch full details for a single item (has description, rating, genres)
async function getDetails(
  type: string,
  id: string
): Promise<{ description: string; rating: number; runtime: number; genres: string[]; country: string; moviedbId?: number } | null> {
  try {
    const res = await fetch(`${CINEMETA}/meta/${type}/${id}.json`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const m = data.meta;
    if (!m) return null;

    return {
      description: m.description || "",
      rating: m.imdbRating ? parseFloat(m.imdbRating) : 0,
      runtime: m.runtime ? parseInt(m.runtime) : 0,
      genres: m.genres || [],
      country: m.country || "",
      moviedbId: m.moviedb_id,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Admin only — TMDB search is used for adding media
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q");
  const type = request.nextUrl.searchParams.get("type") || "movie";

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  try {
    // 1. Try Official TMDB Search if API key exists
    if (apiKey) {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(q)}&page=1&include_adult=false`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (tmdbRes.ok) {
        const data = await tmdbRes.json();
        const results = data.results
          .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
          .map((r: any) => ({
            tmdbId: r.id,
            title: r.title || r.name,
            year: r.release_date ? r.release_date.split("-")[0] : r.first_air_date ? r.first_air_date.split("-")[0] : "",
            overview: r.overview || "",
            rating: Math.round((r.vote_average || 0) * 10) / 10,
            posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : "",
            backdropUrl: r.backdrop_path ? `https://image.tmdb.org/t/p/original${r.backdrop_path}` : "",
            runtime: 0, // Multi-search doesn't give runtime, but it's okay for search
            genres: [], // Handled by detail page or further enrichment
            country: "",
            moviedbId: r.id
          }));
        
        if (results.length > 0) return NextResponse.json({ results });
      }
    }

    // 2. Fallback to Cinemeta
    const contentType = type === "tv" ? "series" : "movie";
    const url = `${CINEMETA}/catalog/${contentType}/top/search=${encodeURIComponent(q)}.json`;

    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const metas = (data.metas || []).slice(0, 6);

    const detailPromises = metas.slice(0, 3).map((item: any) =>
      getDetails(contentType, item.imdb_id || item.id)
    );
    const details = await Promise.all(detailPromises);

    const results: SearchResult[] = metas.map((item: any, i: number) => {
      const detail = i < 3 ? details[i] : null;
      return {
        tmdbId: item.imdb_id || item.id || "",
        title: item.name || "",
        year: item.year ? String(item.year) : (item.releaseInfo || ""),
        overview: detail?.description || item.description || "",
        rating: detail?.rating || (item.imdbRating ? parseFloat(item.imdbRating) : 0),
        posterUrl: item.poster || "",
        backdropUrl: item.background || item.poster || "",
        runtime: detail?.runtime || 0,
        genres: detail?.genres || item.genres || [],
        country: detail?.country || "",
        moviedbId: detail?.moviedbId || item.moviedb_id,
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ results: [] });
  }
}
