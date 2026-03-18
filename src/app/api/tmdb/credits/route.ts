import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

// Using Cinemeta (Stremio) for free metadata
const CINEMETA = "https://v3-cinemeta.strem.io";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  const tmdbId = request.nextUrl.searchParams.get("tmdbId"); // Actually IMDB ID or Stremio ID
  const type = request.nextUrl.searchParams.get("type") || "movie";

  if (!tmdbId) {
    return NextResponse.json({ cast: [], director: "" }, { status: 400 });
  }

  try {
    const contentType = type === "tv" ? "series" : "movie";
    const res = await fetch(`${CINEMETA}/meta/${contentType}/${tmdbId}.json`, {
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
        return NextResponse.json({ cast: [], director: "" });
    }

    const data = await res.json();
    const meta = data.meta;

    if (!meta) {
        return NextResponse.json({ cast: [], director: "" });
    }

    // Cinemeta often provides director in the 'director' array or 'cast' with role 'Director'
    const director = meta.director?.[0] || meta.cast?.find((c: any) => c.role?.toLowerCase().includes("director"))?.name || "";

    const cast = (meta.cast || []).slice(0, 10).map((c: any, i: number) => ({
        id: `cast-${i}`,
        name: c.name || c,
        role: typeof c === 'string' ? "Actor" : (c.role || "Actor"),
        type: "Actor",
        imageUrl: typeof c === 'object' && c.thumbnail ? c.thumbnail : undefined
    }));

    return NextResponse.json({ cast, director });
  } catch (error) {
    console.error("Credits Fetch Error:", error);
    return NextResponse.json({ cast: [], director: "" });
  }
}
