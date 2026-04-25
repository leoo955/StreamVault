"use client";

import { useState, useEffect } from "react";
import { Film, AlertCircle } from "lucide-react";
import Image from "next/image";

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackType?: "poster" | "backdrop" | "avatar";
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
}

export default function SafeImage({
  src,
  alt,
  className = "",
  fallbackType = "poster",
  fill = false,
  priority = false,
  sizes,
}: SafeImageProps) {
  const [isError, setIsError] = useState(false);
  const [retryUrl, setRetryUrl] = useState<string | null>(null);

  // Reset error state when src changes
  useEffect(() => {
    setIsError(false);
    setRetryUrl(null);
  }, [src]);

  const handleError = () => {
    if (!isError) {
      setIsError(true);
      // Logic for intelligent retries could go here if we had alternative URLs
    }
  };

  if (!src || isError) {
    return (
      <div 
        className={`flex items-center justify-center bg-surface-light/20 text-text-muted/40 relative overflow-hidden group/fallback ${className}`}
        style={fill ? { position: "absolute", inset: 0 } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-black/20" />
        <div className="relative z-10 flex flex-col items-center gap-2 p-4 text-center">
          {fallbackType === "poster" ? (
            <>
              <Film className="w-1/3 h-1/3 opacity-20" />
              <span className="text-[10px] md:text-xs font-medium uppercase tracking-[0.2em] opacity-30 px-2 line-clamp-2">
                {alt}
              </span>
            </>
          ) : fallbackType === "backdrop" ? (
            <div className="w-full h-full flex items-center justify-center border border-white/5 rounded-lg opacity-20">
               <Film className="w-12 h-12" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center">
               <AlertCircle className="w-4 h-4 text-gold/30" />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Use next/image for optimized loading if fill is used, else standard img
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill={fill}
        className={className}
        onError={handleError}
        priority={priority}
        sizes={sizes}
        unoptimized // Jellyfin images are already dynamic
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={handleError}
      loading={priority ? "eager" : "lazy"}
    />
  );
}
