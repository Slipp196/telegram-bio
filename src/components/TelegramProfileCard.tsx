import React, { useRef } from 'react';
import { Send, ExternalLink, Camera, Edit3, User } from 'lucide-react';
import { BioProfile } from '../types/bio';

interface TelegramProfileCardProps {
  profile: BioProfile;
  mode: 'guest' | 'editor';
  onOpenEditor: () => void;
  onUpdateAvatar: (url: string) => void;
}

export const TelegramProfileCard: React.FC<TelegramProfileCardProps> = ({
  profile,
  mode,
  onOpenEditor,
  onUpdateAvatar,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleAvatarFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onUpdateAvatar(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="w-full max-w-lg mx-auto relative group">
      {/* Hidden file input for direct avatar upload */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleAvatarFile(e.target.files[0])}
      />

      {/* Main Frosted Winter Profile Card */}
      <div className="winter-card rounded-[32px] p-6 sm:p-8 space-y-6 relative transition-all duration-300 hover:border-sky-400/25">
        {/* Top Avatar & Identifiers Row */}
        <div className="flex items-center gap-5">
          {/* Avatar Slot */}
          <div className="relative shrink-0">
            <div
              onClick={() => {
                if (mode === 'editor') {
                  fileInputRef.current?.click();
                }
              }}
              className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-sky-400/30 bg-sky-950/30 flex items-center justify-center relative shadow-[0_0_30px_rgba(56,189,248,0.2)] ${
                mode === 'editor' ? 'cursor-pointer hover:border-sky-300 transition-colors group/av' : ''
              }`}
            >
              {profile.avatarUrl ? (
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover/av:scale-105"
                />
              ) : (
                /* Clean Frost Placeholder when avatar is not yet uploaded */
                <div className="flex flex-col items-center justify-center text-sky-200/40 group-hover/av:text-sky-200 transition-colors">
                  <User className="w-8 h-8 sm:w-10 sm:h-10 stroke-[1.5]" />
                  {mode === 'editor' && (
                    <span className="text-[10px] text-sky-300/60 mt-1 font-mono">
                      + аватар
                    </span>
                  )}
                </div>
              )}

              {/* Hover overlay in editor mode */}
              {mode === 'editor' && (
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover/av:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera className="w-5 h-5 text-sky-300" />
                </div>
              )}
            </div>

            {/* Frost Blue Status Dot */}
            <div
              className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-sky-400 border-2 border-[#09111e] shadow-[0_0_8px_#38bdf8]"
              title="В сети"
            />
          </div>

          {/* User Name & Handle */}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight text-white font-display truncate lowercase">
                {profile.name}
              </h1>
              {mode === 'editor' && (
                <button
                  onClick={onOpenEditor}
                  className="p-1 rounded-full text-white/50 hover:text-white transition-colors shrink-0"
                  title="Редактировать профиль"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <a
              href={profile.telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-xs sm:text-sm font-mono text-sky-400/90 hover:text-sky-300 transition-colors"
            >
              {profile.username}
            </a>
          </div>
        </div>

        {/* Bio Text */}
        <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
          {profile.bio}
        </p>

        {/* Telegram Direct Action Button */}
        <div className="pt-2">
          <a
            href={profile.telegramUrl}
            target="_blank"
            rel="noreferrer"
            className="winter-pill w-full py-4 px-6 rounded-2xl flex items-center justify-between text-white hover:text-sky-100 hover:border-sky-400/40 hover:bg-sky-500/10 transition-all duration-300 group cursor-pointer shadow-lg active:scale-[0.98]"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 group-hover:scale-105 group-hover:bg-sky-500/30 transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)]">
                <Send className="w-4 h-4 fill-current ml-[-1px]" />
              </div>
              <div className="text-left">
                <span className="text-sm font-medium text-white block tracking-wide">
                  Открыть профиль в Telegram
                </span>
                <span className="text-xs text-sky-200/60 block font-light">
                  {profile.username}
                </span>
              </div>
            </div>

            <ExternalLink className="w-4 h-4 text-sky-300/40 group-hover:text-sky-300 group-hover:translate-x-0.5 transition-all" />
          </a>
        </div>
      </div>
    </div>
  );
};
