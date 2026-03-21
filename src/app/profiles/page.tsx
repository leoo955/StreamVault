"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Pencil, Trash2, X, Check, Lock, Unlock,
  User, Smile, Ghost, Rocket, Star, Heart,
  Zap, Moon, Sun, Cloud, Coffee, Music,
  Gamepad2, Camera, Book, Sword, Shield,
  Crown, Sparkles, Flame
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getPlanFeatures } from "@/lib/plans";
import { usePlan } from "@/hooks/usePlan";

interface Profile {
  id: string;
  name: string;
  avatarUrl: string;
  isKids: boolean;
  pin?: string;
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
  
  // Create Profile State
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("User");
  const [selectedColor, setSelectedColor] = useState("#E53935");
  const [newPin, setNewPin] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Edit Profile State
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  const [editName, setEditName] = useState("");
  const [editSelectedIcon, setEditSelectedIcon] = useState("User");
  const [editSelectedColor, setEditSelectedColor] = useState("#E53935");
  const [editNewPin, setEditNewPin] = useState("");
  const [editRemovePin, setEditRemovePin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // PIN Entry State
  const [pinProfile, setPinProfile] = useState<Profile | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  
  const router = useRouter();
  const { plan: userPlan } = usePlan();

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
      setPinProfile(profile);
      setPinInput("");
      setPinError(false);
      return;
    }
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

  const openCreateModal = () => {
    setNewName("");
    setNewPin("");
    setSelectedIcon("User");
    setSelectedColor(AVATAR_COLORS[0]);
    setShowCreate(true);
  };

