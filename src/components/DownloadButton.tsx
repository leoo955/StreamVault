"use client";

import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface DownloadButtonProps {
  mediaId: string;
  title: string;
  className?: string;
  isPremium?: boolean;
}

/**
 * DownloadButton component.
 * Note: Real downloading logic would depend on the platform (Electron vs Web).
 */
export function DownloadButton({ mediaId, title, className, isPremium = false }: DownloadButtonProps) {
  const handleDownload = () => {
    if (!isPremium) {
      alert("Le téléchargement est réservé aux membres Premium.");
      return;
    }
    
    // Logic for downloading would go here
    // In Electron, we might use a custom IPC call
    // In Web, we might use a direct blob download or service worker cache
    console.log(`Starting download for ${title} (${mediaId})`);
    alert(`Téléchargement de "${title}" démarré...`);
  };

  return (
    <button
      onClick={handleDownload}
      className={cn(
        "btn-glass flex items-center gap-2 px-4 py-2 text-xs",
        className,
        !isPremium && "opacity-50 cursor-not-allowed"
      )}
      title={!isPremium ? "Premium requis" : "Télécharger"}
    >
      <Download className="w-4 h-4" />
      <span>Télécharger</span>
      {!isPremium && <span className="ml-1 text-[8px] bg-accent/20 text-accent px-1 rounded">PRO</span>}
    </button>
  );
}
