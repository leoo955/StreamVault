import { NextRequest, NextResponse } from "next/server";
import { jellyfinClient } from "@/lib/jellyfin/client";
import { rateLimit } from "@/lib/rate-limit";
import { MediaFilter } from "@/lib/jellyfin/types";
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
    const searchParams = request.nextUrl.searchParams;
    const filters: MediaFilter = {
      sortBy: (searchParams.get("sortBy") as MediaFilter["sortBy"]) || "DateCreated",
      sortOrder: (searchParams.get("sortOrder") as MediaFilter["sortOrder"]) || "Descending",
      limit: parseInt(searchParams.get("limit") || "20"),
      startIndex: parseInt(searchParams.get("startIndex") || "0"),
      genreId: searchParams.get("genreId") || undefined,
      searchTerm: searchParams.get("search") || undefined,
      includeItemTypes: searchParams.get("type") || "Movie,Series",
    };

    const data = await jellyfinClient.getItems(filters);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}
