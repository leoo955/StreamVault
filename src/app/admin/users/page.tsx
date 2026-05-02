"use client";

import React, { useState, useEffect } from "react";
import { Users, Search, MoreVertical, Shield, User, Trash2 } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
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
    fetchUsers();
  }, []);

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
            {isLoading ? (
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
                      <div className="text-xs font-bold text-white/80 group-hover:text-white transition-colors">{u.username || "Sans nom"}</div>
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
                  <span className="text-[10px] font-mono text-white/30">{u.profiles?.length || 0}</span>
                </td>
                <td className="px-8 py-5 text-right">
                  <button className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
