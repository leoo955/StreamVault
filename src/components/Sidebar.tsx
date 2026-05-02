"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Home, 
  Film, 
  Tv, 
  Search, 
  Plus, 
  User,
  Bell,
  LogOut,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/lib/userProvider";

/**
 * Sidebar component (Navigation)
 * Desktop: Fixed top navbar with frosted glass.
 * Mobile: Floating bottom tab bar.
 */
export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useUser();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Routes where the sidebar should be hidden
  const hideOnRoutes = ["/login", "/register", "/offline", "/profiles", "/maintenance"];
  if (hideOnRoutes.includes(pathname)) return null;

  const navLinks = [
    { name: "Accueil", href: "/", icon: Home },
    { name: "Films", href: "/movies", icon: Film },
    { name: "Séries", href: "/series", icon: Tv },
    { name: "Ma Liste", href: "/my-list", icon: Plus },
    { name: "Recherche", href: "/search", icon: Search },
  ];

  // Get active profile (from cookie or state - ideally we'd have it in UserContext)
  // For now, let's assume we can get it or just show the user avatar
  const activeProfile = user?.profiles?.[0]; // Fallback to first profile

  return (
    <>
      {/* ── Desktop Navbar ── */}
      <nav 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 hidden md:flex items-center justify-between px-8 md:px-12 h-20",
          isScrolled ? "frost-effect h-16 shadow-2xl" : "bg-transparent"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-display font-black italic text-2xl uppercase tracking-tighter text-white">
            StreamVault
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-8 lg:gap-12">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-link text-sm font-bold uppercase tracking-widest transition-colors duration-300",
                  isActive ? "text-white" : "text-white/40 hover:text-white/80"
                )}
              >
                {link.name}
                {isActive && (
                  <motion.div 
                    layoutId="navUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-white"
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <button className="text-white/60 hover:text-white transition-colors duration-300">
            <Bell className="w-5 h-5" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 p-1 rounded-full hover:bg-white/5 transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/10">
                {activeProfile?.avatarUrl ? (
                  <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold uppercase">
                    {activeProfile?.name?.charAt(0) || "U"}
                  </div>
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform duration-300", isProfileOpen && "rotate-180")} />
            </button>

            {/* Profile Dropdown */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-4 w-56 glass-card-strong p-2 shadow-2xl"
                >
                  <Link href="/profiles" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium">Changer de profil</span>
                  </Link>
                  <Link href="/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                    <User className="w-4 h-4 text-white/60" />
                    <span className="text-sm font-medium">Paramètres</span>
                  </Link>
                  <div className="h-px bg-white/5 my-2" />
                  <button 
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Se déconnecter</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* ── Mobile Tab Bar ── */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden w-[90%] max-w-sm">
        <div className="frost-effect rounded-2xl flex items-center justify-around p-3 shadow-2xl border-white/10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.href}
                href={link.href}
                className={cn(
                  "relative flex flex-col items-center gap-1 transition-all duration-300",
                  isActive ? "text-white" : "text-white/40"
                )}
              >
                <link.icon className={cn("w-6 h-6", isActive && "scale-110")} />
                {isActive && (
                  <motion.div 
                    layoutId="mobileNavDot"
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile Top Header */}
      <div className="fixed top-0 left-0 right-0 z-50 md:hidden flex items-center justify-between px-6 h-16 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <Link href="/" className="font-display font-black italic text-xl uppercase tracking-tighter text-white">
            StreamVault
          </Link>
        </div>
        <div className="flex items-center gap-4 pointer-events-auto">
          <Link href="/search">
            <Search className="w-6 h-6 text-white" />
          </Link>
          <Link href="/profiles" className="w-8 h-8 rounded-lg overflow-hidden bg-white/10">
            {activeProfile?.avatarUrl ? (
              <img src={activeProfile.avatarUrl} alt={activeProfile.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 text-xs font-bold uppercase">
                {activeProfile?.name?.charAt(0) || "U"}
              </div>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}
