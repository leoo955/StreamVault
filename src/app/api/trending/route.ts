import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/trending — Top 10 most watched media this week
export async function GET(req: NextRequest) {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Count progress entries per media in the last 7 days
    const trending = await prisma.progress.groupBy({
      by: ["mediaId"],
      where: {
        updatedAt: { gte: oneWeekAgo },
      },
      _count: { mediaId: true },
      orderBy: { _count: { mediaId: "desc" } },
      take: 10,
    });

    const mediaIds = trending.map((t: { mediaId: string }) => t.mediaId);
    const mediaItems = await prisma.media.findMany({
      where: { id: { in: mediaIds } },
      select: {
        id: true,
        title: true,
        type: true,
        posterUrl: true,
        backdropUrl: true,
        communityRating: true,
        year: true,
        genres: true,
        overview: true,
      },
    });

    const ranked = mediaIds
      .map((id: string, index: number) => {
        const media = mediaItems.find((m: { id: string }) => m.id === id);
        const count = trending[index]?._count?.mediaId || 0;
        if (!media) return null;
        return { ...media, rank: index + 1, weeklyViews: count };
      })
      .filter(Boolean);

    return NextResponse.json({ trending: ranked });
  } catch (error) {
    console.error("[Trending API]", error);
    return NextResponse.json({ trending: [] });
  }
}
