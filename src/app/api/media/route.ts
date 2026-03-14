import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  getMediaItems,
  createMediaItem,
} from "@/lib/db";

// GET /api/media — list all media items
export async function GET() {
  const items = await getMediaItems();
  return NextResponse.json({ items });
}

// POST /api/media — create a new media item (admin only)
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { 
      title, overview, year, runtime, genres, type, 
      posterUrl, backdropUrl, streamUrl, communityRating, 
      tagline, studios, languages, seasons, saga, moviedbId,
      director, cast
    } = body;

    if (!title || !type || (type === "Movie" && !streamUrl)) {
      return NextResponse.json(
        { error: "Titre, type et lien vidéo (pour les films) sont requis" },
        { status: 400 }
      );
    }

    const item = await createMediaItem({
      title,
      overview: overview || "",
      year: year || new Date().getFullYear(),
      runtime: runtime || 0,
      genres: genres || [],
      languages: languages || [],
      type,
      posterUrl: posterUrl || "",
      backdropUrl: backdropUrl || "",
      streamUrl: streamUrl || "",
      communityRating,
      tagline,
      studios,
      seasons,
      saga,
      moviedbId,
      director,
      cast,
      addedBy: user.id,
    });

    return NextResponse.json({ item, message: "Média ajouté avec succès" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur lors de l'ajout" }, { status: 500 });
  }
}
