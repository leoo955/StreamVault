import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), "data");

export async function GET() {
  // Read all data files
  const media = readJSON("media.json", []);
  const users = readJSON("users.json", []);
  const progress = readJSON("progress.json", []);
  const ratings = readJSON("ratings.json", []);
  const comments = readJSON("comments.json", []);

  // Media stats
  const totalMedia = media.length;
  const movies = media.filter((m: { type: string }) => m.type === "Movie").length;
  const series = media.filter((m: { type: string }) => m.type === "Series").length;
  const totalEpisodes = media
    .filter((m: { type: string }) => m.type === "Series")
    .reduce((sum: number, m: { seasons?: { episodes: unknown[] }[] }) => 
      sum + (m.seasons || []).reduce((s: number, sn: { episodes: unknown[] }) => s + sn.episodes.length, 0), 0);

  // User stats
  const totalUsers = users.length;

  // Watch stats
  const totalWatchSeconds = progress.reduce((sum: number, p: { position: number; duration: number }) => 
    sum + Math.min(p.position, p.duration), 0);
  const totalWatchHours = Math.round((totalWatchSeconds / 3600) * 10) / 10;

  // Most watched media
  const watchCounts: Record<string, number> = {};
  for (const p of progress) {
    const mid = (p as { mediaId: string }).mediaId;
    watchCounts[mid] = (watchCounts[mid] || 0) + 1;
  }
  const topWatched = Object.entries(watchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([mediaId, count]) => {
      const item = media.find((m: { id: string }) => m.id === mediaId);
      return {
        mediaId,
        title: item?.title || "Inconnu",
        posterUrl: item?.posterUrl || "",
        count,
      };
    });

  // Active users (watched something in last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const activeUsers = new Set(
    progress
      .filter((p: { updatedAt: string }) => new Date(p.updatedAt) > weekAgo)
      .map((p: { userId: string }) => p.userId)
  ).size;

  // Rating stats
  const totalRatings = ratings.length;
  const avgRating = totalRatings > 0
    ? Math.round((ratings.reduce((s: number, r: { stars: number }) => s + r.stars, 0) / totalRatings) * 10) / 10
    : 0;

  // Comment stats
  const totalComments = comments.length;

  return NextResponse.json({
    media: { total: totalMedia, movies, series, totalEpisodes },
    users: { total: totalUsers, activeThisWeek: activeUsers },
    watch: { totalHours: totalWatchHours, topWatched },
    ratings: { total: totalRatings, average: avgRating },
    comments: { total: totalComments },
  });
}

function readJSON(filename: string, fallback: unknown[]) {
  try {
    const p = path.join(DATA_DIR, filename);
    if (!fs.existsSync(p)) return fallback;
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return fallback;
  }
}
