import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

const CINEMETA = "https://v3-cinemeta.strem.io";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) return NextResponse.json({ results: [] });

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  try {
    // 1. Try Official TMDB Search if API key exists
    if (apiKey) {
      const tmdbRes = await fetch(
        `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query)}&page=1&include_adult=false`,
        { signal: AbortSignal.timeout(5000) }
      );

      if (tmdbRes.ok) {
        const data = await tmdbRes.json();
        const results = data.results
          .filter((r: any) => r.media_type === "movie" || r.media_type === "tv")
          .map((r: any) => ({
            tmdbId: r.id,
            title: r.title || r.name,
            type: r.media_type === "movie" ? "Movie" : "Series",
            year: r.release_date ? r.release_date.split("-")[0] : r.first_air_date ? r.first_air_date.split("-")[0] : null,
            posterUrl: r.poster_path ? `https://image.tmdb.org/t/p/w300${r.poster_path}` : null,
            overview: r.overview
          }));
        
        if (results.length > 0) return NextResponse.json({ results });
      }
    }

    // 2. Fallback to Cinemeta (Free provider)
    const res = await fetch(`${CINEMETA}/catalog/movie/top/search=${encodeURIComponent(query)}.json`, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
       return NextResponse.json({ results: [], error: "Search providers unavailable" }, { status: res.status });
    }

    const data = await res.json();
    const metas = (data.metas || []).slice(0, 10);
    const results = metas.map((m: any) => ({
      tmdbId: m.imdb_id || m.id,
      title: m.name,
      type: m.type === "movie" ? "Movie" : "Series",
      year: m.year ? String(m.year) : (m.releaseInfo || ""),
      posterUrl: m.poster || null,
      overview: m.description || ""
    }));

    if (results.length < 3) {
      try {
        const sRes = await fetch(`${CINEMETA}/catalog/series/top/search=${encodeURIComponent(query)}.json`, {
          signal: AbortSignal.timeout(5000),
        });
        if (sRes.ok) {
          const sData = await sRes.json();
          const sMetas = sData.metas || [];
          sMetas.slice(0, 5).forEach((m: any) => {
             if (!results.find((r: any) => r.tmdbId === (m.imdb_id || m.id))) {
               results.push({
                 tmdbId: m.imdb_id || m.id,
                 title: m.name,
                 type: "Series",
                 year: m.year ? String(m.year) : (m.releaseInfo || ""),
                 posterUrl: m.poster || null,
                 overview: m.description || ""
               });
             }
          });
        }
      } catch {}
    }

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Search error:", err);
    return NextResponse.json({ results: [], error: err.message }, { status: 500 });
  }
}
