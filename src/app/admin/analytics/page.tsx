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
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend
} from "recharts";

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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
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

  const mediaData = data.media.total > 0 ? [
    { name: "Films", value: data.media.movies, color: "#C6A55C" },
    { name: "Séries", value: data.media.series, color: "#6366f1" },
  ] : [];

  const userData = data.users.total > 0 ? [
    { name: "Actifs (7j)", value: data.users.activeThisWeek, color: "#22c55e" },
    { name: "Inactifs", value: Math.max(0, data.users.total - data.users.activeThisWeek), color: "#475569" },
  ] : [];

  const statCards = [
    { icon: Film, label: "Médias total", value: data.media.total, color: "#C6A55C" },
    { icon: MonitorPlay, label: "Épisodes", value: data.media.totalEpisodes, color: "#ec4899" },
    { icon: Users, label: "Utilisateurs", value: data.users.total, color: "#14b8a6" },
    { icon: Clock, label: "Heures vues", value: `${data.watch.totalHours}h`, color: "#f59e0b" },
    { icon: Star, label: "Note moyenne", value: `${data.ratings.average}/5`, color: "#C6A55C" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen px-4 md:px-8 py-8 pt-24 max-w-7xl mx-auto"
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
          <h1 className="text-xl md:text-2xl font-bold">Analytics</h1>
          <p className="text-xs md:text-sm text-text-muted font-medium">Vue d&apos;ensemble de la plateforme</p>
        </div>
      </div>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-8 md:mb-10">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="rounded-2xl p-3 md:p-4 flex flex-col gap-1.5 md:gap-2"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-light)",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${card.color}20` }}
              >
                <card.icon className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: card.color }} />
              </div>
            </div>
            <div className="text-xl md:text-2xl font-bold tracking-tight">{card.value}</div>
            <div className="text-[10px] md:text-xs text-text-muted font-medium uppercase tracking-wider">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
        {/* Media Distribution Camembert */}
        <div className="rounded-2xl p-5 md:p-6" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
            <Film className="w-4 h-4 md:w-5 md:h-5 text-gold" />
            Répartition des Médias
          </h2>
          <div className="h-[250px] md:h-[300px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mediaData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {mediaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-light)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* User Activity Camembert */}
        <div className="rounded-2xl p-5 md:p-6" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
            <Users className="w-4 h-4 md:w-5 md:h-5 text-gold" />
            Activité des Utilisateurs
          </h2>
          <div className="h-[250px] md:h-[300px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={400}
                    animationDuration={1000}
                  >
                    {userData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ background: 'var(--surface)', border: '1px solid var(--surface-light)', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Top Watched */}
      {data.watch.topWatched.length > 0 && (
        <div className="rounded-2xl p-5 md:p-6 mb-10" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}>
          <h2 className="text-base md:text-lg font-bold mb-4 md:mb-6 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-gold" />
            Contenus les plus populaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {data.watch.topWatched.map((item, idx) => (
              <div
                key={item.mediaId}
                className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl hover:bg-surface-hover transition-all duration-300 group"
                style={{ background: "var(--deep-black)", border: "1px solid var(--surface-light)" }}
              >
                <span
                  className="text-2xl md:text-3xl font-black w-6 md:w-8 text-center italic opacity-30 group-hover:opacity-100 transition-opacity"
                  style={{ color: idx === 0 ? "#C6A55C" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : "var(--text-muted)" }}
                >
                  {idx + 1}
                </span>
                <div className="w-12 h-16 md:w-14 md:h-20 rounded-lg overflow-hidden shrink-0 shadow-lg" style={{ background: "var(--surface-light)" }}>
                  {item.posterUrl ? (
                    <img src={item.posterUrl} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Film className="w-4 h-4 md:w-5 md:h-5 text-text-muted/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs md:text-sm truncate uppercase tracking-tight">{item.title}</p>
                  <div className="flex items-center gap-1 mt-0.5 md:mt-1">
                    <MonitorPlay className="w-3 h-3 md:w-3.5 md:h-3.5 text-gold" />
                    <p className="text-[10px] md:text-xs text-text-muted font-medium">{item.count} sessions</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
