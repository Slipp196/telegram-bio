import React from 'react';
import { Send, Cloud, Edit3, User, X, Sparkles } from 'lucide-react';
import { BioProfile, ActiveIslandTab } from '../types/bio';
import { SoundCloudPlayer } from './SoundCloudPlayer';

interface LeftBlurredSidebarProps {
  profile: BioProfile;
  activeTab: ActiveIslandTab;
  onSelectTab: (tab: ActiveIslandTab) => void;
  onOpenEditor: () => void;
  currentTrackIndex: number;
  onSelectTrack: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const LeftBlurredSidebar: React.FC<LeftBlurredSidebarProps> = ({
  profile,
  activeTab,
  onSelectTab,
  onOpenEditor,
  currentTrackIndex,
  onSelectTrack,
  isPlaying,
  onTogglePlay,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  return (
    <aside
      aria-label="Боковая панель профиля и навигации"
      onWheel={(e) => {
        // Prevent scroll attempts and twitching over the left buttons
        e.stopPropagation();
      }}
      className={`fixed top-0 bottom-0 left-0 w-[290px] sm:w-[320px] max-w-[85vw] h-screen z-50 md:z-10 flex flex-col justify-between backdrop-blur-3xl bg-black/90 md:bg-black/75 md:border md:border-white/10 md:rounded-3xl border-r border-white/10 shadow-2xl text-white select-none overflow-hidden transition-transform duration-300 ease-out md:relative md:w-full md:h-[calc(100vh-48px)] md:translate-x-0 ${
        isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      {/* Top & Middle Content (Buttons fit cleanly on desktop, no scroll needed) */}
      <div className="flex-1 md:overflow-hidden overflow-y-auto overscroll-none p-5 sm:p-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Mobile Header with Close Button */}
        <div className="flex md:hidden items-center justify-between pb-2 border-b border-white/10">
          <span className="text-[11px] font-mono tracking-wider uppercase text-white/50">
            Профиль артиста
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg bg-white/10 text-white/70 hover:text-white"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

{/* Profile Card Header (Avatar, Nick, User, Bio) */}
        <div className="space-y-4 pt-1">
          {/* Avatar */}
          <div className="flex items-center justify-between">
            <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 shadow-xl shrink-0">
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-white/50">
                  <User className="w-9 h-9" />
                </div>
              )}
            </div>
          </div>

          {/* Nickname & Username */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-normal tracking-tight font-display text-white">
                {profile.name}
              </h1>
              <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
            </div>

            <p className="text-xs font-mono text-white/50 tracking-wide">
              {profile.username}
            </p>
          </div>

          {/* Description (Bio) */}
          <p className="text-xs sm:text-sm text-white/70 font-light leading-relaxed whitespace-pre-wrap border-l-2 border-white/20 pl-3">
            {profile.bio}
          </p>
        </div>

        {/* Separator */}
        <div className="h-px bg-white/10" />

        {/* Navigation Section: Telegram Channel Card & SoundCloud Card */}
        <div className="space-y-3">
          <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 pl-1">
            Разделы био
          </p>

          {/* Card 1: Telegram Channel Island Opener */}
          <button
            onClick={() => {
              onSelectTab('telegram');
              onCloseMobile?.();
            }}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-white/15 border-white shadow-xl shadow-white/5 text-white'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  activeTab === 'telegram'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/10 text-white group-hover:bg-white/20'
                }`}
              >
                <Send className="w-4 h-4 -translate-x-0.5 translate-y-0.5" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium tracking-tight truncate">
                  Телеграм канал
                </p>
                <p className="text-[10px] text-white/40 font-mono truncate">
                  @sserapphim
                </p>
              </div>
            </div>

            {activeTab === 'telegram' && (
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] shrink-0" />
            )}
          </button>

          {/* Card 2: SoundCloud Island Opener */}
          <button
            onClick={() => {
              onSelectTab('soundcloud');
              onCloseMobile?.();
            }}
            className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
              activeTab === 'soundcloud'
                ? 'bg-white/15 border-white shadow-xl shadow-white/5 text-white'
                : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20 text-white/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  activeTab === 'soundcloud'
                    ? 'bg-white text-black shadow-md'
                    : 'bg-white/10 text-white group-hover:bg-white/20'
                }`}
              >
                <Cloud className="w-4 h-4 fill-current" />
              </div>

              <div className="min-w-0">
                <p className="text-xs font-medium tracking-tight truncate">
                  SoundCloud
                </p>
                <p className="text-[10px] text-white/40 font-mono truncate">
                  916отрывок
                </p>
              </div>
            </div>

            {activeTab === 'soundcloud' && (
              <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Integrated Songs Player at the Very Bottom of the Blur Panel */}
      <SoundCloudPlayer
        currentTrackIndex={currentTrackIndex}
        onSelectTrack={onSelectTrack}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
      />
    </aside>
  );
};
