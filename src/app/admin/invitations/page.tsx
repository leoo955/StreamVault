"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Ticket, Plus, Trash2, ShieldCheck, Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface InvitationCode {
  code: string;
  maxUses: number;
  usedCount: number;
  role: "admin" | "user";
  plan: string;
  expiresAt: string | null;
  note: string | null;
  createdAt: string;
}

export default function InvitationsManagement() {
  const isAdmin = useAdminAuth();
  const [codes, setCodes] = useState<InvitationCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New Form State
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeUses, setNewCodeUses] = useState(1);
  const [newCodeRole, setNewCodeRole] = useState<"admin" | "user">("user");
  const [newCodePlan, setNewCodePlan] = useState("Starter");
  const [newCodeExpiry, setNewCodeExpiry] = useState("");
  const [newCodeNote, setNewCodeNote] = useState("");

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) fetchCodes();
  }, [isAdmin]);

  if (!isAdmin) return <div className="fixed inset-0 z-[200] bg-deep-black flex items-center justify-center"><div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" /></div>;

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/invitations");
      const data = await res.json();
      if (data.codes) {
        setCodes(data.codes);
      }
    } catch {
      console.error("Failed to fetch invitation codes");
    } finally {
      setLoading(false);
    }
  };

  const generateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodeName.trim() || newCodeUses < 1) return;

    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            code: newCodeName.toUpperCase(), 
            maxUses: newCodeUses,
            role: newCodeRole,
            plan: newCodePlan,
            expiresAt: newCodeExpiry || null,
            note: newCodeNote || null
        }),
      });
      if (res.ok) {
        setNewCodeName("");
        setNewCodeUses(1);
        setNewCodeRole("user");
        setNewCodePlan("Starter");
        setNewCodeExpiry("");
        setNewCodeNote("");
        setIsGenerating(false);
        fetchCodes();
      } else {
        const err = await res.json();
        alert(err.error || "Une erreur est survenue");
      }
    } catch {
      console.error("Failed to generate code");
    }
  };

  const generateRandomName = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "VIP-";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCodeName(result);
  };

  const handleDelete = async (codeStr: string) => {
    try {
      const res = await fetch(`/api/invitations/${codeStr}`, { method: "DELETE" });
      if (res.ok) {
        setCodes(codes.filter((c) => c.code !== codeStr));
        setDeleteConfirm(null);
      } else {
        const err = await res.json();
        alert(err.error || "Une erreur est survenue");
      }
    } catch {
      console.error("Failed to delete code");
    }
  };

  const filteredCodes = codes.filter((c) =>
    c.code.toLowerCase().includes(search.toLowerCase()) || 
    c.note?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-4 md:px-8 pt-8 pb-20"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
            <Link href="/admin">
            <button className="p-2 rounded-full hover:bg-surface-light transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            </Link>
            <div>
            <h1 className="text-3xl font-bold">Codes d&apos;Invitation</h1>
            <p className="text-text-secondary mt-1">
                Gérez les accès privés à votre plateforme
            </p>
            </div>
        </div>
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setIsGenerating(!isGenerating)}
            className="btn-gold flex items-center justify-center gap-2"
        >
            <Plus className="w-5 h-5" />
            Nouveau Code
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--gold-glow)" }}>
              <Ticket className="w-5 h-5 text-gold" />
            </div>
            <div>
              <p className="text-2xl font-bold">{codes.length}</p>
              <p className="text-xs text-text-muted">Codes actifs</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-green-500/20">
              <ShieldCheck className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">Privé</p>
              <p className="text-xs text-text-muted">L&apos;inscription libre est bloquée</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generate Form */}
      <AnimatePresence>
        {isGenerating && (
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
            >
                <div className="glass-card p-6 border border-gold/30">
                    <h3 className="font-bold text-lg mb-6 text-gold">Créer un code d&apos;invitation personnalisé</h3>
                    <form onSubmit={generateCode} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Code Name */}
                            <div>
                                <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-widest font-bold">
                                    Nom du code
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={newCodeName}
                                        onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                                        className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none uppercase font-bold tracking-wider"
                                        style={{
                                            background: "var(--surface)",
                                            border: "1px solid var(--surface-light)",
                                            color: "var(--gold)",
                                        }}
                                        placeholder="Ex: VIP-202X"
                                        required
                                    />
                                    <button type="button" onClick={generateRandomName} className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] uppercase font-black text-text-muted hover:text-white transition-colors">Aléatoire</button>
                                </div>
                            </div>

                            {/* Max Uses */}
                            <div>
                                <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-widest font-bold">
                                    Utilisations max
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="1000"
                                    value={newCodeUses}
                                    onChange={(e) => setNewCodeUses(parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--surface-light)",
                                        color: "var(--text-primary)",
                                    }}
                                    required
                                />
                            </div>

                            {/* Expiry */}
                            <div>
                                <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-widest font-bold">
                                    Date d&apos;expiration (Optionnel)
                                </label>
                                <input
                                    type="datetime-local"
                                    value={newCodeExpiry}
                                    onChange={(e) => setNewCodeExpiry(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--surface-light)",
                                        color: "var(--text-primary)",
                                    }}
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-widest font-bold">
                                    Rôle attribué
                                </label>
                                <select
                                    value={newCodeRole}
                                    onChange={(e) => setNewCodeRole(e.target.value as any)}
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none appearance-none"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--surface-light)",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    <option value="user">Utilisateur Standard</option>
                                    <option value="admin">Administrateur</option>
                                </select>
                            </div>

                            {/* Plan */}
                            <div>
                                <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-widest font-bold">
                                    Abonnement (Plan)
                                </label>
                                <select
                                    value={newCodePlan}
                                    onChange={(e) => setNewCodePlan(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none appearance-none"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--surface-light)",
                                        color: "var(--text-primary)",
                                    }}
                                >
                                    <option value="Starter">Starter (Gratuit)</option>
                                    <option value="Premium">Premium</option>
                                    <option value="Ultimate">Ultimate (Tout illimité)</option>
                                </select>
                            </div>

                            {/* Note */}
                            <div>
                                <label className="block text-[10px] text-text-muted mb-2 uppercase tracking-widest font-bold">
                                    Note interne (Pour vous)
                                </label>
                                <input
                                    type="text"
                                    value={newCodeNote}
                                    onChange={(e) => setNewCodeNote(e.target.value)}
                                    placeholder="Ex: Pour mon pote Léo"
                                    className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                                    style={{
                                        background: "var(--surface)",
                                        border: "1px solid var(--surface-light)",
                                        color: "var(--text-primary)",
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                             <button type="submit" className="btn-gold py-3 px-12 shadow-2xl hover:scale-105 active:scale-95 transition-all">Générer le code</button>
                        </div>
                    </form>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un code ou une note..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--surface-light)",
              color: "var(--text-primary)",
            }}
          />
        </div>
      </div>

      {/* Codes list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : filteredCodes.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "var(--surface-light)" }}>
            <Ticket className="w-8 h-8 text-text-muted" />
          </div>
          <h2 className="text-lg font-semibold mb-2">Aucun code d&apos;invitation</h2>
          <p className="text-text-muted text-sm max-w-sm mx-auto">
            Créez des codes secrets pour inviter vos amis à rejoindre StreamVault de manière sécurisée.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCodes.map((c) => {
              const isExpiredUsage = c.usedCount >= c.maxUses;
              const isExpiredDate = c.expiresAt && new Date(c.expiresAt) < new Date();
              const isInvalid = isExpiredUsage || isExpiredDate;

              return (
                <motion.div
                key={c.code}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-4 p-6 rounded-2xl transition-all duration-200 border relative overflow-hidden group shadow-lg"
                style={{ 
                    background: "var(--surface)",
                    borderColor: isInvalid ? "var(--danger)" : "var(--surface-light)"
                }}
                >
                {/* Background Glow */}
                <div 
                    className="absolute -top-10 -right-10 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"
                    style={{ background: isInvalid ? "var(--danger)" : "var(--gold)" }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0 z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div className="min-w-0">
                            <h3 className="font-black text-2xl tracking-tighter text-white font-mono truncate mr-2" style={{ color: isInvalid ? "var(--text-muted)" : "white" }}>
                                {c.code}
                            </h3>
                            {c.note && (
                                <p className="text-[10px] text-text-muted mt-1 italic line-clamp-1">{c.note}</p>
                            )}
                        </div>
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            {isInvalid ? (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-danger/20 text-danger border border-danger/30">Désactivé</span>
                            ) : (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-green-500/20 text-green-400 border border-green-500/30">Actif</span>
                            )}
                            <div className="flex items-center gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${c.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-white/5 text-text-muted border-white/10'}`}>
                                    {c.role}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-tighter border ${c.plan === 'Ultimate' ? 'bg-gold/10 text-gold border-gold/20' : c.plan === 'Premium' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-white/5 text-text-muted border-white/10'}`}>
                                    {c.plan}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Expiry Text */}
                    {c.expiresAt && (
                        <p className={`text-[10px] mb-4 flex items-center gap-1.5 ${isExpiredDate ? 'text-danger' : 'text-text-muted'}`}>
                            <Ticket className="w-3 h-3" />
                            Expire le : {new Date(c.expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}

                    {/* Progress Bar */}
                    <div className="mt-auto">
                        <div className="flex justify-between text-[10px] text-text-muted mb-1.5 uppercase tracking-widest font-bold">
                            <span>Utilisations</span>
                            <span className="font-mono text-xs">{c.usedCount} / {c.maxUses}</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-light rounded-full overflow-hidden">
                            <div 
                                className="h-full transition-all duration-700 ease-out"
                                style={{ 
                                    width: `${Math.min(100, (c.usedCount / c.maxUses) * 100)}%`,
                                    background: isInvalid ? "var(--danger)" : "var(--gold)"
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-surface-light flex items-center justify-between">
                    <span className="text-[9px] text-text-muted uppercase tracking-wider font-bold opacity-30">Créé le {new Date(c.createdAt).toLocaleDateString('fr-FR')}</span>
                    {deleteConfirm === c.code ? (
                    <div className="flex items-center gap-1.5">
                        <button
                        onClick={() => handleDelete(c.code)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest bg-danger text-white transition-all shadow-lg shadow-danger/20"
                        >
                        Confirmer
                        </button>
                        <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-surface-light transition-colors"
                        >
                        Non
                        </button>
                    </div>
                    ) : (
                    <button
                        onClick={() => setDeleteConfirm(c.code)}
                        className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted hover:text-danger hover:scale-105 transition-all"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                    </button>
                    )}
                    </div>
                </div>
                </motion.div>
              );
          })}
        </div>
      )}
    </motion.div>
  );
}
