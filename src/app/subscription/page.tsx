"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Check, ShieldAlert, Sparkles, Star, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface UserPublic {
  id: string;
  username: string;
  role: "admin" | "user";
  plan: string;
}

export default function SubscriptionPage() {
  const [user, setUser] = useState<UserPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login?redirect=/subscription");
          return;
        }
        const data = await res.json();
        
        // DEV MODE RESTRICTION: Only admins can see this page
        if (data.user?.role !== "admin") {
          router.push("/"); // Redirect regular users away
          return;
        }

        setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return null; // router redirect handles the rest

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full mix-blend-screen pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-text-secondary hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>

        {/* Beta Notice */}
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex items-start gap-3 mb-10 max-w-2xl mx-auto">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            <strong className="block mb-1 text-red-300">⚠️ Mode Développeur Restreint</strong>
            Cette page n'est actuellement visible que par les administrateurs du site. Le système de paiement final et de facturation automatique est en cours de création.
          </div>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black mb-4">
            Passez à la vitesse <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-yellow-200">supérieure</span>
          </h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Débloquez des avantages exclusifs, supprimez les limites et soutenez StreamVault en choisissant le plan qui vous correspond.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          
          {/* Starter Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className={`relative rounded-3xl p-8 bg-surface border-2 transition-all ${user.plan === "Starter" ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]" : "border-surface-light border-opacity-50 hover:border-green-500/50"}`}
          >
            {user.plan === "Starter" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-green-500 text-black px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                PLAN ACTUEL
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-400">
                <Check className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-green-400">Starter</h2>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black">Gratuit</span>
              <span className="text-text-secondary"> / toujours</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3 text-text-secondary">
                <Check className="w-5 h-5 shrink-0 text-text-muted" />
                <span>Accès au catalogue de base</span>
              </li>
              <li className="flex gap-3 text-text-secondary">
                <Check className="w-5 h-5 shrink-0 text-text-muted" />
                <span>Qualité standard (720p)</span>
              </li>
              <li className="flex gap-3 text-text-secondary">
                <Check className="w-5 h-5 shrink-0 text-text-muted" />
                <span>Avec publicités intégrées</span>
              </li>
            </ul>
            <button disabled className="w-full py-3 rounded-xl font-bold bg-surface-light text-text-muted cursor-not-allowed">
              {user.plan === "Starter" ? "Déjà Actif" : "Choisir ce plan"}
            </button>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className={`relative rounded-3xl p-8 bg-surface border-2 transition-all ${user.plan === "Premium" ? "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.2)] md:-translate-y-4" : "border-yellow-400/30 hover:border-yellow-400/60"}`}
          >
            <div className="absolute -top-4 right-8 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold tracking-wider flex items-center gap-1">
              <Star className="w-3 h-3" /> POPULAIRE
            </div>
            {user.plan === "Premium" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                PLAN ACTUEL
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-yellow-400/20 rounded-xl text-yellow-400">
                <Star className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-yellow-400">Premium</h2>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black">4.99€</span>
              <span className="text-text-secondary"> / mois</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3">
                <Check className="w-5 h-5 shrink-0 text-yellow-500" />
                <span>Format Full HD (1080p) garanti</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 shrink-0 text-yellow-500" />
                <span>Expérience sans aucune publicité</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 shrink-0 text-yellow-500" />
                <span>Sauvegarde des favoris et playlists</span>
              </li>
              <li className="flex gap-3 text-text-secondary">
                <Check className="w-5 h-5 shrink-0 text-text-muted" />
                <span>Accès aux sorties de la semaine</span>
              </li>
            </ul>
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${user.plan === "Premium" ? "bg-surface-light text-text-muted cursor-not-allowed" : "bg-yellow-400 text-black shadow-[0_0_20px_rgba(250,204,21,0.4)] hover:shadow-[0_0_30px_rgba(250,204,21,0.6)] hover:scale-[1.02]"}`}>
              {user.plan === "Premium" ? "Plan Actif" : "S'abonner"}
            </button>
          </motion.div>

          {/* Ultimate Plan */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className={`relative rounded-3xl p-8 bg-surface border-2 transition-all ${user.plan === "Ultimate" ? "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.2)]" : "border-purple-500/30 hover:border-purple-500/60"}`}
          >
            {user.plan === "Ultimate" && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider">
                PLAN ACTUEL
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-purple-400">Ultimate</h2>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-black">9.99€</span>
              <span className="text-text-secondary"> / mois</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex gap-3">
                <Sparkles className="w-5 h-5 shrink-0 text-purple-400" />
                <span className="font-medium text-white">Résolution 4K UHD Ultra Nette</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 shrink-0 text-purple-500" />
                <span>Sources de streaming ultra-rapides</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 shrink-0 text-purple-500" />
                <span>Téléchargement hors-ligne (bientôt)</span>
              </li>
              <li className="flex gap-3">
                <Check className="w-5 h-5 shrink-0 text-purple-500" />
                <span>Accès en avant-première aux nouveautés</span>
              </li>
            </ul>
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${user.plan === "Ultimate" ? "bg-surface-light text-text-muted cursor-not-allowed" : "bg-purple-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)] hover:shadow-[0_0_30px_rgba(147,51,234,0.6)] hover:scale-[1.02]"}`}>
              {user.plan === "Ultimate" ? "Plan Actif" : "S'abonner"}
            </button>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
