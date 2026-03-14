import { NextResponse } from "next/server";
import { getMediaItems, updateMediaItem } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * Translate text EN→FR using MyMemory (free, no key).
 * Splits long text into chunks of ~450 chars for API limits.
 */
async function translateToFrench(text: string): Promise<string> {
  if (!text || text.trim().length === 0) return text;

  // Check if text is likely already in French (heuristic: common French words)
  const frenchWords = ["le", "la", "les", "de", "du", "des", "un", "une", "est", "dans", "avec", "pour", "sur", "qui", "que", "pas", "sont", "mais", "cette", "ses"];
  const words = text.toLowerCase().split(/\s+/);
  const frenchCount = words.filter((w) => frenchWords.includes(w)).length;
  if (frenchCount / words.length > 0.15) {
    // Likely already in French
    return text;
  }

  // Split into chunks if text is too long (MyMemory limit ~500 chars)
  const MAX_CHUNK = 450;
  if (text.length <= MAX_CHUNK) {
    return await translateChunk(text);
  }

  // Split by sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let current = "";

  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHUNK) {
      if (current) chunks.push(current.trim());
      current = sentence;
    } else {
      current += sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());

  const translated = await Promise.all(chunks.map(translateChunk));
  return translated.join(" ");
}

async function translateChunk(text: string): Promise<string> {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|fr`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    if (data.responseData?.translatedText) {
      const t = data.responseData.translatedText;
      // MyMemory returns caps text if translation fails
      if (t.toUpperCase() === t && text.toUpperCase() !== text) return text;
      return t;
    }
    return text;
  } catch {
    return text;
  }
}

/**
 * POST /api/media/translate-all
 * Translates all media overviews (movies + series) to French.
 */
export async function POST() {
  const items = await getMediaItems();
  let translatedCount = 0;

  for (const item of items) {
    let changed = false;

    // Translate main overview
    if (item.overview && item.overview.trim().length > 0) {
      const translated = await translateToFrench(item.overview);
      if (translated !== item.overview) {
        item.overview = translated;
        changed = true;
      }
    }

    // Translate tagline
    if (item.tagline && item.tagline.trim().length > 0) {
      const translated = await translateToFrench(item.tagline);
      if (translated !== item.tagline) {
        (item as unknown as Record<string, unknown>).tagline = translated;
        changed = true;
      }
    }

    // Translate episode overviews for series
    if (item.type === "Series" && item.seasons) {
      for (const season of item.seasons) {
        for (const ep of season.episodes) {
          if (ep.overview && ep.overview.trim().length > 0) {
            const translated = await translateToFrench(ep.overview);
            if (translated !== ep.overview) {
              ep.overview = translated;
              changed = true;
            }
          }
        }
      }
    }

    if (changed) {
      const updateData: Record<string, unknown> = { overview: item.overview };
      if (item.tagline) updateData.tagline = (item as unknown as Record<string, unknown>).tagline;
      if (item.seasons) updateData.seasons = item.seasons;
      await updateMediaItem(item.id, updateData);
      translatedCount++;
    }
  }

  return NextResponse.json({
    message: `${translatedCount}/${items.length} médias traduits en français`,
    translatedCount,
    total: items.length,
  });
}
