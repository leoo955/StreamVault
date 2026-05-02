"use client";

import React, { useState, useEffect } from "react";
import { Ticket, Plus, Search, Trash2, Copy, Check } from "lucide-react";

export default function AdminInvitationsPage() {
  const [invites, setInvites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const generateCode = async () => {
    setIsGenerating(true);
    try {
      // Generate a clean random code
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
        await fetchInvites();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to generate code");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteCode = async (id: string) => {
    if (!confirm("Supprimer ce code ?")) return;
    try {
      const res = await fetch(`/api/invitations?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchInvites();
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
          onClick={generateCode}
          disabled={isGenerating}
          className="bg-white text-black px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
          Générer
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
              <tr key={invite.id} className="group hover:bg-white/[0.01] transition-colors">
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
                    onClick={() => deleteCode(invite.id)}
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
    </div>
  );
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
