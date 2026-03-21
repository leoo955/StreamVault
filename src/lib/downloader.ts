"use client";

export interface DownloadedMedia {
  id: string;
  title: string;
  posterUrl: string;
  streamUrl: string;
  type: "Movie" | "Series";
  seasonNum?: number;
  episodeNum?: number;
  downloadedAt: string;
}

const DB_NAME = "streamvault-downloads";
const STORE_NAME = "media";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveDownloadMetadata(media: DownloadedMedia) {
  const db = await getDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(media);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getDownloadedMedia(): Promise<DownloadedMedia[]> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getDownload(id: string): Promise<DownloadedMedia | undefined> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDownload(id: string) {
  const db = await getDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  // Ideally, we would also clear all chunks from caches.open("streamvault-offline-v1")
  // For safety and to prevent massive storage leaks, we can match and delete.
  // But since we can't easily know which chunks belong strictly to this id 
  // without storing a map, we just drop the metadata for now.
}

function resolveUrl(base: string, relative: string) {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export async function downloadHlsStream(
  itemUrl: string,
  onProgress: (percent: number) => void
) {
  let streamUrl = itemUrl;
  if(streamUrl.includes(".m3u8")) {
    // Already direct HLS
  } else {
    // If it's a proxy link or something similar, we assume it redirects to m3u8.
    // In our case `proxy?url=` fetches m3u8.
  }

  const cache = await caches.open("streamvault-media-cache");
  const urlsToCache = new Set<string>();
  urlsToCache.add(streamUrl);

  const res = await fetch(streamUrl);
  if (!res.ok) throw new Error("Erreur de récupération du flux");
  
  const text = await res.text();

  // Parse Master Playlist
  if (text.includes("#EXT-X-STREAM-INF")) {
    const lines = text.split("\n");
    let bestUrl = "";
    // Extremely simplified: just take the first stream url we find
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
           bestUrl = lines[i+1].trim();
           break;
        }
    }
    if (bestUrl) {
       bestUrl = resolveUrl(streamUrl, bestUrl);
       urlsToCache.add(bestUrl);
       const subRes = await fetch(bestUrl);
       const subText = await subRes.text();
       const subLines = subText.split("\n");
       for (const line of subLines) {
          if (line && !line.startsWith("#")) {
             urlsToCache.add(resolveUrl(bestUrl, line.trim()));
          }
       }
       cache.put(bestUrl, new Response(subText));
    }
  } else {
    // Single chunk playlist
    const lines = text.split("\n");
    for (const line of lines) {
       if (line && !line.startsWith("#")) {
          urlsToCache.add(resolveUrl(streamUrl, line.trim()));
       }
    }
  }

  cache.put(streamUrl, new Response(text));

  const urlsArray = Array.from(urlsToCache);
  let downloaded = 0;

  // Process downloads in small batches
  const BATCH_SIZE = 5;
  for (let i = 0; i < urlsArray.length; i += BATCH_SIZE) {
    const batch = urlsArray.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (url) => {
         try {
            const cached = await cache.match(url);
            if (!cached) {
               const chunkRes = await fetch(url);
               if (chunkRes.ok) {
                 await cache.put(url, chunkRes);
               }
            }
         } catch(e) {
            console.error("Failed to fetch chunk", url, e);
         }
         downloaded++;
         onProgress(Math.floor((downloaded / urlsArray.length) * 100));
      })
    );
  }
}
