"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, AlertTriangle, Info, Download, Trash2, Shield } from "lucide-react";
import { useEffect } from "react";

export type PopupType = "success" | "error" | "info" | "download" | "confirm" | "warning";

export interface PopupConfig {
  type: PopupType;
  title: string;
  message: string;
  /** Optional sub-message or details */
  details?: string;
  /** For confirm popups */
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  /** Auto-close delay in ms (0 = no auto-close) */
  autoClose?: number;
  /** Progress percentage (for download type) */
  progress?: number;
}

interface FullScreenPopupProps {
  popup: PopupConfig | null;
  onClose: () => void;
}

const iconMap = {
  success: <CheckCircle2 className="w-16 h-16" />,
  error: <AlertTriangle className="w-16 h-16" />,
  info: <Info className="w-16 h-16" />,
  download: <Download className="w-16 h-16" />,
  confirm: <Trash2 className="w-16 h-16" />,
  warning: <Shield className="w-16 h-16" />,
};

const colorMap = {
  success: { bg: "rgba(76, 175, 80, 0.15)", border: "rgba(76, 175, 80, 0.4)", icon: "#4CAF50", glow: "0 0 80px rgba(76, 175, 80, 0.3)" },
  error: { bg: "rgba(229, 57, 53, 0.15)", border: "rgba(229, 57, 53, 0.4)", icon: "#E53935", glow: "0 0 80px rgba(229, 57, 53, 0.3)" },
  info: { bg: "rgba(33, 150, 243, 0.15)", border: "rgba(33, 150, 243, 0.4)", icon: "#2196F3", glow: "0 0 80px rgba(33, 150, 243, 0.3)" },
  download: { bg: "rgba(198, 165, 92, 0.15)", border: "rgba(198, 165, 92, 0.4)", icon: "#C6A55C", glow: "0 0 80px rgba(198, 165, 92, 0.3)" },
  confirm: { bg: "rgba(229, 57, 53, 0.15)", border: "rgba(229, 57, 53, 0.4)", icon: "#E53935", glow: "0 0 80px rgba(229, 57, 53, 0.3)" },
  warning: { bg: "rgba(255, 152, 0, 0.15)", border: "rgba(255, 152, 0, 0.4)", icon: "#FF9800", glow: "0 0 80px rgba(255, 152, 0, 0.3)" },
};

export default function FullScreenPopup({ popup, onClose }: FullScreenPopupProps) {
  useEffect(() => {
    if (!popup) return;
    if (popup.autoClose && popup.autoClose > 0) {
      const timer = setTimeout(onClose, popup.autoClose);
      return () => clearTimeout(timer);
    }
  }, [popup, onClose]);

  // Lock body scroll when popup is open
  useEffect(() => {
    if (popup) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [popup]);

  return (
    <AnimatePresence>
      {popup && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
          style={{ background: "rgba(0, 0, 0, 0.85)", backdropFilter: "blur(20px)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget && popup.type !== "confirm") onClose();
          }}
        >
          {/* Close button */}
          {popup.type !== "confirm" && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </motion.button>
          )}

          {/* Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm rounded-3xl overflow-hidden text-center"
            style={{
              background: "rgba(15, 15, 15, 0.95)",
              border: `1px solid ${colorMap[popup.type].border}`,
              boxShadow: colorMap[popup.type].glow,
            }}
          >
            {/* Background glow */}
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full -translate-y-1/2 blur-3xl opacity-30 pointer-events-none"
              style={{ background: colorMap[popup.type].icon }}
            />

            <div className="relative p-8 pt-10">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
                style={{ background: colorMap[popup.type].bg, color: colorMap[popup.type].icon }}
              >
                {iconMap[popup.type]}
              </motion.div>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-2xl font-black mb-3"
              >
                {popup.title}
              </motion.h2>

              {/* Message */}
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-text-secondary leading-relaxed text-sm mb-2"
              >
                {popup.message}
              </motion.p>

              {/* Details */}
              {popup.details && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="text-text-muted text-xs mt-2 px-4"
                >
                  {popup.details}
                </motion.p>
              )}

              {/* Download Progress Bar */}
              {popup.type === "download" && popup.progress !== undefined && (
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.25 }}
                  className="mt-6 w-full"
                >
                  <div className="flex items-center justify-between text-xs text-text-muted mb-2">
                    <span>Progression</span>
                    <span className="font-bold" style={{ color: colorMap.download.icon }}>{popup.progress}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: `linear-gradient(90deg, ${colorMap.download.icon}, #e0c97f)`, width: `${popup.progress}%` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${popup.progress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-8 flex flex-col gap-3"
              >
                {popup.type === "confirm" ? (
                  <>
                    <button
                      onClick={() => { popup.onConfirm?.(); onClose(); }}
                      className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95"
                      style={{ background: colorMap[popup.type].icon, color: "#fff" }}
                    >
                      {popup.confirmText || "Confirmer"}
                    </button>
                    <button
                      onClick={() => { popup.onCancel?.(); onClose(); }}
                      className="w-full py-3.5 rounded-xl font-bold text-sm text-text-secondary hover:text-white transition-colors"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}
                    >
                      {popup.cancelText || "Annuler"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={onClose}
                    className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:opacity-90"
                    style={{ background: colorMap[popup.type].icon, color: popup.type === "download" ? "#0A0A0A" : "#fff" }}
                  >
                    {popup.type === "success" ? "Parfait !" : popup.type === "error" ? "Compris" : "OK"}
                  </button>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
