import { NextRequest, NextResponse } from "next/server";
import { rateLimitStream } from "@/lib/rate-limit";

// Stream proxy with Range header passthrough for seeking support
const JELLYFIN_URL = process.env.JELLYFIN_URL || "http://localhost:8096";
const JELLYFIN_API_KEY = process.env.JELLYFIN_API_KEY || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = request.headers.get("x-forwarded-for") || "anonymous";
  const { allowed } = rateLimitStream(ip);
  if (!allowed) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  try {
    const { id } = await params;
    const streamUrl = `${JELLYFIN_URL}/Items/${id}/Download?api_key=${JELLYFIN_API_KEY}`;

    // Forward the Range header for seeking
    const headers: Record<string, string> = {};
    const range = request.headers.get("range");
    if (range) {
      headers["Range"] = range;
    }

    const response = await fetch(streamUrl, { headers });

    // Create response with proper streaming headers
    const responseHeaders = new Headers();
    responseHeaders.set("Content-Type", response.headers.get("Content-Type") || "video/mp4");
    responseHeaders.set("Accept-Ranges", "bytes");

    if (response.headers.get("Content-Range")) {
      responseHeaders.set("Content-Range", response.headers.get("Content-Range")!);
    }
    if (response.headers.get("Content-Length")) {
      responseHeaders.set("Content-Length", response.headers.get("Content-Length")!);
    }

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Stream error:", error);
    return new NextResponse("Stream failed", { status: 500 });
  }
}
