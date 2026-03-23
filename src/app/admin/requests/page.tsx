"use client";

import { useState, useEffect } from "react";
import { Check, X, Clock, MessageSquare, Trash2, Search, Filter, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";

interface MediaRequest {
  id: string;
  title: string;
  type: "Movie" | "Series";
  tmdbId?: number;
  status: "PENDING" | "FULFILLED" | "REJECTED";
  note?: string;
  requestedById: string;
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<MediaRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "FULFILLED" | "REJECTED">("PENDING");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/requests");
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error("Failed to fetch requests", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, note })
      });

      if (res.ok) {
        setEditingId(null);
        setNote("");
        fetchRequests();
      }
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm("Supprimer cette demande ?")) return;
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      if (res.ok) fetchRequests();
    } catch (error) {
      console.error("Delete failed", error);
    }
  };

  const filtered = requests.filter(r => filter === "ALL" || r.status === filter);

  return (
    <div className="flex min-h-screen bg-[#050505] text-white">
      <Sidebar />
      <main className="flex-1 p-8 pt-24 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <header className="mb-12">
             <h1 className="text-4xl font-black mb-2 tracking-tight">GESTION DES DEMANDES</h1>
             <p className="text-text-muted">Découvre ce que tes utilisateurs veulent voir.</p>
          </header>

          <div className="flex items-center gap-4 mb-8">
             <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                {(["PENDING", "FULFILLED", "REJECTED", "ALL"] as const).map(f => (
                   <button
                     key={f}
                     onClick={() => setFilter(f)}
                     className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filter === f ? "bg-gold text-deep-black" : "text-text-muted hover:text-white"}`}
                   >
                     {f === "PENDING" ? "EN ATTENTE" : f === "FULFILLED" ? "AJOUTÉS" : f === "REJECTED" ? "REFUSÉS" : "TOUS"}
                   </button>
                ))}
             </div>
          </div>

          {loading ? (
             <div className="space-y-4">
                {[1,2,3,4].map(i => <div key={i} className="h-20 rounded-2xl bg-white/5 animate-pulse" />)}
             </div>
          ) : filtered.length === 0 ? (
             <div className="py-20 text-center glass-card rounded-3xl">
                <p className="text-text-muted italic">Aucune demande dans cette catégorie.</p>
             </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((req) => (
                <div key={req.id} className="glass-card p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/[0.03] transition-colors group">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${req.status === "PENDING" ? "bg-gold/10 text-gold" : req.status === "FULFILLED" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                       <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                       <div className="flex items-center gap-2 mb-0.5">
                          <h3 className="font-bold text-lg">{req.title}</h3>
                          <span className="px-1.5 py-0.5 rounded-[4px] bg-white/10 text-[9px] uppercase font-black text-text-muted tracking-tighter">
                             {req.type === "Movie" ? "Film" : "Série"}
                          </span>
                       </div>
                       <div className="flex items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1"><User className="w-3 h-3" /> {req.requestedById.slice(0, 8)}...</span>
                          <span>•</span>
                          <span>{new Date(req.createdAt).toLocaleDateString("fr-FR")}</span>
                       </div>
                       {req.note && (
                          <p className="text-xs text-gold/80 mt-2 italic pr-4">Note: {req.note}</p>
                       )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {editingId === req.id ? (
                      <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-gold/30">
                        <input
                          type="text"
                          placeholder="Note (optionnelle)..."
                          className="bg-transparent text-xs px-2 outline-none w-40"
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                        />
                        <button onClick={() => updateStatus(req.id, "FULFILLED")} className="p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white" title="Accepter">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => updateStatus(req.id, "REJECTED")} className="p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white" title="Refuser">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        {req.status === "PENDING" && (
                          <button
                            onClick={() => setEditingId(req.id)}
                            className="px-4 py-2 rounded-xl bg-gold/10 text-gold text-xs font-bold hover:bg-gold/20 transition-colors"
                          >
                            Traiter
                          </button>
                        )}
                        <button
                          onClick={() => deleteRequest(req.id)}
                          className="p-2.5 rounded-xl hover:bg-red-500/10 text-text-muted hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
