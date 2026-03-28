"use client";

import { useState, useEffect, MouseEvent } from "react";
import { Download, Check, AlertCircle } from "lucide-react";
import { saveDownloadMetadata, getDownload, deleteDownload, downloadHlsStream, DownloadedMedia } from "@/lib/downloader";
import { usePlan } from "@/hooks/usePlan";
import { usePopup } from "@/lib/popup";

export default function DownloadButton({ media, className = "" }: { media: DownloadedMedia, className?: string }) {
  const { plan } = usePlan();
  const { showPopup, showSuccess, showError, showConfirm } = usePopup();
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
      showPopup({
        type: "warning",
        title: "Plan insuffisant",
        message: `Le téléchargement hors-ligne nécessite un plan Premium ou Ultimate.`,
        details: `Votre plan actuel : ${plan.name}`,
      });
      return;
    }

    if (status === "downloaded") {
      showConfirm(
        "Supprimer le téléchargement ?",
        "Ce contenu sera retiré de votre appareil. Vous pourrez le retélécharger plus tard.",
        async () => {
          await deleteDownload(media.id);
          setStatus("idle");
          setProgress(0);
          showSuccess("Supprimé", "Le téléchargement a été supprimé de votre appareil.");
        },
        "Supprimer"
      );
      return;
    }

    if (status === "downloading") return;

    setStatus("downloading");
    setProgress(0);

    // Show download popup
    showPopup({
      type: "download",
      title: "Téléchargement en cours",
      message: media.title,
      progress: 0,
    });

    try {
      const cachedUrls = await downloadHlsStream(media.streamUrl, (p) => {
        setProgress(p);
        // Update the download popup progress in real-time
        showPopup({
          type: "download",
          title: "Téléchargement en cours",
          message: media.title,
          progress: p,
        });
      });

      // Save the proxied streamUrl for offline playback
      const proxiedStreamUrl = media.streamUrl.startsWith("/api/proxy")
        ? media.streamUrl
        : `/api/proxy?url=${encodeURIComponent(media.streamUrl)}`;
      media.downloadedAt = new Date().toISOString();
      media.cachedUrls = cachedUrls;
      media.streamUrl = proxiedStreamUrl;
      await saveDownloadMetadata(media);
      setStatus("downloaded");

      showSuccess(
        "Téléchargement terminé !",
        `"${media.title}" est maintenant disponible hors-ligne.`,
        "Vous pouvez le regarder sans connexion internet depuis la page Téléchargements."
      );
    } catch (error) {
      console.error("Download failed:", error);
      setStatus("error");
      showError(
        "Échec du téléchargement",
        `Impossible de télécharger "${media.title}".`,
        "Vérifiez votre connexion internet et réessayez."
      );
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
         {/* DEV badge */}
         <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[6px] font-black tracking-wider bg-amber-500 text-black px-1.5 py-px rounded-sm leading-tight z-20">
           DEV
         </span>
      </div>
    </button>
  );
}
