'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Search, Bell, User, ChevronRight, Star, Clock, Volume2, VolumeX } from 'lucide-react'
import { MediaCard } from '@/components/MediaCard'

const HERO_ITEMS = [
  {
    id: '1',
    title: 'DUNE\nPART TWO',
    tagline: 'Exclusivité',
    year: '2024',
    duration: '2h 46m',
    quality: '4K HDR',
    rating: 8.6,
    description: "Paul Atréides s'unit à Chani et aux Fremen pour mener la révolte contre ceux qui ont anéanti sa famille.",
    backdrop: 'https://image.tmdb.org/t/p/original/8rpDcsfLJypbO6vtec0gZ9mSNEh.jpg',
    color: '#B66A42',
  },
  {
    id: '2',
    title: 'OPPEN\nHEIMER',
    tagline: 'Primé aux Oscars',
    year: '2023',
    duration: '3h 01m',
    quality: '4K HDR',
    rating: 8.5,
    description: "L'histoire du physicien J. Robert Oppenheimer et de son rôle dans le développement de la bombe atomique.",
    backdrop: 'https://image.tmdb.org/t/p/original/nb3xI8XI3w4pMVZ38VijbsyBqP4.jpg',
    color: '#EAB308',
  },
  {
    id: '3',
    title: 'INTER\nSTELLAR',
    tagline: 'Chef-d\'œuvre',
    year: '2014',
    duration: '2h 49m',
    quality: '4K IMAX',
    rating: 8.7,
    description: "Un groupe d'explorateurs utilise un trou de ver découvert récemment pour dépasser les limites de l'espace.",
    backdrop: 'https://image.tmdb.org/t/p/original/xu9zaAevzQ5nnrsXN6JcahLnG4i.jpg',
    color: '#3B82F6',
  },
]

