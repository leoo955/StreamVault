"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Megaphone, Send, ArrowLeft, CheckCircle2, AlertCircle, Trash2,
  Info, AlertTriangle, Sparkles, Gift, Eye
} from "lucide-react";
import Link from "next/link";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "promo";
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
  createdAt: string;
  active: boolean;
}

const typeOptions = [
  { value: "promo", label: "🎁 Promo / Nouveauté", color: "#C6A55C" },
  { value: "info", label: "📢 Information", color: "#2196F3" },
  { value: "success", label: "✅ Bonne nouvelle", color: "#4CAF50" },
  { value: "warning", label: "⚠️ Avertissement", color: "#FF9800" },
];

export default function AnnouncementsPage() {
  const isAdmin = useAdminAuth();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"info" | "warning" | "success" | "promo">("promo");
  const [imageUrl, setImageUrl] = useState("");
  const [buttonText, setButtonText] = useState("");
  const [buttonUrl, setButtonUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isAdmin) loadAnnouncements();
  }, [isAdmin]);

  const loadAnnouncements = () => {
    fetch("/api/announcements")
      .then(r => r.json())
      .then(data => setAnnouncements(data.announcements || []))
      .catch(() => {});
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, message, type,
          imageUrl: imageUrl || undefined,
          buttonText: buttonText || undefined,
          buttonUrl: buttonUrl || undefined,
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTitle("");
        setMessage("");
        setImageUrl("");
        setButtonText("");
        setButtonUrl("");
        loadAnnouncements();
        // Also send as notification
        fetch("/api/admin/notifications/all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, message }),
        }).catch(() => {});
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const data = await res.json();
        setError(data.error || "Erreur lors de la création");
      }
    } catch {
      setError("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette annonce ?")) return;
    await fetch("/api/announcements", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadAnnouncements();
  };

  const selectedColor = typeOptions.find(t => t.value === type)?.color || "#C6A55C";

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen px-4 md:px-8 pt-8 pb-20">
      <div className="max-w-4xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 group font-bold uppercase tracking-widest text-[10px]">
          <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
          Retour Dashboard
        </Link>

        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 rounded-2xl bg-gold/10 flex items-center justify-center border border-gold/20 shadow-lg shadow-gold/5">
            <Megaphone className="w-7 h-7 text-gold" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Popups d&apos;Annonce</h1>
            <p className="text-text-muted text-sm font-medium mt-1">Créez des popups plein écran qui apparaissent une seule fois par utilisateur.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="glass-card p-8 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] -z-10 rounded-full" />

            <h2 className="text-lg font-black mb-6 flex items-center gap-2">
              <Send className="w-4 h-4 text-gold" />
              Nouvelle Annonce
            </h2>
            
            <form onSubmit={handleSend} className="space-y-5">
              {/* Type */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {typeOptions.map(opt => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setType(opt.value as any)}
                      className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${
                        type === opt.value
                          ? "border-current bg-white/10"
                          : "border-white/5 bg-surface hover:bg-white/5"
                      }`}
                      style={type === opt.value ? { color: opt.color, borderColor: opt.color + "50" } : {}}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Titre</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Nouvelle fonctionnalité ! 🎉"
                  className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40 font-bold"
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Décrivez le contenu de l'annonce..."
                  rows={3}
                  className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40 leading-relaxed"
                  required
                />
              </div>

              {/* Image URL (optional) */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Image URL (optionnel)</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40"
                />
              </div>

              {/* Button (optional) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Texte bouton</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Voir ici"
                    className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted ml-1">Lien bouton</label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="/page"
                    className="w-full bg-surface border border-surface-light rounded-xl px-4 py-3 text-sm focus:border-gold/50 outline-none transition-all placeholder:text-text-muted/40"
                  />
                </div>
              </div>

              {/* Preview & Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  disabled={!title}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-sm font-bold flex items-center justify-center gap-2 hover:bg-white/5 transition-all disabled:opacity-30"
                >
                  <Eye className="w-4 h-4" /> Aperçu
                </button>
                <button
                  type="submit"
                  disabled={loading || !title || !message}
                  className="flex-1 btn-gold py-3 rounded-xl text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-gold/10"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-deep-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Publier <Send className="w-3 h-3" /></>
                  )}
                </button>
              </div>
            </form>

            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 p-3 bg-green-500/10 border border-green-500/20 rounded-xl flex items-center gap-3"
                >
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  <p className="text-xs font-bold text-green-500">Popup créée ! Elle apparaîtra lors de la prochaine visite de chaque utilisateur.</p>
                </motion.div>
              )}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-xs font-bold text-red-500">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Live announcements list */}
          <div>
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-gold" />
              Annonces actives ({announcements.length})
            </h2>

            {announcements.length === 0 ? (
              <div className="glass-card p-8 border border-white/5 text-center text-text-muted">
                <Megaphone className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Aucune annonce active</p>
                <p className="text-xs mt-1">Créez-en une avec le formulaire.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => {
                  const color = typeOptions.find(t => t.value === ann.type)?.color || "#C6A55C";
                  return (
                    <motion.div
                      key={ann.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass-card p-5 border border-white/5 group hover:border-opacity-20 transition-all"
                      style={{ borderColor: color + "30" }}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: color + "15", color }}
                        >
                          {ann.type === "info" && <Info className="w-5 h-5" />}
                          {ann.type === "warning" && <AlertTriangle className="w-5 h-5" />}
                          {ann.type === "success" && <Sparkles className="w-5 h-5" />}
                          {ann.type === "promo" && <Gift className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-sm truncate">{ann.title}</h3>
                          <p className="text-text-muted text-xs mt-1 line-clamp-2">{ann.message}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-[10px] text-text-muted">
                              {new Date(ann.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                            {ann.buttonText && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5" style={{ color }}>
                                🔗 {ann.buttonText}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(ann.id)}
                          className="p-2 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && title && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
            style={{ background: "rgba(0, 0, 0, 0.88)", backdropFilter: "blur(24px)" }}
            onClick={() => setShowPreview(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowPreview(false)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
            >
              <span className="sr-only">Fermer</span>
              ✕
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.7, y: 60 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 60 }}
              transition={{ type: "spring", damping: 22, stiffness: 260 }}
              className="relative w-full max-w-md rounded-3xl overflow-hidden"
              style={{
                background: "rgba(12, 12, 12, 0.97)",
                border: `1px solid ${selectedColor}40`,
                boxShadow: `0 0 100px ${selectedColor}25`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full -translate-y-1/2 blur-[100px] opacity-40 pointer-events-none" style={{ background: selectedColor }} />

              {imageUrl && (
                <div className="relative w-full aspect-video overflow-hidden">
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
                </div>
              )}

              <div className="relative p-8 pt-10">
                {!imageUrl && (
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: selectedColor + "15", color: selectedColor }}>
                    {type === "info" && <Info className="w-12 h-12" />}
                    {type === "warning" && <AlertTriangle className="w-12 h-12" />}
                    {type === "success" && <Sparkles className="w-12 h-12" />}
                    {type === "promo" && <Gift className="w-12 h-12" />}
                  </div>
                )}
                <h2 className="text-2xl font-black text-center mb-4">{title || "Titre de l'annonce"}</h2>
                <p className="text-text-secondary text-center text-sm mb-8 whitespace-pre-line">{message || "Message..."}</p>
                <div className="space-y-3">
                  {buttonText ? (
                    <>
                      <button className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider" style={{ background: selectedColor, color: type === "promo" ? "#0A0A0A" : "#fff" }}>
                        {buttonText}
                      </button>
                      <button className="w-full py-3 text-sm text-text-muted">Plus tard</button>
                    </>
                  ) : (
                    <button className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider" style={{ background: selectedColor, color: type === "promo" ? "#0A0A0A" : "#fff" }}>
                      Compris
                    </button>
                  )}
                </div>
              </div>

              <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] uppercase tracking-widest font-black text-text-muted bg-surface px-3 py-1 rounded-full">
                Aperçu
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
