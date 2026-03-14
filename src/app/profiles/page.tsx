"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, Check,
  User, Smile, Ghost, Rocket, Star, Heart,
  Zap, Moon, Sun, Cloud, Coffee, Music,
  Gamepad2, Camera, Book, Sword, Shield,
  Crown, Sparkles, Flame
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  pin?: string; // hashed on server, just check presence
}

const ICON_MAP: Record<string, React.ElementType> = {
  User, Smile, Ghost, Rocket, Star, Heart,
  Zap, Moon, Sun, Cloud, Coffee, Music,
  Gamepad2, Camera, Book, Sword, Shield,
  Crown, Sparkles, Flame
};

const AVATAR_OPTIONS = Object.keys(ICON_MAP);

const AVATAR_COLORS = [
  "#E53935", "#D81B60", "#8E24AA", "#5E35B1",
  "#3949AB", "#1E88E5", "#039BE5", "#00ACC1",
  "#00897B", "#43A047", "#7CB342", "#FDD835",
  "#FFB300", "#FB8C00", "#F4511E", "#6D4C41",
];

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("User");
  const [selectedColor, setSelectedColor] = useState("#E53935");
  const [newPin, setNewPin] = useState("");
  const [pinProfile, setPinProfile] = useState<Profile | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = () => {
    fetch("/api/profiles")
      .then((r) => {
        if (r.status === 401) {
          router.push("/login");
          throw new Error("Unauthorized");
        }
        return r.json();
      })
      .then((d) => setProfiles(d.profiles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const selectProfile = (profile: Profile) => {
    if (editing) return;
    if (profile.pin) {
      // Profile has a PIN — show PIN entry modal
      setPinProfile(profile);
      setPinInput("");
      setPinError(false);
      return;
    }
    // Store selected profile in sessionStorage
    sessionStorage.setItem("activeProfile", JSON.stringify(profile));
    router.push("/");
  };

  const confirmPin = async () => {
    if (!pinProfile) return;
    const res = await fetch(`/api/profiles/verify-pin?id=${pinProfile.id}&pin=${pinInput}`);
    if (res.ok) {
      sessionStorage.setItem("activeProfile", JSON.stringify(pinProfile));
      setPinProfile(null);
      router.push("/");
    } else {
      setPinError(true);
      setPinInput("");
    }
  };

  const createProfile = async () => {
    if (!newName.trim()) return;

    const avatarUrl = `icon:${selectedIcon}:${selectedColor}`;
    await fetch("/api/profiles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, avatarUrl, pin: newPin.trim() || undefined }),
    });
    setNewName("");
    setNewPin("");
    setShowCreate(false);
    fetchProfiles();
  };

  const removeProfile = async (id: string) => {
    await fetch(`/api/profiles?id=${id}`, { method: "DELETE" });
    fetchProfiles();
  };

  const renderAvatar = (profile: Profile) => {
    const isIconAvatar = profile.avatarUrl?.startsWith("icon:");
    if (isIconAvatar) {
      const parts = profile.avatarUrl.split(":");
      const iconName = parts[1] || "User";
      const color = parts[2] || "#E53935";
      const IconComp = ICON_MAP[iconName] || User;
      return (
        <div
          className="w-full h-full rounded-2xl flex items-center justify-center"
          style={{ background: `${color}33`, border: `3px solid ${color}` }}
        >
          <IconComp className="w-10 h-10 md:w-12 md:h-12" style={{ color }} />
        </div>
      );
    }
    return (
      <div className="w-full h-full rounded-2xl bg-surface flex items-center justify-center text-4xl font-bold text-text-muted">
        {profile.name[0]?.toUpperCase()}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep-black flex items-center justify-center" style={{ marginLeft: 0 }}>
        <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-deep-black flex flex-col items-center justify-center" style={{ marginLeft: 0 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-3xl w-full px-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
          Qui regarde ?
        </h1>
        <p className="text-text-muted text-sm mb-12">
          Sélectionnez votre profil
        </p>

        {/* Profile grid */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="relative group cursor-pointer"
              onClick={() => selectProfile(profile)}
            >
              <div className="w-28 h-28 md:w-32 md:h-32 transition-transform hover:scale-110">
                {renderAvatar(profile)}
              </div>
              <p className="mt-3 text-sm text-text-secondary group-hover:text-text-primary transition-colors text-center">
                {profile.name}
              </p>
              {profile.isKids && (
                <span className="text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded-full block text-center mt-1">
                  KIDS
                </span>
              )}

              {/* Edit/Delete overlay */}
              {editing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl"
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); removeProfile(profile.id); }}
                    className="p-2 bg-red-600/80 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5 text-white" />
                  </button>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Add profile button */}
          {profiles.length < 5 && !editing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: profiles.length * 0.1 }}
              className="cursor-pointer group"
              onClick={() => setShowCreate(true)}
            >
              <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl border-2 border-dashed border-text-muted/30 flex items-center justify-center transition-all group-hover:border-gold group-hover:bg-gold/5">
                <Plus className="w-10 h-10 text-text-muted group-hover:text-gold transition-colors" />
              </div>
              <p className="mt-3 text-sm text-text-muted group-hover:text-text-secondary text-center">
                Ajouter
              </p>
            </motion.div>
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setEditing(!editing)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              editing
                ? "bg-gold text-deep-black"
                : "border border-text-muted/30 text-text-secondary hover:text-text-primary hover:border-text-muted"
            }`}
          >
            {editing ? (
              <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Terminé</span>
            ) : (
              <span className="flex items-center gap-2"><Pencil className="w-4 h-4" /> Gérer les profils</span>
            )}
          </button>
        </div>
      </motion.div>

      {/* Create profile modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 flex items-center justify-center"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl p-6 space-y-5"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-text-primary">Nouveau profil</h2>
                <button onClick={() => setShowCreate(false)}>
                  <X className="w-5 h-5 text-text-muted hover:text-text-primary" />
                </button>
              </div>

              {/* Name input */}
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nom du profil"
                className="w-full px-4 py-3 rounded-xl text-base outline-none"
                style={{
                  background: "var(--deep-black)",
                  border: "1px solid var(--surface-light)",
                  color: "var(--text-primary)",
                }}
                autoFocus
              />

              {/* Avatar preview */}
              <div className="flex justify-center">
                <div
                  className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{ background: `${selectedColor}33`, border: `3px solid ${selectedColor}` }}
                >
                  {(() => {
                    const PreviewIcon = ICON_MAP[selectedIcon] || User;
                    return <PreviewIcon className="w-10 h-10" style={{ color: selectedColor }} />;
                  })()}
                </div>
              </div>

              {/* Icon picker */}
              <div>
                <p className="text-xs text-text-muted mb-2">Choisir une icône</p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((iconName) => {
                    const IconComp = ICON_MAP[iconName] || User;
                    return (
                      <button
                        key={iconName}
                        onClick={() => setSelectedIcon(iconName)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                          selectedIcon === iconName ? "bg-gold/20 ring-2 ring-gold scale-110" : "bg-deep-black hover:bg-surface-light text-text-secondary"
                        }`}
                      >
                        <IconComp className="w-5 h-5" style={{ color: selectedIcon === iconName ? selectedColor : undefined }} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color picker */}
              <div>
                <p className="text-xs text-text-muted mb-2">Couleur</p>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        selectedColor === color ? "ring-2 ring-white scale-110" : "hover:scale-105"
                      }`}
                      style={{ background: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Create button */}
              <button
                onClick={createProfile}
                disabled={!newName.trim()}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                style={{ background: "var(--gold)", color: "var(--deep-black)" }}
              >
                Créer le profil
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PIN entry modal */}
      <AnimatePresence>
        {pinProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 flex items-center justify-center"
            onClick={() => setPinProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9 }}
              className="w-full max-w-sm rounded-2xl p-8 space-y-6 text-center"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center" style={{ background: "var(--gold-glow)", border: "2px solid var(--gold)" }}>
                <span className="text-2xl font-black text-gold">🔒</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-text-primary">Profil protégé</h2>
                <p className="text-sm text-text-muted mt-1">Entrez le code PIN pour <span className="text-gold font-semibold">{pinProfile.name}</span></p>
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinInput}
                onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") confirmPin(); }}
                placeholder="• • • •"
                className={`w-full text-center text-2xl tracking-[0.5em] font-bold px-4 py-3 rounded-xl outline-none transition-all ${
                  pinError ? "border-red-500" : ""
                }`}
                style={{
                  background: "var(--deep-black)",
                  border: `1px solid ${pinError ? "#ef4444" : "var(--surface-light)"}`,
                  color: "var(--text-primary)",
                }}
                autoFocus
              />
              {pinError && <p className="text-red-400 text-sm font-medium">Code incorrect, réessayez.</p>}
              <button
                onClick={confirmPin}
                disabled={pinInput.length !== 4}
                className="w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
                style={{ background: "var(--gold)", color: "var(--deep-black)" }}
              >
                Déverrouiller
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
