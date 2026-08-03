"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/userProvider';

/**
 * Hook to extract the dominant color from an image URL.
 * Uses a canvas-based approach to analyze pixel data.
 * If the user has explicitly set a custom accent color in their preferences, it overrides this extraction.
 */
export function useImageColors(imageUrl: string | null | undefined) {
  const { user } = useUser();
  const customColor = user?.preferences?.accentColor;

  const [colors, setColors] = useState<{
    dominant: string;
    vibrant: string;
    isDark: boolean;
  }>({
    dominant: customColor || '#EAB308', // Fallback to user's color or yellow
    vibrant: customColor || '#EAB308',
    isDark: false
  });

  // Keep it updated if the user changes it in settings
  useEffect(() => {
    if (customColor) {
      setColors({ dominant: customColor, vibrant: customColor, isDark: false });
    }
  }, [customColor]);

  useEffect(() => {
    // If the user has a custom color, skip extraction
    if (customColor) return;
    if (!imageUrl || imageUrl === "") return;

    const img = new Image();
    img.crossOrigin = "Anonymous";
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        const size = 10; // Even smaller for speed and less memory
        canvas.width = size;
        canvas.height = size;

        ctx.drawImage(img, 0, 0, size, size);
        const imageData = ctx.getImageData(0, 0, size, size).data;
        
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < imageData.length; i += 4) {
          const sum = imageData[i] + imageData[i+1] + imageData[i+2];
          if (sum > 20 && sum < 740) { // Skip extreme black/white
            r += imageData[i];
            g += imageData[i+1];
            b += imageData[i+2];
            count++;
          }
        }

        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
          const brightness = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
          setColors({ dominant: hex, vibrant: hex, isDark: brightness < 128 });
        }
      } catch (e) {
        // Silently fail to avoid console noise on CORS/load issues
      }
    };

    img.src = imageUrl;
  }, [imageUrl, customColor]);

  return colors;
}

