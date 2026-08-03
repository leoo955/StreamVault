"use client";

import { LayoutDashboard, Film, Tv, Users, Ticket, Activity, TrendingUp, Search, RefreshCw, PlusSquare } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    
    try {
      const res = await fetch("/api/admin/stats", {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = [
    { label: 'Utilisateurs', value: data?.stats?.users || '0', icon: Users, trend: '+2 cette semaine' },
    { label: 'Films', value: data?.stats?.movies || '0', icon: Film, trend: 'Catalogue total' },
    { label: 'Séries', value: data?.stats?.series || '0', icon: Tv, trend: 'Collections actives' },
    { label: 'Invitations', value: data?.stats?.invites || '0', icon: Ticket, trend: 'Codes disponibles' },
  ]

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    if (minutes < 1) return "à l'instant";
    if (minutes < 60) return `il y a ${minutes}m`;
    if (hours < 24) return `il y a ${hours}h`;
    return `il y a ${Math.floor(hours / 24)}j`;
  };

  return (
    <div className="space-y-16">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="font-display font-light text-4xl md:text-5xl text-white tracking-widest uppercase flex items-center gap-6">
            <LayoutDashboard className="text-white/20" size={40} />
            Vue d'ensemble
          </h2>
          <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[10px] ml-16">
            Monitoring & Contrôle Système
          </p>
        </div>

        <button 
          onClick={() => fetchData(true)}
          disabled={isRefreshing}
          className="group flex items-center gap-3 bg-white/[0.03] border border-white/5 hover:border-white/10 hover:bg-white/[0.06] text-white/40 hover:text-white px-6 py-3 rounded-xl transition-all duration-500"
        >
          <RefreshCw size={14} className={isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
          <span className="text-[10px] font-black uppercase tracking-widest">Rafraîchir</span>
        </button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="group flex flex-col gap-6 p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all duration-700"
          >
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] flex items-center justify-center text-white/40 group-hover:text-white transition-colors duration-700">
                <stat.icon size={22} />
              </div>
              <TrendingUp className="text-white/5 group-hover:text-white/40 transition-colors duration-700" size={18} />
            </div>
            
            <div>
              <div className="text-4xl font-black font-display tracking-tighter text-white mb-2 italic">
                {isLoading ? "..." : stat.value}
              </div>
              <div className="font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/30 group-hover:text-white/60 transition-colors duration-700">{stat.label}</div>
            </div>

            <div className="text-[9px] text-white/15 font-bold uppercase tracking-widest mt-2 pt-6 border-t border-white/5">
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Activity & Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/30 flex items-center gap-4">
              <Activity size={14} className="text-white/10" />
              Activités récentes
            </h3>
            <span className="text-[9px] text-white/10 font-bold uppercase tracking-widest cursor-pointer hover:text-white transition-colors duration-500">Historique complet</span>
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
               <div className="py-20 text-center text-white/5 font-bold uppercase tracking-widest text-[9px]">Chargement des données...</div>
            ) : data?.activities?.length > 0 ? data.activities.map((item: any) => (
              <div key={item.id} className="group p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 flex items-center justify-between transition-all duration-700">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/10 group-hover:text-white/40 transition-all duration-700">
                    {item.type === 'media' ? <Film size={18} /> : item.type === 'invite' ? <Ticket size={18} /> : <Users size={18} />}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1 group-hover:text-white transition-colors duration-700">{item.action}</div>
                    <div className="text-[10px] text-white/20 font-medium tracking-wide">
                      PAR <span className="text-white/40">{item.user}</span> {item.details && ` · ${item.details}`}
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em] group-hover:text-white/20 transition-colors">
                  {formatTime(item.time)}
                </div>
              </div>
            )) : (
              <div className="py-20 text-center text-white/5 font-bold uppercase tracking-widest text-[9px]">Aucune activité récente</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/30 px-2">Opérations</h3>
          <div className="flex flex-col gap-4">
            <button 
              onClick={() => router.push("/admin/media/add")}
              className="group w-full flex items-center gap-4 bg-white text-black font-sans font-black uppercase tracking-[0.2em] text-[10px] py-5 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
            >
              <PlusSquareIcon size={16} />
              <span>Nouveau Média</span>
            </button>
            <button 
              onClick={async () => {
                setIsGenerating(true);
                try {
                  const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
                  const res = await fetch("/api/invitations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ 
                      code: `SV-${randomCode}`,
                      maxUses: 1,
                      role: "user",
                      plan: "PREMIUM"
                    }),
                  });
                  if (res.ok) {
                    const data = await res.json();
                    alert(`Code généré : ${data.code}`);
                    // Re-fetch to update stats
                    const statsRes = await fetch("/api/admin/stats");
                    if (statsRes.ok) setData(await statsRes.json());
                  } else {
                    alert("Erreur lors de la génération");
                  }
                } catch (e) {
                  console.error(e);
                } finally {
                  setIsGenerating(false);
                }
              }}
              disabled={isGenerating}
              className="group w-full flex items-center gap-4 bg-white/[0.03] border border-white/5 text-white/40 font-sans font-black uppercase tracking-[0.2em] text-[10px] py-5 px-8 rounded-2xl hover:bg-white/[0.06] hover:text-white hover:border-white/10 transition-all duration-500 disabled:opacity-50"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Ticket size={16} />}
              <span>Générer Invitation</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Loader2({ className, size }: { className?: string, size?: number }) {
  return (
    <svg 
      className={className}
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
    </svg>
  )
}

function PlusSquareIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <path d="M12 8v8"/>
      <path d="M8 12h8"/>
    </svg>
  )
}
