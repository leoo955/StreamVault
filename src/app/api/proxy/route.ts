import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export const runtime = 'edge';

const getSecret = () => {
  const secret = process.env.JWT_SECRET || "streamvault-secret-key-change-in-production-2024";
  return new TextEncoder().encode(secret);
};

export async function GET(req: NextRequest) {
  // Lightweight auth for Edge: verify JWT from cookies directly
  const cookieHeader = req.headers.get("cookie") || "";
  const sessionCookie = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("session="));

  if (!sessionCookie) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const token = sessionCookie.split("=").slice(1).join("=");
    await jwtVerify(token, getSecret());
  } catch (err) {
    return new NextResponse("Invalid Session", { status: 401 });
  }

  const targetUrl = req.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing URL parameters", { status: 400 });
  }

  // SSRF Protection for Edge
  try {
    const parsed = new URL(targetUrl);
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("192.168.") ||
      hostname.startsWith("10.") ||
      hostname.startsWith("172.") ||
      hostname === "0.0.0.0" ||
      hostname.endsWith(".local")
    ) {
      return new NextResponse("Blocked: internal network", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  try {
    const targetOrigin = new URL(targetUrl).origin + "/";
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": targetOrigin,
        "Origin": targetOrigin.slice(0, -1),
      },
    });

    if (!response.ok) {
      console.error(`Edge Proxy: Target returned ${response.status} for ${targetUrl}`);
      return new NextResponse(`Proxy error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Type", contentType);

    // Rewrite HLS manifests to redirect internal segments to this proxy
    if (contentType.includes("mpegurl") || targetUrl.includes(".m3u8") || contentType.includes("application/vnd.apple.mpegurl")) {
      const text = await response.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

      const rewrittenLines = text.split("\n").map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return line;

        if (trimmed.startsWith("#")) {
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="(.*?)"/g, (match, p1) => {
              const absoluteUrl = p1.startsWith("http") ? p1 : new URL(p1, baseUrl).href;
              return `URI="/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
            });
          }
          return line;
        }

        const absoluteUrl = trimmed.startsWith("http") ? trimmed : new URL(trimmed, baseUrl).href;
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      });

      return new NextResponse(rewrittenLines.join("\n"), { headers });
    } else {
      // Stream directly from source (no buffering, no size limit in Edge Runtime)
      return new NextResponse(response.body, { headers });
    }
  } catch (error: any) {
    console.error("Edge Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
