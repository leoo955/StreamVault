"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Search, Calendar, Shield, Activity, Monitor, User as UserIcon, Clock, Filter, Trash2, X
} from "lucide-react";
import Link from "next/link";
import { ActivityLog } from "@/lib/db";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const S = {
  background: "var(--surface)",
  border: "1px solid var(--surface-light)",
};

export default function AdminLogsPage() {
  const isAdmin = useAdminAuth();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("Tous");

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/logs")
      .then(res => res.json())
      .then(data => {
        if (data.logs) setLogs(data.logs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [isAdmin]);

  if (!isAdmin) return <div className="fixed inset-0 z-[200] bg-deep-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.username?.toLowerCase().includes(filter.toLowerCase()) ||
      log.ip.includes(filter) ||
      log.details.toLowerCase().includes(filter.toLowerCase());
    
    const matchesAction = actionFilter === "Tous" || log.action === actionFilter;
    
    return matchesSearch && matchesAction;
  });

  const uniqueActions = ["Tous", ...Array.from(new Set(logs.map(l => l.action)))];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-deep-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-6">
            <Link href="/admin">
              <button className="p-3 rounded-2xl hover:bg-surface-light transition-all duration-300 group" style={S}>
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              </button>
            </Link>
            <div>
              <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                <Shield className="w-8 h-8 text-gold" />
                Logs d&apos;Activité
              </h1>
              <p className="text-text-muted mt-1">Surveillez les accès et activités de la plateforme en temps réel.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <div className="px-5 py-3 rounded-2xl flex flex-col items-center" style={S}>
                <span className="text-[10px] uppercase tracking-widest text-text-muted font-bold">Total Events</span>
                <span className="text-xl font-black text-gold">{logs.length}</span>
             </div>
          </div>
        </div>

        {/* Filters */}
        <div className="grid md:grid-cols-[1fr,auto] gap-4 mb-8">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-gold transition-colors" />
              <input 
                type="text" 
                placeholder="Rechercher utilisateur, IP, ou contenu..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all"
                style={S}
              />
           </div>
           
           <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {uniqueActions.map(action => (
                <button 
                  key={action}
                  onClick={() => setActionFilter(action)}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${actionFilter === action ? 'bg-gold text-deep-black shadow-lg shadow-gold/20' : 'bg-surface text-text-muted border border-surface-light hover:border-gold/50'}`}
                >
                  {action}
                </button>
              ))}
           </div>
        </div>

        {/* Logs Table */}
        <div className="rounded-3xl overflow-hidden border border-surface-light bg-surface/30 backdrop-blur-xl">
           <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-surface-light bg-surface/50">
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted">Utilisateur</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted">Action</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted">Détails</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted">Adresse IP</th>
                    <th className="px-6 py-5 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted">Date</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-surface-light">
                 {loading ? (
                   <tr>
                     <td colSpan={5} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                           <Activity className="w-8 h-8 text-gold animate-pulse" />
                           <p className="text-sm font-medium animate-pulse">Chargement des logs...</p>
                        </div>
                     </td>
                   </tr>
                 ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-20 text-center text-text-muted">
                         Aucun log trouvé pour cette recherche.
                      </td>
                    </tr>
                 ) : (
                   filteredLogs.map((log) => (
                     <motion.tr 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }}
                       key={log.id} 
                       className="hover:bg-surface/40 transition-colors group"
                     >
                       <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-surface-light flex items-center justify-center">
                                <UserIcon className="w-4 h-4 text-text-secondary" />
                             </div>
                             <div>
                                <p className="text-sm font-bold">{log.username}</p>
                                <p className="text-[10px] text-text-muted font-mono">{log.userId?.slice(0,8)}</p>
                             </div>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            log.action === "Connexion" ? "bg-green-500/10 text-green-500" :
                            log.action === "Connexion Échouée" ? "bg-red-500/10 text-red-500" :
                            log.action === "Lecture" ? "bg-blue-500/10 text-blue-500" :
                            "bg-gold/10 text-gold"
                          }`}>
                            {log.action}
                          </span>
                       </td>
                       <td className="px-6 py-4">
                          <p className="text-sm text-text-secondary max-w-md truncate" title={log.details}>{log.details}</p>
                       </td>
                       <td className="px-6 py-4 font-mono text-xs text-text-muted group-hover:text-text-secondary transition-colors">
                          {log.ip}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-xs text-text-muted">
                             <Clock className="w-3.5 h-3.5" />
                             {formatDate(log.timestamp)}
                          </div>
                       </td>
                     </motion.tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
      
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
