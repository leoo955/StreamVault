"use client";

import { useState, useEffect } from "react";
import { MonitorDown } from "lucide-react";

// Extend Window interface for the PWA event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: fullscreen)").matches
    ) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault(); // Prevent standard visual prompts
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <button
      onClick={handleInstallClick}
      title="Installer l'Application Windows"
      className="flex items-center gap-1.5 md:gap-2 px-2.5 py-1.5 md:px-3 rounded-lg bg-gold/15 hover:bg-gold/25 text-gold border border-gold/30 transition-all hover:scale-105"
    >
      <MonitorDown className="w-4 h-4 md:w-5 md:h-5 drop-shadow-md" />
      <span className="hidden md:inline text-[11px] font-black tracking-widest uppercase">
        App Windows
      </span>
    </button>
  );
}
