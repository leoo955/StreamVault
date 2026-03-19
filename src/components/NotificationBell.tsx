"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, Film, Tv, Star, CheckCheck } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  mediaId?: string;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    fetchNotifications();
  };

  const markRead = async (id: string) => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchNotifications();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-white/5 transition-all duration-300"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 transition-colors duration-300 ${unreadCount > 0 ? "text-gold" : "text-text-muted"}`} />
        
        {unreadCount > 0 && (
          <>
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full z-10"
            />
            <motion.span
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 2.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full"
            />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 top-full mt-4 w-80 md:w-[400px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[200] glass-card-strong"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div>
                <h3 className="font-black text-text-primary text-sm uppercase tracking-widest">Alerte Info</h3>
                <p className="text-[10px] text-text-muted mt-0.5 font-medium">Restez au courant du contenu</p>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-[10px] text-gold hover:text-gold-light font-black transition-colors uppercase tracking-wider"
                >
                  <CheckCheck className="w-3 h-3" />
                  Lu
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[450px] overflow-y-auto scrollbar-hide">
              {notifications.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center justify-center px-10">
                  <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-text-muted opacity-20" />
                  </div>
                  <h4 className="text-sm font-bold text-text-primary">Tout est calme ici</h4>
                  <p className="text-xs text-text-muted mt-2 leading-relaxed">
                    Revenez plus tard pour découvrir les nouveautés et les interactions.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {notifications.map((n) => {
                    const content = (
                      <div
                        className={`flex gap-4 px-5 py-4 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer relative group ${!n.read ? "bg-gold/[0.03]" : ""}`}
                        onClick={() => { if (!n.read) markRead(n.id); }}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 ${n.read ? "bg-white/[0.05]" : "bg-gold/20"}`}>
                          {n.mediaId ? (
                            <Film className={`w-5 h-5 ${n.read ? "text-text-muted" : "text-gold"}`} />
                          ) : (
                            <Star className={`w-5 h-5 ${n.read ? "text-text-muted" : "text-gold"}`} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className={`text-xs font-black uppercase tracking-wider truncate mb-1 ${n.read ? "text-text-secondary" : "gold-text"}`}>
                              {n.title}
                            </p>
                            {!n.read && (
                              <div className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 mt-1 shadow-[0_0_10px_var(--gold)]" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted leading-relaxed line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[9px] text-text-muted/60 mt-2 font-bold uppercase tracking-tighter">
                            {timeAgo(n.createdAt)}
                          </p>
                        </div>
                      </div>
                    );

                    return n.mediaId ? (
                      <Link href={`/detail/${n.mediaId}`} key={n.id} onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={n.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="px-5 py-3 bg-white/[0.01] border-t border-white/5 text-center">
                <p className="text-[9px] text-text-muted font-bold uppercase tracking-widest">Vos 50 dernières alertes</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
