"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Hls from "hls.js";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  X,
  Gauge,
  PictureInPicture,
  Languages,
  Tv,
} from "lucide-react";
import Link from "next/link";

interface EpisodeNav {
  label: string;
  onPlay: () => void;
  thumbnailUrl?: string;
}

interface VideoPlayerProps {
  streamUrl: string;
  title: string;
  itemId: string;
  startPosition?: number;
  nextEpisode?: EpisodeNav;
  prevEpisode?: EpisodeNav;
  seasonNum?: number;
  episodeNum?: number;
  subtitles?: { name: string; language: string; url: string }[];
}

export default function VideoPlayer({
  streamUrl,
  title,
  itemId,
  startPosition = 0,
  nextEpisode,
  prevEpisode,
  seasonNum,
  episodeNum,
  subtitles = [],
}: VideoPlayerProps) {
  const [currentSubtitle, setCurrentSubtitle] = useState<string>("");
  const [parsedCues, setParsedCues] = useState<{ start: number; end: number; text: string }[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [activeSub, setActiveSub] = useState<number | null>(null);
  const [showSubMenu, setShowSubMenu] = useState(false);
  const [subtitleDelay, setSubtitleDelay] = useState(0.5);
  const [autoPlayCountdown, setAutoPlayCountdown] = useState(10);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showSkipIntro, setShowSkipIntro] = useState(false);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [resumeTimeLabel, setResumeTimeLabel] = useState("");
  const [hlsLevels, setHlsLevels] = useState<{ height: number; bitrate: number }[]>([]);
  const [currentQuality, setCurrentQuality] = useState(-1); // -1 = auto
  const [showQualityMenu, setShowQualityMenu] = useState(false);
  const [showSkipRecap, setShowSkipRecap] = useState(false);
  const [showEndCredits, setShowEndCredits] = useState(false);
  const [audioTracks, setAudioTracks] = useState<{id: number, name: string, language: string}[]>([]);
  const [currentAudioTrack, setCurrentAudioTrack] = useState<number>(-1);
  const [showAudioMenu, setShowAudioMenu] = useState(false);
  const hlsRef = useRef<Hls | null>(null);
  const speedMenuRef = useRef<HTMLDivElement>(null);

  const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  const changeSpeed = useCallback((speed: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
  }, []);

  const cycleSpeed = useCallback(() => {
    const idx = SPEEDS.indexOf(playbackSpeed);
    const next = SPEEDS[(idx + 1) % SPEEDS.length];
    changeSpeed(next);
  }, [playbackSpeed, changeSpeed]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const togglePiP = useCallback(async () => {
    try {
      if (!videoRef.current) return;
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.log("Playback interrupted:", error);
        });
      }
    } else {
      videoRef.current.pause();
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    const newMuted = !videoRef.current.muted;
    videoRef.current.muted = newMuted;
    setIsMuted(newMuted);
    if (!newMuted && videoRef.current.volume === 0) {
      videoRef.current.volume = 1;
      setVolume(1);
    }
  }, []);

  const changeVolume = useCallback((newVol: number) => {
    if (!videoRef.current) return;
    const clamped = Math.max(0, Math.min(1, newVol));
    videoRef.current.volume = clamped;
    setVolume(clamped);
    if (clamped === 0) {
      videoRef.current.muted = true;
      setIsMuted(true);
    } else if (videoRef.current.muted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  }, []);

  const skip = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime += seconds;
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current || !videoRef.current) return;
    
    // iOS/iPhone special handling: container fullscreen often fails, use video element directly
    if (!document.fullscreenEnabled && (videoRef.current as any).webkitEnterFullscreen) {
      (videoRef.current as any).webkitEnterFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      if (containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        await (containerRef.current as any).webkitRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      }
    }
  }, []);

  const toggleCast = useCallback(() => {
    if (!videoRef.current) return;
    
    // Remote Playback API (Modern browsers)
    if ((videoRef.current as any).remote && (videoRef.current as any).remote.prompt) {
      (videoRef.current as any).remote.prompt();
    } 
    // AirPlay legacy API
    else if ((window as any).WebKitPlaybackTargetAvailabilityEvent) {
      (videoRef.current as any).webkitShowPlaybackTargetPicker();
    } else {
      alert("Casting non supporté sur ce navigateur.");
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  }, [isPlaying]);

  // HLS Integration
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    let hls: Hls | null = null;
    let formattedUrl = streamUrl;

    // Proxy 3rd party HLS requests to bypass browser CORS policies
    if (streamUrl.includes(".m3u8") && streamUrl.startsWith("http") && !streamUrl.includes(window.location.hostname)) {
      formattedUrl = `/api/proxy?url=${encodeURIComponent(streamUrl)}`;
    }

    if (Hls.isSupported() && streamUrl.includes(".m3u8")) {
      hls = new Hls({ 
        maxBufferLength: 30,
        renderTextTracksNatively: true
      });
      hls.loadSource(formattedUrl);
      hls.attachMedia(video);
      hlsRef.current = hls;
      hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
        const levels = hls!.levels.map((l: any) => ({ height: l.height || 0, bitrate: l.bitrate || 0 }));
        setHlsLevels(levels);

        // Restore saved quality preference
        const savedQuality = localStorage.getItem('sv-preferred-quality');
        if (savedQuality && savedQuality !== '-1') {
          const idx = levels.findIndex((l: any) => l.height === parseInt(savedQuality));
          if (idx >= 0) {
            hls!.currentLevel = idx;
            setCurrentQuality(idx);
          } else {
            setCurrentQuality(-1);
          }
        } else {
          setCurrentQuality(-1);
        }

        // Detect audio tracks
        if (hls!.audioTracks && hls!.audioTracks.length >= 1) {
          const tracks = hls!.audioTracks.map((t: any) => ({
            id: t.id,
            name: t.name || (t.lang === 'fr' ? 'Français (VF)' : t.lang === 'en' ? 'English (VO)' : t.lang || `Piste ${t.id + 1}`),
            language: t.lang || t.name || 'default'
          }));
          setAudioTracks(tracks);

          // Restore saved audio preference
          const savedLang = localStorage.getItem('sv-preferred-audio-lang');
          if (savedLang) {
            const match = tracks.find((t: any) => t.language === savedLang);
            if (match) {
              hls!.audioTrack = match.id;
              setCurrentAudioTrack(match.id);
            } else {
              setCurrentAudioTrack(hls!.audioTrack);
            }
          } else {
            setCurrentAudioTrack(hls!.audioTrack);
          }
        }

        if (startPosition > 0) {
          video.currentTime = startPosition;
          const m = Math.floor(startPosition / 60);
          const s = Math.floor(startPosition % 60);
          setResumeTimeLabel(`${m}:${s.toString().padStart(2, "0")}`);
          setShowResumeToast(true);
          setTimeout(() => setShowResumeToast(false), 4000);
        }
      });
    } else {
      video.src = streamUrl;
      if (startPosition > 0) {
        video.addEventListener("loadedmetadata", () => {
          video.currentTime = startPosition;
          const m = Math.floor(startPosition / 60);
          const s = Math.floor(startPosition % 60);
          setResumeTimeLabel(`${m}:${s.toString().padStart(2, "0")}`);
          setShowResumeToast(true);
          setTimeout(() => setShowResumeToast(false), 4000);
        }, { once: true });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamUrl, startPosition]);

  // Reset states on source change
  useEffect(() => {
    setShowNextOverlay(false);
    setShowNextPrompt(false);
    setAutoPlayCountdown(10);
  }, [streamUrl]);

