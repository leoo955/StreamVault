"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Film,
  Users,
  Clock,
  Star,
  MessageSquare,
  TrendingUp,
  MonitorPlay,
  Tv,
  Clapperboard,
} from "lucide-react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface Analytics {
  media: { total: number; movies: number; series: number; totalEpisodes: number };
  users: { total: number; activeThisWeek: number };
  watch: {
    totalHours: number;
    topWatched: { mediaId: string; title: string; posterUrl: string; count: number }[];
  };
  ratings: { total: number; average: number };
  comments: { total: number };
}

export default function AdminAnalyticsPage() {
  const isAdmin = useAdminAuth();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return <div className="p-8 text-text-muted">Erreur lors du chargement</div>;

  const statCards = [
    { icon: Film, label: "Médias total", value: data.media.total, color: "#C6A55C" },
    { icon: Clapperboard, label: "Films", value: data.media.movies, color: "#6366f1" },
    { icon: Tv, label: "Séries", value: data.media.series, color: "#8b5cf6" },
    { icon: MonitorPlay, label: "Épisodes", value: data.media.totalEpisodes, color: "#ec4899" },
    { icon: Users, label: "Utilisateurs", value: data.users.total, color: "#14b8a6" },
    { icon: TrendingUp, label: "Actifs (7j)", value: data.users.activeThisWeek, color: "#22c55e" },
    { icon: Clock, label: "Heures vues", value: `${data.watch.totalHours}h`, color: "#f59e0b" },
    { icon: Star, label: "Note moyenne", value: `${data.ratings.average}/5`, color: "#C6A55C" },
    { icon: Star, label: "Total notes", value: data.ratings.total, color: "#a78bfa" },
    { icon: MessageSquare, label: "Commentaires", value: data.comments.total, color: "#06b6d4" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 md:px-8 py-8 pt-24"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="p-2 rounded-xl hover:bg-surface-hover transition-colors"
          style={{ background: "var(--surface)" }}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">📊 Analytics</h1>
          <p className="text-sm text-text-muted">Vue d&apos;ensemble de la plateforme</p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-xl p-4 flex flex-col gap-2"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-light)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${card.color}20` }}
              >
                <card.icon className="w-4 h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs text-text-muted">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Top Watched */}
      {data.watch.topWatched.length > 0 && (
        <div className="rounded-xl p-6" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-gold" />
            Les plus regardés
          </h2>
          <div className="space-y-3">
            {data.watch.topWatched.map((item, idx) => (
              <div
                key={item.mediaId}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-hover transition-colors"
                style={{ background: "var(--deep-black)" }}
              >
                <span
                  className="text-2xl font-black w-8 text-center"
                  style={{ color: idx === 0 ? "#C6A55C" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "var(--text-muted)" }}
                >
                  {idx + 1}
                </span>
                <div className="w-12 h-16 rounded-lg overflow-hidden shrink-0" style={{ background: "var(--surface-light)" }}>
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-4 h-4 text-text-muted/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.title}</p>
                  <p className="text-xs text-text-muted">{item.count} vues</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
