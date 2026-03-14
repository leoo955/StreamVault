"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Shield, Globe, Play, Lock, LogOut, Check } from "lucide-react";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  username: string;
  role: "admin" | "user";
  preferences: { language: string; autoplay: boolean };
}

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [autoplay, setAutoplay] = useState(true);
  const [language, setLanguage] = useState("fr");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setUser(d.user);
          setAutoplay(d.user.preferences?.autoplay ?? true);
          setLanguage(d.user.preferences?.language ?? "fr");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const savePreferences = async () => {
    setSaving(true); setError(""); setSuccess("");
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: { autoplay, language } }),
      });
      if (res.ok) setSuccess("Préférences sauvegardées");
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
