"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import FullScreenPopup, { PopupConfig, PopupType } from "@/components/FullScreenPopup";

interface PopupContextType {
  showPopup: (config: PopupConfig) => void;
  showSuccess: (title: string, message: string, details?: string) => void;
  showError: (title: string, message: string, details?: string) => void;
  showInfo: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showConfirm: (title: string, message: string, onConfirm: () => void, confirmText?: string) => void;
  showDownload: (title: string, message: string, progress: number) => void;
  closePopup: () => void;
}

const PopupContext = createContext<PopupContextType | null>(null);

export function usePopup() {
  const ctx = useContext(PopupContext);
  if (!ctx) throw new Error("usePopup must be used within PopupProvider");
  return ctx;
}

export function PopupProvider({ children }: { children: ReactNode }) {
  const [popup, setPopup] = useState<PopupConfig | null>(null);

  const showPopup = useCallback((config: PopupConfig) => {
    setPopup(config);
  }, []);

  const closePopup = useCallback(() => setPopup(null), []);

  const showSuccess = useCallback((title: string, message: string, details?: string) => {
    setPopup({ type: "success", title, message, details, autoClose: 3000 });
  }, []);

  const showError = useCallback((title: string, message: string, details?: string) => {
    setPopup({ type: "error", title, message, details });
  }, []);

  const showInfo = useCallback((title: string, message: string) => {
    setPopup({ type: "info", title, message, autoClose: 4000 });
  }, []);

  const showWarning = useCallback((title: string, message: string) => {
    setPopup({ type: "warning", title, message });
  }, []);

  const showConfirm = useCallback((title: string, message: string, onConfirm: () => void, confirmText?: string) => {
    setPopup({ type: "confirm", title, message, onConfirm, confirmText });
  }, []);

  const showDownload = useCallback((title: string, message: string, progress: number) => {
    setPopup({ type: "download", title, message, progress });
  }, []);

  return (
    <PopupContext.Provider value={{ showPopup, showSuccess, showError, showInfo, showWarning, showConfirm, showDownload, closePopup }}>
      {children}
      <FullScreenPopup popup={popup} onClose={closePopup} />
    </PopupContext.Provider>
  );
}
