import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/db";

export async function GET(req: NextRequest) {
  // Auth required — prevent anonymous SSRF attacks
  const user = await getAuthUser(req);
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

  const targetUrl = req.nextUrl.searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing URL parameters", { status: 400 });
  }

  // Block requests to internal/private networks (SSRF protection)
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
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": new URL(targetUrl).origin,
        "Origin": new URL(targetUrl).origin,
      },
    });

    if (!response.ok) {
      return new NextResponse(`Proxy error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get("content-type") || "";
    let body: BodyInit;

    // Rewrite HLS manifests to redirect internal segments to this proxy
    if (contentType.includes("mpegurl") || targetUrl.includes(".m3u8")) {
      const text = await response.text();
      const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf("/") + 1);

      const rewrittenLines = text.split("\n").map((line) => {
        const trimmed = line.trim();
        
        // Ignore empty lines and standard tags
        if (!trimmed) return line;

        // Tags that might contain URIs (like EXT-X-KEY encryption)
        if (trimmed.startsWith("#")) {
          if (trimmed.includes('URI="')) {
            return trimmed.replace(/URI="(.*?)"/g, (match, p1) => {
              const absoluteUrl = p1.startsWith("http") ? p1 : new URL(p1, baseUrl).href;
              return `URI="/api/proxy?url=${encodeURIComponent(absoluteUrl)}"`;
            });
          }
          return line;
        }

        // It's a standard URL to a video chunk or child playlist
        const absoluteUrl = trimmed.startsWith("http") ? trimmed : new URL(trimmed, baseUrl).href;
        return `/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
      });

      body = rewrittenLines.join("\n");
    } else {
      // For video segments (.ts, .vtt, etc.), stream the binary buffer directly
      body = await response.arrayBuffer();
    }

    // Append our own wide-open CORS headers
    const headers = new Headers();
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Content-Type", contentType);

    return new NextResponse(body, { headers });
  } catch (error: any) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
