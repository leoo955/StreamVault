"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, 
  Send, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Film
} from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AnnouncementsPage() {
  const isAdmin = useAdminAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [mediaId, setMediaId] = useState("");
  
  const [mediaItems, setMediaItems] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      fetch("/api/media?summary=true")
        .then(res => res.json())
        .then(data => setMediaItems(data.items || []));
    }
  }, [isAdmin]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/notifications/all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, message, mediaId: mediaId || undefined })
      });

      if (res.ok) {
        setSuccess(true);
        setTitle("");
        setMessage("");
        setMediaId("");
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch (err) {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedia = mediaItems.filter(m => 
    m.title.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 5);

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen px-4 md:px-8 pt-8 pb-20">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 group font-bold uppercase tracking-widest text-[10px]">
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Retour Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/5">
            <Megaphone className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Annonces Globales</h1>
            <p className="text-text-muted text-sm font-medium mt-1">Envoyez une notification à tous les utilisateurs enregistrés.</p>
          </div>
        </div>

        <div className="glass-card p-8 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] -z-10 rounded-full" />
          
          <form onSubmit={handleSend} className="space-y-8">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Titre de l&apos;annonce</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Nouvelle fonctionnalité : Playlists !"
                className="w-full bg-surface border border-surface-light rounded-2xl px-5 py-4 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Décrivez la nouveauté en quelques lignes..."
                rows={4}
                className="w-full bg-surface border border-surface-light rounded-2xl px-5 py-4 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40 leading-relaxed font-medium"
                required
              />
            </div>

            <div className="space-y-4">
              <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Lier un média (Optionnel)</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Chercher un film ou une série..."
                  className="w-full bg-surface border border-surface-light rounded-2xl pl-12 pr-5 py-4 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                />
              </div>

              {search && filteredMedia.length > 0 && (
                <div className="bg-surface-dark border border-surface-light rounded-2xl overflow-hidden divide-y divide-white/5 shadow-2xl">
                  {filteredMedia.map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setMediaId(m.id === mediaId ? "" : m.id);
                        setSearch("");
                      }}
                      className={`w-full flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors text-left ${mediaId === m.id ? "bg-gold/10" : ""}`}
                    >
                      <div className="w-10 h-14 rounded bg-surface-light shrink-0 overflow-hidden">
                        {m.posterUrl && <img src={m.posterUrl} alt="" className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{m.title}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">{m.year} • {m.type}</p>
                      </div>
                      {mediaId === m.id && <CheckCircle2 className="w-5 h-5 text-gold" />}
                    </button>
                  ))}
                </div>
              )}

              {mediaId && !search && (
                <div className="flex items-center justify-between p-4 rounded-2xl bg-gold/5 border border-gold/20">
                  <div className="flex items-center gap-3">
                    <Film className="w-5 h-5 text-gold" />
                    <p className="text-xs font-bold text-gold">Média lié : {mediaItems.find(m => m.id === mediaId)?.title}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setMediaId("")}
                    className="text-[10px] font-black uppercase tracking-widest text-gold hover:text-white transition-colors"
                  >
                    Retirer
                  </button>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-white/5">
              <button
                type="submit"
                disabled={loading || !title || !message}
                className="w-full btn-gold py-5 rounded-2xl flex items-center justify-center gap-3 text-sm font-black uppercase tracking-[0.2em] shadow-2xl shadow-gold/10 disabled:opacity-50 disabled:cursor-not-allowed group transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-deep-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Envoyer l&apos;Annonce
                    <Send className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-bold text-green-500">Succès !</p>
                  <p className="text-xs text-green-500/70 font-medium">L&apos;annonce a été envoyée à tous les utilisateurs.</p>
                </div>
              </motion.div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-danger/20 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-danger" />
                </div>
                <div>
                  <p className="text-sm font-bold text-danger">Erreur</p>
                  <p className="text-xs text-danger/70 font-medium">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
