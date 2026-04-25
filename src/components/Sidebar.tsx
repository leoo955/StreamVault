"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  TrendingUp,
  Film,
  Tv,
  Heart,
  Settings,
  Search,
  LayoutDashboard,
  LogIn,
  LogOut,
  User,
  ChevronDown,
  Download,
  MessageSquare,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useUser } from "@/lib/userProvider";

import NotificationBell from "./NotificationBell";
import PwaInstallButton from "./PwaInstallButton";

interface UserData {
  username: string;
  role: "admin" | "user";
}

const NAV_ITEMS = [
  { icon: Home, labelKey: "nav.home", href: "/" },
  { icon: TrendingUp, labelKey: "nav.trending", href: "/trending" },
  { icon: Film, labelKey: "nav.movies", href: "/movies" },
  { icon: Tv, labelKey: "nav.series", href: "/series" },
  { icon: Heart, labelKey: "nav.myList", href: "/my-list" },
  { icon: Download, labelKey: "Téléchargements", href: "/downloads" },
];

export default function Sidebar() {
  const { user: userData, setUser } = useUser();
  const user = userData as UserData | null;
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();

  const hideSidebar =
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register") ||
    pathname?.startsWith("/watch") ||
    pathname?.startsWith("/profiles");

  // Close user menu on click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showUserMenu]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setShowUserMenu(false);
    router.push("/login");
  };

  if (hideSidebar) return null;

  return (
    <>
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 transition-all"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          paddingBottom: "12px",
        }}
      >
        <Link href="/" className="flex items-center gap-2">
          <img src="/icon-192.png" alt="Logo" className="w-7 h-7 rounded-full object-contain" />
          <span className="font-bold text-sm gold-text tracking-tight">StreamVault</span>
        </Link>
        <div className="flex items-center gap-2">
          <PwaInstallButton />
          <Link href="/search" className="p-2 text-text-muted hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </Link>
          {user && <NotificationBell />}
        </div>
      </header>

      {/* ===== DESKTOP: Top Horizontal Navbar ===== */}
      <header
        className="hidden md:flex fixed top-0 left-0 right-0 z-50 h-16 items-center justify-between px-6 transition-all"
        style={{
          background: "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
          paddingBottom: "8px",
        }}
      >
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img src="/icon-192.png" alt="StreamVault Logo" className="w-8 h-8 rounded-full object-contain overflow-hidden" />
          <span className="font-bold text-base gold-text tracking-tight">StreamVault</span>
        </Link>

        {/* Center: Nav Items */}
        <nav className="flex items-center gap-7 lg:gap-12">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={`relative flex items-center transition-all duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-text-muted hover:text-white"
                  }`}
                >
                  <span className="text-[11px] lg:text-[13px] font-black tracking-[0.2em] uppercase">
                    {t(item.labelKey)}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute -bottom-2.5 left-0 right-0 h-[2.5px] rounded-full"
                      style={{ background: "var(--gold)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </div>
              </Link>
            );
          })}

          {user?.role === "admin" && (
            <Link href="/admin">
              <div
                className={`flex items-center transition-all duration-300 ${
                  pathname?.startsWith("/admin")
                    ? "text-gold"
                    : "text-text-muted hover:text-white"
                }`}
              >
                <span className="text-[11px] lg:text-[13px] font-black tracking-[0.2em] uppercase">
                  {t("nav.admin")}
                </span>
              </div>
            </Link>
          )}
        </nav>

        {/* Right: Search + Notifications + Account */}
        <div className="flex items-center gap-2 shrink-0">
          <PwaInstallButton />
          
          <Link href="/search" className="p-2.5 rounded-lg hover:bg-white/5 text-text-muted hover:text-text-primary transition-colors">
            <Search className="w-5 h-5" />
          </Link>

          {/* Notifications */}
          {user && <NotificationBell />}

          {/* Account */}
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  style={{ background: "var(--gold-glow)", color: "var(--gold)", border: "1.5px solid var(--gold)" }}
                >
                  {user.username[0]?.toUpperCase()}
                </div>
                <ChevronDown className={`w-3 h-3 text-text-muted transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-xl overflow-hidden shadow-2xl z-[200]"
                    style={{ background: "var(--surface)", border: "1px solid var(--surface-light)" }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: "var(--surface-light)" }}>
                      <p className="text-sm font-semibold text-text-primary">{user.username}</p>
                      <p className="text-[10px] text-text-muted uppercase tracking-wider mt-0.5">{user.role}</p>
                    </div>
                    <div className="p-1.5">
                      <Link href="/profiles" onClick={() => setShowUserMenu(false)}>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors">
                          <User className="w-4 h-4" /> Profils
                        </div>
                      </Link>
                      <Link href="/settings" onClick={() => setShowUserMenu(false)}>
                        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors">
                          <Settings className="w-4 h-4" /> Réglages
                        </div>
                      </Link>
                      <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Déconnexion
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/login">
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-gold hover:bg-gold/10 transition-colors">
                <LogIn className="w-4 h-4" />
                <span>{t("nav.login")}</span>
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* ===== MOBILE: Bottom Tab Bar (Premium Redesign) ===== */}
      <nav
        className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center justify-between px-6 py-3 w-[min(90vw,400px)] rounded-full shadow-2xl"
        style={{
          background: "rgba(10, 10, 10, 0.85)",
          backdropFilter: "blur(16px) saturate(180%)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4), inset 0 0 20px rgba(255,255,255,0.02)",
        }}
      >
        {(() => {
          const mobileItems: { icon: any; label: string; href: string }[] = [
            { icon: Search, label: "Recherche", href: "/search" },
            { icon: Download, label: "Télécharger", href: "/downloads" },
            { icon: Home, label: "Accueil", href: "/" },
            { icon: Heart, label: "Favoris", href: "/my-list" },
          ];
          if (user?.role === "admin") {
            mobileItems.push({ icon: LayoutDashboard, label: "Admin", href: "/admin" });
          }
          mobileItems.push({ icon: User, label: "Compte", href: "/settings" });
          return mobileItems;
        })().map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
          const isHome = item.icon === Home;

          return (
            <Link key={item.href} href={item.href} className="relative outline-none">
              <motion.div
                className="flex flex-col items-center justify-center transition-all duration-300"
                animate={{
                  scale: isActive ? 1.2 : 1,
                  y: isActive && isHome ? -4 : 0,
                }}
              >
                <div
                  className={`flex items-center justify-center transition-all duration-300 ${
                    isHome && isActive
                      ? "w-11 h-11 rounded-full bg-gold shadow-[0_0_20px_rgba(198,165,92,0.4)]"
                      : isHome
                      ? "w-11 h-11 rounded-full bg-white/5"
                      : ""
                  }`}
                >
                  <item.icon
                    className={`transition-all duration-300 ${
                      isActive
                        ? isHome ? "text-deep-black w-5 h-5" : "text-gold w-6 h-6"
                        : "text-text-muted hover:text-white w-5 h-5"
                    }`}
                  />
                </div>
                
                {!isHome && (
                  <motion.div
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0, y: isActive ? 4 : 8 }}
                    className="absolute -bottom-4 h-1 w-1 rounded-full bg-gold"
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
