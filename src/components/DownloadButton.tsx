"use client";

import { useState, useEffect, MouseEvent } from "react";
import { Download, Check, AlertCircle } from "lucide-react";
import { saveDownloadMetadata, getDownload, deleteDownload, downloadHlsStream, DownloadedMedia } from "@/lib/downloader";
import { usePlan } from "@/hooks/usePlan";

export default function DownloadButton({ media, className = "" }: { media: DownloadedMedia, className?: string }) {
  const { plan } = usePlan();
  const [status, setStatus] = useState<"idle" | "downloading" | "downloaded" | "error">("idle");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    getDownload(media.id).then((saved) => {
      if (saved) setStatus("downloaded");
    });
  }, [media.id]);

  const handleDownload = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (plan && !plan.canDownload) {
        alert(`Le téléchargement hors-ligne nécessite un plan Premium ou Ultimate. (Votre plan actuel : ${plan.name})`);
        return;
    }

    if (status === "downloaded") {
      if (confirm("Supprimer ce téléchargement hors-ligne ?")) {
         await deleteDownload(media.id);
         setStatus("idle");
         setProgress(0);
      }
      return;
    }

    if (status === "downloading") return;

    setStatus("downloading");
    setProgress(0);

    try {
      await downloadHlsStream(media.streamUrl, (p) => {
        setProgress(p);
      });
      media.downloadedAt = new Date().toISOString();
      await saveDownloadMetadata(media);
      setStatus("downloaded");
    } catch (error) {
      console.error("Download failed:", error);
      setStatus("error");
    }
  };

  return (
    <button 
      onClick={handleDownload}
      className={`flex flex-col items-center justify-center gap-1.5 transition-colors ${status === "downloaded" ? "text-gold" : "text-white/70 hover:text-white"} ${className}`}
      title={status === "idle" ? "Télécharger" : status === "downloaded" ? "Supprimer le téléchargement" : ""}
    >
      <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center relative overflow-hidden transition-all ${status === "downloaded" ? "bg-gold/20" : "bg-white/10 hover:bg-white/20"}`}>
         {status === "idle" && <Download className="w-4 h-4 sm:w-5 sm:h-5" />}
         {status === "downloading" && (
            <>
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                 <circle cx="50%" cy="50%" r="40%" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
                 <circle cx="50%" cy="50%" r="40%" fill="none" stroke="var(--gold)" strokeWidth="2.5" 
                   strokeDasharray={100} strokeDashoffset={100 - progress} className="transition-all duration-300" />
              </svg>
              <span className="text-[9px] sm:text-[10px] font-bold z-10">{progress}%</span>
            </>
         )}
         {status === "downloaded" && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-gold" />}
         {status === "error" && <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />}
      </div>
    </button>
  );
}
