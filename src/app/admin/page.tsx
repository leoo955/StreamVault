"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Film,
  Tv,
  Trash2,
  Edit3,
  BarChart3,
  Link as LinkIcon,
  Search,
  Users,
  Ticket,
  Activity,
  FolderOpen,
  Clock,
  Shield,
  Lock as LockIcon,
  User,
  Check,
  Megaphone,
} from "lucide-react";
import Link from "next/link";

import { useAdminAuth } from "@/hooks/useAdminAuth";

interface MediaItem {
  id: string;
  title: string;
  type: "Movie" | "Series";
  year: number;
  streamUrl: string;
  posterUrl: string;
  genres: string[];
  dateAdded: string;
}

export default function AdminDashboard() {
  const isAdmin = useAdminAuth();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  
  const [healthData, setHealthData] = useState<{ stats: any, issues: Record<string, string[]> }>({ stats: {}, issues: {} });
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [logs, setLogs] = useState<any[]>([]);
  const [resetUsername, setResetUsername] = useState("");
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchItems();
  }, [isAdmin]);

  const fetchItems = async () => {
    try {
      const [mRes, hRes, lRes] = await Promise.all([
        fetch("/api/media"),
        fetch("/api/admin/health"),
        fetch("/api/admin/logs")
      ]);
      const mData = await mRes.json();
      const hData = await hRes.json();
      const lData = await lRes.json();
      
      setItems(mData.items || []);
      setHealthData(hData);
      setLogs((lData.logs || []).slice(0, 10));
    } catch {
      console.error("Failed to fetch media");
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep-black flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  const handleDelete = async (id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id];
    setLoading(true);
    try {
      for (const targetId of ids) {
        await fetch(`/api/media/${targetId}`, { method: "DELETE" });
      }
      setItems(items.filter((i) => !ids.includes(i.id)));
      setDeleteConfirm(null);
      setSelectedIds([]);
      setIsSelectionMode(false);
    } catch {
      console.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReset = async () => {
    if (!resetUsername || !resetNewPassword) return;
    setIsResetting(true);
    setResetSuccess(null);
    try {
      const uRes = await fetch(`/api/users?search=${resetUsername}`);
      const uData = await uRes.json();
      const user = (uData.users || []).find((u: any) => u.username.toLowerCase() === resetUsername.toLowerCase());
      
      if (!user) {
        alert("Utilisateur non trouvé !");
        return;
      }

      const res = await fetch(`/api/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: resetNewPassword })
      });

      if (res.ok) {
        setResetSuccess("Réussite !");
        setResetUsername("");
        setResetNewPassword("");
        setTimeout(() => setResetSuccess(null), 3000);
      } else {
        alert("Erreur serveur.");
      }
    } catch {
      alert("Erreur de connexion.");
    } finally {
      setIsResetting(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const filteredItems = items.filter((i) =>
    i.title.toLowerCase().includes(search.toLowerCase())
  );

  const movieCount = items.filter((i) => i.type === "Movie").length;
  const seriesCount = items.filter((i) => i.type === "Series").length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-8 pt-8 pb-20"
    >
      <AnimatePresence>
        {isSelectionMode && selectedIds.length > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-6 px-6 py-4 rounded-2xl shadow-2xl border border-surface-light"
            style={{ background: "rgba(20,20,20,0.95)", backdropFilter: "blur(20px)" }}
          >
            <span className="text-sm font-bold">{selectedIds.length} médias sélectionnés</span>
            <div className="h-6 w-px bg-surface-light" />
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(selectedIds)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="px-4 py-2 rounded-xl text-sm font-medium hover:bg-surface-light transition-colors"
              >
                Désélectionner
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-8">
        <div className="w-64 shrink-0 hidden xl:block">
          <div className="sticky top-8 space-y-1">
            <h2 className="px-4 text-[10px] uppercase tracking-[0.2em] font-black text-text-muted mb-4">Administration</h2>
            {[
              { name: "Dashboard", icon: BarChart3, href: "/admin", active: true },
              { name: "Média", icon: Film, href: "/admin" },
              { name: "Sagas", icon: FolderOpen, href: "/admin/sagas" },
              { name: "Utilisateurs", icon: Users, href: "/admin/users" },
              { name: "Invitation", icon: Ticket, href: "/admin/invitations" },
              { name: "Logs", icon: Activity, href: "/admin/logs" },
              { name: "Annonces", icon: Megaphone, href: "/admin/announcements", color: "var(--gold)" },
              { name: "Analytics", icon: BarChart3, href: "/admin/analytics", color: "var(--gold)" },
            ].map((item, idx) => (
              <Link key={idx} href={item.href}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    item.active
                      ? "bg-gold text-deep-black font-bold shadow-lg shadow-gold/10"
                      : "text-text-secondary hover:bg-surface-light hover:text-white"
                  }`}
                >
                  <item.icon className="w-4 h-4" style={{ color: item.color }} />
                  <span className="text-sm">{item.name}</span>
                </div>
              </Link>
            ))}
            <div className="pt-8 px-4">
              <Link href="/admin/add">
                <button className="w-full btn-gold py-3 flex items-center justify-center gap-2 text-sm shadow-xl shadow-gold/10">
                  <Plus className="w-4 h-4" /> Ajouter un média
                </button>
              </Link>
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="xl:hidden mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold">Admin</h1>
              <Link href="/admin/add">
                <button className="btn-gold p-2.5 rounded-xl"><Plus className="w-5 h-5" /></button>
              </Link>
            </div>
            {/* Mobile Admin Navigation Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
              {[
                { name: "Dashboard", icon: BarChart3, href: "/admin" },
                { name: "Sagas", icon: FolderOpen, href: "/admin/sagas" },
                { name: "Utilisateurs", icon: Users, href: "/admin/users" },
                { name: "Invitations", icon: Ticket, href: "/admin/invitations" },
                { name: "Logs", icon: Activity, href: "/admin/logs" },
                { name: "Annonces", icon: Megaphone, href: "/admin/announcements" },
                { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
              ].map((item) => {
                const isActive = typeof window !== "undefined" && window.location.pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}>
                    <div
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                        isActive
                          ? "bg-gold text-deep-black shadow-lg shadow-gold/10"
                          : "bg-surface text-text-secondary border border-surface-light hover:bg-surface-light"
                      }`}
                    >
                      <item.icon className="w-3.5 h-3.5" />
                      {item.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="glass-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-glow)" }}>
                  <BarChart3 className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{items.length}</p>
                  <p className="text-xs text-text-muted">Total médias</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-glow)" }}>
                  <Film className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{movieCount}</p>
                  <p className="text-xs text-text-muted">Films</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-glow)" }}>
                  <Tv className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{seriesCount}</p>
                  <p className="text-xs text-text-muted">Séries</p>
                </div>
              </div>
            </div>
          </div>

          {/* Layout Grid: Library + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher dans la bibliothèque..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                  />
                </div>
                {!isSelectionMode && (
                  <button
                    onClick={() => setIsSelectionMode(true)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold border border-surface-light hover:bg-surface-light transition-all flex items-center gap-2"
                  >
                    <Activity className="w-3.5 h-3.5" /> Sélectionner
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)
                ) : filteredItems.length === 0 ? (
                  <div className="text-center py-20">
                    <Film className="w-12 h-12 text-surface-light mx-auto mb-4" />
                    <p className="text-text-muted">Aucun média trouvé</p>
                  </div>
                ) : (
                  filteredItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-4 p-4 rounded-xl hover:bg-surface/50 transition-all group border border-transparent hover:border-surface-light"
                      style={{ background: "var(--surface)" }}
                    >
                      {isSelectionMode && (
                        <button
                          onClick={() => toggleSelection(item.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                            selectedIds.includes(item.id) ? "bg-gold border-gold" : "border-surface-light"
                          }`}
                        >
                          {selectedIds.includes(item.id) && <Plus className="w-3.5 h-3.5 text-deep-black rotate-45" />}
                        </button>
                      )}
                      <div
                        className="w-12 h-16 rounded-lg bg-surface-light shrink-0"
                        style={{ backgroundImage: `url(${item.posterUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm truncate">{item.title}</h4>
                          {healthData.issues?.[item.id] && (
                            <span className="px-1.5 py-0.5 rounded text-[8px] bg-danger/10 text-danger border border-danger/20 font-black uppercase">
                              Health
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-muted mt-0.5">
                          {item.year} • {item.genres.slice(0, 2).join(", ")}
                        </p>
                      </div>
                      {!isSelectionMode && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/edit/${item.id}`}>
                            <button className="p-2 hover:bg-surface-light rounded-lg transition-colors" title="Modifier">
                              <Edit3 className="w-4 h-4 text-text-secondary" />
                            </button>
                          </Link>
                          {deleteConfirm === item.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold bg-danger/20 text-danger hover:bg-danger"
                              >
                                Confirmer
                              </button>
                              <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-surface-light">
                                Annuler
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(item.id)}
                              className="p-2 hover:bg-danger/10 rounded-lg transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4 text-text-secondary hover:text-danger" />
                            </button>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Right Sidebar: Activity + Support + Health */}
            <div className="lg:col-span-4 space-y-6">

              {/* Flux d'activité */}
              <div className="glass-card p-6">
                <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted mb-6 flex items-center gap-2">
                  <Activity className="w-3 h-3 text-gold" /> Flux d&apos;activité
                </h5>
                <div className="space-y-6 relative">
                  <div className="absolute left-[11px] top-2 bottom-2 w-px bg-surface-light" />
                  {logs.length === 0 ? (
                    <p className="text-xs text-text-muted text-center py-4">Aucune activité</p>
                  ) : (
                    logs.slice(0, 5).map((log) => (
                      <div key={log.id} className="flex gap-4 relative">
                        <div className="w-6 h-6 rounded-full bg-surface-light shrink-0 flex items-center justify-center z-10 border border-surface">
                          <Clock className="w-3 h-3 text-text-muted" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-bold text-white tracking-tight">
                            {log.username} <span className="text-[10px] text-text-muted font-normal">• {log.action}</span>
                          </p>
                          <p className="text-[10px] text-text-muted mt-0.5 truncate">{log.details}</p>
                          <p className="text-[9px] text-gold/40 mt-0.5">{new Date(log.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Support Utilisateur – Reset Password */}
              <div className="glass-card p-6 border border-gold/10">
                <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted mb-5 flex items-center gap-2">
                  <LockIcon className="w-3 h-3 text-gold" /> Support Utilisateur
                </h5>
                <p className="text-[10px] text-text-muted mb-4">Réinitialiser un mot de passe rapidement :</p>
                <div className="space-y-2 mb-4">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      placeholder="Pseudo exact"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface border border-surface-light focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
                    <input
                      type="text"
                      value={resetNewPassword}
                      onChange={(e) => setResetNewPassword(e.target.value)}
                      placeholder="Nouveau MDP (6 car. min)"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl text-xs bg-surface border border-surface-light focus:border-gold/50 outline-none transition-all"
                    />
                  </div>
                </div>
                <button
                  onClick={handleQuickReset}
                  disabled={isResetting || !resetUsername || !resetNewPassword}
                  className={`w-full py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                    resetSuccess
                      ? "bg-green-500 text-black"
                      : "bg-gold/10 text-gold border border-gold/20 hover:bg-gold hover:text-deep-black disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
                >
                  {isResetting ? (
                    <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : resetSuccess ? (
                    <><Check className="w-3.5 h-3.5" /> Réinitialisé !</>
                  ) : (
                    "Reset Password"
                  )}
                </button>
                <p className="text-[9px] text-text-muted text-center italic opacity-50 mt-3">L&apos;utilisateur pourra se reconnecter direct.</p>
              </div>

              {/* Bibliothèque Health */}
              <div className="glass-card p-6 border border-gold/10">
                <h5 className="text-[10px] uppercase tracking-[0.2em] font-black text-text-muted mb-5 flex items-center gap-2">
                  <Shield className="w-3 h-3 text-gold" /> Bibliothèque Health
                </h5>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-light">
                    <span className="text-xs text-text-secondary">Posters OK</span>
                    <span className="text-xs font-bold text-green-500">{(healthData.stats?.total || 0) - (healthData.stats?.missingPosters || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-light">
                    <span className="text-xs text-text-secondary">Synopsis OK</span>
                    <span className="text-xs font-bold text-green-500">{(healthData.stats?.total || 0) - (healthData.stats?.missingOverviews || 0)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-light">
                    <span className="text-xs text-text-secondary">Alertes</span>
                    <span className="text-xs font-bold text-danger">{Object.keys(healthData.issues || {}).length}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
