import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const tmdbId = request.nextUrl.searchParams.get("tmdbId");

  if (!tmdbId) {
    return NextResponse.json({ keywords: [] }, { status: 400 });
  }

  try {
    // Scrape TMDB movie page to extract keywords
    const res = await fetch(`https://www.themoviedb.org/movie/${tmdbId}?language=fr-FR`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      return NextResponse.json({ keywords: [] });
    }

    const html = await res.text();
    const keywords: string[] = [];
    
    // Extract keywords from HTML
    const keywordRegex = /\/keyword\/[^>]*>(.*?)<\/a>/g;
    let match;
    while ((match = keywordRegex.exec(html)) !== null) {
      keywords.push(match[1].trim());
    }

    return NextResponse.json({ keywords });
  } catch (error) {
    console.error("TMDB Keywords Error:", error);
    return NextResponse.json({ keywords: [] });
  }
}
