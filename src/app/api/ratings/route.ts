import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const RATINGS_FILE = path.join(process.cwd(), "data", "ratings.json");

interface Rating {
  userId: string;
  mediaId: string;
  stars: number; // 1-5
  createdAt: string;
}

function readRatings(): Rating[] {
  try {
    if (!fs.existsSync(RATINGS_FILE)) return [];
    return JSON.parse(fs.readFileSync(RATINGS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeRatings(ratings: Rating[]) {
  fs.writeFileSync(RATINGS_FILE, JSON.stringify(ratings, null, 2));
}

// GET /api/ratings?mediaId=xxx — get rating for a media item
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  const mediaId = request.nextUrl.searchParams.get("mediaId");

  const ratings = readRatings();

  if (mediaId) {
    // Get average rating and user's own rating
    const mediaRatings = ratings.filter((r) => r.mediaId === mediaId);
    const avg = mediaRatings.length > 0
      ? mediaRatings.reduce((sum, r) => sum + r.stars, 0) / mediaRatings.length
      : 0;
    const userRating = user
      ? mediaRatings.find((r) => r.userId === user.id)?.stars || 0
      : 0;

    return NextResponse.json({
      average: Math.round(avg * 10) / 10,
      count: mediaRatings.length,
      userRating,
    });
  }

  // If no mediaId, return all user's ratings
  if (!user) return NextResponse.json({ ratings: [] });
  const userRatings = ratings.filter((r) => r.userId === user.id);
  return NextResponse.json({ ratings: userRatings });
}

// POST /api/ratings — rate a media item
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const { mediaId, stars } = await request.json();
  if (!mediaId || !stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "mediaId et stars (1-5) requis" }, { status: 400 });
  }

  const ratings = readRatings();

  // Update or create
  const existing = ratings.findIndex((r) => r.userId === user.id && r.mediaId === mediaId);
  if (existing >= 0) {
    ratings[existing].stars = stars;
    ratings[existing].createdAt = new Date().toISOString();
  } else {
    ratings.push({
      userId: user.id,
      mediaId,
      stars,
      createdAt: new Date().toISOString(),
    });
  }

  writeRatings(ratings);
  return NextResponse.json({ message: "Note enregistrée", stars });
}
