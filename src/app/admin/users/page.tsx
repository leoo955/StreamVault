"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Search,
  Users,
  Trash2,
  Shield,
  ShieldAlert,
  User,
  Star,
  Zap,
  Ticket,
  Lock as LockIcon,
} from "lucide-react";
import Link from "next/link";

interface UserData {
  id: string;
  username: string;
  role: "admin" | "user";
  plan: string;
  createdAt: string;
  preferences: {
    language: string;
    autoplay: boolean;
  };
}

export default function UserManagement() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch {
      console.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = async (user: UserData) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      } else {
        const err = await res.json();
        alert(err.error || "Une erreur est survenue");
      }
    } catch {
      console.error("Failed to update role");
    }
  };

  const changePlan = async (user: UserData, newPlan: string) => {
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: newPlan }),
      });
      if (res.ok) {
        setUsers(users.map(u => u.id === user.id ? { ...u, plan: newPlan } : u));
      } else {
        const err = await res.json();
        alert(err.error || "Une erreur est survenue");
      }
    } catch {
      console.error("Failed to update plan");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        setUsers(users.filter((u) => u.id !== id));
        setDeleteConfirm(null);
      } else {
        const err = await res.json();
        alert(err.error || "Une erreur est survenue");
      }
    } catch {
      console.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-8 pt-8 pb-20"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
            <Link href="/admin">
            <button className="p-2 rounded-full hover:bg-surface-light transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            </Link>
            <div>
            <h1 className="text-3xl font-bold">Gestion Utilisateurs</h1>
            <p className="text-text-secondary mt-1">
                Gérez les rôles et les abonnements de votre plateforme
            </p>
            </div>
        </div>
        <Link href="/subscription">
            <button className="px-5 py-2.5 rounded-xl font-bold bg-gold/10 text-gold hover:bg-gold hover:text-deep-black transition-colors flex items-center gap-2 border border-gold/30 hover:border-gold shadow-lg shadow-gold/5">
                Voir les Abonnements API
            </button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-glow)" }}>
              <User className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-text-muted">Total inscrits</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue-500/20">
              <Shield className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.filter(u => u.role === "admin").length}</p>
              <p className="text-xs text-text-muted">Administrateurs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un utilisateur..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-light)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* Users list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-light)" }}>
            <User className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Aucun utilisateur trouvé</h2>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.map((user) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 hover:bg-surface-hover group border border-transparent hover:border-surface-light"
              style={{ background: "var(--surface)" }}
            >
              {/* Avatar thumb */}
              <div className="w-12 h-12 rounded-full shrink-0 flex items-center justify-center text-xl font-bold uppercase"
                style={{ background: user.role === "admin" ? "var(--gold-glow)" : "var(--surface-light)", color: user.role === "admin" ? "var(--gold)" : "white" }}
              >
                {user.username.charAt(0)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="font-medium text-base truncate">{user.username}</h3>
                    {user.role === "admin" && <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gold/20 text-gold border border-gold/30">Admin</span>}
                    
                    <select
                      value={user.plan || "Starter"}
                      onChange={(e) => changePlan(user, e.target.value)}
                      className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border focus:outline-none cursor-pointer appearance-none text-center"
                      style={{
                        background: user.plan === "Ultimate" ? "rgba(168, 85, 247, 0.2)" : user.plan === "Premium" ? "rgba(234, 179, 8, 0.2)" : "rgba(34, 197, 94, 0.2)",
                        color: user.plan === "Ultimate" ? "#d8b4fe" : user.plan === "Premium" ? "#fef08a" : "#86efac",
                        borderColor: user.plan === "Ultimate" ? "rgba(168, 85, 247, 0.3)" : user.plan === "Premium" ? "rgba(234, 179, 8, 0.3)" : "rgba(34, 197, 94, 0.3)",
                      }}
                    >
                      <option value="Starter" className="bg-black text-green-400">STARTER</option>
                      <option value="Premium" className="bg-black text-yellow-400">PREMIUM</option>
                      <option value="Ultimate" className="bg-black text-purple-400">ULTIMATE</option>
                    </select>

                </div>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-text-muted">
                  <span className="font-mono text-[10px] opacity-50">ID: {user.id.substring(0, 8)}...</span>
                  <span>•</span>
                  <span>Inscrit le {new Date(user.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                    onClick={() => toggleRole(user)}
                    className="p-2 rounded-lg hover:bg-surface-light transition-colors flex items-center gap-2 text-xs font-medium"
                    title={user.role === "admin" ? "Rétrograder en Utilisateur" : "Promouvoir Admin"}
                >
                    {user.role === "admin" ? (
                        <ShieldAlert className="w-4 h-4 text-text-secondary hover:text-orange-400" />
                    ) : (
                        <Shield className="w-4 h-4 text-text-secondary hover:text-green-400" />
                    )}
                    <span className="hidden sm:inline text-text-secondary">{user.role === "admin" ? "Rétrograder" : "Promouvoir"}</span>
                </button>

                {deleteConfirm === user.id ? (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={async () => {
                        const newPwd = prompt("Nouveau mot de passe (6 caractères min) :");
                        if (!newPwd) return;
                        if (newPwd.length < 6) { alert("Trop court !"); return; }
                        
                        const res = await fetch(`/api/users/${user.id}/reset-password`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ newPassword: newPwd })
                        });
                        
                        if (res.ok) alert(`Mot de passe de ${user.username} réinitialisé !`);
                        else alert("Erreur lors de la réinitialisation.");
                      }}
                      className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                      title="Réinitialiser le mot de passe"
                    >
                      <LockIcon className="w-4 h-4 text-text-secondary hover:text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-danger/20 text-danger hover:bg-danger/30 transition-colors"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-surface-light transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteConfirm(user.id)}
                    className="p-2 rounded-lg hover:bg-danger/20 transition-colors"
                    title="Bannir l'utilisateur"
                  >
                    <Trash2 className="w-4 h-4 text-text-secondary hover:text-danger" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
