import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

// Image proxy — serves Jellyfin images without exposing the server
const JELLYFIN_URL = process.env.JELLYFIN_URL || "http://localhost:8096";
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { allowed } = rateLimit(ip);
  if (!allowed) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const imageType = searchParams.get("type") || "Primary";
    const maxWidth = searchParams.get("maxWidth") || "600";
    const quality = searchParams.get("quality") || "90";

    const imageUrl = `${JELLYFIN_URL}/Items/${id}/Images/${imageType}?maxWidth=${maxWidth}&quality=${quality}&api_key=${JELLYFIN_API_KEY}`;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = await response.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "image/jpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return new NextResponse("Image fetch failed", { status: 500 });
  }
}
