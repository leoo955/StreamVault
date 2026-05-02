"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          identifier, 
          password, 
          invitationCode: inviteCode.trim().toUpperCase() 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      // Successful registration
      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Cinematic Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
        style={{ backgroundImage: `url('https://image.tmdb.org/t/p/original/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg')` }}
      />
      {/* Gradients to fade into OLED black */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-l from-black via-transparent to-black" />

      {/* Glass Panel */}
      <div className="w-full max-w-[700px] frost-effect p-8 sm:p-14 rounded-[32px] relative z-10 flex flex-col my-8 backdrop-blur-3xl border border-white/10 shadow-2xl">
        
        <div className="text-center mb-12">
          <h1 className="font-outfit text-4xl font-black italic tracking-tighter text-white mb-2 uppercase drop-shadow-md">
            Créer un <span className="text-white/40">Compte</span>
          </h1>
          <p className="font-inter text-white/50 text-sm">
            Rejoignez StreamVault avec votre code
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-inter text-center animate-in fade-in slide-in-from-top-2 duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col space-y-8">
          {/* Invitation Code */}
          <div className="space-y-2">
            <label className="label-refined text-white/70 block ml-1 mb-3" htmlFor="inviteCode">
              Code d'invitation <span className="text-white/30 text-[10px] ml-1">(REQUIS)</span>
            </label>
            <input
              id="inviteCode"
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 text-white font-inter placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all duration-300 tracking-widest uppercase"
              placeholder="XXXX-XXXX-XXXX"
              required
              disabled={isLoading}
            />
          </div>

          {/* Identifier (Email / Username) */}
          <div className="space-y-2">
            <label className="label-refined text-white/70 block ml-1 mb-3" htmlFor="identifier">
              Email ou Nom d'utilisateur
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 text-white font-inter placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all duration-300"
              placeholder="votre@email.com ou pseudo"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="label-refined text-white/70 block ml-1 mb-3" htmlFor="password">
              Mot de Passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-6 py-4 text-white font-inter placeholder-white/30 focus:outline-none focus:border-white/40 focus:bg-white/[0.08] transition-all duration-300 tracking-widest"
              placeholder="••••••••"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group w-full bg-white text-black disabled:bg-white/50 disabled:cursor-not-allowed font-inter font-bold py-4 rounded-2xl mt-6 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 uppercase tracking-widest text-sm flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                S'inscrire
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-white/10">
          <p className="text-white/50 text-sm font-inter">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-white hover:text-white hover:underline underline-offset-4 transition-all">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
