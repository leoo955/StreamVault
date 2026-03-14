import { NextRequest, NextResponse } from "next/server";
import { getMediaItemById, updateMediaItem } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Translate text from English to French using MyMemory (free, no key).
 */
async function translateToFrench(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (data.responseData?.translatedText) {
      const translated = data.responseData.translatedText;
      // MyMemory returns the original text in caps if it can't translate
      if (translated.toUpperCase() === translated && text.toUpperCase() !== text) {
        return text; // fallback to original
      }
      return translated;
    }
    return text;
  } catch {
    return text;
  }
}

/**
 * POST /api/media/[id]/enrich-episodes
 * Auto-fetches episode images, titles (FR), & overviews from TVMaze.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const item = await getMediaItemById(id);
  if (!item || item.type !== "Series" || !item.seasons || item.seasons.length === 0) {
    return NextResponse.json({ error: "Série introuvable ou pas de saisons" }, { status: 404 });
  }

  // Search for the show on TVMaze
  let showId: number | null = null;
  try {
    const searchUrl = `https://api.tvmaze.com/singlesearch/shows?q=${encodeURIComponent(item.title)}`;
    const searchRes = await fetch(searchUrl);
    if (searchRes.ok) {
      const show = await searchRes.json();
      showId = show.id;
    }
  } catch {
    // ignore
  }

  if (!showId) {
    return NextResponse.json({ error: "Série introuvable sur TVMaze" }, { status: 404 });
  }

  // Fetch all episodes
  let tvmazeEpisodes: TVMazeEpisode[] = [];
  try {
    const epUrl = `https://api.tvmaze.com/shows/${showId}/episodes`;
    const epRes = await fetch(epUrl);
    if (epRes.ok) {
      tvmazeEpisodes = await epRes.json();
    }
  } catch {
    return NextResponse.json({ error: "Erreur récupération épisodes" }, { status: 500 });
  }

  let enrichedCount = 0;
  let changed = false;
  const updatedSeasons = [...item.seasons];

  for (const season of updatedSeasons) {
    // Collect all episode titles to translate in batch
    const titlesToTranslate: { ep: typeof season.episodes[0]; name: string }[] = [];

    for (const ep of season.episodes) {
      const match = tvmazeEpisodes.find(
        (te) => te.season === season.number && te.number === ep.number
      );
      if (!match) continue;

      // Queue title for translation
      if (match.name) {
        titlesToTranslate.push({ ep, name: match.name });
      }

      // Set image
      if (!ep.imageUrl && match.image) {
        ep.imageUrl = match.image.original || match.image.medium || undefined;
        if (ep.imageUrl) enrichedCount++;
        changed = true;
      }

      // Set overview (translate too)
      if (!ep.overview && match.summary) {
        const cleanSummary = match.summary.replace(/<[^>]+>/g, "").trim();
        ep.overview = await translateToFrench(cleanSummary);
        changed = true;
      }

      // Set runtime
      if (!ep.runtime && match.runtime) {
        ep.runtime = match.runtime;
        changed = true;
      }
    }

    // Translate all titles for this season
    for (const { ep, name } of titlesToTranslate) {
      ep.title = await translateToFrench(name);
      changed = true;
    }
  }

  if (changed) {
    await updateMediaItem(id, { seasons: updatedSeasons });
  }

  return NextResponse.json({
    message: `${enrichedCount} épisodes enrichis via TVMaze (FR)`,
    enrichedCount,
    tvmazeShowId: showId,
  });
}

interface TVMazeEpisode {
  id: number;
  name: string;
  season: number;
  number: number;
  runtime: number | null;
  image: { medium: string; original: string } | null;
  summary: string | null;
}
