import { NextRequest, NextResponse } from "next/server";

// Fallback logic to fetch subtitles utilizing a community proxy or direct srt files
// Since Subdl blocked free unauthenticated access with a schema error, we switch to an alternative approach.

import AdmZip from "adm-zip";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const tmdbId = req.nextUrl.searchParams.get("tmdbId");
  const type = req.nextUrl.searchParams.get("type") || "movie";
  const lang = req.nextUrl.searchParams.get("lang") || "fr";
  const season = req.nextUrl.searchParams.get("season") || "";
  const episode = req.nextUrl.searchParams.get("episode") || "";
  const download = req.nextUrl.searchParams.get("download"); // URL or base64

  // Download endpoint: Serve the VTT
  if (download) {
    try {
      // If it's a URL (Subdl provides absolute URLs like https://dl.subdl.com/...)
      if (download.startsWith("http")) {
         console.log("Downloading external subtitle:", download);
         const res = await fetch(download);
         if (!res.ok) throw new Error("Failed to download external subtitle zip");
         
         const arrayBuffer = await res.arrayBuffer();
         const buffer = Buffer.from(arrayBuffer);
         
         // Subdl returns ZIP files. We need to extract the SRT file inside.
         let srtContent = "";
         const zip = new AdmZip(buffer);
         const zipEntries = zip.getEntries();
         
         // Find the largest .srt file in the zip (usually the main subtitle, ignoring MACOSX metadata)
         const srtFiles = zipEntries.filter((zipEntry: any) => zipEntry.entryName.endsWith('.srt') && !zipEntry.entryName.includes('__MACOSX'));
         
         if (srtFiles.length > 0) {
            const largestFile = srtFiles.reduce((prev: any, current: any) => 
               (prev.header.size > current.header.size) ? prev : current
            );
            
            srtContent = zip.readAsText(largestFile);
         } else {
            throw new Error("No SRT found in zip");
         }
         
         const vttContent = srtToVtt(srtContent);
         return new NextResponse(vttContent, {
            headers: {
              "Content-Type": "text/vtt; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
         });
      } else {
         // Fallback legacy logic for base64 demo string
         const vttContent = Buffer.from(download, 'base64').toString('utf-8');
         return new NextResponse(vttContent, {
            headers: {
              "Content-Type": "text/vtt; charset=utf-8",
              "Access-Control-Allow-Origin": "*",
            },
         });
      }
    } catch (e) {
      console.error("Subtitles fetch error:", e);
      return NextResponse.json({ error: "Download error" }, { status: 500 });
    }
  }

  // Search endpoint
  if (!tmdbId) {
    return NextResponse.json({ error: "tmdbId required" }, { status: 400 });
  }

  try {
    const isMovie = type === "movie";
    const subdlApiUrl = new URL("https://api.subdl.com/api/v1/subtitles");
    const apiKey = process.env.SUBDL_API_KEY || "d85b1f3d828d1bd4b4c10a48b37e96b5";
    subdlApiUrl.searchParams.append("api_key", apiKey);
    subdlApiUrl.searchParams.append("tmdb_id", tmdbId);
    if (!isMovie) {
       subdlApiUrl.searchParams.append("type", "tv");
       if (season) subdlApiUrl.searchParams.append("season_number", season);
       if (episode) subdlApiUrl.searchParams.append("episode_number", episode);
    } else {
       subdlApiUrl.searchParams.append("type", "movie");
    }
    
    // Convert comma-separated langs into subdl format (e.g. 'fr,en')
    subdlApiUrl.searchParams.append("languages", lang || "fr,en");
    subdlApiUrl.searchParams.append("subs_per_page", "10");

    console.log("Fetching Subdl API:", subdlApiUrl.toString());
    const res = await fetch(subdlApiUrl.toString());
    
    if (!res.ok) {
        throw new Error(`Subdl API returning ${res.status}`);
    }
    
    const data = await res.json();
    if (!data.status || !data.subtitles) {
        throw new Error("Invalid Subdl Response Schema");
    }
    
    const formattedSubtitles = data.subtitles.map((sub: any) => {
        // Find the best valid zip file link (sometimes first element is a generic info URL, we need .zip)
        const file = sub.url || (sub.files && sub.files.length > 0 ? sub.files[0] : null);
        if (!file) return null;
        
        // Proxy URL to download from Subdl servers and convert to VTT securely
        const subUrl = `https://dl.subdl.com${file}`;
        
        return {
           name: sub.release_name || `${sub.language || sub.lang} Subtitle`,
           language: (sub.language || sub.lang || "").toLowerCase(),
           url: subUrl,
           author: sub.author || "Subdl API",
           hearingImpaired: sub.hi || !!sub.hearing_impaired,
           isWebDl: (sub.release_name || "").toLowerCase().includes("web")
        };
    }).filter(Boolean);

    // Prioritize Web-DL (better sync for streaming) and non-HI
    formattedSubtitles.sort((a: any, b: any) => {
        if (a.isWebDl && !b.isWebDl) return -1;
        if (!a.isWebDl && b.isWebDl) return 1;
        if (!a.hearingImpaired && b.hearingImpaired) return -1;
        if (a.hearingImpaired && !b.hearingImpaired) return 1;
        return 0;
    });

    // Keep only 1 subtitle per language to avoid cluttering the UI
    const finalSubtitles = [];
    const seenLangs = new Set();
    for (const sub of formattedSubtitles) {
       if (!seenLangs.has(sub.language)) {
          seenLangs.add(sub.language);
          // Simplify names for UI
          sub.name = sub.language === 'fr' ? 'Français' : (sub.language === 'en' ? 'English' : sub.name);
          finalSubtitles.push(sub);
       }
    }

    if (finalSubtitles.length === 0) {
        throw new Error("No subtitles found in Subdl response");
    }

    return NextResponse.json({ subtitles: finalSubtitles });
  } catch (e) {
    console.warn("Subtitle subdl fetch error, falling back to demo:", e);
    
    // Fallback logic if Subdl fails (e.g. 403 Not Authorized on public key)
    const langArray = lang.split(',');
    const fallbackSubtitles = langArray.map((l) => {
      const isFr = l.toLowerCase().includes('fr');
      
      let srtContent = "";
      if (isFr) {
        srtContent = `1
00:00:00,000 --> 10:00:00,000
Serveur de sous-titres premium hors-ligne (Erreur 403).
(Clé API Subdl manquante ou bloquée. Veuillez configurer process.env.SUBDL_API_KEY)`;
      } else {
        srtContent = `1
00:00:00,000 --> 10:00:00,000
Premium subtitle server offline (Error 403).
(Subdl API key missing or rate-limited. Please configure process.env.SUBDL_API_KEY)`;
      }

      const vttContent = srtToVtt(srtContent);
      const encodedVtt = Buffer.from(vttContent).toString('base64');

      return {
        name: isFr ? "Français (Démo)" : "English (Demo)",
        language: isFr ? "fr" : "en",
        url: encodedVtt,
        author: "StreamVault Fallback System",
        hearingImpaired: false,
      };
    });

    return NextResponse.json({ subtitles: fallbackSubtitles });
  }
}

// Convert SRT format to WebVTT format
function srtToVtt(srt: string): string {
  let vtt = "WEBVTT\n\n";

  // Normalize line endings
  const normalized = srt.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  // Split into blocks
  const blocks = normalized.split(/\n\n+/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 2) continue;

    // Find the timestamp line (contains -->)
    let timestampIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes("-->")) {
        timestampIdx = i;
        break;
      }
    }

    if (timestampIdx === -1) continue;

    // Convert commas to dots in timestamps
    const timestamp = lines[timestampIdx].replace(/,/g, ".");

    // Get subtitle text (everything after timestamp)
    const text = lines.slice(timestampIdx + 1).join("\n");

    if (text.trim()) {
      vtt += `${timestamp}\n${text}\n\n`;
    }
  }

  return vtt;
}

