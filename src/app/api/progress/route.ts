import { NextRequest, NextResponse } from "next/server";
import { getAuthUser, getWatchProgressForUser, saveWatchProgress, getWatchProgress } from "@/lib/db";
import { logActivity } from "@/lib/logger";

// GET /api/progress — fetch all progress for logged-in user
export async function GET(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const progress = await getWatchProgressForUser(user.id);
  return NextResponse.json({ progress });
}

// POST /api/progress — save/update watch progress
export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { mediaId, seasonNum, episodeNum, position, duration } = body;

  if (!mediaId || position === undefined || duration === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  await saveWatchProgress({
    userId: user.id,
    mediaId,
    seasonNum: seasonNum || undefined,
    episodeNum: episodeNum || undefined,
    position: Math.floor(position),
    duration: Math.floor(duration),
    updatedAt: new Date().toISOString(),
  });

  // Log "Watching" action only if progress is significant (e.g., > 10% or just started)
  // To avoid spamming logs, we could just log once per session, but for now let's log the action
  if (position < 10) {
     const detail = `ID: ${mediaId}${seasonNum ? ` S${seasonNum} E${episodeNum}` : ""}`;
     await logActivity(req, "Lecture", detail);
  }

  return NextResponse.json({ success: true });
}
