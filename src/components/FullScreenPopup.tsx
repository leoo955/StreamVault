"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface FullScreenPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FullScreenPopup component for immersive modals.
 * Features a high-quality frosted glass effect and cinematic transitions.
 */
export function FullScreenPopup({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  className 
}: FullScreenPopupProps) {
  
  // Prevent scrolling when the popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
          
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Popup Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              y: 0,
              transition: { 
                type: "spring", 
                stiffness: 260, 
                damping: 30,
                delay: 0.1
              }
            }}
            exit={{ opacity: 0, scale: 0.9, y: 20, transition: { duration: 0.2 } }}
            className={cn(
              "relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[2rem] frost-effect shadow-2xl flex flex-col",
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 md:p-8 border-b border-white/10">
              {title && (
                <h2 className="text-2xl md:text-3xl font-display font-light tracking-wide text-white">
                  {title}
                </h2>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
              {children}
            </div>
            
            {/* Ambient Light Effect inside the popup */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/[0.02] blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-white/[0.01] blur-[60px] rounded-full pointer-events-none"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
