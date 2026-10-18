import React, { useState, useEffect } from 'react';
import { Cloud, Play, Pause, ExternalLink, Edit3, Radio } from 'lucide-react';
import { SoundCloudTrackConfig } from '../types/bio';
import { audioEngine } from '../utils/audioSynthesizer';

interface SoundCloudWidgetProps {
  track: SoundCloudTrackConfig;
  mode: 'guest' | 'editor';
  onOpenEditor: () => void;
}

export const SoundCloudWidget: React.FC<SoundCloudWidgetProps> = ({
  track,
  mode,
  onOpenEditor,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0.2);

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setProgress((prev) => (prev >= 1 ? 0 : prev + 0.01));
      }, 400);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const running = audioEngine.toggleAmbient('ambient-night', 0.08);
    setIsPlaying(running);
  };

  const handleWaveClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(clickRatio);
    if (!isPlaying) {
      audioEngine.startAmbient('ambient-night', 0.08);
      setIsPlaying(true);
    }
  };

  // 24 waveform bar heights
  const bars = [25, 40, 60, 50, 75, 90, 80, 65, 45, 70, 95, 85, 70, 55, 80, 90, 75, 60, 45, 65, 80, 60, 40, 25];

  return (
    <div className="w-full glass-card rounded-3xl p-5 space-y-4 shadow-2xl relative group">
      {/* Widget Header with SoundCloud branding */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2 text-white">
          <div className="w-6 h-6 rounded-full bg-[#ff5500]/20 flex items-center justify-center text-[#ff5500]">
            <Cloud className="w-3.5 h-3.5 fill-current" />
          </div>
          <span className="text-xs uppercase tracking-wider font-medium text-white/70">
            SoundCloud Трек
          </span>
        </div>

        <div className="flex items-center gap-2">
          {mode === 'editor' && (
            <button
              onClick={onOpenEditor}
              className="p-1 rounded-full text-white/60 hover:text-white transition-colors"
              title="Заменить трек (авто-подтягивание)"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          <a
            href={track.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-[#ff884d] hover:text-[#ffa066] transition-colors flex items-center gap-1 font-medium"
          >
            <span className="hidden sm:inline">Открыть трек</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Track Player Body */}
      <div className="flex items-center gap-4">
        {/* Play/Pause Button with Artwork */}
        <div
          onClick={handleTogglePlay}
          className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden cursor-pointer group/art shrink-0 border border-white/20 shadow-md bg-black/40"
          title={isPlaying ? 'Пауза' : 'Слушать трек'}
        >
          <img
            src={track.artworkUrl}
            alt={track.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover transition-transform duration-500 group-hover/art:scale-105"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover/art:bg-black/25">
            {isPlaying ? (
              <Pause className="w-5 h-5 text-white fill-current animate-pulse" />
            ) : (
              <Play className="w-5 h-5 text-white fill-current ml-0.5" />
            )}
          </div>
        </div>

        {/* Title, Artist, Status */}
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-medium text-white truncate block">
              {track.title}
            </span>
            {isPlaying && (
              <span className="flex items-center gap-1 text-[10px] text-emerald-300 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse" /> играет
              </span>
            )}
          </div>
          <span className="text-xs text-white/50 block font-light truncate">
            {track.artist} · {track.duration}
          </span>
        </div>
      </div>

      {/* Interactive Waveform Bar Visualizer */}
      <div className="space-y-1 pt-1">
        <div
          onClick={handleWaveClick}
          className="h-9 flex items-end gap-[3px] sm:gap-[4px] cursor-pointer py-1 select-none group/wave"
          title="Кликните на звуковую волну для перемотки"
        >
          {bars.map((heightPercent, idx) => {
            const barProgress = idx / bars.length;
            const isPassed = barProgress <= progress;

            return (
              <div
                key={idx}
                className="flex-1 rounded-full transition-all duration-150 group-hover/wave:brightness-125"
                style={{
                  height: `${heightPercent}%`,
                  backgroundColor: isPassed ? '#ff5500' : 'rgba(255, 255, 255, 0.16)',
                  boxShadow: isPassed && isPlaying ? '0 0 6px rgba(255, 85, 0, 0.5)' : 'none',
                }}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>
            {Math.floor(progress * 3)}:
            {String(Math.floor((progress * 180) % 60)).padStart(2, '0')}
          </span>
          <span>{track.duration}</span>
        </div>
      </div>
    </div>
  );
};
