import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const q = request.nextUrl.searchParams.get("q");
  const tmdbId = request.nextUrl.searchParams.get("tmdbId");
  const type = request.nextUrl.searchParams.get("type") || "Movie";

  if (!q && !tmdbId) return NextResponse.json({ links: [] });

  try {
    const links = [];

    if (q) {
      const encodedQuery = encodeURIComponent(q);
      links.push({
        provider: "Wawacity (Recherche VF/VOSTFR)",
        url: `https://www.wawacity.tech/?search=${encodedQuery}`,
        quality: "DL/Stream",
        type: "Search"
      });
      links.push({
        provider: "French Stream (Recherche VF)",
        url: `https://french-stream.re/index.php?do=search&subaction=search&story=${encodedQuery}`,
        quality: "Stream FR",
        type: "Search"
      });
      links.push({
        provider: "Recherche Google (Streaming VF)",
        url: `https://www.google.com/search?q=${encodedQuery}+streaming+vf+gratuit`,
        quality: "Manuel",
        type: "Search"
      });
    }

    return NextResponse.json({ links });
  } catch (error) {
    return NextResponse.json({ links: [] });
  }
}
