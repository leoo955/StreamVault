"use client";

import { useState, useEffect } from "react";

interface ImageColors {
  dominant: string;
  vibrant: string;
  muted: string;
  darkMuted: string;
}

const DEFAULT_COLORS: ImageColors = {
  dominant: "rgb(198, 165, 92)",  // gold
  vibrant: "rgb(198, 165, 92)",
  muted: "rgb(30, 30, 30)",
  darkMuted: "rgb(15, 15, 15)",
};

/**
 * Extracts dominant colors from an image URL using canvas pixel sampling.
 * Returns dominant, vibrant, muted, and darkMuted colors.
 */
export function useImageColors(imageUrl: string | undefined | null): ImageColors {
  const [colors, setColors] = useState<ImageColors>(DEFAULT_COLORS);

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Sample at small size for performance
        const size = 64;
        canvas.width = size;
        canvas.height = size;
        ctx.drawImage(img, 0, 0, size, size);

        const data = ctx.getImageData(0, 0, size, size).data;

        // Build color buckets
        const buckets: Map<string, { r: number; g: number; b: number; count: number; saturation: number; brightness: number }> = new Map();

        for (let i = 0; i < data.length; i += 16) { // Sample every 4th pixel
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];
          if (a < 128) continue; // Skip transparent

          // Quantize to reduce color space
          const qr = Math.round(r / 32) * 32;
          const qg = Math.round(g / 32) * 32;
          const qb = Math.round(b / 32) * 32;
          const key = `${qr},${qg},${qb}`;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation = max === 0 ? 0 : (max - min) / max;
          const brightness = max / 255;

          if (buckets.has(key)) {
            const bucket = buckets.get(key)!;
            bucket.count++;
          } else {
            buckets.set(key, { r: qr, g: qg, b: qb, count: 1, saturation, brightness });
          }
        }

        const sorted = [...buckets.values()]
          .filter((b) => b.brightness > 0.05 && b.brightness < 0.95) // Skip pure black/white
          .sort((a, b) => b.count - a.count);

        if (sorted.length === 0) {
          setColors(DEFAULT_COLORS);
          return;
        }

        // Dominant = most frequent
        const dominant = sorted[0];

        // Vibrant = highest saturation among top colors
        const vibrant = [...sorted]
          .slice(0, 15)
          .sort((a, b) => b.saturation - a.saturation)[0] || dominant;

        // Muted = reduce saturation of dominant
        const muted = {
          r: Math.round(dominant.r * 0.3 + 30),
          g: Math.round(dominant.g * 0.3 + 30),
          b: Math.round(dominant.b * 0.3 + 30),
        };

        // Dark muted = very dark version
        const darkMuted = {
          r: Math.round(dominant.r * 0.1 + 5),
          g: Math.round(dominant.g * 0.1 + 5),
          b: Math.round(dominant.b * 0.1 + 5),
        };

        setColors({
          dominant: `rgb(${dominant.r}, ${dominant.g}, ${dominant.b})`,
          vibrant: `rgb(${vibrant.r}, ${vibrant.g}, ${vibrant.b})`,
          muted: `rgb(${muted.r}, ${muted.g}, ${muted.b})`,
          darkMuted: `rgb(${darkMuted.r}, ${darkMuted.g}, ${darkMuted.b})`,
        });
      } catch {
        setColors(DEFAULT_COLORS);
      }
    };

    img.onerror = () => setColors(DEFAULT_COLORS);
  }, [imageUrl]);

  return colors;
}
