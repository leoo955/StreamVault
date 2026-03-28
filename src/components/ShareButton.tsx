"use client";

import { useState } from "react";
import { Share2, Copy, Check, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ShareButtonProps {
  title: string;
  mediaId: string;
  className?: string;
}

export default function ShareButton({ title, mediaId, className = "" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/detail/${mediaId}`
    : `/detail/${mediaId}`;

  const shareText = `Regarde "${title}" sur StreamVault !`;

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: shareText, url: shareUrl });
      } catch {}
    } else {
      setIsOpen(!isOpen);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const socials = [
    {
      name: "WhatsApp",
      color: "#25D366",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
    },
    {
      name: "Discord",
      color: "#5865F2",
      url: shareUrl, // Discord doesn't have a share URL, just copy
      action: copyLink,
    },
    {
      name: "X",
      color: "#fff",
      url: `https://x.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Telegram",
      color: "#0088cc",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
  ];

  return (
    <div className={`relative ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNativeShare}
        className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 transition-all text-sm font-medium"
      >
        <Share2 className="w-4 h-4" />
        Partager
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200]"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-full mb-2 left-0 w-56 rounded-xl overflow-hidden z-[201] shadow-2xl"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
            >
              <div className="p-1.5">
                <div className="px-3 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  Partager via
                </div>

                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.action ? undefined : s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => {
                      if (s.action) {
                        e.preventDefault();
                        s.action();
                      }
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black"
                      style={{ background: `${s.color}20`, color: s.color }}
                    >
                      {s.name[0]}
                    </div>
                    <span className="text-sm font-medium">{s.name}</span>
                  </a>
                ))}

                <div className="border-t border-white/5 mt-1 pt-1">
                  <button
                    onClick={() => { copyLink(); setIsOpen(false); }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors w-full text-left"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-text-muted" />
                    )}
                    <span className="text-sm font-medium">
                      {copied ? "Copié !" : "Copier le lien"}
                    </span>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
