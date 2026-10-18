import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ListMusic,
  ExternalLink,
  Volume2,
  Volume1,
  VolumeX,
} from 'lucide-react';
import { ARTIST_TRACKS, ArtistTrack } from '../data/artistTracks';
import { audioEngine } from '../utils/audioSynthesizer';

declare global {
  interface Window {
    SC?: {
      Widget: {
        (iframe: HTMLIFrameElement | string): SoundCloudWidgetInstance;
        Events: {
          LOAD_PROGRESS: string;
          PLAY_PROGRESS: string;
          PLAY: string;
          PAUSE: string;
          FINISH: string;
          SEEK: string;
          READY: string;
          ERROR: string;
        };
      };
    };
  }
}

interface SoundCloudWidgetInstance {
  play: () => void;
  pause: () => void;
  toggle: () => void;
  seekTo: (milliseconds: number) => void;
  setVolume: (volume: number) => void;
  getVolume: (callback: (volume: number) => void) => void;
  getDuration: (callback: (duration: number) => void) => void;
  getPosition: (callback: (position: number) => void) => void;
  bind: (eventName: string, listener: (...args: any[]) => void) => void;
  unbind: (eventName: string) => void;
  load: (url: string, options?: any) => void;
}

interface SoundCloudPlayerProps {
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export const SoundCloudPlayer: React.FC<SoundCloudPlayerProps> = ({
  currentTrackIndex,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
}) => {
  const [showTracklist, setShowTracklist] = useState(false);
  const [progress, setProgress] = useState(0);

  // Initialize volume from localStorage so it NEVER resets to 100%
  const [volume, setVolume] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sc_player_volume');
      if (saved !== null) {
        const val = parseFloat(saved);
        if (!isNaN(val) && val >= 0 && val <= 1) return val;
      }
    } catch {
      // guard
    }
    return 0.7; // default comfortable 70% volume
  });

  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(volume > 0 ? volume : 0.7);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [showVolumePopup, setShowVolumePopup] = useState(false);

  const volumeContainerRef = useRef<HTMLDivElement | null>(null);
  const volumePopupTimerRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const widgetRef = useRef<SoundCloudWidgetInstance | null>(null);

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const volumeRef = useRef(volume);
  volumeRef.current = volume;

  const isPlayingRef = useRef(isPlaying);
  isPlayingRef.current = isPlaying;

  const currentTrack: ArtistTrack = ARTIST_TRACKS[currentTrackIndex] || ARTIST_TRACKS[0];
  const totalSeconds = currentTrack.secondsTotal || 150;

  // Helper to trigger volume tooltip HUD
  const triggerVolumePopup = useCallback(() => {
    setShowVolumePopup(true);
    if (volumePopupTimerRef.current) clearTimeout(volumePopupTimerRef.current);
    volumePopupTimerRef.current = window.setTimeout(() => {
      setShowVolumePopup(false);
    }, 2000);
  }, []);

  // Update volume on SoundCloud widget
  const applyVolumeToWidget = useCallback((volLevel: number, muted: boolean) => {
    const finalVol = muted ? 0 : Math.round(volLevel * 100);
    if (widgetRef.current) {
      try {
        widgetRef.current.setVolume(finalVol);
      } catch {
        // guard
      }
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ method: 'setVolume', value: finalVol }),
          '*'
        );
      } catch {
        // guard
      }
    }
  }, []);

  // Connect SoundCloud Widget API when iframe loads
  useEffect(() => {
    if (!iframeRef.current) return;

    const initWidget = () => {
      if (window.SC && window.SC.Widget && iframeRef.current) {
        try {
          const widget = window.SC.Widget(iframeRef.current);
          widgetRef.current = widget;

          widget.bind(window.SC.Widget.Events.READY, () => {
            const vol = isMutedRef.current ? 0 : Math.round(volumeRef.current * 100);
            widget.setVolume(vol);
            if (isPlayingRef.current) {
              widget.play();
            }
          });

          widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, (data: { relativePosition: number; currentPosition?: number }) => {
            if (typeof data?.relativePosition === 'number') {
              setProgress(data.relativePosition);
            } else if (typeof data?.currentPosition === 'number') {
              setProgress(data.currentPosition / (totalSeconds * 1000));
            }
          });

          widget.bind(window.SC.Widget.Events.FINISH, () => {
            onSelectTrack((currentTrackIndex + 1) % ARTIST_TRACKS.length);
            setProgress(0);
          });
        } catch {
          // fallback
        }
      }
    };

    if (window.SC) {
      initWidget();
    } else {
      const timer = setTimeout(initWidget, 500);
      return () => clearTimeout(timer);
    }
  }, [currentTrack.trackId, currentTrackIndex, totalSeconds]);

  // Synchronize play / pause state & strictly prevent volume from resetting to 100%
  useEffect(() => {
    if (widgetRef.current) {
      try {
        if (isPlaying) {
          const targetVol = isMuted ? 0 : Math.round(volume * 100);
          widgetRef.current.setVolume(targetVol);
          widgetRef.current.play();

          // Enforce volume 50ms and 200ms after play starts so SoundCloud widget can never override it
          const t1 = setTimeout(() => {
            try {
              widgetRef.current?.setVolume(targetVol);
            } catch {}
          }, 50);

          const t2 = setTimeout(() => {
            try {
              widgetRef.current?.setVolume(targetVol);
            } catch {}
          }, 200);

          return () => {
            clearTimeout(t1);
            clearTimeout(t2);
          };
        } else {
          widgetRef.current.pause();
        }
      } catch {
        // fallback
      }
    }
  }, [isPlaying, volume, isMuted]);

  // Fail-Safe Active Playback Ticker: Guarantees that time and progress ALWAYS advance when playing!
  useEffect(() => {
    if (!isPlaying) return;

    const ticker = setInterval(() => {
      if (widgetRef.current) {
        try {
          widgetRef.current.getPosition((posMs: number) => {
            if (typeof posMs === 'number' && posMs > 0) {
              const durMs = totalSeconds * 1000;
              const ratio = Math.max(0, Math.min(1, posMs / durMs));
              setProgress(ratio);
              return;
            }
          });
        } catch {}
      }

      // Smooth fallback increment if widget.getPosition is delayed
      setProgress((prev) => {
        const step = 0.25 / totalSeconds;
        const next = prev + step;
        if (next >= 1) {
          onSelectTrack((currentTrackIndex + 1) % ARTIST_TRACKS.length);
          return 0;
        }
        return next;
      });
    }, 250);

    return () => clearInterval(ticker);
  }, [isPlaying, totalSeconds, currentTrackIndex, onSelectTrack]);

  // Non-passive wheel event on volume button: ensures only volume changes and page does NOT scroll
  useEffect(() => {
    const el = volumeContainerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const step = e.deltaY < 0 ? 0.05 : -0.05;
      const currentBase = isMutedRef.current ? 0 : volumeRef.current;
      const newVol = Math.max(0, Math.min(1, parseFloat((currentBase + step).toFixed(2))));

      setVolume(newVol);
      try {
        localStorage.setItem('sc_player_volume', newVol.toString());
      } catch {}

      if (newVol === 0) {
        setIsMuted(true);
        audioEngine.setVolume(0);
        applyVolumeToWidget(0, true);
      } else {
        setIsMuted(false);
        setPrevVolume(newVol);
        audioEngine.setVolume(newVol);
        applyVolumeToWidget(newVol, false);
      }

      triggerVolumePopup();
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onNativeWheel);
    };
  }, [applyVolumeToWidget, triggerVolumePopup]);

  // Handle Mute Click Toggle in Bottom-Left
  const handleToggleMute = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isMuted) {
      const restored = prevVolume > 0 ? prevVolume : 0.7;
      setIsMuted(false);
      setVolume(restored);
      try {
        localStorage.setItem('sc_player_volume', restored.toString());
      } catch {}
      audioEngine.setVolume(restored);
      applyVolumeToWidget(restored, false);
    } else {
      setPrevVolume(volume > 0 ? volume : 0.7);
      setIsMuted(true);
      audioEngine.setVolume(0);
      applyVolumeToWidget(0, true);
    }

    triggerVolumePopup();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectTrack((currentTrackIndex + 1) % ARTIST_TRACKS.length);
    setProgress(0);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectTrack((currentTrackIndex - 1 + ARTIST_TRACKS.length) % ARTIST_TRACKS.length);
    setProgress(0);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(ratio);

    if (widgetRef.current) {
      const ms = Math.floor(ratio * (currentTrack.secondsTotal || 150) * 1000);
      try {
        widgetRef.current.seekTo(ms);
      } catch {}
    }
  };

  const currentSeconds = Math.floor(totalSeconds * progress);
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveVolume = isMuted ? 0 : volume;

  return (
    <div className="relative w-full border-t border-white/10 bg-black/60 backdrop-blur-2xl p-3.5 sm:p-4 text-white select-none">
      {/* Hidden real SoundCloud Player Widget */}
      <div className="sr-only" aria-hidden="true">
        <iframe
          ref={iframeRef}
          key={currentTrack.trackId}
          title={`SoundCloud - ${currentTrack.title}`}
          width="100%"
          height="20"
          scrolling="no"
          frameBorder="no"
          allow="autoplay; encrypted-media"
          src={`https://w.soundcloud.com/player/?url=https%3A%2F%2Fapi.soundcloud.com%2Ftracks%2F${currentTrack.trackId}&color=%23ffffff&auto_play=${
            isPlaying ? 'true' : 'false'
          }&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false&visual=false`}
        />
      </div>

      {/* Expandable Drawer with Queue / All Tracks with Smooth Animation */}
      <div
        className={`absolute bottom-full left-0 right-0 max-h-[340px] overflow-y-auto bg-[#09090b]/98 backdrop-blur-3xl border-t border-x border-white/15 rounded-t-2xl p-3.5 shadow-2xl space-y-1.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden z-30 transition-all duration-300 ease-out transform origin-bottom ${
          showTracklist
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center justify-between px-2 pb-2.5 border-b border-white/10 text-xs text-white/50">
          <span className="font-mono uppercase tracking-wider text-[11px] text-white/80">
            Очередь треков ({ARTIST_TRACKS.length})
          </span>
          <button
            onClick={() => setShowTracklist(false)}
            className="text-white/40 hover:text-white text-xs underline cursor-pointer"
          >
            Закрыть
          </button>
        </div>

        <div className="pt-1 space-y-1">
          {ARTIST_TRACKS.map((t, idx) => {
            const isSelected = idx === currentTrackIndex;
            return (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTrack(idx);
                  setProgress(0);
                  if (!isPlaying) onTogglePlay();
                }}
                className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors text-xs cursor-pointer ${
                  isSelected
                    ? 'bg-white/20 text-white font-medium'
                    : 'hover:bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span className="font-mono text-[10px] text-white/40 w-4">
                    {(idx + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="truncate">{t.title}</span>
                </div>
                <span className="font-mono text-[10px] text-white/40 shrink-0">
                  {t.duration}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Bottom Player Interface */}
      <div className="space-y-3">
        {/* Track Info Row with Silky Smooth Crossfade and Slide Animation */}
        <div
          key={currentTrack.trackId}
          className="flex items-center justify-between gap-3 animate-in fade-in slide-in-from-right-3 duration-300 fill-mode-both"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Artwork thumbnail with smooth scale in */}
            <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-900 border border-white/15 shrink-0 shadow-md transition-transform duration-300">
              <img
                src={currentTrack.artworkUrl}
                alt={currentTrack.title}
                className="w-full h-full object-cover grayscale contrast-125 brightness-95"
              />
            </div>

            <div className="min-w-0">
              <h4 className="text-xs font-medium text-white truncate leading-tight">
                {currentTrack.title}
              </h4>
              <p className="text-[10px] text-white/50 font-mono truncate">
                {currentTrack.artist}
              </p>
            </div>
          </div>

          {/* Right Action Icons: Queue toggle & External link */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setShowTracklist(!showTracklist)}
              title="Очередь треков"
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                showTracklist
                  ? 'bg-white text-black border-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
            </button>

            <a
              href={currentTrack.permalink}
              target="_blank"
              rel="noreferrer"
              title="Открыть на SoundCloud"
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Progress Bar with Current / Total Time */}
        <div className="space-y-1">
          <div
            onClick={handleSeek}
            className="group relative w-full h-1.5 bg-white/10 hover:h-2 rounded-full cursor-pointer transition-all overflow-hidden"
          >
            <div
              style={{ width: `${Math.max(0, Math.min(100, progress * 100)).toFixed(1)}%` }}
              className="h-full bg-white rounded-full transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(255,255,255,0.7)]"
            />
          </div>

          <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
            <span>{formatTime(currentSeconds)}</span>
            <span>{currentTrack.duration}</span>
          </div>
        </div>

        {/* Playback Controls & Volume in Bottom-Left */}
        <div className="flex items-center justify-between pt-1">
          {/* Bottom-Left Volume / Mute Button Container with Native Wheel Capture */}
          <div
            ref={volumeContainerRef}
            className="relative"
            onMouseEnter={() => {
              setIsHoveringVolume(true);
              triggerVolumePopup();
            }}
            onMouseLeave={() => setIsHoveringVolume(false)}
          >
            {/* Volume Floating HUD with HIGH-CONTRAST Glowing Fill Bar */}
            <div
              className={`absolute bottom-full left-0 mb-3 px-3.5 py-2.5 rounded-2xl bg-black/95 backdrop-blur-3xl border border-white/20 text-white shadow-2xl flex items-center gap-3 text-[11px] font-mono whitespace-nowrap z-50 pointer-events-none transition-all duration-200 ease-out transform ${
                isHoveringVolume || showVolumePopup
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span className="text-white/50 text-[10px]">ГРОМКОСТЬ:</span>
                <span className="text-white font-semibold min-w-9">
                  {isMuted ? '0%' : `${Math.round(effectiveVolume * 100)}%`}
                </span>
              </div>

              {/* High-Contrast Luminous White Volume Bar (Completely fixed, never gray) */}
              <div className="w-20 h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/20 relative shadow-inner">
                <div
                  className="h-full bg-white rounded-full transition-all duration-75 shadow-[0_0_10px_#ffffff]"
                  style={{
                    width: `${Math.max(0, Math.min(100, Math.round(effectiveVolume * 100)))}%`,
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleToggleMute}
              title={
                isMuted
                  ? 'Включить звук (прокрутите колесико мыши для изменения громкости)'
                  : 'Выключить звук (прокрутите колесико мыши для изменения громкости)'
              }
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isMuted || effectiveVolume === 0
                  ? 'bg-white/10 border-white/25 text-white/40 hover:text-white hover:bg-white/20'
                  : 'bg-white/5 border-white/10 text-white hover:bg-white/15 shadow-sm'
              }`}
            >
              {isMuted || effectiveVolume === 0 ? (
                <VolumeX className="w-4 h-4 text-white/50" />
              ) : effectiveVolume < 0.5 ? (
                <Volume1 className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
          </div>

          {/* Centered Prev / Play / Next Controls */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrev}
              title="Предыдущий трек"
              className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={onTogglePlay}
              title={isPlaying ? 'Пауза' : 'Слушать'}
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-neutral-200 transition-transform active:scale-95 flex items-center justify-center shadow-lg shadow-white/10 cursor-pointer"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current translate-x-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              title="Следующий трек"
              className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Track counter (e.g. 01/25) */}
          <span className="text-[10px] font-mono text-white/40">
            {(currentTrackIndex + 1).toString().padStart(2, '0')}/{ARTIST_TRACKS.length}
          </span>
        </div>
      </div>
    </div>
  );
};
