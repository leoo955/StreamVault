"use client";

import { useUser } from "@/lib/userProvider";
import { useState, useEffect } from "react";
import { Loader2, Palette, Check } from "lucide-react";

export default function SettingsPage() {
  const { user, refreshUser } = useUser();
  const [accentColor, setAccentColor] = useState("#EAB308");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.preferences?.accentColor) {
      setAccentColor(user.preferences.accentColor);
    }
  }, [user]);

  const handleSave = async () => {
    setIsLoading(true);
    setSuccess(false);
    try {
      const currentPreferences = user?.preferences || {};
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences: {
            ...currentPreferences,
            accentColor,
          }
        }),
      });

      if (res.ok) {
        await refreshUser();
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const PRESET_COLORS = [
    "#EAB308", // Yellow
    "#EF4444", // Red
    "#3B82F6", // Blue
    "#10B981", // Green
    "#A855F7", // Purple
    "#EC4899", // Fuchsia
    "#F97316", // Orange
    "#06B6D4", // Cyan
  ];

  return (
    <div className="min-h-screen pt-24 px-8 md:px-16 pb-24">
      <div className="max-w-2xl mx-auto space-y-12">
        <div>
          <h1 className="title-section mb-2 text-white flex items-center gap-3">
            <Palette className="text-accent" />
            Paramètres d'apparence
          </h1>
          <p className="text-white/50 text-sm font-inter">
            Personnalisez la couleur d'accentuation globale de l'interface.
          </p>
        </div>

        <div className="glass-card p-8 rounded-2xl space-y-8">
          <div className="space-y-4">
            <label className="label-refined text-white/70 block">Couleur Principale</label>
            
            <div className="flex flex-wrap gap-4">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setAccentColor(color)}
                  className={`w-12 h-12 rounded-full border-2 transition-all hover:scale-110 ${accentColor === color ? 'border-white' : 'border-transparent'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <label className="label-refined text-white/70 block">Couleur Personnalisée</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-14 h-14 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <span className="text-white/70 font-mono tracking-wider bg-white/5 px-4 py-2 rounded-lg">
                {accentColor.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="text-sm font-inter">
              {success ? (
                <span className="text-green-500 flex items-center gap-2 animate-in fade-in">
                  <Check size={16} /> Enregistré avec succès
                </span>
              ) : null}
            </div>
            
            <button
              onClick={handleSave}
              disabled={isLoading}
              className="btn-primary px-8 py-3 flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sauvegarder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
