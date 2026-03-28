"use client";

import { useEffect, useState } from "react";
import { DownloadedMedia, getDownloadedMedia, deleteDownload } from "@/lib/downloader";
import { motion } from "framer-motion";
import { Play, Trash2, DownloadCloud, Film } from "lucide-react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { usePlan } from "@/hooks/usePlan";
import { usePopup } from "@/lib/popup";
import { Crown, Stars, ShieldAlert } from "lucide-react";

export default function DownloadsPage() {
  const { plan, loading: planLoading } = usePlan();
  const { showConfirm, showSuccess } = usePopup();
  const [downloads, setDownloads] = useState<DownloadedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  useEffect(() => {
    loadDownloads();
  }, []);

  const loadDownloads = async () => {
    try {
      const data = await getDownloadedMedia();
      setDownloads(data.sort((a, b) => new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime()));
    } catch (e) {
      console.error("Failed to load downloads", e);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string, title: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    showConfirm(
      "Supprimer le téléchargement ?",
      `"${title}" sera retiré de votre appareil. Vous pourrez le retélécharger plus tard.`,
      async () => {
        await deleteDownload(id);
        loadDownloads();
        showSuccess("Supprimé", "Le téléchargement a été supprimé.");
      },
      "Supprimer"
    );
  };

  if (loading || planLoading) return <div className="p-8 pb-32">Chargement de la bibliothèque locale...</div>;

  // Plan Restriction UI
  if (plan && !plan.canDownload) {
    return (
      <div className="p-4 md:p-8 pt-24 min-h-screen flex flex-col items-center justify-center text-center">
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md p-10 rounded-3xl glass-card-strong border-gold/30 shadow-[0_0_50px_rgba(198,165,92,0.1)] relative overflow-hidden"
        >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-gold/10 blur-3xl rounded-full" />
            <div className="w-20 h-20 bg-gold/20 text-gold rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-inner">
                <Crown className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-black mb-4">Mode Hors-Ligne</h1>
            <p className="text-text-secondary mb-8 leading-relaxed">
                Le téléchargement de films et séries est une fonctionnalité exclusive aux membres <span className="text-gold font-bold">Premium</span> et <span className="text-gold font-bold">Ultimate</span>.
            </p>
            <div className="space-y-3 mb-10">
                <div className="flex items-center gap-3 text-sm text-text-muted bg-white/5 p-3 rounded-xl border border-white/5">
                    <Stars className="w-4 h-4 text-gold shrink-0" />
                    <span>Regardez vos films sans connexion internet</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-text-muted bg-white/5 p-3 rounded-xl border border-white/5">
                    <ShieldAlert className="w-4 h-4 text-gold shrink-0" />
                    <span>Idéal pour les voyages et déplacements</span>
                </div>
            </div>
            <Link href="/settings/subscription">
                <button className="w-full btn-gold py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-xl shadow-gold/20 active:scale-95 transition-all">
                    Découvrir les Plans
                </button>
            </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pt-24 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <DownloadCloud className="w-8 h-8 text-gold" />
        <h1 className="text-3xl font-bold">Mes Téléchargements</h1>
      </div>

      {downloads.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-12 mt-12 glass-card rounded-2xl border border-white/5">
          <DownloadCloud className="w-16 h-16 text-text-muted/30 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Aucun téléchargement</h2>
          <p className="text-text-muted max-w-sm mb-6">
            Les films et épisodes téléchargés apparaîtront ici. Vous pourrez les regarder même sans connexion internet.
          </p>
          <Link href="/">
            <button className="btn-gold px-6 py-2.5 rounded-lg font-bold">Explorer le catalogue</button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {downloads.map((media) => {
            // Because media.id is "uuid-S1E1", we extract the UUID part carefully
            const originalId = media.type === "Series" && media.id.includes("-S")
              ? media.id.substring(0, media.id.lastIndexOf("-S"))
              : media.id;

            const watchUrl = media.type === "Series" 
               ? `/watch/${originalId}?s=${media.seasonNum}&e=${media.episodeNum}`
               : `/watch/${originalId}`;
            return (
              <motion.div
                key={media.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="group relative rounded-xl overflow-hidden glass-card border border-white/5 hover:border-gold/30 transition-all flex flex-col"
              >
                {/* Poster/Thumbnail */}
                <Link href={watchUrl} className="relative aspect-video w-full bg-surface-light overflow-hidden block">
                  {media.posterUrl ? (
                    <img src={media.posterUrl} alt={media.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Film className="w-8 h-8 text-white/20" /></div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                     <div className="w-12 h-12 bg-gold text-deep-black rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(198,165,92,0.6)]">
                        <Play className="w-5 h-5 ml-1" fill="currentColor" />
                     </div>
                  </div>
                  {media.type === "Series" && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold">
                       S{media.seasonNum} • E{media.episodeNum}
                    </div>
                  )}
                </Link>

                {/* Metadata */}
                <div className="p-4 flex-1 flex flex-col justify-between auto-rows-max">
                  <div>
                     <h3 className="font-semibold text-sm line-clamp-2 md:text-base group-hover:text-gold transition-colors">{media.title}</h3>
                     <p className="text-xs text-text-muted mt-1">Téléchargé le {new Date(media.downloadedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                     <span className="text-[10px] uppercase font-black tracking-wider text-green-400 bg-green-400/10 px-2 py-1 rounded">Dispo. Hors-Ligne</span>
                     <button
                       onClick={(e) => handleRemove(media.id, media.title, e)}
                       className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                       title="Supprimer"
                     >
                       <Trash2 className="w-4 h-4" />
                     </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