  const createProfile = async () => {
    if (!newName.trim() || isCreating) return;
    setIsCreating(true);
    try {
      const avatarUrl = `icon:${selectedIcon}:${selectedColor}`;
      await fetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, avatarUrl, pin: newPin.trim() || undefined }),
      });
      setShowCreate(false);
      fetchProfiles();
    } catch (error) {
      console.error("Failed to create profile:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const openEditProfile = (profile: Profile) => {
    setEditingProfile(profile);
    setEditName(profile.name);
    if (profile.avatarUrl?.startsWith("icon:")) {
      const parts = profile.avatarUrl.split(":");
      setEditSelectedIcon(parts[1] || "User");
      setEditSelectedColor(parts[2] || "#E53935");
    } else {
      setEditSelectedIcon("User");
      setEditSelectedColor(AVATAR_COLORS[0]);
    }
    setEditNewPin("");
    setEditRemovePin(false);
  };

  const saveProfile = async () => {
    if (!editingProfile || !editName.trim() || isSaving) return;
    setIsSaving(true);
    try {
      const avatarUrl = `icon:${editSelectedIcon}:${editSelectedColor}`;
      let pinToSend = undefined;
      if (editRemovePin) {
        pinToSend = ""; // backend maps empty string to null to remove PIN
      } else if (editNewPin.trim().length === 4) {
        pinToSend = editNewPin.trim();
      }
      
      await fetch("/api/profiles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingProfile.id,
          name: editName,
          avatarUrl,
          pin: pinToSend
        })
      });
      setEditingProfile(null);
      fetchProfiles();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const removeProfile = async (id: string) => {
    if (confirm("Voulez-vous vraiment supprimer ce profil ?")) {
      await fetch(`/api/profiles?id=${id}`, { method: "DELETE" });
      if (editingProfile?.id === id) setEditingProfile(null);
      fetchProfiles();
    }
  };

  const renderAvatar = (profile: Profile | null, iconName: string, color: string, name: string, sizeClasses = "w-32 h-32 md:w-40 md:h-40") => {
    if (profile && !profile.avatarUrl?.startsWith("icon:")) {
      return (
        <div className={`${sizeClasses} rounded-full bg-surface flex items-center justify-center text-5xl font-bold text-text-muted shadow-xl border-4 border-surface-light`}>
          {name[0]?.toUpperCase() || "?"}
        </div>
      );
    }
    const IconComp = ICON_MAP[iconName] || User;
    return (
      <div
        className={`${sizeClasses} rounded-full flex items-center justify-center shadow-xl backdrop-blur-md`}
        style={{ background: `linear-gradient(135deg, ${color}33, ${color}11)`, border: `4px solid ${color}` }}
      >
        <IconComp className="w-14 h-14 md:w-16 md:h-16 shadow-black/50 drop-shadow-lg" style={{ color }} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-[200] bg-deep-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] bg-deep-black flex flex-col items-center justify-center pt-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center w-full max-w-5xl px-6 pb-20"
      >
        <h1 className="text-4xl md:text-5xl font-black text-text-primary mb-3">
          Qui regarde ?
        </h1>
        <p className="text-text-muted text-lg font-medium mb-16">
          Sélectionnez votre profil
        </p>

        {/* Profile grid */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-16">
          {profiles.map((profile, i) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
              className="relative group cursor-pointer flex flex-col items-center"
              onClick={() => selectProfile(profile)}
            >
              <div className={`relative transition-transform duration-300 ${!editing && "group-hover:scale-110"}`}>
                <div className={`rounded-full transition-all duration-300 ${!editing && "group-hover:ring-4 ring-gold/40"}`}>
                  {renderAvatar(
                    profile, 
                    profile.avatarUrl?.split(":")[1] || "User", 
                    profile.avatarUrl?.split(":")[2] || "#E53935", 
                    profile.name
                  )}
                </div>

                {/* Visual Lock Indicator */}
                {profile.pin && !editing && (
                  <div className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-deep-black flex items-center justify-center border-4 border-deep-black shadow-xl z-10 transition-transform group-hover:scale-110">
                    <Lock className="w-5 h-5 text-gold" />
                  </div>
                )}

                {/* Edit Overlay */}
                {editing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full cursor-pointer backdrop-blur-[2px] z-20 transition-all hover:bg-black/50"
                    onClick={(e) => { e.stopPropagation(); openEditProfile(profile); }}
                  >
                    <Pencil className="w-10 h-10 text-white drop-shadow-md" />
                  </motion.div>
                )}
              </div>
              
              <p className="mt-5 text-lg md:text-xl font-semibold text-text-secondary group-hover:text-text-primary transition-colors">
                {profile.name}
              </p>
            </motion.div>
          ))}

          {/* Add profile button */}
          {!editing && (
            profiles.length < (userPlan?.maxProfiles || 1) ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: profiles.length * 0.1, type: "spring" }}
                className="cursor-pointer group flex flex-col items-center"
                onClick={openCreateModal}
              >
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-dashed border-text-muted/30 flex items-center justify-center transition-all duration-300 group-hover:border-gold group-hover:bg-gold/5 group-hover:scale-110">
                  <Plus className="w-12 h-12 md:w-16 md:h-16 text-text-muted group-hover:text-gold transition-colors" />
                </div>
                <p className="mt-5 text-lg md:text-xl font-semibold text-text-muted group-hover:text-text-secondary">
                  Ajouter un profil
                </p>
              </motion.div>
            ) : profiles.length === 1 && userPlan?.id === "Starter" ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center max-w-[200px] text-center px-4"
              >
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-text-muted/30" />
                </div>
                <p className="text-[10px] uppercase font-black tracking-widest text-gold mb-1">Plan Starter</p>
                <p className="text-[11px] text-text-muted leading-tight">
                  Passez au plan <span className="text-white font-bold">Premium</span> pour ajouter d'autres profils.
                </p>
              </motion.div>
            ) : null
          )}
        </div>

        {/* Bottom actions */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => setEditing(!editing)}
            className={`px-8 py-3 rounded-full text-base font-bold transition-all duration-300 shadow-lg ${
              editing
                ? "bg-text-primary text-deep-black hover:bg-white scale-105"
                : "border-2 border-text-muted/40 text-text-secondary hover:text-text-primary hover:border-text-muted bg-surface/50 hover:bg-surface"
            }`}
          >
            {editing ? "Terminé" : "Gérer les profils"}
          </button>
        </div>
      </motion.div>

      {/* Editing Modal */}
      <AnimatePresence>
        {(showCreate || editingProfile) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => { setShowCreate(false); setEditingProfile(null); }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative my-8"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-surface-light">
                <h2 className="text-2xl font-black text-text-primary">
                  {editingProfile ? "Modifier le profil" : "Nouveau profil"}
                </h2>
                <button onClick={() => { setShowCreate(false); setEditingProfile(null); }} className="p-2 rounded-full hover:bg-surface-light transition-colors">
                  <X className="w-6 h-6 text-text-muted hover:text-text-primary" />
                </button>
              </div>

              {/* Avatar preview */}
              <div className="flex justify-center py-2">
                {renderAvatar(
                  editingProfile ? editingProfile : null,
                  editingProfile ? editSelectedIcon : selectedIcon,
                  editingProfile ? editSelectedColor : selectedColor,
                  editingProfile ? editName : newName,
                  "w-28 h-28"
                )}
              </div>

              {/* Name input */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-text-secondary uppercase tracking-wider ml-1">Nom du profil</label>
                <input
                  type="text"
                  value={editingProfile ? editName : newName}
                  onChange={(e) => editingProfile ? setEditName(e.target.value) : setNewName(e.target.value)}
                  placeholder="Ex: John, Kids..."
                  className="w-full px-5 py-4 rounded-2xl text-lg font-medium outline-none transition-all focus:ring-2 focus:ring-gold/50"
                  style={{ background: "var(--deep-black)", border: "1px solid var(--surface-light)", color: "var(--text-primary)" }}
                  autoFocus
                />
              </div>

              {/* Editable PIN Section */}
              <div className="space-y-3 p-4 rounded-2xl border border-surface-light bg-deep-black/50">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-4 h-4 text-gold" /> Code PIN (RDC)
                  </label>
                  {editingProfile && editingProfile.pin && !editRemovePin && (
                    <button 
                      onClick={() => { setEditRemovePin(true); setEditNewPin(""); }}
                      className="text-xs text-red-400 hover:text-red-300 font-bold bg-red-400/10 px-3 py-1 rounded-full transition-colors flex items-center gap-1"
                    >
                      <Unlock className="w-3 h-3" /> Supprimer le code
                    </button>
                  )}
                  {editingProfile && editRemovePin && (
                    <button 
                      onClick={() => setEditRemovePin(false)}
                      className="text-xs text-text-muted hover:text-text-primary font-bold px-3 py-1 rounded-full transition-colors"
                    >
                      Annuler la suppression
                    </button>
                  )}
                </div>

                {!editRemovePin && (
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={editingProfile ? editNewPin : newPin}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      editingProfile ? setEditNewPin(val) : setNewPin(val);
                    }}
                    placeholder={editingProfile && editingProfile.pin ? "•••• (Modifier)" : "Créer un PIN à 4 chiffres"}
                    className="w-full px-5 py-3 rounded-xl tracking-widest font-bold outline-none transition-all focus:ring-2 focus:ring-gold/50"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-light)", color: "var(--text-primary)" }}
                  />
                )}
                {editRemovePin && (
                  <p className="text-sm text-text-muted italic px-2">Le code PIN sera supprimé à l'enregistrement.</p>
                )}
                <p className="text-xs text-text-muted px-2">Un code PIN limite l'accès à ce profil.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Icon picker */}
                <div>
                  <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">Icône</p>
                  <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                    {AVATAR_OPTIONS.map((iconName) => {
                      const IconComp = ICON_MAP[iconName] || User;
                      const isSelected = editingProfile ? editSelectedIcon === iconName : selectedIcon === iconName;
                      const activeColor = editingProfile ? editSelectedColor : selectedColor;
                      return (
                        <button
                          key={iconName}
                          onClick={() => editingProfile ? setEditSelectedIcon(iconName) : setSelectedIcon(iconName)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                            isSelected ? "bg-gold/20 ring-2 ring-gold scale-110 shadow-lg" : "bg-deep-black hover:bg-surface-light text-text-secondary"
                          }`}
                        >
                          <IconComp className="w-6 h-6" style={{ color: isSelected ? activeColor : undefined }} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color picker */}
                <div>
                  <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3 ml-1">Couleur</p>
                  <div className="flex flex-wrap gap-3">
                    {AVATAR_COLORS.map((color) => {
                      const isSelected = editingProfile ? editSelectedColor === color : selectedColor === color;
                      return (
                        <button
                          key={color}
                          onClick={() => editingProfile ? setEditSelectedColor(color) : setSelectedColor(color)}
                          className={`w-10 h-10 rounded-full transition-all duration-200 ${
                            isSelected ? "ring-2 ring-offset-4 ring-offset-surface ring-white scale-110 shadow-lg" : "hover:scale-110 hover:ring-2 hover:ring-white/30"
                          }`}
                          style={{ background: color }}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                {/* Save/Create button */}
                <button
                  onClick={editingProfile ? saveProfile : createProfile}
                  disabled={(editingProfile ? !editName.trim() : !newName.trim()) || isCreating || isSaving}
                  className="w-full py-4 rounded-full text-base font-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 shadow-xl"
                  style={{ background: "var(--gold)", color: "var(--deep-black)" }}
                >
                  {isCreating || isSaving ? (
                    <div className="w-5 h-5 border-2 border-deep-black/30 border-t-deep-black rounded-full animate-spin" />
                  ) : (
                    editingProfile ? "Enregistrer les modifications" : "Créer le profil"
                  )}
                </button>

                {/* Delete button (only in edit mode) */}
                {editingProfile && (
                  <button
                    onClick={() => removeProfile(editingProfile.id)}
                    className="w-full py-3 rounded-full text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors border border-transparent hover:border-red-500/30"
                  >
                    Supprimer ce profil
                  </button>
                )}
              </div>
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
            className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-sm rounded-[2rem] p-8 md:p-10 space-y-8 text-center shadow-2xl relative"
              style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
            >
              <button 
                onClick={() => setPinProfile(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-deep-black/50 hover:bg-surface-light text-text-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center shadow-lg shadow-gold/10" style={{ background: "var(--deep-black)", border: "2px solid var(--gold)" }}>
                <Lock className="w-8 h-8 text-gold" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-text-primary mb-2">Profil Verrouillé</h2>
                <p className="text-text-muted font-medium">
                  Code requis pour <span className="text-gold font-bold">{pinProfile.name}</span>
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, "")); setPinError(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") confirmPin(); }}
                  placeholder="• • • •"
                  className={`w-full text-center text-3xl tracking-[0.75em] font-black px-6 py-5 rounded-2xl outline-none transition-all shadow-inner ${
                    pinError ? "border-red-500 shadow-red-500/10" : "focus:border-gold/50 focus:shadow-gold/10"
                  }`}
                  style={{
                    background: "var(--deep-black)",
                    border: `2px solid ${pinError ? "#ef4444" : "var(--surface-light)"}`,
                    color: "var(--text-primary)",
                  }}
                  autoFocus
                />
                
                <AnimatePresence>
                  {pinError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-sm font-bold bg-red-400/10 py-2 rounded-lg"
                    >
                      Le code PIN est incorrect.
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={confirmPin}
                disabled={pinInput.length !== 4}
                className="w-full py-4 rounded-full text-lg font-black transition-all disabled:opacity-30 disabled:hover:scale-100 hover:scale-105 active:scale-95 shadow-xl shadow-gold/20 disabled:shadow-none bg-gold text-deep-black"
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
