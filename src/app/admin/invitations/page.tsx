"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Search, Trash2, Copy, Check, X, Loader2, Save, Wand2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminInvitationsPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    maxUses: 1,
    role: "user",
    plan: "Starter"
  });

  const fetchInvites = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvites(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInvites();
  }, []);

  const generateRandomCode = () => {
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    setFormData({ ...formData, code: `SV-${random}` });
  };

  const handleSave = async () => {
    if (!formData.code || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await fetchInvites();
        setIsCreating(false);
      } else {
        const error = await res.json();
        alert(error.error || "Failed to create code");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCode = async (code: string) => {
    if (!confirm("Supprimer ce code ?")) return;
    try {
      const res = await fetch(`/api/invitations?id=${code}`, { method: "DELETE" });
      if (res.ok) fetchInvites();
      else alert("Échec de la suppression");
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h2 className="font-display font-light text-4xl text-white tracking-widest uppercase flex items-center gap-6">
            <Ticket className="text-white/20" size={32} />
            Invitations
          </h2>
          <p className="text-white/20 font-bold tracking-[0.4em] uppercase text-[9px] ml-14">
            Codes d'accès & Privilèges
          </p>
        </div>

        <button 
          onClick={() => {
            setIsCreating(true);
            setFormData({ code: "", maxUses: 1, role: "user", plan: "Starter" });
          }}
          className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus size={14} />
          Nouveau Code
        </button>
      </div>

      <div className="bg-white/[0.01] border border-white/5 rounded-[2rem] overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Code</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Usage</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Plan</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20">Rôle</th>
              <th className="px-8 py-5 font-sans font-bold uppercase tracking-[0.3em] text-[9px] text-white/20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading && invites.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-white/5 border-t-white animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : invites.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center text-white/10 font-bold uppercase tracking-widest text-xs">
                  Aucune invitation active
                </td>
              </tr>
            ) : invites.map((invite) => (
              <tr key={invite.code} className="group hover:bg-white/[0.01] transition-colors">
                <td className="px-8 py-4">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-white tracking-widest bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{invite.code}</span>
                    <button 
                      onClick={() => copyToClipboard(invite.code)}
                      className="p-2 text-white/20 hover:text-white transition-colors"
                    >
                      {copiedId === invite.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white/60">{invite.used}</span>
                    <span className="text-[9px] text-white/10">/</span>
                    <span className="text-xs font-bold text-white/30">{invite.maxUses}</span>
                  </div>
                </td>
                <td className="px-8 py-4">
                  <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-white/40">{invite.plan}</span>
                </td>
                <td className="px-8 py-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{invite.role}</span>
                </td>
                <td className="px-8 py-4 text-right">
                  <button 
                    onClick={() => deleteCode(invite.code)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-white/20 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Creation Modal */}
      <AnimatePresence>
        {isCreating && (
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
                onClick={() => setIsCreating(false)}
                className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="flex items-center gap-6 mb-12 border-b border-white/5 pb-8">
                 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white/20">
                    <Ticket size={32} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-display font-light text-white mb-2 uppercase tracking-wide">Créer une Invitation</h3>
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-[0.4em]">Configuration des accès</p>
                 </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <label className="label-refined text-white/20 text-[10px]">Code d'invitation</label>
                    <button 
                      onClick={generateRandomCode}
                      className="text-[9px] font-black uppercase text-white/20 hover:text-white flex items-center gap-2 transition-colors"
                    >
                      <Wand2 size={10} />
                      Générer Aléatoire
                    </button>
                  </div>
                  <input 
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase().replace(/\s/g, '-')})}
                    placeholder="VIP-2026-X"
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-white/20 transition-all font-mono tracking-widest"
                  />
                </div>

                <div className="space-y-4">
                  <label className="label-refined text-white/20 text-[10px]">Utilisations Maximum</label>
                  <input 
                    type="number"
                    min="1"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({...formData, maxUses: parseInt(e.target.value) || 1})}
                    className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-8 py-5 text-white focus:outline-none focus:border-white/20 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="label-refined text-white/20 text-[10px]">Rôle Assigné</label>
                    <select 
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="user" className="bg-[#0C0C0C]">User</option>
                      <option value="admin" className="bg-[#0C0C0C]">Admin</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    <label className="label-refined text-white/20 text-[10px]">Plan Inclus</label>
                    <select 
                      value={formData.plan}
                      onChange={(e) => setFormData({...formData, plan: e.target.value})}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-2xl px-6 py-5 text-white focus:outline-none focus:border-white/20 transition-all appearance-none cursor-pointer"
                    >
                      <option value="Starter" className="bg-[#0C0C0C]">Starter</option>
                      <option value="Premium" className="bg-[#0C0C0C]">Premium</option>
                      <option value="Ultimate" className="bg-[#0C0C0C]">Ultimate</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => setIsCreating(false)}
                    className="flex-1 px-8 py-5 rounded-2xl border border-white/5 text-white/20 font-black uppercase tracking-widest text-[10px] hover:bg-white/[0.03] transition-all"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={handleSave}
                    disabled={isSaving || !formData.code}
                    className="flex-[2] bg-white text-black font-black uppercase text-[10px] tracking-widest py-5 rounded-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                    Créer l'Invitation
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
