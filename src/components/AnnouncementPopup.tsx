"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Megaphone, Sparkles, AlertTriangle, Gift } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "success" | "promo";
  imageUrl?: string;
  buttonText?: string;
  buttonUrl?: string;
}

const SEEN_KEY = "sv-announcements-seen";

function getSeenIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || "[]");
  } catch {
    return [];
  }
}

function markAsSeen(id: string) {
  const seen = getSeenIds();
  if (!seen.includes(id)) {
    seen.push(id);
    localStorage.setItem(SEEN_KEY, JSON.stringify(seen));
  }
}

const iconMap = {
  info: <Megaphone className="w-12 h-12" />,
  warning: <AlertTriangle className="w-12 h-12" />,
  success: <Sparkles className="w-12 h-12" />,
  promo: <Gift className="w-12 h-12" />,
};

const colorMap = {
  info: { accent: "#2196F3", bg: "rgba(33, 150, 243, 0.12)", border: "rgba(33, 150, 243, 0.3)", glow: "rgba(33, 150, 243, 0.25)" },
  warning: { accent: "#FF9800", bg: "rgba(255, 152, 0, 0.12)", border: "rgba(255, 152, 0, 0.3)", glow: "rgba(255, 152, 0, 0.25)" },
  success: { accent: "#4CAF50", bg: "rgba(76, 175, 80, 0.12)", border: "rgba(76, 175, 80, 0.3)", glow: "rgba(76, 175, 80, 0.25)" },
  promo: { accent: "#C6A55C", bg: "rgba(198, 165, 92, 0.12)", border: "rgba(198, 165, 92, 0.3)", glow: "rgba(198, 165, 92, 0.25)" },
};

export default function AnnouncementPopup() {
  const [current, setCurrent] = useState<Announcement | null>(null);
  const [queue, setQueue] = useState<Announcement[]>([]);

  useEffect(() => {
    // Wait a bit before showing (don't block initial load)
    const timer = setTimeout(() => {
      fetch("/api/announcements")
        .then((r) => r.json())
        .then((data) => {
          const seen = getSeenIds();
          const unseen = (data.announcements || []).filter(
            (a: Announcement) => !seen.includes(a.id)
          );
          if (unseen.length > 0) {
            setCurrent(unseen[0]);
            setQueue(unseen.slice(1));
          }
        })
        .catch(() => {});
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    if (current) {
      markAsSeen(current.id);
    }
    if (queue.length > 0) {
      setCurrent(queue[0]);
      setQueue(queue.slice(1));
    } else {
      setCurrent(null);
    }
  };

  const colors = current ? colorMap[current.type] : colorMap.info;

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9998] flex items-center justify-center p-6"
          style={{ background: "rgba(0, 0, 0, 0.88)", backdropFilter: "blur(24px)" }}
          onClick={dismiss}
        >
          {/* Close X */}
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={dismiss}
            className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 60 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.7, y: 60 }}
            transition={{ type: "spring", damping: 22, stiffness: 260 }}
            className="relative w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              background: "rgba(12, 12, 12, 0.97)",
              border: `1px solid ${colors.border}`,
              boxShadow: `0 0 100px ${colors.glow}, 0 20px 60px rgba(0,0,0,0.5)`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full -translate-y-1/2 blur-[100px] opacity-40 pointer-events-none"
              style={{ background: colors.accent }}
            />

            {/* Optional image */}
            {current.imageUrl && (
              <div className="relative w-full aspect-video overflow-hidden">
                <img
                  src={current.imageUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0c] via-transparent to-transparent" />
              </div>
            )}

            <div className="relative p-8 pt-10">
              {/* Icon */}
              {!current.imageUrl && (
                <motion.div
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12, delay: 0.15 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                  style={{ background: colors.bg, color: colors.accent }}
                >
                  {iconMap[current.type]}
                </motion.div>
              )}

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-2xl font-black text-center mb-4 leading-tight"
              >
                {current.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-text-secondary text-center leading-relaxed text-sm mb-8 whitespace-pre-line"
              >
                {current.message}
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="space-y-3"
              >
                {current.buttonText && current.buttonUrl ? (
                  <>
                    <Link href={current.buttonUrl} onClick={dismiss}>
                      <button
                        className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:opacity-90"
                        style={{ background: colors.accent, color: current.type === "promo" ? "#0A0A0A" : "#fff" }}
                      >
                        {current.buttonText}
                      </button>
                    </Link>
                    <button
                      onClick={dismiss}
                      className="w-full py-3 rounded-xl text-sm font-medium text-text-muted hover:text-white transition-colors"
                    >
                      Plus tard
                    </button>
                  </>
                ) : (
                  <button
                    onClick={dismiss}
                    className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:opacity-90"
                    style={{ background: colors.accent, color: current.type === "promo" ? "#0A0A0A" : "#fff" }}
                  >
                    Compris
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
