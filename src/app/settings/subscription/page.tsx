"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Crown, 
  Check, 
  Zap, 
  ShieldCheck, 
  Monitor, 
  Download, 
  ChevronLeft,
  Stars,
  AlertCircle
} from "lucide-react";
import { useRouter } from "next/navigation";
import { PLAN_FEATURES, getPlanFeatures, PlanFeatures } from "@/lib/plans";

export default function SubscriptionPage() {
  const router = useRouter();
  const [userPlan, setUserPlan] = useState<string>("Starter");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (data.user) setUserPlan(data.user.plan || "Starter");
      })
      .finally(() => setLoading(false));
  }, []);

  const currentPlanFeatures = getPlanFeatures(userPlan);

  const PlanCard = ({ plan, isCurrent }: { plan: PlanFeatures, isCurrent: boolean }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative p-8 rounded-3xl border transition-all duration-500 overflow-hidden flex flex-col h-full ${
        isCurrent 
          ? "glass-card-strong border-gold/40 shadow-[0_0_40px_rgba(198,165,92,0.15)] bg-gold/5" 
          : "glass-card border-white/5 hover:border-white/10"
      }`}
    >
      {isCurrent && (
        <div className="absolute top-0 right-0 px-4 py-1 bg-gold text-black text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg">
          Plan Actuel
        </div>
      )}

      {/* Plan Icon & Name */}
      <div className="mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${
          plan.id === "Ultimate" ? "bg-gold/20 text-gold shadow-[0_0_20px_rgba(198,165,92,0.3)]" :
          plan.id === "Premium" ? "bg-cyan-500/20 text-cyan-400" :
          "bg-white/5 text-text-muted"
        }`}>
          {plan.id === "Ultimate" ? <Crown className="w-8 h-8" /> : 
           plan.id === "Premium" ? <Zap className="w-7 h-7" /> : 
           <Monitor className="w-7 h-7" />}
        </div>
        <h3 className="text-2xl font-black tracking-tight mb-1">{plan.name}</h3>
        <p className="text-gold font-bold text-lg">{plan.price}</p>
      </div>

      {/* Features List */}
      <ul className="space-y-4 mb-10 flex-1">
        {plan.benefits.map((benefit, idx) => (
          <li key={idx} className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-full p-0.5 ${isCurrent ? "bg-gold text-black" : "bg-white/10 text-white"}`}>
                <Check className="w-3 h-3" strokeWidth={4} />
            </div>
            <span className={`text-sm ${isCurrent ? "text-white" : "text-text-secondary"}`}>{benefit}</span>
          </li>
        ))}
      </ul>

      {/* Stats Table (Simple) */}
      <div className="space-y-3 pt-6 border-t border-white/5">
        <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold text-text-muted">
            <span>Profils Max</span>
            <span className="text-white">{plan.maxProfiles}</span>
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold text-text-muted">
            <span>Qualité Max</span>
            <span className="text-gold">{plan.maxQuality}</span>
        </div>
        <div className="flex justify-between text-[11px] uppercase tracking-wider font-bold text-text-muted">
            <span>Mode Hors-Ligne</span>
            <span className={plan.canDownload ? "text-green-400" : "text-red-400"}>
                {plan.canDownload ? "Activé" : "Désactivé"}
            </span>
        </div>
      </div>
    </motion.div>
  );

  if (loading) return null;

  return (
    <div className="min-h-screen bg-deep-black pb-32">
      {/* Hero Header */}
      <div className="relative h-[40vh] min-h-[400px] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {/* Background Visual */}
        <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-deep-black" />
            <div className="absolute inset-0 bg-black/60" />
            <motion.div 
                animate={{ 
                    scale: [1, 1.1, 1],
                    opacity: [0.1, 0.2, 0.1]
                }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute inset-0 flex items-center justify-center blur-3xl"
            >
                <div className="w-[500px] h-[500px] rounded-full bg-gold/20" />
            </motion.div>
        </div>

        <div className="relative z-10 max-w-4xl">
            <button 
                onClick={() => router.back()}
                className="mb-8 p-2 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2 text-text-muted hover:text-white group mx-auto"
            >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="text-xs font-bold uppercase tracking-widest">Retour</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-3 mb-4"
            >
                <Stars className="w-6 h-6 text-gold fill-gold/20" />
                <span className="text-gold font-black uppercase tracking-[0.4em] text-sm italic">StreamVault Membership</span>
            </motion.div>

            <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-7xl font-black mb-6 tracking-tighter"
            >
                Votre voyage vers <br/> l'excellence <span className="gold-text">cinématographique</span>.
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-text-secondary text-lg max-w-2xl mx-auto"
            >
                Découvrez des fonctionnalités exclusives, une qualité 4K époustouflante et un confort de visionnage inégalé.
            </motion.p>
        </div>
      </div>

      {/* Plans Selection */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <PlanCard plan={PLAN_FEATURES.Starter} isCurrent={userPlan === "Starter"} />
            <PlanCard plan={PLAN_FEATURES.Premium} isCurrent={userPlan === "Premium"} />
            <PlanCard plan={PLAN_FEATURES.Ultimate} isCurrent={userPlan === "Ultimate"} />
        </div>

        {/* Info Box */}
        <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-16 p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left"
        >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <AlertCircle className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h4 className="font-bold mb-1">Comment changer de plan ?</h4>
                <p className="text-sm text-text-muted">
                    Pour le moment, les changements de plan sont gérés manuellement par l'administrateur afin de garantir une sécurité maximale à nos membres VIP. Contactez votre invitateur pour demander un surclassement.
                </p>
            </div>
            <button 
                onClick={() => window.location.href = "mailto:admin@streamvault.local"}
                className="px-6 py-3 rounded-xl bg-white text-black font-bold text-sm hover:bg-gold hover:text-black transition-all shadow-xl active:scale-95 shrink-0"
            >
                Contacter l'Admin
            </button>
        </motion.div>
      </div>
    </div>
  );
}
