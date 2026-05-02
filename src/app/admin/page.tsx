"use client";

import { LayoutDashboard, Film, Tv, Users, Ticket, Activity, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function AdminDashboard() {
  const [isGenerating, setIsGenerating] = useState(false)
  
  const stats = [
    { label: 'Utilisateurs', value: '12', icon: Users, trend: '+2 cette semaine' },
    { label: 'Films', value: '148', icon: Film, trend: '+12 ce mois' },
    { label: 'Séries', value: '42', icon: Tv, trend: '+3 ce mois' },
    { label: 'Invitations', value: '5', icon: Ticket, trend: '8 disponibles' },
  ]

  const recentActivity = [
    { id: 1, action: 'Nouvel utilisateur', user: 'romain', time: 'il y a 2h', icon: Users },
    { id: 2, action: 'Film ajouté', user: 'admin', details: 'Dune: Part Two', time: 'il y a 5h', icon: Film },
    { id: 3, action: 'Invitation créée', user: 'admin', details: 'CODE-XYZ', time: 'il y a 1j', icon: Ticket },
  ]

  return (
    <div className="space-y-16">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-light text-4xl md:text-5xl text-white tracking-widest uppercase flex items-center gap-6">
          <LayoutDashboard className="text-white/20" size={40} />
          Vue d'ensemble
        </h2>
        <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[10px] ml-16">
          Monitoring & Contrôle Système
        </p>
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
                {stat.value}
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
            {recentActivity.map((item) => (
              <div key={item.id} className="group p-5 rounded-2xl bg-white/[0.01] border border-white/[0.03] hover:border-white/10 flex items-center justify-between transition-all duration-700">
                <div className="flex items-center gap-6">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] flex items-center justify-center text-white/10 group-hover:text-white/40 transition-all duration-700">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white/60 uppercase tracking-widest mb-1 group-hover:text-white transition-colors duration-700">{item.action}</div>
                    <div className="text-[10px] text-white/20 font-medium tracking-wide">
                      PAR <span className="text-white/40">{item.user}</span> {item.details && ` · ${item.details}`}
                    </div>
                  </div>
                </div>
                <div className="text-[9px] text-white/10 font-bold uppercase tracking-[0.2em] group-hover:text-white/20 transition-colors">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/30 px-2">Opérations</h3>
          <div className="flex flex-col gap-4">
            <button className="group w-full flex items-center gap-4 bg-white text-black font-sans font-black uppercase tracking-[0.2em] text-[10px] py-5 px-8 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-500">
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
