'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Film, 
  Tv, 
  Users, 
  Settings, 
  Ticket, 
  BarChart3,
  LogOut,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/Sidebar'
import { useUser } from '@/lib/userProvider'

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Film, label: 'Films', href: '/admin/media/movies' },
  { icon: Tv, label: 'Séries', href: '/admin/media/series' },
  { icon: Ticket, label: 'Invitations', href: '/admin/invitations' },
  { icon: Users, label: 'Utilisateurs', href: '/admin/users' },
  { icon: BarChart3, label: 'Statistiques', href: '/admin/stats' },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isLoading, logout } = useUser()

  // Guard: Only admins can see this section
  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.replace('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-white/5 border-t-white animate-spin"></div>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return null // Will redirect via useEffect
  }

  return (
    <div className="flex h-screen overflow-hidden bg-black text-white selection:bg-white selection:text-black pt-20">
      {/* ── Admin Sidebar ── */}
      <aside className="w-72 frost-effect border-r border-white/5 flex flex-col z-[40]">
        <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
          <div className="label-refined px-6 mb-4 text-white/20">Menu Admin</div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href))
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-6 py-4 rounded-2xl transition-all duration-500",
                  isActive ? "bg-white/5 text-white shadow-[0_0_40px_rgba(255,255,255,0.03)]" : "hover:bg-white/[0.03] text-white/30 hover:text-white/70"
                )}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={cn("transition-colors duration-500", isActive ? "text-white" : "text-white/20 group-hover:text-white/50")} />
                  <span className="font-sans font-bold uppercase tracking-[0.2em] text-[10px]">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill-admin" className="w-1 h-1 rounded-full bg-white shadow-[0_0_10px_#fff]" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-6 mt-auto border-t border-white/5 flex flex-col gap-3">
          <button onClick={() => router.push('/settings')} className="flex items-center gap-4 px-6 py-4 rounded-xl text-white/20 hover:text-white/60 hover:bg-white/[0.02] transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            <Settings size={16} />
            Paramètres
          </button>
          <button onClick={logout} className="flex items-center gap-4 px-6 py-4 rounded-xl text-red-500/40 hover:text-red-500 hover:bg-red-500/[0.03] transition-all duration-500 text-[10px] font-bold uppercase tracking-[0.2em]">
            <LogOut size={16} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0 min-h-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-12 bg-black/50 backdrop-blur-3xl z-30">
          <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-[0.3em]">
            <span className="text-white/20">Système</span>
            <ChevronRight size={12} className="text-white/10" />
            <span className="text-white/60">Gestion</span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="flex flex-col items-end gap-0.5">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80">Administrateur</span>
                <span className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Privilèges Totaux</span>
             </div>
             <div className="w-10 h-10 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-white/40">
                <Users size={18} />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#000000] px-12 pt-12">
          {children}
          {/* Spacer to guarantee bottom padding */}
          <div className="h-12 w-full shrink-0"></div>
        </div>
      </main>
    </div>
  )

}

