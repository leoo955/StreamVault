"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Film, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        return;
      }

      router.push("/");
      router.refresh();
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
          <h1 className="text-2xl font-bold text-center mb-2">Connexion</h1>
          <p className="text-text-secondary text-center text-sm mb-8">
            Accédez à votre bibliothèque de streaming
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
                placeholder="Entrez votre nom"
                required
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
                  placeholder="Entrez votre mot de passe"
                  required
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
              {loading ? "Connexion..." : "Se connecter"}
            </motion.button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-gold hover:text-gold-light transition-colors">
              Créer un compte
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
