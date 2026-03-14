import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    // We use Kitsu's Edge API for free, fast anime search without auth
    const url = `https://kitsu.io/api/edge/anime?filter[text]=${encodeURIComponent(q)}&page[limit]=6`;
    
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "Accept": "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      }
    });

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const json = await res.json();
    const data = json.data || [];

    // Map Kitsu's JSON API format to our frontend's TmdbResult format
    const results = data.map((item: any) => {
      const attrs = item.attributes;
      
      // Kitsu gives rating on 100, we want it on 10
      const rawRating = attrs.averageRating ? parseFloat(attrs.averageRating) : 0;
      const normalizedRating = rawRating > 0 ? (rawRating / 10) : 0;
      
      // Get the best available title
      const title = attrs.titles?.en || attrs.titles?.en_jp || attrs.canonicalTitle || "";
      
      // Extract year from startDate (YYYY-MM-DD)
      const year = attrs.startDate ? attrs.startDate.substring(0, 4) : "";

      return {
        // We set tmdbId to the kitsu ID parsed as Int just as a unique identifier for React keys
        tmdbId: parseInt(item.id) || Date.now(),
        title: title,
        year: year,
        overview: attrs.synopsis || "",
        rating: Math.round(normalizedRating * 10) / 10,
        posterUrl: attrs.posterImage?.large || attrs.posterImage?.original || "",
        backdropUrl: attrs.coverImage?.large || attrs.coverImage?.original || attrs.posterImage?.large || "",
        runtime: attrs.episodeLength || 24, // default 24 min if unknown
        genres: ["Animation", "Anime"], // Force basic genres as Kitsu categories require deep sideloading
        country: "Japan",
        moviedbId: undefined, // Prevents the frontend from trying to fetch TMDB keywords
      };
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error("Kitsu Search error:", error);
    return NextResponse.json({ results: [] });
  }
}
