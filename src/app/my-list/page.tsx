"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function MyListPage() {
  const { t } = useI18n();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen px-8 pt-8 pb-20"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("nav.myList")}</h1>
        <p className="text-text-secondary mt-1">
          {t("list.subtitle")}
        </p>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "var(--gold-glow)" }}
        >
          <Heart className="w-10 h-10 text-gold" />
        </div>
        <h2 className="text-xl font-semibold mb-2">{t("list.empty")}</h2>
        <p className="text-text-secondary max-w-md">
          {t("list.emptyDesc")}
        </p>
      </div>
    </motion.div>
  );
}
