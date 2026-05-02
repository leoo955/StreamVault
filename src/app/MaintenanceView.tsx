"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

// --- Game Constants ---
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Moving UP
const GAME_SPEED = 120; // ms

export default function MaintenanceView() {
  const router = useRouter();
  // UI State
  const [showGame, setShowGame] = useState(false);

  // Game State
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const lastDirectionRef = useRef(INITIAL_DIRECTION);

  // --- Logic: Random Food ---
  const generateFood = useCallback((currentSnake: typeof INITIAL_SNAKE) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // Ensure food doesn't land on snake
      const onSnake = currentSnake.some(seg => seg.x === newFood.x && seg.y === newFood.y);
      if (!onSnake) break;
    }
    return newFood;
  }, []);

  // --- Logic: Movement & Collisions ---
  const moveSnake = useCallback(() => {
    if (!showGame) return; // Don't move if hidden

    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      // Check Wall Collision
      if (
        newHead.x < 0 || 
        newHead.x >= GRID_SIZE || 
        newHead.y < 0 || 
        newHead.y >= GRID_SIZE
      ) {
        setIsGameOver(true);
        return prevSnake;
      }

      // Check Self Collision
      if (prevSnake.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
        setIsGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check Food Collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop(); // Remove tail
      }

      lastDirectionRef.current = direction;
      return newSnake;
    });
  }, [direction, food, generateFood, showGame]);

  // --- Admin Bypass Shortcut ---
  useEffect(() => {
    const handleAdminBypass = (e: KeyboardEvent) => {
      // Check for Ctrl + Alt + A
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'a') {
        router.push('/login');
      }
    };

    window.addEventListener('keydown', handleAdminBypass);
    return () => window.removeEventListener('keydown', handleAdminBypass);
  }, [router]);

  // --- Controls (Snake) ---
  useEffect(() => {
    if (!showGame) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const lastDir = lastDirectionRef.current;
      switch (e.key) {
        case 'ArrowUp':
        case 'z':
        case 'w':
          if (lastDir.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (lastDir.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'q':
        case 'a':
          if (lastDir.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (lastDir.x !== -1) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showGame]);

  // --- Game Loop ---
  useEffect(() => {
    if (showGame && !isGameOver && !isPaused) {
      gameLoopRef.current = setInterval(moveSnake, GAME_SPEED);
    } else {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    }
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, isGameOver, isPaused, showGame]);

  // --- Actions ---
  const restartGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood({ x: 5, y: 5 });
    setIsGameOver(false);
    setScore(0);
    setIsPaused(false);
    lastDirectionRef.current = INITIAL_DIRECTION;
  };

  return (
    <main className="min-h-[100dvh] w-full bg-deep-black flex flex-col items-center justify-center p-6 sm:p-12 overflow-hidden selection:bg-white selection:text-black font-sans text-white">
      
      {/* 0. Minimal Logo at Top */}
      <div className="absolute top-8 left-0 right-0 flex justify-center pointer-events-none">
        <span className="font-display font-black italic text-xl uppercase tracking-tighter text-white/20">
          StreamVault
        </span>
      </div>

      {/* 1. Typographic Header */}
      <div className="flex flex-col items-center text-center mb-10 space-y-4 max-w-xl">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={() => setShowGame(!showGame)}
          className="font-display font-black italic uppercase text-7xl md:text-9xl tracking-tighter text-white cursor-pointer select-none active:scale-95 transition-transform"
        >
          Oops.
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="text-sm md:text-base tracking-tight font-light leading-relaxed px-4"
        >
          Le serveur est en pause pour maintenance.<br className="hidden sm:block" />
          Revenez d'ici quelques minutes pour la suite du spectacle.
        </motion.p>
      </div>

      {/* 2. Snake Game Board - Hidden by default */}
      <AnimatePresence>
        {showGame && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="relative group"
          >
            {/* Game Container */}
            <div 
              className="relative w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] border border-white/10 bg-white/[0.02] overflow-hidden"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
              }}
            >
              {/* Render Food */}
              <div 
                className="bg-white/40 animate-pulse"
                style={{
                  gridColumnStart: food.x + 1,
                  gridRowStart: food.y + 1,
                  borderRadius: '2px',
                }}
              />

              {/* Render Snake */}
              {snake.map((seg, i) => (
                <div 
                  key={`${seg.x}-${seg.y}-${i}`}
                  className="bg-white"
                  style={{
                    gridColumnStart: seg.x + 1,
                    gridRowStart: seg.y + 1,
                    opacity: 1 - (i / snake.length) * 0.5, // Fading tail
                    borderRadius: '1px',
                    zIndex: snake.length - i,
                  }}
                />
              ))}

              {/* Overlays */}
              <AnimatePresence>
                {(isGameOver || isPaused) && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm"
                  >
                    {isGameOver ? (
                      <>
                        <p className="font-display italic font-bold uppercase tracking-widest text-white/50 mb-4">Game Over</p>
                        <p className="text-3xl font-black mb-8 italic uppercase tracking-tighter">{score} points</p>
                        <button 
                          onClick={restartGame}
                          className="px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-transform"
                        >
                          Rejouer
                        </button>
                      </>
                    ) : (
                      <>
                        <p className="font-display italic font-bold uppercase tracking-widest text-white/50 mb-4">Pause</p>
                        <button 
                          onClick={() => setIsPaused(false)}
                          className="px-8 py-3 bg-white text-black font-bold uppercase text-xs tracking-[0.2em] hover:scale-105 active:scale-95 transition-transform"
                        >
                          Continuer
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Score Indicator */}
            <div className="absolute -top-6 left-0 right-0 flex justify-between items-end px-1 opacity-20">
              <span className="text-[10px] uppercase tracking-[0.3em] font-bold">Snake System v1</span>
              <span className="text-xs font-mono">{score.toString().padStart(4, '0')}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Footer info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        className="mt-16 flex flex-col items-center gap-2 text-white/10"
      >
      </motion.div>

      {/* Cinematic Grain Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-[100] opacity-[0.015] mix-blend-overlay" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' 
        }} 
      />

    </main>
  );
}
