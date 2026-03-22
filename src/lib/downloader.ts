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
  // Always use the proxy to bypass 403 Forbidden errors and Referer checks
  const getProxiedUrl = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`;
  
  const streamUrl = itemUrl.startsWith("/api/proxy") ? itemUrl : getProxiedUrl(itemUrl);

  const cache = await caches.open("streamvault-media-cache");
  const urlsToCache = new Set<string>();
  urlsToCache.add(streamUrl);

  const res = await fetch(streamUrl);
  if (!res.ok) throw new Error(`Erreur de récupération du flux: ${res.status}`);
  
  const text = await res.text();

  // Parse Playlist (Master or Media)
  if (text.includes("#EXT-X-STREAM-INF")) {
    const lines = text.split("\n");
    let bestUrl = "";
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
           bestUrl = lines[i+1].trim();
           break;
        }
    }
    if (bestUrl) {
       // Note: bestUrl might already be proxied if it was relative and rewritten by the proxy
       const absoluteBestUrl = bestUrl.startsWith("/") ? bestUrl : getProxiedUrl(resolveUrl(itemUrl, bestUrl));
       urlsToCache.add(absoluteBestUrl);
       
       const subRes = await fetch(absoluteBestUrl);
       const subText = await subRes.text();
       const subLines = subText.split("\n");
       for (const line of subLines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith("#")) {
             // If the proxy already rewrote it to /api/proxy?url=..., we keep it
             const chunkUrl = trimmed.startsWith("/") ? trimmed : getProxiedUrl(resolveUrl(absoluteBestUrl, trimmed));
             urlsToCache.add(chunkUrl);
          }
       }
       cache.put(absoluteBestUrl, new Response(subText));
    }
  } else {
    // Media playlist (contains chunks)
    const lines = text.split("\n");
    for (const line of lines) {
       const trimmed = line.trim();
       if (trimmed && !trimmed.startsWith("#")) {
          const chunkUrl = trimmed.startsWith("/") ? trimmed : getProxiedUrl(resolveUrl(itemUrl, trimmed));
          urlsToCache.add(chunkUrl);
       }
    }
  }

  cache.put(streamUrl, new Response(text));

  const urlsArray = Array.from(urlsToCache);
  let downloaded = 0;

  const BATCH_SIZE = 3; // Smaller batch size for proxy stability
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
               } else {
                 console.warn("Skipping chunk due to status", chunkRes.status, url);
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
