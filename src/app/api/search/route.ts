import { NextRequest, NextResponse } from "next/server";
import { getMediaItems, getAuthUser } from "@/lib/db";

// GET /api/search?q=query&type=Movie|Series&genre=Action (auth required)
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.toLowerCase() || "";
  const type = req.nextUrl.searchParams.get("type") || "";
  const genre = req.nextUrl.searchParams.get("genre") || "";

  if (!q && !type && !genre) {
    return NextResponse.json({ results: [] });
  }

  let items = await getMediaItems();

  // Filter by type
  if (type === "Movie" || type === "Series") {
    items = items.filter((i) => i.type === type);
  }

  // Filter by genre
  if (genre) {
    items = items.filter((i) =>
      i.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
    );
  }

  // Search by query (title, overview, saga, genres)
  if (q) {
    items = items.filter((i) => {
      const searchable = [
        i.title,
        i.overview,
        i.saga || "",
        i.tagline || "",
        ...(i.genres || []),
        ...(i.studios || []),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(q);
    });
  }

  return NextResponse.json({ results: items });
}
