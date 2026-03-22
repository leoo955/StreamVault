"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Film, Eye, EyeOff, CheckCircle2, AlertCircle, Stars } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuthCache } from "@/components/ProfileGuard";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Invite Preview State
  const [inviteData, setInviteData] = useState<{ role: string, plan: string } | null>(null);
  const [isVerifyingInvite, setIsVerifyingInvite] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (inviteCode.length >= 3) {
            verifyInvite();
        } else {
            setInviteData(null);
        }
    }, 500);
    return () => clearTimeout(timer);
  }, [inviteCode]);

  const verifyInvite = async () => {
    setIsVerifyingInvite(true);
    try {
        const res = await fetch(`/api/invitations/${inviteCode.toUpperCase()}`);
        if (res.ok) {
            const data = await res.json();
            setInviteData({ role: data.role, plan: data.plan });
        } else {
            setInviteData(null);
        }
    } catch {
        setInviteData(null);
    } finally {
        setIsVerifyingInvite(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);

    try {
      // Register
      const regRes = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, inviteCode }),
      });

      const regData = await regRes.json();
      if (!regRes.ok) {
        setError(regData.error);
        return;
      }

      // Auto-login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (loginRes.ok) {
        clearAuthCache();
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
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
        <div className="glass-card-strong p-8">
          <h1 className="text-2xl font-bold text-center mb-2">Créer un compte</h1>
          <p className="text-text-secondary text-center text-sm mb-8">
            Le premier compte créé sera administrateur
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">
                Nom d&apos;utilisateur
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--surface-light)",
                  color: "var(--text-primary)",
                }}
                placeholder="Choisissez un nom"
                required
                minLength={3}
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: "var(--surface)",
                    border: "1px solid var(--surface-light)",
                    color: "var(--text-primary)",
                  }}
                  placeholder="Minimum 6 caractères"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs text-text-muted mb-1.5 uppercase tracking-wider">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: "var(--surface)",
                  border: "1px solid var(--surface-light)",
                  color: "var(--text-primary)",
                }}
                placeholder="Retapez le mot de passe"
                required
                minLength={6}
              />
            </div>

            {/* Invite Code */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs text-text-muted uppercase tracking-wider">
                    Code d&apos;invitation
                </label>
                {isVerifyingInvite && (
                    <div className="w-3 h-3 border border-gold/30 border-t-gold rounded-full animate-spin" />
                )}
              </div>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                style={{
                  background: "var(--surface)",
                  border: inviteData ? "1px solid var(--gold)" : "1px solid var(--surface-light)",
                  color: inviteData ? "var(--gold)" : "var(--text-primary)",
                  fontWeight: "bold",
                  letterSpacing: "1px"
                }}
                placeholder="Ex: VIP-202X"
                required
              />

              <AnimatePresence>
                {inviteData && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-3 rounded-xl bg-gold/5 border border-gold/20 flex flex-col gap-2">
                            <div className="flex items-center gap-2 text-gold">
                                <Stars className="w-4 h-4 fill-gold/20" />
                                <span className="text-[10px] font-black uppercase tracking-widest italic animate-pulse">Invitation Spéciale</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-white/10">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gold animate-ping" />
                                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter">Plan {inviteData.plan}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/40 border border-white/10">
                                    <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">Rôle {inviteData.role}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-lg text-sm"
                style={{
                  background: "rgba(229, 57, 53, 0.1)",
                  border: "1px solid rgba(229, 57, 53, 0.3)",
                  color: "var(--danger)",
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={loading}
              className="btn-gold w-full text-center disabled:opacity-50"
            >
              {loading ? "Création..." : "Créer le compte"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-gold hover:text-gold-light transition-colors">
              Se connecter
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