function parseVTTTime(timeStr: string): number {
  if (!timeStr) return 0;
  // Handle HH:MM:SS.mmm or MM:SS.mmm
  const parts = timeStr.split(':');
  let seconds = 0;
  if (parts.length === 3) {
    seconds += parseInt(parts[0], 10) * 3600;
    seconds += parseInt(parts[1], 10) * 60;
    seconds += parseFloat(parts[2]);
  } else if (parts.length === 2) {
    seconds += parseInt(parts[0], 10) * 60;
    seconds += parseFloat(parts[1]);
  }
  return seconds;
}

  // Handle Subtitles Track change with Custom Renderer
  useEffect(() => {
    if (activeSub === null || !subtitles[activeSub]) {
        setParsedCues([]);
        setCurrentSubtitle("");
        return;
    }

    const sub = subtitles[activeSub];
    
    const fetchUrl = `/api/subtitles?download=${encodeURIComponent(sub.url)}`;
    
    fetch(fetchUrl)
      .then(res => res.text())
      .then(text => {
          const blocks = text.split(/\n\n+/);
          const newCues = [];
          
          for (const block of blocks) {
             const lines = block.trim().split('\n');
             if (lines.length < 2) continue;
             
             let timeLineIdx = -1;
             for (let i = 0; i < lines.length; i++) {
                 if (lines[i].includes('-->')) {
                     timeLineIdx = i;
                     break;
                 }
             }
             
             if (timeLineIdx === -1) continue;
             
             const timeParts = lines[timeLineIdx].split(' --> ');
             if (timeParts.length !== 2) continue;
             
             const start = parseVTTTime(timeParts[0].trim());
             const end = parseVTTTime(timeParts[1].trim());
             const cueText = lines.slice(timeLineIdx + 1).join('\n');
             
             newCues.push({ start, end, text: cueText });
          }
          
          setParsedCues(newCues);
      })
      .catch(err => console.error("Failed to load subtitles manually", err));

  }, [activeSub, subtitles]);

  // Sync subtitles with video time
  useEffect(() => {
    const video = videoRef.current;
    if (!video || parsedCues.length === 0) return;

    const handleTimeUpdate = () => {
       const time = video.currentTime - subtitleDelay;
       const activeCue = parsedCues.find(cue => time >= cue.start && time <= cue.end);
       if (activeCue) {
           setCurrentSubtitle(activeCue.text);
       } else {
           setCurrentSubtitle("");
       }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, [parsedCues, subtitleDelay]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
      const onTimeUpdate = () => {
        setCurrentTime(video.currentTime);
        if (video.currentTime > 5 && video.currentTime < 120 && !showSkipIntro) {
          setShowSkipIntro(true);
        }
        if (video.currentTime >= 120 && showSkipIntro) {
          setShowSkipIntro(false);
        }
        if (nextEpisode && video.duration > 60 && video.duration - video.currentTime < 40 && !showNextPrompt && !showNextOverlay) {
          setShowNextPrompt(true);
        }
      };
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      if (startPosition > 0) video.currentTime = startPosition;
    };
    const onWaiting = () => setIsBuffering(true);
    const onCanPlay = () => setIsBuffering(false);
    const onFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    const onEnded = () => {
      setShowNextPrompt(false);
      if (nextEpisode) {
        setShowNextOverlay(true);
        setAutoPlayCountdown(10);
      }
    };

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("waiting", onWaiting);
    video.addEventListener("canplay", onCanPlay);
    video.addEventListener("ended", onEnded);
    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("waiting", onWaiting);
      video.removeEventListener("canplay", onCanPlay);
      video.removeEventListener("ended", onEnded);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, [startPosition, nextEpisode]);

  // Autoplay countdown when overlay is shown
  useEffect(() => {
    if (!showNextOverlay || !nextEpisode) return;

    const interval = setInterval(() => {
      setAutoPlayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          nextEpisode.onPlay();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoPlayTimerRef.current = interval as unknown as NodeJS.Timeout;
    return () => clearInterval(interval);
  }, [showNextOverlay, nextEpisode]);

  // Save watch progress every 15 seconds (improved from 10s)
  useEffect(() => {
    const saveProgress = () => {
      const video = videoRef.current;
      if (!video || !video.duration || video.duration === Infinity) return;
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mediaId: itemId,
          seasonNum,
          episodeNum,
          position: video.currentTime,
          duration: video.duration,
        }),
      }).catch(() => {});
    };

    const interval = setInterval(saveProgress, 15000);

    const video = videoRef.current;
    const onPauseSave = () => saveProgress();
    video?.addEventListener("pause", onPauseSave);

    const onBeforeUnload = () => saveProgress();
    window.addEventListener("beforeunload", onBeforeUnload);

    return () => {
      clearInterval(interval);
      video?.removeEventListener("pause", onPauseSave);
      window.removeEventListener("beforeunload", onBeforeUnload);
      saveProgress();
    };
  }, [itemId, seasonNum, episodeNum]);

  // Skip Recap detection: show for first 90s of non-first episodes
  useEffect(() => {
    if (!seasonNum || !episodeNum || episodeNum <= 1) return;
    const video = videoRef.current;
    if (!video) return;

    const checkRecap = () => {
      if (video.currentTime > 5 && video.currentTime < 90 && startPosition < 10) {
        setShowSkipRecap(true);
      } else {
        setShowSkipRecap(false);
      }
    };
    video.addEventListener("timeupdate", checkRecap);
    return () => video.removeEventListener("timeupdate", checkRecap);
  }, [seasonNum, episodeNum, startPosition]);

  // End credits detection: show "Next Episode" when < 90s remaining for series
  useEffect(() => {
    if (!nextEpisode) return;
    const video = videoRef.current;
    if (!video) return;

    const checkCredits = () => {
      if (video.duration && video.duration - video.currentTime < 90 && video.duration > 120) {
        setShowEndCredits(true);
      } else {
        setShowEndCredits(false);
      }
    };
    video.addEventListener("timeupdate", checkCredits);
    return () => video.removeEventListener("timeupdate", checkCredits);
  }, [nextEpisode]);

  const setQuality = useCallback((levelIndex: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIndex;
      setCurrentQuality(levelIndex);
      const height = levelIndex >= 0 ? hlsRef.current.levels[levelIndex]?.height : -1;
      localStorage.setItem('sv-preferred-quality', String(height || -1));
    }
    setShowQualityMenu(false);
  }, []);

  const switchAudioTrack = useCallback((trackId: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = trackId;
      setCurrentAudioTrack(trackId);
      const track = hlsRef.current.audioTracks.find((t: any) => t.id === trackId);
      if (track) {
        localStorage.setItem('sv-preferred-audio-lang', track.lang || track.name || 'default');
      }
    }
    setShowAudioMenu(false);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (showNextOverlay) {
        if (e.key === "Enter" && nextEpisode) {
          e.preventDefault();
          nextEpisode.onPlay();
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowNextOverlay(false);
          return;
        }
      }
      switch (e.key) {
        case " ":
        case "k": e.preventDefault(); togglePlay(); break;
        case "f": e.preventDefault(); toggleFullscreen(); break;
        case "m": e.preventDefault(); toggleMute(); break;
        case "ArrowLeft": e.preventDefault(); skip(-10); break;
        case "ArrowRight": e.preventDefault(); skip(10); break;
        case "s": e.preventDefault(); cycleSpeed(); break;
        case "j": e.preventDefault(); if (showSkipIntro) { skip(80); setShowSkipIntro(false); } break;
        case "n":
          if (nextEpisode) { e.preventDefault(); nextEpisode.onPlay(); }
          break;
        case "p":
          if (prevEpisode) { e.preventDefault(); prevEpisode.onPlay(); }
          break;
        case "i":
          e.preventDefault();
          togglePiP();
          break;
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, skip, nextEpisode, prevEpisode, showNextOverlay, cycleSpeed, showSkipIntro, togglePiP]);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-black overflow-hidden select-none"
      onMouseMove={handleMouseMove}
      onTouchStart={handleMouseMove}
      onClick={() => { 
        if (!showNextOverlay) {
          if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
            setShowControls(!showControls);
            if (!showControls && isPlaying) {
              if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
              hideTimerRef.current = setTimeout(() => setShowControls(false), 3000);
            }
          } else {
            togglePlay(); 
            handleMouseMove();
          }
        } 
      }}
      style={{ cursor: showControls ? "default" : "none" }}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Custom Subtitle Overlay */}
      <AnimatePresence>
        {currentSubtitle && activeSub !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-28 w-full flex justify-center pointer-events-none z-40 px-8"
          >
            <div 
              className="text-center bg-black/50 px-4 py-2 rounded shadow-2xl backdrop-blur-sm pointer-events-auto"
              style={{
                 maxWidth: '80%',
                 textShadow: '0px 1px 4px rgba(0,0,0,1)'
              }}
            >
              <p 
                className="text-2xl md:text-3xl font-medium text-white tracking-wide"
                dangerouslySetInnerHTML={{ __html: currentSubtitle.replace(/\n/g, '<br/>') }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buffering spinner */}
      <AnimatePresence>
        {isBuffering && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="w-14 h-14 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Resume Toast */}
      <AnimatePresence>
        {showResumeToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl"
            style={{ background: "rgba(10,10,10,0.9)", border: "1px solid var(--gold)", backdropFilter: "blur(12px)" }}
          >
            <p className="text-sm font-medium text-white">
              ▶ Reprise à <span className="text-gold font-bold">{resumeTimeLabel}</span>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Recap Button */}
      <AnimatePresence>
        {showSkipRecap && (
          <motion.button
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            onClick={(e) => { e.stopPropagation(); seek(90); setShowSkipRecap(false); }}
            className="absolute bottom-32 right-6 z-50 px-6 py-3 rounded-xl text-sm font-bold shadow-2xl hover:scale-105 transition-transform"
            style={{ background: "rgba(10,10,10,0.85)", border: "1px solid rgba(255,255,255,0.2)", backdropFilter: "blur(8px)" }}
          >
            Passer le résumé ⏭
          </motion.button>
        )}
      </AnimatePresence>

      {/* End Credits — Next Episode */}
      <AnimatePresence>
        {showEndCredits && nextEpisode && !showNextOverlay && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="absolute bottom-32 right-6 z-50 w-72 rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "rgba(10,10,10,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">Épisode suivant</p>
              <p className="text-sm font-bold text-white mb-3 line-clamp-1">{nextEpisode.label}</p>
              <button
                onClick={() => nextEpisode.onPlay()}
                className="w-full py-2.5 rounded-lg text-sm font-black flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform"
                style={{ background: "var(--gold)", color: "var(--deep-black)" }}
              >
                <Play className="w-4 h-4" fill="currentColor" />
                Lancer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-play next episode overlay */}
      <AnimatePresence>
        {showNextOverlay && nextEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="relative text-center space-y-6 max-w-lg px-12 py-10 rounded-3xl overflow-hidden"
              style={{ background: "rgba(10, 10, 10, 0.9)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
            >
              {/* Background image blur */}
              {nextEpisode.thumbnailUrl && (
                 <div className="absolute inset-0 -z-10">
                    <img src={nextEpisode.thumbnailUrl} className="w-full h-full object-cover opacity-20 blur-xl scale-110" alt="" />
                    <div className="absolute inset-0 bg-black/40" />
                 </div>
              )}

              <p className="text-gold text-xs font-black uppercase tracking-[0.2em]">Épisode suivant</p>
              
              <div className="space-y-4">
                {nextEpisode.thumbnailUrl && (
                  <div className="w-56 h-32 mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10 group-hover:scale-105 transition-transform duration-500">
                    <img src={nextEpisode.thumbnailUrl} className="w-full h-full object-cover" alt="" />
                  </div>
                )}
                <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{nextEpisode.label}</h2>
              </div>

              {/* Circular countdown */}
              <div className="relative w-20 h-20 mx-auto">
                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.1)" strokeWidth="4" fill="none" />
                  <circle
                    cx="40" cy="40" r="36"
                    stroke="#C6A55C"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 36}`}
                    strokeDashoffset={`${2 * Math.PI * 36 * (1 - autoPlayCountdown / 10)}`}
                    style={{ transition: "stroke-dashoffset 1s linear" }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xl font-black text-white">
                  {autoPlayCountdown}
                </span>
              </div>

              <div className="flex items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setShowNextOverlay(false)}
                  className="px-8 py-3 rounded-xl text-xs font-bold transition-all hover:bg-white/10 backdrop-blur-md"
                  style={{ border: "1px solid rgba(255,255,255,0.2)" }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => nextEpisode.onPlay()}
                  className="px-8 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 shadow-xl hover:scale-105"
                  style={{ background: "#C6A55C", color: "#0A0A0A" }}
                >
                  <Play className="w-4 h-4" fill="currentColor" />
                  Lancer maintenant
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Next Episode Prompt Card (Bottom-Right, 40s before end) */}
      <AnimatePresence>
        {showNextPrompt && nextEpisode && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`absolute bottom-24 right-8 z-[60] w-72 md:w-80 overflow-hidden rounded-2xl shadow-2xl border border-white/10 group/card ${!showControls ? 'pointer-events-auto' : ''}`}
            style={{ background: "rgba(10, 10, 10, 0.95)", backdropFilter: "blur(12px)" }}
            onClick={(e) => { e.stopPropagation(); nextEpisode.onPlay(); }}
          >
            <div className="relative h-36 md:h-44 w-full cursor-pointer">
              {nextEpisode.thumbnailUrl ? (
                <img src={nextEpisode.thumbnailUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" alt="" />
              ) : (
                <div className="w-full h-full bg-surface-light flex items-center justify-center">
                   <Play className="w-8 h-8 text-gold/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/40">
                 <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                    <Play className="w-5 h-5 text-deep-black ml-1" fill="currentColor" />
                 </div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowNextPrompt(false); }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white/60 hover:text-white hover:bg-black/80 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-1 cursor-pointer">
               <p className="text-[10px] font-black text-gold uppercase tracking-wider mb-0.5">Épisode suivant</p>
               <h3 className="text-sm font-bold text-white line-clamp-1 group-hover/card:text-gold transition-colors">{nextEpisode.label}</h3>
               <div 
                 className="mt-2 text-[10px] items-center gap-1.5 text-text-muted transition-colors flex font-bold"
               >
                 VOIR MAINTENANT <ChevronRight className="w-3 h-3" />
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Skip Intro Button */}
      <AnimatePresence>
        {showSkipIntro && showControls && !showNextOverlay && (
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30 }}
            onClick={(e) => { e.stopPropagation(); skip(80); setShowSkipIntro(false); }}
            className="absolute bottom-32 right-6 z-[55] flex items-center gap-3 px-6 py-3.5 rounded-xl text-base font-bold transition-all hover:scale-105"
            style={{
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.3)",
              color: "white",
            }}
          >
            <SkipForward className="w-5 h-5" />
            Passer l&apos;intro
          </motion.button>
        )}
      </AnimatePresence>

      {/* Controls overlay */}
      <AnimatePresence>
        {showControls && !showNextOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col justify-between z-10"
            onClick={(e) => {
              if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) {
                // On mobile, tap on empty controls area hides them
                e.stopPropagation();
                setShowControls(false);
              } else {
                e.stopPropagation();
                togglePlay();
              }
            }}
          >
            {/* Center controls (Mobile & Desktop) */}
            <div className="absolute inset-0 flex items-center justify-center gap-8 sm:gap-14 md:gap-16 pointer-events-none">
              <button
                onClick={(e) => { e.stopPropagation(); skip(-10); handleMouseMove(); }}
                className="pointer-events-auto p-5 sm:p-5 rounded-full bg-black/50 hover:bg-gold/40 text-white hover:text-gold transition-all backdrop-blur-md"
              >
                <SkipBack className="w-10 h-10 md:w-10 md:h-10" />
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); handleMouseMove(); }}
                className="pointer-events-auto p-7 sm:p-7 rounded-full bg-black/50 hover:bg-gold/40 text-white hover:text-gold transition-all backdrop-blur-md"
              >
                {isPlaying ? <Pause className="w-14 h-14 md:w-14 md:h-14" /> : <Play className="w-14 h-14 md:w-14 md:h-14 ml-1" fill="currentColor" />}
              </button>

              <button
                onClick={(e) => { e.stopPropagation(); skip(10); handleMouseMove(); }}
                className="pointer-events-auto p-5 sm:p-5 rounded-full bg-black/50 hover:bg-gold/40 text-white hover:text-gold transition-all backdrop-blur-md"
              >
                <SkipForward className="w-10 h-10 md:w-10 md:h-10" />
              </button>
            </div>

            {/* Top bar */}
            <div 
              className="flex justify-between items-start gap-4 p-4 sm:p-6 pb-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none"
            >
              <Link 
                href={`/detail/${itemId}`} 
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto hover:text-gold transition-colors p-2 -ml-2 rounded-full"
              >
                <ArrowLeft className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-lg" />
              </Link>
              <h2 className="text-base sm:text-lg md:text-xl font-semibold truncate flex-1 text-center mt-1 drop-shadow-md text-white">{title}</h2>

              {/* Episode nav in top bar */}
              {(prevEpisode || nextEpisode) && (
                <div className="pointer-events-auto flex items-center gap-2">
                  {prevEpisode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); prevEpisode.onPlay(); }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-black/40 hover:bg-white/10 transition-all backdrop-blur-md"
                      style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                      <span className="hidden md:inline">Précédent</span>
                    </button>
                  )}
                  {nextEpisode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); nextEpisode.onPlay(); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-black/40 hover:bg-white/10 transition-all backdrop-blur-md"
                      style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <span className="hidden md:inline">Suivant</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Bottom controls */}
            <div 
               className="p-4 sm:p-6 pt-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-3 sm:gap-4 pointer-events-auto"
               onClick={(e) => e.stopPropagation()}
            >
              {/* Progress bar */}
              <div 
                 className="group/progress relative cursor-pointer py-2 -my-2 flex items-center"
                 onClick={(e) => {
                   const rect = e.currentTarget.getBoundingClientRect();
                   const percent = (e.clientX - rect.left) / rect.width;
                   seek(percent * duration);
                 }}
              >
                <div className="w-full h-2 sm:h-2.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold transition-all duration-100 ease-linear"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                {/* Thumb */}
                <div 
                  className="absolute h-4 w-4 sm:h-5 sm:w-5 bg-white rounded-full shadow transition-transform opacity-0 group-hover/progress:opacity-100 scale-0 group-hover/progress:scale-100"
                  style={{ left: `calc(${progressPercent}% - 6px)` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 sm:gap-5">
                  {/* Skip back (hidden on mobile since we have center buttons) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); skip(-10); handleMouseMove(); }}
                    className="hover:text-gold transition-colors hidden md:block"
                  >
                    <SkipBack className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>

                  {/* Play/Pause (hidden on mobile since we have center buttons) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePlay(); handleMouseMove(); }}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center hover:bg-gold/20 transition-all hidden md:flex"
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 sm:w-7 sm:h-7" />
                    ) : (
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  {/* Skip forward (hidden on mobile since we have center buttons) */}
                  <button
                    onClick={(e) => { e.stopPropagation(); skip(10); handleMouseMove(); }}
                    className="hover:text-gold transition-colors hidden md:block"
                  >
                    <SkipForward className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>

                  {/* Volume */}
                  <div className="group/vol flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleMute(); handleMouseMove(); }}
                      className="hover:text-gold transition-colors"
                    >
                      {isMuted || volume === 0 ? (
                        <VolumeX className="w-7 h-7 sm:w-7 sm:h-7" />
                      ) : (
                        <Volume2 className="w-7 h-7 sm:w-7 sm:h-7" />
                      )}
                    </button>
                    <div className="w-0 group-hover/vol:w-20 overflow-hidden transition-all duration-300 hidden md:block">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => { changeVolume(parseFloat(e.target.value)); handleMouseMove(); }}
                        className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer accent-gold"
                        style={{ accentColor: "var(--gold)" }}
                      />
                    </div>
                  </div>

                  {/* Time */}
                  <span className="text-xs sm:text-sm text-text-secondary font-mono">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                  {/* Next episode shortcut at bottom right */}
                  {/* Next episode shortcut at bottom right */}
                  {nextEpisode && (
                    <button
                      onClick={(e) => { e.stopPropagation(); nextEpisode.onPlay(); }}
                      className="group/next flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-white/10 hover:bg-gold/20 text-white hover:text-gold transition-all border border-white/10 hover:border-gold/30 text-sm font-bold"
                      title="Épisode suivant (N)"
                    >
                      <span>Suivant</span>
                      <SkipForward className="w-6 h-6 sm:w-7 sm:h-7 group-hover/next:translate-x-0.5 transition-transform" />
                    </button>
                  )}

                  {/* Audio Tracks Menu — always visible */}
                  <div className="relative">
                    {showAudioMenu && (
                      <div className="absolute bottom-full right-0 mb-4 w-52 bg-surface border border-surface-light rounded-xl overflow-hidden shadow-2xl z-[60]" onClick={(e) => e.stopPropagation()}>
                        <div className="p-2.5 border-b border-surface-light bg-black/40">
                          <p className="text-xs font-bold text-gold px-2">🔊 Langue Audio</p>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-1.5 py-2 custom-scrollbar">
                          {audioTracks.length > 1 ? (
                            audioTracks.map((track) => (
                              <button
                                key={track.id}
                                onClick={(e) => { e.stopPropagation(); switchAudioTrack(track.id); }}
                                className={`w-full text-left px-3 py-2.5 text-sm rounded-lg hover:bg-surface-light transition-colors flex items-center gap-2 ${currentAudioTrack === track.id ? "text-gold font-medium bg-gold/5" : "text-text-primary"}`}
                              >
                                {currentAudioTrack === track.id && <span className="text-gold">✓</span>}
                                <span>{track.name || track.language || `Piste ${track.id + 1}`}</span>
                              </button>
                            ))
                          ) : audioTracks.length === 1 ? (
                            <div className="px-3 py-2.5 text-sm text-text-muted">
                              <p className="font-medium text-gold">{audioTracks[0].name}</p>
                              <p className="text-[10px] mt-0.5">Piste unique détectée</p>
                            </div>
                          ) : (
                            <div className="px-3 py-2.5 text-sm text-text-muted">
                              <p className="font-medium">Piste par défaut</p>
                              <p className="text-[10px] mt-1 leading-relaxed">Ce flux n'a pas de pistes audio séparées.<br/>Un master playlist HLS avec EXT-X-MEDIA est nécessaire.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowAudioMenu(prev => !prev); setShowSubMenu(false); setShowQualityMenu(false); setShowSpeedMenu(false); }}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all border ${showAudioMenu ? "bg-gold/20 text-gold border-gold/40" : "bg-white/10 text-white border-white/10 hover:bg-white/20 hover:text-gold hover:border-gold/30"}`}
                      title="Langue Audio (VO/VF)"
                    >
                      <Languages className="w-5 h-5" />
                      <span className="hidden sm:inline">VO/VF</span>
                    </button>
                  </div>

                  {/* Subtitles Menu */}
                  {subtitles.length > 0 && (
                    <div className="relative">
                      {showSubMenu && (
                        <div className="absolute bottom-full right-0 mb-4 w-48 bg-surface border border-surface-light rounded-xl overflow-hidden shadow-2xl z-50">
                          <div className="p-2 border-b border-surface-light bg-black/40">
                            <p className="text-xs font-semibold text-text-secondary px-2">Sous-titres</p>
                          </div>
                          <div className="max-h-64 overflow-y-auto p-1 py-2 custom-scrollbar">
                            <button
                              onClick={() => { setActiveSub(null); setShowSubMenu(false); }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-surface-light transition-colors ${activeSub === null ? "text-gold font-medium" : "text-text-primary"}`}
                            >
                              Désactivé
                            </button>
                            {subtitles.map((sub, idx) => (
                              <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setActiveSub(idx); setShowSubMenu(false); }}
                                className={`w-full flex flex-col text-left px-3 py-2 text-sm rounded hover:bg-surface-light transition-colors ${activeSub === idx ? "text-gold font-medium" : "text-text-primary"}`}
                              >
                                <span className="truncate">{sub.language.toUpperCase()}</span>
                                <span className="text-[10px] text-text-muted truncate">{sub.name}</span>
                              </button>
                            ))}
                            {activeSub !== null && (
                                <div className="pt-2 mt-1 border-t border-surface-light">
                                  <div className="flex items-center justify-between px-3 mb-1">
                                      <span className="text-[10px] text-text-muted uppercase">Sync.</span>
                                      <span className="text-[10px] font-mono text-gold">{subtitleDelay > 0 ? '+' : ''}{subtitleDelay.toFixed(1)}s</span>
                                  </div>
                                  <div className="flex justify-between px-2 gap-1 pb-1">
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setSubtitleDelay(d => d - 0.5); }} 
                                      className="flex-1 px-1 py-1 text-xs hover:bg-surface-light rounded transition-colors"
                                    >
                                      -0.5s
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setSubtitleDelay(0); }} 
                                      className="px-2 py-1 text-[10px] hover:bg-surface-light rounded transition-colors"
                                    >
                                      RàZ
                                    </button>
                                    <button 
                                      onClick={(e) => { e.stopPropagation(); setSubtitleDelay(d => d + 0.5); }} 
                                      className="flex-1 px-1 py-1 text-xs hover:bg-surface-light rounded transition-colors"
                                    >
                                      +0.5s
                                    </button>
                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowSubMenu(!showSubMenu); }}
                        className={`hover:text-gold transition-colors relative ${activeSub !== null ? "text-gold" : ""}`}
                        title="Sous-titres"
                      >
                        <MessageSquare className="w-7 h-7 sm:w-7 sm:h-7" />
                        {activeSub !== null && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold" />
                        )}
                      </button>
                    </div>
                  )}

                  {/* Speed Control */}
                  <div className="relative" ref={speedMenuRef}>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full right-0 mb-4 w-36 bg-surface border border-surface-light rounded-xl overflow-hidden shadow-2xl z-50">
                        <div className="p-2 border-b border-surface-light bg-black/40">
                          <p className="text-xs font-semibold text-text-secondary px-2">Vitesse</p>
                        </div>
                        <div className="p-1 py-2">
                          {SPEEDS.map((speed) => (
                            <button
                              key={speed}
                              onClick={(e) => { e.stopPropagation(); changeSpeed(speed); }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-surface-light transition-colors ${
                                playbackSpeed === speed ? "text-gold font-medium" : "text-text-primary"
                              }`}
                            >
                              {speed === 1 ? "Normal" : `${speed}x`}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); setShowSubMenu(false); }}
                      className={`hover:text-gold transition-colors text-xs font-bold px-2 py-1 rounded ${
                        playbackSpeed !== 1 ? "text-gold bg-gold/10" : ""
                      }`}
                      title="Vitesse de lecture (S)"
                    >
                      {playbackSpeed === 1 ? <Gauge className="w-7 h-7 sm:w-7 sm:h-7" /> : `${playbackSpeed}x`}
                    </button>
                  </div>

                  {/* Quality Selector */}
                  {hlsLevels.length > 1 && (
                    <div className="relative">
                      {showQualityMenu && (
                        <div className="absolute bottom-full right-0 mb-4 w-40 bg-surface border border-surface-light rounded-xl overflow-hidden shadow-2xl z-50">
                          <div className="p-2 border-b border-surface-light bg-black/40">
                            <p className="text-xs font-semibold text-text-secondary px-2">Qualité</p>
                          </div>
                          <div className="p-1 py-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); setQuality(-1); }}
                              className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-surface-light transition-colors ${
                                currentQuality === -1 ? "text-gold font-medium" : "text-text-primary"
                              }`}
                            >
                              Auto
                            </button>
                            {hlsLevels.map((level, i) => (
                              <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setQuality(i); }}
                                className={`w-full text-left px-3 py-2 text-sm rounded hover:bg-surface-light transition-colors ${
                                  currentQuality === i ? "text-gold font-medium" : "text-text-primary"
                                }`}
                              >
                                {level.height}p
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); setShowSubMenu(false); }}
                        className={`hover:text-gold transition-colors text-xs font-bold px-2 py-1 rounded ${
                          currentQuality !== -1 ? "text-gold bg-gold/10" : ""
                        }`}
                        title="Qualité vidéo"
                      >
                        {currentQuality === -1 ? "HD" : `${hlsLevels[currentQuality]?.height}p`}
                      </button>
                    </div>
                  )}

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleFullscreen(); }}
                    className="hover:text-gold transition-colors"
                    title={isFullscreen ? "Quitter le plein écran (F)" : "Plein écran (F)"}
                  >
                    {isFullscreen ? (
                      <Minimize className="w-7 h-7 sm:w-7 sm:h-7" />
                    ) : (
                      <Maximize className="w-7 h-7 sm:w-7 sm:h-7" />
                    )}
                  </button>

                  {/* Cast to TV */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleCast(); }}
                    className="hover:text-gold transition-colors"
                    title="Caster sur la TV"
                  >
                    <Tv className="w-7 h-7 sm:w-7 sm:h-7" />
                  </button>

                  {/* Picture in Picture */}
                  <button
                    onClick={(e) => { e.stopPropagation(); togglePiP(); handleMouseMove(); }}
                    className="hover:text-gold transition-colors hidden md:block"
                    title="Picture-in-Picture (I)"
                  >
                    <PictureInPicture className="w-6 h-6 sm:w-7 sm:h-7" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
