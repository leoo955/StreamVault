"use client";

import React from "react";
import { BarChart3, TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminStatsPage() {
  const data = [
    { label: "Vues hebdomadaires", value: "24,840", change: "+12%", up: true },
    { label: "Temps d'écoute moyen", value: "1h 42m", change: "-4%", up: false },
    { label: "Taux de complétion", value: "78%", change: "+2%", up: true },
    { label: "Stockage utilisé", value: "4.2 TB", change: "64%", up: true },
  ];

  return (
    <div className="space-y-16 pb-32">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <h2 className="font-display font-light text-4xl text-white tracking-widest uppercase flex items-center gap-6">
          <BarChart3 className="text-white/20" size={32} />
          Analytique
        </h2>
        <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[9px] ml-14">
          Performances & Métriques Système
        </p>
      </div>

      {/* Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {data.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.8 }}
            className="p-8 rounded-[2rem] bg-white/[0.01] border border-white/5 space-y-6 group hover:border-white/10 transition-all duration-700"
          >
            <div className="flex justify-between items-start">
               <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20 group-hover:text-white/40 transition-colors">{stat.label}</div>
               {stat.up ? (
                 <ArrowUpRight size={16} className="text-green-500/40" />
               ) : (
                 <ArrowDownRight size={16} className="text-red-500/40" />
               )}
            </div>
            
            <div className="flex items-baseline gap-4">
               <div className="text-4xl font-display font-black italic tracking-tighter text-white">{stat.value}</div>
               <div className={`text-[10px] font-black tracking-widest ${stat.up ? 'text-green-500/40' : 'text-red-500/40'}`}>
                 {stat.change}
               </div>
            </div>

            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: stat.up ? '70%' : '30%' }}
                 transition={{ duration: 1.5, delay: 0.5 }}
                 className="h-full bg-white/10"
               />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-10">
          <div className="flex items-center justify-between">
             <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/40">Engagement Audience</h3>
             <Activity size={16} className="text-white/10" />
          </div>
          
          <div className="aspect-[2/1] w-full flex items-end gap-3 px-2">
            {[40, 60, 35, 90, 50, 75, 45, 80, 55, 65, 40, 95].map((h, i) => (
              <motion.div 
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${h}%` }}
                transition={{ duration: 1, delay: i * 0.05 }}
                className="flex-1 bg-white/[0.03] rounded-t-lg group-hover:bg-white/10 transition-colors"
              />
            ))}
          </div>

          <div className="flex justify-between text-[8px] font-black tracking-widest text-white/10 uppercase">
             <span>Janvier</span>
             <span>Décembre</span>
          </div>
        </div>

        <div className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-10">
          <div className="flex items-center justify-between">
             <h3 className="font-sans font-bold uppercase tracking-[0.4em] text-[10px] text-white/40">Répartition Catalogue</h3>
             <PieChart size={16} className="text-white/10" />
          </div>

          <div className="space-y-6">
            {[
              { label: "Action", value: "42%", color: "white/20" },
              { label: "Drame", value: "28%", color: "white/10" },
              { label: "Sience-Fiction", value: "15%", color: "white/5" },
              { label: "Autres", value: "15%", color: "white/2" },
            ].map((item) => (
              <div key={item.label} className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/30">{item.label}</span>
                  <span className="text-white/60">{item.value}</span>
                </div>
                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-white/10" style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
