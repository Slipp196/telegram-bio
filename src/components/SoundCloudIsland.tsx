import React, { useState, useRef } from 'react';
import { ExternalLink, Play, Pause, Disc3, TrendingUp, Headphones, Cloud } from 'lucide-react';
import {
  ARTIST_TRACKS,
  ArtistTrack,
  SOUNDCLOUD_ARTIST_URL,
  SOUNDCLOUD_ARTIST_BIO,
  SOUNDCLOUD_ARTIST_NAME,
} from '../data/artistTracks';

interface SoundCloudIslandProps {
  currentTrackIndex: number;
  isPlaying: boolean;
  onSelectTrack: (index: number) => void;
  onTogglePlay: () => void;
}

export const SoundCloudIsland: React.FC<SoundCloudIslandProps> = ({
  currentTrackIndex,
  isPlaying,
  onSelectTrack,
  onTogglePlay,
}) => {
  const [sortMode, setSortMode] = useState<'latest' | 'popular'>('latest');
  const tracksContainerRef = useRef<HTMLDivElement | null>(null);

  // Compute displayed tracks based on sort mode
  const displayedTracks = [...ARTIST_TRACKS].map((t, originalIndex) => ({
    ...t,
    originalIndex,
  }));

  if (sortMode === 'popular') {
    displayedTracks.sort((a, b) => (b.playbackCount || 0) - (a.playbackCount || 0));
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-7 animate-in fade-in slide-in-from-right-4 duration-400 select-none">
      {/* Top Artist Profile Showcase Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Artist Monochrome Avatar */}
            <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 shrink-0 shadow-2xl group">
              <img
                src="https://i1.sndcdn.com/artworks-vWsKYosnwudv0TYG-rGpp4g-t500x500.jpg"
                alt={SOUNDCLOUD_ARTIST_NAME}
                className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                {/* User explicitly requested: only 'SOUNDCLOUD' badge, NO '25 релизов' */}
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono tracking-wider uppercase bg-white/10 text-white border border-white/15">
                  SOUNDCLOUD
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-light text-white font-display tracking-tight">
                {SOUNDCLOUD_ARTIST_NAME}
              </h2>

              {/* Exact bio from SoundCloud profile: "the path to happiness - 916th excerpt" */}
              <p className="text-xs sm:text-sm text-white/70 font-mono tracking-wide">
                {SOUNDCLOUD_ARTIST_BIO}
              </p>
            </div>
          </div>

          {/* Jump to SoundCloud Profile */}
          <a
            href={SOUNDCLOUD_ARTIST_URL}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-medium text-xs flex items-center justify-center gap-2 shadow-xl shadow-white/5 group shrink-0"
          >
            <Cloud className="w-3.5 h-3.5 fill-current" />
            <span>Перейти в SoundCloud</span>
            <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>

      {/* Releases Section with View Mode Switcher (Latest vs Most Popular) */}
      <div className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 text-white">
            <Disc3 className="w-4 h-4 text-white/70 animate-spin [animation-duration:10s]" />
            <h3 className="text-sm font-medium tracking-wider uppercase font-mono text-white/90">
              {sortMode === 'latest' ? 'Последние релизы' : 'Популярные по прослушиваниям'}
            </h3>
          </div>

          {/* Mode Switcher Buttons */}
          <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-full border border-white/10">
            <button
              onClick={() => setSortMode('latest')}
              title="Показать последние релизы"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                sortMode === 'latest'
                  ? 'bg-white text-black font-medium shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Disc3 className="w-3 h-3" />
              <span>Релизы</span>
            </button>

            <button
              onClick={() => setSortMode('popular')}
              title="Показать популярные по прослушиваниям"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
                sortMode === 'popular'
                  ? 'bg-white text-black font-medium shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Популярные</span>
            </button>
          </div>
        </div>

        {/* Spacious, un-cramped track listing with internal smooth scrolling */}
        <div
          ref={tracksContainerRef}
          className="space-y-2.5 max-h-[calc(100vh-240px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain pr-1"
        >
          {displayedTracks.map((track, displayIdx) => {
            const isSelected = track.originalIndex === currentTrackIndex;
            const isCurrentlyPlaying = isSelected && isPlaying;

            return (
              <div
                key={track.id}
                onClick={() => {
                  if (isSelected) {
                    onTogglePlay();
                  } else {
                    onSelectTrack(track.originalIndex);
                    if (!isPlaying) onTogglePlay();
                  }
                }}
                className={`group flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-white/15 border-white/35 shadow-lg shadow-white/5 text-white'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.06] hover:border-white/20 text-white/80 hover:text-white'
                }`}
              >
                {/* Left: Index, Artwork, Title & Playback Count */}
                <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-3">
                  {/* Track Number / Playing Equalizer */}
                  <div className="w-6 text-center font-mono text-xs text-white/40 shrink-0">
                    {isCurrentlyPlaying ? (
                      <div className="flex items-end justify-center gap-0.5 h-3.5">
                        <span className="w-0.5 h-full bg-white animate-pulse" />
                        <span className="w-0.5 h-2/3 bg-white animate-pulse delay-75" />
                        <span className="w-0.5 h-4/5 bg-white animate-pulse delay-150" />
                      </div>
                    ) : (
                      <span>{(displayIdx + 1).toString().padStart(2, '0')}</span>
                    )}
                  </div>

                  {/* Artwork with single play/pause overlay */}
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                    <img
                      src={track.artworkUrl}
                      alt={track.title}
                      className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isCurrentlyPlaying ? (
                        <Pause className="w-4 h-4 text-white fill-current" />
                      ) : (
                        <Play className="w-4 h-4 text-white fill-current translate-x-0.5" />
                      )}
                    </div>
                  </div>

                  {/* Title & Artist & Playback Count (NO release date) */}
                  <div className="min-w-0 space-y-0.5">
                    <p
                      className={`text-sm sm:text-base font-medium truncate ${
                        isSelected ? 'text-white' : 'text-white/90 group-hover:text-white'
                      }`}
                    >
                      {track.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono truncate">
                      <span className="text-white/40">{track.artist}</span>
                      {track.playbackCount !== undefined && (
                        <>
                          <span className="text-white/20">·</span>
                          <span className="flex items-center gap-1 text-white/70">
                            <Headphones className="w-3 h-3 text-white/50" />
                            <span>{track.playbackCount} прослушиваний</span>
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Duration & External SoundCloud Link */}
                <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                  <span className="text-xs font-mono text-white/50">
                    {track.duration}
                  </span>

                  <a
                    href={track.permalink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    title="Слушать на SoundCloud"
                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all opacity-80 group-hover:opacity-100"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card: "Перейти в SoundCloud, чтобы смотреть еще треков" */}
        <div className="pt-6 pb-2 flex flex-col items-center justify-center text-center space-y-3.5 border-t border-white/10">
          <p className="text-xs text-white/40 font-mono tracking-wider uppercase">
            Вся дискография и неизданный материал
          </p>
          <a
            href={SOUNDCLOUD_ARTIST_URL}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-medium text-xs flex items-center gap-2.5 shadow-xl shadow-white/10 group cursor-pointer"
          >
            <Cloud className="w-3.5 h-3.5 fill-current" />
            <span>Перейти в SoundCloud, чтобы слушать больше треков</span>
            <ExternalLink className="w-3.5 h-3.5 text-black/60" />
          </a>
        </div>
      </div>
    </div>
  );
};
