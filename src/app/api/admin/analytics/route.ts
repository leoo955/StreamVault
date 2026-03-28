import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";
import { prisma } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
  }

  try {
    // 1. Media Stats from Prisma
    const totalMedia = await prisma.media.count();
    const movies = await prisma.media.count({ where: { type: "Movie" } });
    const series = await prisma.media.count({ where: { type: "Series" } });
    const totalEpisodes = await prisma.episode.count();

    // 2. User Stats from Prisma
    const totalUsers = await prisma.user.count();
    
    // Active users (watched something in last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const activeResults = await prisma.progress.groupBy({
      by: ['userId'],
      where: {
        updatedAt: { gte: weekAgo }
      }
    });
    const activeUsers = activeResults.length;

    // 3. Watch Stats from Prisma
    const progressData = await prisma.progress.findMany({
      select: { progress: true, duration: true }
    });
    const totalWatchSeconds = progressData.reduce((sum, p) => 
      sum + Math.min(p.progress || 0, p.duration || 0), 0);
    const totalWatchHours = Math.round((totalWatchSeconds / 3600) * 10) / 10;

    // 4. Most watched media (Top 5)
    const topWatchedResults = await prisma.progress.groupBy({
      by: ['mediaId'],
      _count: { mediaId: true },
      orderBy: { _count: { mediaId: 'desc' } },
      take: 5
    });

    const topWatched = await Promise.all(
      topWatchedResults.map(async (row) => {
        const item = await prisma.media.findUnique({
          where: { id: row.mediaId },
          select: { title: true, posterUrl: true }
        });
        return {
          mediaId: row.mediaId,
          title: item?.title || "Inconnu",
          posterUrl: item?.posterUrl || "",
          count: row._count.mediaId,
        };
      })
    );

    // 5. Rating stats (Still JSON for now)
    const ratings = readJSON("ratings.json", []);
    const totalRatings = ratings.length;
    const avgRating = totalRatings > 0
      ? Math.round((ratings.reduce((s: number, r: any) => s + (r.stars || 0), 0) / totalRatings) * 10) / 10
      : 0;

    // 6. Comment stats from Prisma
    const totalComments = await prisma.comment.count();

    return NextResponse.json({
      media: { total: totalMedia, movies, series, totalEpisodes },
      users: { total: totalUsers, activeThisWeek: activeUsers },
      watch: { totalHours: totalWatchHours, topWatched },
      ratings: { total: totalRatings, average: avgRating },
      comments: { total: totalComments },
    });
  } catch (err: any) {
    console.error("Analytics error:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

function readJSON(filename: string, fallback: any[]) {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return fallback;
  }
}
