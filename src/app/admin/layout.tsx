'use client'

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
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

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

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* ── Sidebar ── */}
      <aside className="w-72 frost-effect border-r border-white/5 flex flex-col z-[100]">
        <div className="h-20 flex items-center px-8">
          <Link href="/" className="title-hero text-xl tracking-tighter">
            STREAM<span className="text-white/30">VAULT</span>
            <span className="ml-2 text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded font-sans font-bold italic tracking-normal uppercase">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-8 flex flex-col gap-2">
          <div className="label-refined px-4 mb-4">Navigation</div>
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300",
                  isActive ? "bg-accent/10 text-accent" : "hover:bg-white/5 text-white/50 hover:text-white"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={isActive ? "text-accent" : "text-inherit"} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div layoutId="active-pill" className="w-1.5 h-1.5 rounded-full bg-accent" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-white/5 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors text-sm font-medium">
            <Settings size={18} />
            Paramètres
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-colors text-sm font-medium">
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-10 frost-effect z-50">
          <div className="flex items-center gap-3 text-sm">
            <span className="text-white/40">Admin</span>
            <ChevronRight size={14} className="text-white/20" />
            <span className="font-medium">Dashboard</span>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end">
                <span className="text-sm font-bold">Admin StreamVault</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Plan Ultimate</span>
             </div>
             <div className="w-10 h-10 rounded-full bg-surface-light border border-white/10 flex items-center justify-center">
                <Users size={20} className="text-accent" />
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {children}
        </div>
      </main>
    </div>
  )
}
