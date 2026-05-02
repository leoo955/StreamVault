"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to extract the dominant color from an image URL.
 * Uses a canvas-based approach to analyze pixel data.
 */
export function useImageColors(imageUrl: string | null | undefined) {
  const [colors, setColors] = useState<{
    dominant: string;
    vibrant: string;
    isDark: boolean;
  }>({
    dominant: '#EAB308', // Default accent color (yellow-500)
    vibrant: '#EAB308',
    isDark: false
  });

  useEffect(() => {
    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Use a small scale for performance
      const size = 50;
      canvas.width = size;
      canvas.height = size;

      ctx.drawImage(img, 0, 0, size, size);
      
      try {
        const imageData = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0;
        let count = 0;
        
        // Simple average calculation for "dominant"
        // But we skip pure black or pure white to get better accents
        for (let i = 0; i < imageData.length; i += 4) {
          const red = imageData[i];
          const green = imageData[i + 1];
          const blue = imageData[i + 2];
          
          // Skip if too dark or too bright (near black/white)
          if ((red + green + blue) > 30 && (red + green + blue) < 730) {
            r += red;
            g += green;
            b += blue;
            count++;
          }
        }

        if (count === 0) return; // Fallback to default

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
        
        // Calculate brightness (HSP model)
        const hsp = Math.sqrt(
          0.299 * (r * r) +
          0.587 * (g * g) +
          0.114 * (b * b)
        );

        setColors({
          dominant: hex,
          vibrant: hex, // For now, we use average as vibrant
          isDark: hsp < 127.5
        });

        // Update CSS Variable globally or scoped? 
        // GEMINI.md says it's applied to the main button. 
        // We can expose it so components can use it via style={{ '--accent': colors.dominant }}
      } catch (e) {
        console.error("Failed to extract image colors:", e);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for color extraction:", imageUrl);
    };

  }, [imageUrl]);

  return colors;
}
