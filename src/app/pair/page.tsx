"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MonitorSmartphone, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { clearAuthCache } from "@/components/ProfileGuard";

export default function PairPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/pair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Code invalide");
        return;
      }

      setSuccess(true);
      clearAuthCache(); // Clear any unauthenticated cache
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 1500);
    } catch {
      setError("Erreur de connexion");
    } finally {
      if (!success) setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ marginLeft: 0 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <img src="/icon-192.png" alt="StreamVault Logo" className="w-12 h-12 rounded-full object-contain overflow-hidden" />
          <span className="text-3xl font-bold gold-text">StreamVault</span>
        </div>

        {/* Form */}
        <div className="glass-card-strong p-8 text-center relative overflow-hidden">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-surface border border-gold/30 flex items-center justify-center shadow-[0_0_20px_rgba(198,165,92,0.15)]">
              <MonitorSmartphone className="w-8 h-8 text-gold" />
            </div>
          </div>
          
          <h1 className="text-2xl font-bold mb-3">Associer un appareil</h1>
          <p className="text-text-secondary text-sm mb-8 leading-relaxed">
            Rendez-vous sur StreamVault depuis votre appareil principal (dans Paramètres &gt; Couplage) et entrez le code affiché.
          </p>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setCode(val);
                    setError("");
                  }}
                  className={`w-full text-center text-4xl tracking-[0.5em] font-black px-4 py-5 rounded-2xl outline-none transition-all shadow-inner ${
                    error ? "border-red-500 shadow-red-500/10" : "focus:border-gold/50 focus:shadow-gold/10"
                  }`}
                  style={{
                    background: "var(--deep-black)",
                    border: `2px solid ${error ? "#ef4444" : "var(--surface-light)"}`,
                    color: "var(--text-primary)",
                  }}
                  placeholder="------"
                  autoFocus
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg text-sm font-medium"
                  style={{
                    background: "rgba(229, 57, 53, 0.1)",
                    border: "1px solid rgba(229, 57, 53, 0.3)",
                    color: "var(--danger)",
                  }}
                >
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-4 rounded-xl text-base font-black transition-all disabled:opacity-30 hover:scale-[1.02] active:scale-95 shadow-xl disabled:shadow-none bg-gold text-deep-black flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-deep-black/30 border-t-deep-black rounded-full animate-spin" />
                ) : (
                  "Associer l'appareil"
                )}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="py-10 flex flex-col items-center"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-4 border border-green-500/30">
                <Check className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Appareil associé !</h2>
              <p className="text-text-muted text-sm">Transfert vers votre compte...</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
