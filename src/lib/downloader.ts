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
  cachedUrls?: string[]; // Track all cached URLs for proper cleanup
  sizeBytes?: number;    // Estimated download size
}

const DB_NAME = "streamvault-downloads";
const STORE_NAME = "media";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 2);
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
  
  // Get the download metadata first to find cached URLs
  const media = await getDownload(id);
  
  // Delete from IndexedDB
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  // Clean up cached media chunks via Service Worker message
  if (media?.cachedUrls && media.cachedUrls.length > 0 && navigator.serviceWorker?.controller) {
    const channel = new MessageChannel();
    navigator.serviceWorker.controller.postMessage(
      { type: "DELETE_DOWNLOAD_CACHE", payload: { urls: media.cachedUrls } },
      [channel.port2]
    );
  }
}

// Get storage usage info
export async function getStorageEstimate(): Promise<{ usedMB: number; totalMB: number; percentUsed: number }> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    const usedMB = Math.round((est.usage || 0) / (1024 * 1024));
    const totalMB = Math.round((est.quota || 0) / (1024 * 1024));
    const percentUsed = totalMB > 0 ? Math.round((usedMB / totalMB) * 100) : 0;
    return { usedMB, totalMB, percentUsed };
  }
  return { usedMB: 0, totalMB: 0, percentUsed: 0 };
}

function resolveUrl(base: string, relative: string) {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

// Fetch with automatic retry (3 attempts)
async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      if (attempt === retries) return res; // Return last failed response
    } catch (err) {
      if (attempt === retries) throw err;
    }
    await new Promise((r) => setTimeout(r, delay * attempt)); // Exponential backoff
  }
  throw new Error(`Failed after ${retries} retries: ${url}`);
}

export async function downloadHlsStream(
  itemUrl: string,
  onProgress: (percent: number) => void
): Promise<string[]> {
  const getProxiedUrl = (url: string) => `/api/proxy?url=${encodeURIComponent(url)}`;
  const streamUrl = itemUrl.startsWith("/api/proxy") ? itemUrl : getProxiedUrl(itemUrl);

  const cache = await caches.open("streamvault-media-cache");
  const urlsToCache = new Set<string>();
  urlsToCache.add(streamUrl);

  // Fetch and parse the master/media playlist
  const res = await fetchWithRetry(streamUrl);
  if (!res.ok) throw new Error(`Erreur flux: ${res.status}`);
  const text = await res.text();

  if (text.includes("#EXT-X-STREAM-INF")) {
    // Master playlist → pick the first (lowest) quality for reliable offline
    const lines = text.split("\n");
    let bestUrl = "";
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("#EXT-X-STREAM-INF")) {
        bestUrl = lines[i + 1].trim();
        break;
      }
    }
    if (bestUrl) {
      const absoluteBestUrl = bestUrl.startsWith("/")
        ? bestUrl
        : getProxiedUrl(resolveUrl(itemUrl, bestUrl));
      urlsToCache.add(absoluteBestUrl);

      const subRes = await fetchWithRetry(absoluteBestUrl);
      const subText = await subRes.text();
      const subLines = subText.split("\n");
      for (const line of subLines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const chunkUrl = trimmed.startsWith("/")
            ? trimmed
            : getProxiedUrl(resolveUrl(absoluteBestUrl, trimmed));
          urlsToCache.add(chunkUrl);
        }
      }
      cache.put(absoluteBestUrl, new Response(subText));
    }
  } else {
    // Media playlist
    const lines = text.split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const chunkUrl = trimmed.startsWith("/")
          ? trimmed
          : getProxiedUrl(resolveUrl(itemUrl, trimmed));
        urlsToCache.add(chunkUrl);
      }
    }
  }

  // Cache the playlist itself
  cache.put(streamUrl, new Response(text));

  // Download all chunks with retry + progress
  const urlsArray = Array.from(urlsToCache);
  let downloaded = 0;
  let totalBytes = 0;
  let failedChunks: string[] = [];

  const BATCH_SIZE = 4;
  for (let i = 0; i < urlsArray.length; i += BATCH_SIZE) {
    const batch = urlsArray.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (url) => {
        try {
          const cached = await cache.match(url);
          if (!cached) {
            const chunkRes = await fetchWithRetry(url, 3, 800);
            if (chunkRes.ok) {
              const blob = await chunkRes.blob();
              totalBytes += blob.size;
              await cache.put(url, new Response(blob));
            } else {
              failedChunks.push(url);
              console.warn("[DL] Skip chunk:", chunkRes.status, url);
            }
          }
        } catch (e) {
          failedChunks.push(url);
          console.error("[DL] Chunk error:", url, e);
        }
        downloaded++;
        onProgress(Math.floor((downloaded / urlsArray.length) * 100));
      })
    );
  }

  // Retry failed chunks one more time
  if (failedChunks.length > 0 && failedChunks.length < urlsArray.length * 0.2) {
    console.log(`[DL] Retrying ${failedChunks.length} failed chunks...`);
    for (const url of failedChunks) {
      try {
        const r = await fetchWithRetry(url, 2, 2000);
        if (r.ok) {
          const blob = await r.blob();
          totalBytes += blob.size;
          await cache.put(url, new Response(blob));
        }
      } catch {}
    }
  }

  console.log(`[DL] Complete: ${urlsArray.length} chunks, ~${Math.round(totalBytes / (1024 * 1024))}MB`);
  
  // Return the list of cached URLs for cleanup tracking
  return urlsArray;
}
