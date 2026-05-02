"use client";

import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  className?: string;
}

/**
 * ShareButton component using the Web Share API.
 * Falls back to copying to clipboard if the API is not available.
 */
export function ShareButton({ title, text, url, className }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title,
      text: text || `Regardez ${title} sur StreamVault`,
      url: url || window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log("Share cancelled or failed", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        // We could add a toast notification here later
        alert("Lien copié dans le presse-papier !");
      } catch (err) {
        console.error("Failed to copy link", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className={cn(
        "btn-glass flex items-center gap-2 px-4 py-2 text-xs",
        className
      )}
    >
      <Share2 className="w-4 h-4" />
      <span>Partager</span>
    </button>
  );
}
