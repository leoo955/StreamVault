import { LayoutDashboard, Film, Tv, Users, Ticket, Activity, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AdminDashboard() {
  const stats = [
    { label: 'Utilisateurs', value: '12', icon: Users, trend: '+2 cette semaine', color: '#3B82F6' },
    { label: 'Films', value: '148', icon: Film, trend: '+12 ce mois', color: '#EAB308' },
    { label: 'Séries', value: '42', icon: Tv, trend: '+3 ce mois', color: '#8B5CF6' },
    { label: 'Invitations', value: '5', icon: Ticket, trend: '8 disponibles', color: '#10B981' },
  ]

  const recentActivity = [
    { id: 1, action: 'Nouvel utilisateur', user: 'romain', time: 'il y a 2h', icon: Users },
    { id: 2, action: 'Film ajouté', user: 'admin', details: 'Dune: Part Two', time: 'il y a 5h', icon: Film },
    { id: 3, action: 'Invitation créée', user: 'admin', details: 'CODE-XYZ', time: 'il y a 1j', icon: Ticket },
  ]

  return (
    <div className="space-y-12">
      {/* ── Welcome Header ── */}
      <div className="flex flex-col gap-2">
        <h2 className="title-section text-white flex items-center gap-4">
          <LayoutDashboard className="text-accent" size={32} />
          Vue d'ensemble
        </h2>
        <p className="text-white/40 font-medium tracking-wide uppercase text-[11px]">
          Statistiques et activités de votre instance StreamVault
        </p>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="frost-effect p-6 rounded-2xl border border-white/5 flex flex-col gap-4 group hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${stat.color}15`, color: stat.color }}
              >
                <stat.icon size={24} />
              </div>
              <TrendingUp className="text-white/10 group-hover:text-accent transition-colors" size={20} />
            </div>
            
            <div>
              <div className="text-3xl font-black font-display tracking-tight text-white mb-1">
                {stat.value}
              </div>
              <div className="label-refined text-[10px]">{stat.label}</div>
            </div>

            <div className="text-[10px] text-white/30 font-bold uppercase tracking-wider mt-2 pt-4 border-t border-white/5">
              {stat.trend}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Activity & Actions ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="label-refined text-white/60 flex items-center gap-2">
              <Activity size={14} />
              Activités récentes
            </h3>
            <span className="text-[10px] text-white/30 font-bold uppercase cursor-pointer hover:text-white transition-colors">Voir tout</span>
          </div>

          <div className="flex flex-col gap-3">
            {recentActivity.map((item) => (
              <div key={item.id} className="frost-effect p-4 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-accent transition-colors">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white/90">{item.action}</div>
                    <div className="text-[11px] text-white/40">
                      par <span className="text-white/60">{item.user}</span> {item.details && `· ${item.details}`}
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-white/20 font-bold uppercase tracking-widest">
                  {item.time}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <h3 className="label-refined text-white/60">Actions rapides</h3>
          <div className="flex flex-col gap-4">
            <button className="btn-primary w-full justify-start py-4">
              <PlusSquareIcon size={18} />
              <span>Ajouter un média</span>
            </button>
            <button className="btn-glass w-full justify-start py-4 border-white/5">
              <Ticket size={18} />
              <span>Générer un code</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlusSquareIcon({ size }: { size: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
      <path d="M12 8v8"/>
      <path d="M8 12h8"/>
    </svg>
  )
}
