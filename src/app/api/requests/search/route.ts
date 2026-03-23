import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) {
    return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q");
  if (!query || query.length < 2) return NextResponse.json({ results: [] });

  const apiKey = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;

  try {
    // We use TMDB if available, otherwise fallback to Cinemeta logic (omitted here for brevity, assuming TMDB is configured)
    const res = await fetch(
      `https://api.themoviedb.org/3/search/multi?api_key=${apiKey}&language=fr-FR&query=${encodeURIComponent(query)}&page=1&include_adult=false`,
      { signal: AbortSignal.timeout(5000) }
    );

    if (!res.ok) {
      console.error(`TMDB search failed: ${res.status} ${res.statusText}`);
      return NextResponse.json({ results: [], error: "TMDB API error" }, { status: res.status });
    }
    const data = await res.json();

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

    return NextResponse.json({ results });
  } catch (err: any) {
    console.error("Request search error:", err);
    return NextResponse.json({ results: [], error: err.message }, { status: 500 });
  }
}
