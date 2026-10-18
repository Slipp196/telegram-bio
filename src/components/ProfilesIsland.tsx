import React from 'react';
import { Plus, Compass, Sparkles, User, Snowflake, ShieldCheck } from 'lucide-react';
import { BioProfile } from '../types/bio';

interface ProfilesIslandProps {
  profiles: BioProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenCreateModal: () => void;
  onOpenDirectoryModal: () => void;
}

export const ProfilesIsland: React.FC<ProfilesIslandProps> = ({
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenCreateModal,
  onOpenDirectoryModal,
}) => {
  return (
    <aside
      aria-label="Остров переключения профилей"
      className="hidden md:flex flex-col items-center justify-between w-[64px] lg:w-[68px] shrink-0 md:sticky md:top-6 md:h-[calc(100vh-48px)] py-3 px-1.5 rounded-3xl bg-black/60 backdrop-blur-3xl border border-white/10 shadow-2xl relative z-20 select-none"
    >
      {/* Top Header / Platform Emblem */}
      <div className="flex flex-col items-center gap-2 w-full">
        <button
          onClick={onOpenDirectoryModal}
          className="group relative w-10 h-10 rounded-2xl bg-white/5 border border-white/15 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 hover:border-white/30 transition-all cursor-pointer shadow-md"
          title="Каталог профилей"
        >
          <Snowflake className="w-4 h-4 transition-transform group-hover:rotate-45" />
          {/* Tooltip */}
          <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 text-[11px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
            Каталог профилей
          </span>
        </button>

        <div className="w-7 h-px bg-white/10 my-1" />
      </div>

      {/* Profile Avatars Stack (Scrollable if many) */}
      <div className="w-full flex-1 overflow-y-auto no-scrollbar py-2 flex flex-col items-center gap-2.5">
        {profiles.map((p) => {
          const isActive = p.id === activeProfileId;
          const initial = (p.name || p.username || 'U').charAt(0).toUpperCase();

          return (
            <div key={p.id || p.username} className="relative group flex items-center justify-center">
              {/* Active Left Indicator Bar */}
              {isActive && (
                <span className="absolute -left-2.5 top-1/2 -translate-y-1/2 w-1.5 h-6 rounded-r-full bg-white shadow-[0_0_10px_#ffffff]" />
              )}

              {/* Avatar Button */}
              <button
                onClick={() => p.id && onSelectProfile(p.id)}
                className={`relative w-11 h-11 rounded-2xl overflow-hidden transition-all duration-300 flex items-center justify-center cursor-pointer ${
                  isActive
                    ? 'ring-2 ring-white shadow-[0_0_16px_rgba(255,255,255,0.7)] scale-105 bg-white/20'
                    : 'opacity-70 hover:opacity-100 hover:scale-105 bg-white/5 border border-white/10 hover:border-white/30'
                }`}
              >
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.name}
                    className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-white/80 font-display font-medium text-sm">
                    {initial}
                  </div>
                )}

                {/* Badge Indicator in Corner */}
                {p.id === 'slipp-seraphim' && (
                  <span
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white text-black flex items-center justify-center text-[8px] font-bold shadow"
                    title="Главный автор"
                  >
                    ★
                  </span>
                )}
              </button>

              {/* Hover Tooltip Card */}
              <div className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 px-3 py-2 rounded-2xl bg-black/95 backdrop-blur-2xl border border-white/20 text-white min-w-[140px] max-w-[220px] opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 shadow-2xl flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-white tracking-tight truncate font-display">
                    {p.name}
                  </span>
                  {p.badge && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/10 text-white/80 border border-white/15">
                      {p.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-mono text-white/50 truncate">
                  {p.username}
                </span>
                {p.bio && (
                  <p className="text-[10px] text-white/70 line-clamp-2 mt-0.5 leading-snug">
                    {p.bio}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Actions: Add Profile & Explore */}
      <div className="flex flex-col items-center gap-2 w-full pt-1">
        <div className="w-7 h-px bg-white/10 my-1" />

        {/* Create Profile Button */}
        <button
          onClick={onOpenCreateModal}
          className="group relative w-11 h-11 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-black transition-all duration-300 flex items-center justify-center cursor-pointer shadow-lg hover:shadow-white/20 hover:scale-105"
          title="Создать свой профиль"
        >
          <Plus className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
          {/* Tooltip */}
          <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 text-[11px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
            Создать свой профиль
          </span>
        </button>

        {/* Directory Modal Trigger */}
        <button
          onClick={onOpenDirectoryModal}
          className="group relative w-10 h-10 rounded-2xl bg-white/[0.03] hover:bg-white/10 text-white/50 hover:text-white border border-white/10 transition-all flex items-center justify-center cursor-pointer"
          title="Все профили платформы"
        >
          <Compass className="w-4 h-4" />
          <span className="pointer-events-none absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-xl bg-black/90 backdrop-blur-xl border border-white/20 text-[11px] font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-2xl">
            Все профили
          </span>
        </button>
      </div>
    </aside>
  );
};
