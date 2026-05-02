'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus } from 'lucide-react'

interface MediaCardProps {
  id: string
  title: string
  posterUrl: string
  accentColor?: string
  type?: 'movie' | 'series'
}

export function MediaCard({ id, title, posterUrl, accentColor = '#EAB308', type = 'movie' }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)

  return (
    <motion.div
      className="relative shrink-0 w-[170px] md:w-[210px] aspect-[2/3] group cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 22 }}
    >
      {/* Ambient glow behind card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute -inset-3 rounded-[20px] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              background: `radial-gradient(circle at center, ${accentColor}22 0%, transparent 70%)`,
              boxShadow: `0 20px 60px -15px ${accentColor}33`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Card body */}
      <div className="absolute inset-0 rounded-xl overflow-hidden bg-surface">
        {/* Skeleton placeholder */}
        {!imgLoaded && <div className="absolute inset-0 skeleton" />}

        {/* Poster image */}
        <motion.img
          src={posterUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          onLoad={() => setImgLoaded(true)}
          style={{ opacity: imgLoaded ? 1 : 0 }}
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />

        {/* Hover overlay */}
        <div
          className="absolute inset-0 z-10 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-xl"
          style={{
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
          }}
        >
          <motion.div
            animate={{ y: isHovered ? 0 : 16, opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="label-refined mb-1.5 text-white/50" style={{ fontSize: '9px' }}>
              {type === 'movie' ? 'Film' : 'Série'}
            </div>
            <h4 className="font-display font-bold text-white text-sm md:text-base leading-tight mb-4 line-clamp-2">
              {title}
            </h4>

            <div className="flex gap-2">
              <button
                className="flex-1 h-9 rounded-md flex items-center justify-center transition-all duration-300 active:scale-95 text-black font-bold"
                style={{ backgroundColor: accentColor, boxShadow: `0 4px 20px -4px ${accentColor}66` }}
              >
                <Play size={16} fill="currentColor" />
              </button>
              <button className="w-9 h-9 rounded-md flex items-center justify-center border border-white/15 bg-white/5 hover:bg-white/15 transition-all duration-300 active:scale-95">
                <Plus size={16} />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Subtle border on hover */}
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          animate={{
            boxShadow: isHovered
              ? `inset 0 0 0 1px ${accentColor}30`
              : 'inset 0 0 0 1px rgba(255,255,255,0.04)',
          }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </motion.div>
  )
}
