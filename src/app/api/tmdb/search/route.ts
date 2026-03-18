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

  try {
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

    // Fetch details for the first 3 results in parallel (for speed)
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
