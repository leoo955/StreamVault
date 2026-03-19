import { NextRequest, NextResponse } from "next/server";
import {
  getAuthUser,
  getMediaItems,
  getMediaItemsOptimized,
  createMediaItem,
} from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const isSummary = searchParams.get("summary") === "true";
  const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

  const items = isSummary 
    ? await getMediaItemsOptimized(limit) 
    : await getMediaItems();

  const trimmedItems = items.map((item: any) => ({
    ...item,
    overview: item.overview?.substring(0, 200) || "",
  }));

  return NextResponse.json({ items: trimmedItems });
}

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
