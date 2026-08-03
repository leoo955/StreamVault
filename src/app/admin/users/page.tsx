"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, Shield, User, Trash2, Edit3, X, Loader2, Save, Plus, Key } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    role: "user",
    plan: "Starter"
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: string) => {
    if (!confirm("Supprimer cet utilisateur ? Cette action est irréversible.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchUsers();
      else alert("Échec de la suppression");
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (user: any) => {
    setEditingUser(user);
    setFormData({
      email: user.email || "",
      username: user.username || "",
      password: "",
      role: user.role,
      plan: user.plan
    });
  };

  const handleCreateClick = () => {
    setIsCreating(true);
    setFormData({
      email: "",
      username: "",
      password: "",
      role: "user",
      plan: "Starter"
    });
  };

  const saveChanges = async () => {
    setIsSaving(true);
    try {
      const isEdit = !!editingUser;
      const res = await fetch("/api/admin/users", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEdit ? { id: editingUser.id, ...formData } : formData),
      });
      if (res.ok) {
        setEditingUser(null);
        setIsCreating(false);
        fetchUsers();
      } else {
        const data = await res.json();
        alert(data.error || "Erreur lors de l'opération");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = users.filter(u => 
    (u.username?.toLowerCase() || "").includes(search.toLowerCase()) || 
    (u.email?.toLowerCase() || "").includes(search.toLowerCase())
  );

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="font-display font-light text-4xl text-white tracking-widest uppercase flex items-center gap-6">
            <Users className="text-white/20" size={32} />
            Utilisateurs
          </h2>
          <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[9px] ml-14">
            Contrôle d'accès & Comptes
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-white transition-colors" />
            <input 
              type="text" 
              placeholder="RECHERCHER..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-white/[0.02] border border-white/5 rounded-xl py-3 pl-12 pr-6 text-[10px] font-bold tracking-widest focus:outline-none focus:border-white/10 transition-all w-64 placeholder:text-white/5"
            />
          </div>
          <button 
            onClick={handleCreateClick}
            className="bg-white text-black h-12 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus size={14} />
            Créer
          </button>
        </div>
      </div>

      <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Identité</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Rôle</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Plan</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Profils</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-white animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-white/10 font-bold uppercase tracking-widest text-xs">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/20">
                      <User size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{u.username || "Sans pseudo"}</div>
                      <div className="text-[9px] text-white/20 uppercase tracking-widest">{u.email || "Pas d'email"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    {u.role === 'admin' ? (
                      <Shield size={12} className="text-white/60" />
                    ) : (
                      <User size={12} className="text-white/20" />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${u.role === 'admin' ? 'text-white/60' : 'text-white/20'}`}>
                      {u.role}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-5">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/40">{u.plan}</span>
                </td>
                <td className="px-8 py-5">
                  <span className="text-[10px] font-mono text-white/30">{u._count?.profiles || 0}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEditClick(u)}
                      className="p-2 rounded-lg hover:bg-white/5 text-white/20 hover:text-white transition-all"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button 
                      onClick={() => deleteUser(u.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {(editingUser || isCreating) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl p-6"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-[#0C0C0C] border border-white/10 rounded-[2.5rem] p-10 md:p-14 relative overflow-hidden shadow-2xl"
            >
              <button 
                onClick={() => { setEditingUser(null); setIsCreating(false); }}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
                 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20">
                    {isCreating ? <Plus size={32} /> : <Edit3 size={32} />}
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-light text-white mb-2 uppercase tracking-wide">
                      {isCreating ? "Nouveau Compte" : "Éditer le Compte"}
                    </h3>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em] line-clamp-1">
                      {isCreating ? "Création manuelle d'utilisateur" : editingUser.email}
                    </p>
                 </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="label-refined text-white/20 text-[9px]">Email</label>
                    <input 
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!!editingUser}
                      placeholder="email@exemple.com"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all text-xs disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="label-refined text-white/20 text-[9px]">Pseudo</label>
                    <input 
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="pseudo"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="label-refined text-white/20 text-[9px]">
                    {isCreating ? "Mot de Passe" : "Nouveau Mot de Passe (laisser vide pour ne pas changer)"}
                  </label>
                  <div className="relative">
                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10" />
                    <input 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="label-refined text-white/20 text-[9px]">Rôle</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer text-xs"
                    >
                      <option value="user" className="bg-[#0C0C0C]">User</option>
                      <option value="admin" className="bg-[#0C0C0C]">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="label-refined text-white/20 text-[9px]">Plan</label>
                    <select 
                      value={formData.plan}
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer text-xs"
                    >
                      <option value="Starter" className="bg-[#0C0C0C]">Starter</option>
                      <option value="Premium" className="bg-[#0C0C0C]">Premium</option>
                      <option value="Ultimate" className="bg-[#0C0C0C]">Ultimate</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button 
                    onClick={() => { setEditingUser(null); setIsCreating(false); }}
                    className="flex-1 px-8 py-4 rounded-2xl border border-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] hover:bg-white/[0.03] transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={saveChanges}
                    disabled={isSaving}
                    className="flex-[2] bg-white text-black font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
