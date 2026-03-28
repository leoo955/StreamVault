import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/recommendations — AI-powered recommendations for the current user
export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Get user's watch history
    const watchHistory = await prisma.progress.findMany({
      where: { userId: user.id },
      select: { mediaId: true },
    });
    const watchedIds = new Set(watchHistory.map((w: { mediaId: string }) => w.mediaId));

    // 2. Get all media
    const allMedia = await prisma.media.findMany({
      select: {
        id: true,
        title: true,
        type: true,
        genres: true,
        posterUrl: true,
        backdropUrl: true,
        communityRating: true,
        year: true,
        overview: true,
        saga: true,
      },
    });

    // 3. Analyze user preferences: count genre frequency from watched content
    const genreScores: Record<string, number> = {};
    const watchedMedia = allMedia.filter((m: { id: string }) => watchedIds.has(m.id));

    for (const media of watchedMedia) {
      const genres: string[] = Array.isArray(media.genres) ? media.genres : [];
      for (const genre of genres) {
        genreScores[genre] = (genreScores[genre] || 0) + 3;
      }
    }

    // 4. Score all unwatched media
    const unwatched = allMedia.filter((m: { id: string }) => !watchedIds.has(m.id));
    const scored = unwatched.map((media: any) => {
      let score = 0;
      const genres: string[] = Array.isArray(media.genres) ? media.genres : [];

      // Genre matching (strongest signal)
      for (const genre of genres) {
        score += (genreScores[genre] || 0) * 2;
      }

      // Same saga bonus
      const watchedSagas = new Set(
        watchedMedia.filter((m: any) => m.saga).map((m: any) => m.saga)
      );
      if (media.saga && watchedSagas.has(media.saga)) {
        score += 15;
      }

      // Community rating bonus
      if (media.communityRating) {
        score += media.communityRating * 0.5;
      }

      // Recency bonus
      if (media.year && media.year >= new Date().getFullYear() - 2) {
        score += 3;
      }

      return { ...media, genres, score };
    });

    scored.sort((a: any, b: any) => b.score - a.score);
    const recommendations = scored.slice(0, 15);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("[Recommendations API]", error);
    return NextResponse.json({ recommendations: [] });
  }
}
