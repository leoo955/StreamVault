"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ArrowLeft,
  Settings,
  Subtitles,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  id: string;
  title: string;
  posterUrl?: string;
  streamUrl?: string;
}

export function VideoPlayer({ id, title, posterUrl, streamUrl }: VideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // --- UI State ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);

  // --- Logic: Controls Visibility ---
  const hideControls = useCallback(() => {
    setShowControls(false);
  }, []);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(hideControls, 3000);
  }, [hideControls]);

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [resetControlsTimeout]);

  // --- Logic: Video Handlers ---
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
    resetControlsTimeout();
  }, [isPlaying, resetControlsTimeout]);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    setCurrentTime(videoRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    setIsLoading(false);
  };

  const seek = (amount: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += amount;
    resetControlsTimeout();
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = parseFloat(e.target.value);
    videoRef.current.currentTime = time;
    setCurrentTime(time);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    resetControlsTimeout();
  };

  // --- Formatting ---
  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          toggleFullscreen();
          break;
        case "m":
          toggleMute();
          break;
        case "arrowleft":
          seek(-10);
          break;
        case "arrowright":
          seek(10);
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay]);

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && hideControls()}
      className="relative w-screen h-screen bg-black overflow-hidden flex items-center justify-center cursor-none group"
      style={{ cursor: showControls ? 'default' : 'none' }}
    >
      {/* ── Video Element ── */}
      <video
        ref={videoRef}
        src={streamUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} // Demo video
        poster={posterUrl}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => { setIsLoading(false); setIsPlaying(true); }}
        onPause={() => setIsPlaying(false)}
        muted={isMuted}
        volume={volume}
        onClick={togglePlay}
        autoPlay
      />

      {/* ── Loading Overlay ── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <Loader2 className="w-12 h-12 text-white animate-spin opacity-50" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 z-50 p-8 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent"
          >
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-4 text-white/60 hover:text-white transition-all duration-300 group/back"
            >
              <ArrowLeft className="group-hover/back:-translate-x-1 transition-transform" />
              <div className="flex flex-col items-start">
                <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Quitter la lecture</span>
                <span className="text-xl font-display font-black italic uppercase tracking-tighter">{title}</span>
              </div>
            </button>

            <div className="flex items-center gap-6">
               <button className="text-white/40 hover:text-white transition-colors">
                  <Subtitles size={20} />
               </button>
               <button className="text-white/40 hover:text-white transition-colors">
                  <Settings size={20} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom Controls ── */}
      <AnimatePresence>
        {showControls && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-0 left-0 right-0 z-50 px-8 pb-10 pt-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col gap-6"
          >
            
            {/* Timeline */}
            <div className="relative group/timeline w-full flex flex-col gap-2">
              <div className="flex justify-between text-[10px] font-mono font-bold tracking-widest text-white/30 px-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              
              <div className="relative w-full h-1.5 md:h-1 flex items-center">
                 <input
                   type="range"
                   min={0}
                   max={duration || 0}
                   value={currentTime}
                   onChange={handleTimelineChange}
                   onMouseEnter={() => setIsHoveringTimeline(true)}
                   onMouseLeave={() => setIsHoveringTimeline(false)}
                   className="absolute inset-0 w-full h-full opacity-0 z-30 cursor-pointer"
                 />
                 {/* Custom Rail */}
                 <div className="absolute inset-0 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-white"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                 </div>
                 {/* Hover Glow / Handle */}
                 <motion.div 
                    className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_#fff] z-20 pointer-events-none"
                    animate={{ 
                      left: `${(currentTime / duration) * 100}%`,
                      scale: isHoveringTimeline ? 1.2 : 0,
                      opacity: isHoveringTimeline ? 1 : 0
                    }}
                    style={{ transform: 'translateX(-50%)' }}
                 />
              </div>
            </div>

            {/* Main Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-8 md:gap-10">
                <button onClick={() => seek(-10)} className="text-white/40 hover:text-white transition-all active:scale-90">
                  <RotateCcw size={28} strokeWidth={1.5} />
                </button>
                
                <button 
                  onClick={togglePlay} 
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                >
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                </button>

                <button onClick={() => seek(10)} className="text-white/40 hover:text-white transition-all active:scale-90">
                  <RotateCw size={28} strokeWidth={1.5} />
                </button>

                <div className="flex items-center gap-4 group/volume ml-4">
                   <button onClick={toggleMute} className="text-white/40 hover:text-white transition-colors">
                      {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
                   </button>
                   <input 
                     type="range"
                     min={0}
                     max={1}
                     step={0.05}
                     value={isMuted ? 0 : volume}
                     onChange={(e) => { setVolume(parseFloat(e.target.value)); setIsMuted(false); }}
                     className="w-0 group-hover/volume:w-24 transition-all duration-500 opacity-0 group-hover/volume:opacity-100 accent-white h-1 rounded-full cursor-pointer"
                   />
                </div>
              </div>

              <div className="flex items-center gap-8">
                 <div className="hidden lg:flex flex-col items-end mr-4">
                    <span className="text-[10px] font-bold tracking-[0.2em] text-white/20 uppercase">Qualité</span>
                    <span className="text-xs font-black tracking-widest text-white/60">4K ULTRA HD</span>
                 </div>
                 <button onClick={toggleFullscreen} className="text-white/40 hover:text-white transition-all active:scale-90">
                   {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
                 </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cinematic Overlay Effect ── */}
      <div className="absolute inset-0 pointer-events-none z-10 bg-black/10 mix-blend-overlay opacity-30" />
      
    </div>
  );
}