const TRENDING = [
  { id: '1', title: 'Dune: Part Two', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8b8R8l88Qje9dn9OE8v03xP5X2h.jpg', color: '#B66A42' },
  { id: '2', title: 'Oppenheimer', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Gxv8gSFCU0XGDykEGvHLCR7Sqk.jpg', color: '#EAB308' },
  { id: '3', title: 'Spider-Verse', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg', color: '#E11D48' },
  { id: '4', title: 'The Batman', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/74xTEgt7R36Fpooo50r9T25onhq.jpg', color: '#DC2626' },
  { id: '5', title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', color: '#3B82F6' },
  { id: '6', title: 'Inception', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/ljsZTbVsrQSqZgWeep2B1QiDKuh.jpg', color: '#6366F1' },
  { id: '7', title: 'Blade Runner', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg', color: '#F97316' },
]

const RECENT = [
  { id: '10', title: 'Civil War', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg', color: '#84CC16' },
  { id: '11', title: 'Furiosa', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', color: '#F59E0B' },
  { id: '12', title: 'Inside Out 2', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/vpnVM9B6NMmQpWeZvzLvDESb2QY.jpg', color: '#8B5CF6' },
  { id: '13', title: 'Deadpool 3', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg', color: '#EF4444' },
  { id: '14', title: 'Alien: Romulus', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/b33nnKl1GSFbao4l3fZDDqsMx0F.jpg', color: '#059669' },
  { id: '15', title: 'Gladiator II', poster: 'https://image.tmdb.org/t/p/w600_and_h900_bestv2/2cxhvwyEwRlysAmRH4iodkvo0z5.jpg', color: '#D97706' },
]

const HERO_INTERVAL = 10000

export default function Home() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [navScrolled, setNavScrolled] = useState(false)

  const hero = HERO_ITEMS[heroIndex]

  const nextHero = useCallback(() => {
    setHeroIndex(prev => (prev + 1) % HERO_ITEMS.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(nextHero, HERO_INTERVAL)
    return () => clearInterval(timer)
  }, [nextHero])

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="flex-1 w-full bg-black scrollbar-hide overflow-x-hidden" style={{ '--accent': hero.color } as React.CSSProperties}>

      {/* ━━ Navbar ━━ */}
      <header
        className="fixed top-0 inset-x-0 h-20 z-[100] px-8 md:px-12 flex items-center justify-between transition-all duration-700"
        style={{
          background: navScrolled ? 'rgba(255,255,255,0.03)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(24px) saturate(140%)' : 'none',
          WebkitBackdropFilter: navScrolled ? 'blur(24px) saturate(140%)' : 'none',
          borderBottom: navScrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center gap-12">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="title-hero text-2xl cursor-default select-none"
          >
            STREAM<span className="text-white/30 font-light italic">VAULT</span>
          </motion.h1>

          <nav className="hidden md:flex items-center gap-8">
            {['Accueil', 'Films', 'Séries', 'Ma Liste'].map((item, i) => (
              <motion.span
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="nav-link label-refined"
              >
                {item}
              </motion.span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-6 text-white/50">
          <Search size={20} className="hover:text-white cursor-pointer transition-colors duration-300" />
          <Bell size={20} className="hover:text-white cursor-pointer transition-colors duration-300" />
          <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-all duration-300">
            <User size={16} />
          </div>
        </div>
      </header>

      {/* ━━ Hero Section — 100vh ━━ */}
      <section className="relative h-screen w-full flex flex-col justify-end overflow-hidden">
        {/* Backdrop images with crossfade */}
        <AnimatePresence mode="wait">
          <motion.div
            key={hero.id}
            initial={{ opacity: 0, scale: 1.08 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${hero.backdrop}')` }}
          />
        </AnimatePresence>

        {/* Cinematic Gradients — vertical + horizontal */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent w-3/4" />
        {/* Subtle accent glow at the bottom */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[300px] opacity-15 pointer-events-none"
          style={{ background: `radial-gradient(ellipse at 25% 100%, ${hero.color}44 0%, transparent 70%)` }}
        />

        {/* Content */}
        <div className="relative z-10 px-8 md:px-12 pb-40 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              style={{ maxWidth: '672px', width: '100%' }}
            >
              {/* Meta badges */}
              <div className="flex items-center gap-4 mb-5">
                <span
                  className="px-3 py-1.5 rounded-md text-[10px] font-bold tracking-widest uppercase border"
                  style={{
                    backgroundColor: `${hero.color}20`,
                    borderColor: `${hero.color}40`,
                    color: hero.color,
                  }}
                >
                  {hero.tagline}
                </span>
                <div className="flex items-center gap-2 text-white/40 text-xs font-bold tracking-widest uppercase">
                  <Star size={12} className="text-yellow-400" fill="currentColor" />
                  <span>{hero.rating}</span>
                  <span className="text-white/15">·</span>
                  <span>{hero.year}</span>
                  <span className="text-white/15">·</span>
                  <Clock size={11} />
                  <span>{hero.duration}</span>
                  <span className="text-white/15">·</span>
                  <span>{hero.quality}</span>
                </div>
              </div>

              {/* Title — cinematic */}
              <h2 className="title-hero text-6xl md:text-8xl mb-7 whitespace-pre-line">
                {hero.title}
              </h2>

              {/* Description */}
              <p className="text-base md:text-lg text-white/60 font-normal leading-relaxed mb-10" style={{ maxWidth: '480px' }}>
                {hero.description}
              </p>

              {/* Action buttons */}
              <div className="flex flex-row items-center gap-4">
                <button className="btn-primary">
                  <Play size={20} fill="currentColor" />
                  <span>REGARDER</span>
                </button>
                <button className="btn-glass">
                  <Plus size={20} />
                  <span>MA LISTE</span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-12 left-8 md:left-12 flex gap-2">
            {HERO_ITEMS.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setHeroIndex(i)}
                className={`dot-indicator ${i === heroIndex ? 'active' : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Content Sections ━━ */}
      <div className="relative z-10 pb-32 space-y-20 pt-16">

        {/* Trending */}
        <MediaRow
          title="Tendances de la semaine"
          items={TRENDING}
          delay={0.3}
        />

        {/* Recently Added */}
        <MediaRow
          title="Récemment ajouté"
          items={RECENT}
          delay={0.5}
        />
      </div>

      {/* ━━ Footer ━━ */}
      <footer className="relative z-10 border-t border-white/[0.04] px-8 md:px-12 py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="title-hero text-xl text-white/10 select-none">
            STREAM<span className="font-light">VAULT</span>
          </div>
          <div className="flex gap-8">
            {['À propos', 'Conditions', 'Confidentialité', 'Contact'].map(link => (
              <span key={link} className="label-refined hover:text-white cursor-pointer transition-colors duration-300">
                {link}
              </span>
            ))}
          </div>
          <p className="text-white/15 text-xs">© 2024 StreamVault. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

/* ── MediaRow — Reusable section ── */
function MediaRow({ title, items, delay = 0 }: { title: string; items: typeof TRENDING; delay?: number }) {
  return (
    <section className="px-8 md:px-12">
      <div className="flex items-center justify-between mb-8">
        <motion.h3
          className="title-section"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay }}
        >
          {title}
        </motion.h3>
        <motion.span
          className="nav-link label-refined flex items-center gap-1"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: delay + 0.2 }}
        >
          Tout voir <ChevronRight size={14} />
        </motion.span>
      </div>

      <div className="relative -mx-8 md:-mx-12 px-8 md:px-12 overflow-x-auto scrollbar-hide mask-edge-fade">
        <div className="flex gap-5 md:gap-6 pb-8">
          {items.map((movie, i) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: delay + (i * 0.08) }}
            >
              <MediaCard
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster}
                accentColor={movie.color}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
