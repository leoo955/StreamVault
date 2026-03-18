import { NextRequest, NextResponse } from "next/server";
import { jellyfinClient } from "@/lib/jellyfin/client";
import { rateLimit } from "@/lib/rate-limit";
import { getAuthUser } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  try {
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "12");
    const items = await jellyfinClient.getLatestItems(limit);
    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching latest items:", error);
    return NextResponse.json({ error: "Failed to fetch latest items" }, { status: 500 });
  }
}
