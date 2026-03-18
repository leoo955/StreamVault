import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

// Using OpenSubtitles or a similar aggregator could be complex here.
// We'll simulate a search for .vtt links from public repositories.
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q");
  const tmdbId = request.nextUrl.searchParams.get("tmdbId");

  if (!q && !tmdbId) return NextResponse.json({ subtitles: [] });

  try {
    // Simulating finding subtitles
    const subtitles = [
      { lang: "Français", url: `https://subtitles.example.com/fr/${tmdbId || "unknown"}.vtt` },
      { lang: "English", url: `https://subtitles.example.com/en/${tmdbId || "unknown"}.vtt` },
    ];

    return NextResponse.json({ subtitles });
  } catch (error) {
    return NextResponse.json({ subtitles: [] });
  }
}
