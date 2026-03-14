import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const PROGRESS_FILE = path.join(process.cwd(), "data", "progress.json");

interface ProgressEntry {
  mediaId: string;
  userId: string;
  position: number;
  duration: number;
  updatedAt: string;
}

// GET /api/stats — returns watch statistics for current user
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let allProgress: ProgressEntry[] = [];
  try {
    if (fs.existsSync(PROGRESS_FILE)) {
      allProgress = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf-8"));
    }
  } catch {
    allProgress = [];
  }

  const userProgress = allProgress.filter((p) => p.userId === user.id);

  // Total watch time
  const totalSeconds = userProgress.reduce((sum, p) => sum + Math.min(p.position, p.duration), 0);
  const totalHours = Math.round((totalSeconds / 3600) * 10) / 10;

  // This month
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthProgress = userProgress.filter((p) => new Date(p.updatedAt) >= monthStart);
  const monthSeconds = thisMonthProgress.reduce((sum, p) => sum + Math.min(p.position, p.duration), 0);
  const monthHours = Math.round((monthSeconds / 3600) * 10) / 10;

  // Unique media watched
  const uniqueMedia = new Set(userProgress.map((p) => p.mediaId)).size;

  // This week
  const weekStart = new Date(now);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const thisWeekProgress = userProgress.filter((p) => new Date(p.updatedAt) >= weekStart);
  const weekSeconds = thisWeekProgress.reduce((sum, p) => sum + Math.min(p.position, p.duration), 0);
  const weekHours = Math.round((weekSeconds / 3600) * 10) / 10;

  return NextResponse.json({
    totalHours,
    monthHours,
    weekHours,
    uniqueMedia,
    totalEntries: userProgress.length,
  });
}
