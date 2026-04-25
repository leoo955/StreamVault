"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Globe, Play, Lock, LogOut, Check, MonitorSmartphone, Crown, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import { getPlanFeatures } from "@/lib/plans";
import { useTheme, THEMES } from "@/lib/theme";
import { useUser } from "@/lib/userProvider";

export default function SettingsPage() {
  const router = useRouter();
  const { theme: currentTheme, setTheme } = useTheme();
  const { user, loading, refresh, setUser } = useUser();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [autoplay, setAutoplay] = useState(true);
  const [language, setLanguage] = useState("fr");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [pairingCode, setPairingCode] = useState("");
  const [codeExpiresAt, setCodeExpiresAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState("");

  const fetchPairingCode = async () => {
    try {
      const res = await fetch("/api/user/pairing");
      if (res.ok) {
        const data = await res.json();
        setPairingCode(data.code);
        setCodeExpiresAt(new Date(data.expiresAt));
      }
    } catch {}
  };

  const generateNewPairingCode = async () => {
    try {
      setPairingCode("...");
      const res = await fetch("/api/user/pairing", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setPairingCode(data.code);
        setCodeExpiresAt(new Date(data.expiresAt));
      }
    } catch {}
  };

  useEffect(() => {
    if (!codeExpiresAt) return;
    const interval = setInterval(() => {
      const now = new Date();
      const diff = codeExpiresAt.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeRemaining("Expiré");
        if (pairingCode && pairingCode !== "...") setPairingCode(""); 
        clearInterval(interval);
      } else {
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeRemaining(`${m}:${s.toString().padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [codeExpiresAt, pairingCode]);

  useEffect(() => {
    if (user) {
      setAutoplay(user.preferences?.autoplay ?? true);
      setLanguage(user.preferences?.language ?? "fr");
      fetchPairingCode();
    }
  }, [user]);

  const savePreferences = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { autoplay, language } }),
      });
      if (res.ok) {
        setSuccess("Préférences sauvegardées");
        refresh();
      }
      else setError("Erreur de sauvegarde");
    } catch { setError("Erreur"); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) { setError("Les mots de passe ne correspondent pas"); return; }
    if (newPassword.length < 6) { setError("Min. 6 caractères"); return; }
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess("Mot de passe changé"); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); }
      else setError(data.error);
    } catch { setError("Erreur"); }
    finally { setSaving(false); }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const S = { background: "var(--surface)", border: "1px solid var(--surface-light)", color: "var(--text-primary)" };

  if (loading) return (
    <div className="min-h-screen px-8 pt-8 max-w-2xl">
      {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl mb-4" />)}
    </div>
  );

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <p className="text-text-muted mb-4">Connectez-vous pour accéder aux paramètres</p>
        <a href="/login" className="btn-gold">Se connecter</a>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen px-8 pt-8 pb-20 max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Paramètres</h1>
      <p className="text-text-secondary mb-8">Gérez votre compte et vos préférences</p>

      {(success || error) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-3 rounded-xl text-sm" style={{
          background: success ? "rgba(76,175,80,0.1)" : "rgba(229,57,53,0.1)",
          border: `1px solid ${success ? "rgba(76,175,80,0.3)" : "rgba(229,57,53,0.3)"}`,
          color: success ? "#4CAF50" : "var(--danger)",
        }}>
          {success || error}
        </motion.div>
      )}

      {/* Profile */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold">Profil</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ background: "var(--gold-glow)", color: "var(--gold)" }}>
            {user.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium">{user.username}</p>
            <p className="text-xs text-text-muted flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {user.role === "admin" ? "Administrateur" : "Utilisateur"}
            </p>
          </div>
        </div>
      </section>

      {/* Subscription */}
      <section className="glass-card p-6 mb-4 relative overflow-hidden group hover:border-gold/30 transition-all cursor-pointer" onClick={() => router.push("/settings/subscription")}>
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown className="w-20 h-20 text-gold rotate-12" />
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold">Abonnement</h2>
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
            user.plan === "Ultimate" ? "bg-gold/10 text-gold border-gold/20" :
            user.plan === "Premium" ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/20" :
            "bg-white/5 text-text-muted border-white/10"
          }`}>
            Plan {user.plan || "Starter"}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-text-muted">Gérez vos avantages et facturation</span>
            <span className="text-gold font-bold">Détails →</span>
        </div>
      </section>

      {/* Preferences */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Globe className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold">Préférences</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Play className="w-4 h-4 text-text-muted" />
              <div><p className="text-sm font-medium">Lecture automatique</p><p className="text-xs text-text-muted">Lancer automatiquement le prochain épisode</p></div>
            </div>
            <button onClick={() => setAutoplay(!autoplay)} className="w-12 h-6 rounded-full transition-all duration-200 relative" style={{ background: autoplay ? "var(--gold)" : "var(--surface-light)" }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all duration-200" style={{ left: autoplay ? "calc(100% - 1.375rem)" : "0.125rem" }} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-text-muted" />
              <div><p className="text-sm font-medium">Langue</p></div>
            </div>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="px-3 py-1.5 rounded-lg text-sm focus:outline-none" style={S}>
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <button onClick={savePreferences} disabled={saving} className="btn-gold mt-5 text-sm flex items-center gap-2 disabled:opacity-50">
          <Check className="w-4 h-4" />{saving ? "..." : "Sauvegarder"}
        </button>
      </section>

      {/* Theme Selector */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold">Thème</h2>
        </div>
        <p className="text-text-muted text-xs mb-4">Personnalisez l'apparence de StreamVault</p>
        <div className="grid grid-cols-5 gap-3">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`relative group/theme rounded-xl overflow-hidden transition-all duration-300 aspect-square ${currentTheme.id === t.id ? "ring-2 ring-offset-2 ring-offset-deep-black" : "hover:scale-105"}`}
              style={{ background: t.preview, outlineColor: t.accent }}
            >
              {currentTheme.id === t.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Check className="w-5 h-5" style={{ color: t.accent }} />
                </div>
              )}
              <p className="absolute bottom-1 left-0 right-0 text-[8px] font-bold text-center text-white/80 drop-shadow-lg">{t.name}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Device Pairing */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MonitorSmartphone className="w-5 h-5 text-gold" />
            <h2 className="text-lg font-semibold">Couplage d'appareil</h2>
          </div>
        </div>
        
        <div className="text-center bg-deep-black/40 rounded-xl p-6 border border-surface-light mb-4 shadow-inner">
          <p className="text-text-muted text-sm mb-3">Entrez ce code sur votre nouvel appareil (ex: TV)</p>
          <div className="text-4xl md:text-5xl font-mono font-black text-gold tracking-[0.2em] mb-3 drop-shadow-md">
            {pairingCode && pairingCode !== "..." ? `${pairingCode.slice(0, 3)} ${pairingCode.slice(3)}` : "--- ---"}
          </div>
          <p className="text-xs text-text-secondary">
            Expire dans : <span className="font-mono text-white ml-1">{timeRemaining || "--:--"}</span>
          </p>
        </div>
        <button onClick={generateNewPairingCode} className="w-full py-3 rounded-xl border border-gold/30 text-gold hover:bg-gold/10 transition-colors text-sm font-bold">
          Générer un nouveau code
        </button>
      </section>

      {/* Password */}
      <section className="glass-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-gold" />
          <h2 className="text-lg font-semibold">Mot de passe</h2>
        </div>
        <div className="space-y-3">
          <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="Mot de passe actuel" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} />
          <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Nouveau mot de passe" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} />
          <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirmer" className="w-full px-4 py-3 rounded-xl text-sm focus:outline-none" style={S} />
        </div>
        <button onClick={changePassword} disabled={saving || !oldPassword || !newPassword} className="btn-gold mt-4 text-sm disabled:opacity-50">Changer le mot de passe</button>
      </section>

      {/* Logout */}
      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 p-4 rounded-xl text-sm font-medium transition-colors hover:bg-surface-hover" style={{ background: "var(--surface)", border: "1px solid var(--surface-light)", color: "var(--danger)" }}>
        <LogOut className="w-4 h-4" />Déconnexion
      </button>
    </motion.div>
  );
}
