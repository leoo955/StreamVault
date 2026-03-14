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
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
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
        className="relative p-2 rounded-full hover:bg-surface transition-colors"
        aria-label="Notifications"
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-gold" : "text-text-muted"}`} />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gold text-deep-black text-[9px] font-black rounded-full flex items-center justify-center"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 md:w-96 rounded-2xl overflow-hidden shadow-2xl z-[200]"
            style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-light">
              <h3 className="font-bold text-text-primary text-sm">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] text-gold hover:text-gold/80 font-bold transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="py-10 text-center text-text-muted text-sm">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Aucune notification
                </div>
              ) : (
                notifications.map((n) => {
                  const content = (
                    <div
                      className={`flex gap-3 px-4 py-3 hover:bg-surface-light/50 transition-colors cursor-pointer border-b border-surface-light/30 last:border-0 ${!n.read ? "bg-gold/5" : ""}`}
                      onClick={() => { if (!n.read) markRead(n.id); }}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${n.read ? "bg-surface-light" : "bg-gold/20"}`}>
                        {n.mediaId ? (
                          <Tv className={`w-4 h-4 ${n.read ? "text-text-muted" : "text-gold"}`} />
                        ) : (
                          <Star className={`w-4 h-4 ${n.read ? "text-text-muted" : "text-gold"}`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold ${n.read ? "text-text-secondary" : "text-text-primary"}`}>{n.title}</p>
                        <p className="text-[11px] text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-text-muted mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-gold mt-1.5 shrink-0" />
                      )}
                    </div>
                  );

                  return n.mediaId ? (
                    <Link href={`/detail/${n.mediaId}`} key={n.id} onClick={() => setOpen(false)}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id}>{content}</div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
