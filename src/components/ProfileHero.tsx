import React from 'react';
import { Send, Cloud, ExternalLink, Edit3 } from 'lucide-react';

interface ProfileHeroProps {
  name: string;
  tagline: string;
  telegramUrl: string;
  soundcloudUrl: string;
  mode: 'guest' | 'editor';
  onOpenEditor: () => void;
}

export const ProfileHero: React.FC<ProfileHeroProps> = ({
  name,
  tagline,
  telegramUrl,
  soundcloudUrl,
  mode,
  onOpenEditor,
}) => {
  return (
    <div className="space-y-6">
      {/* Title & Tagline (clean, without bulky avatar, exactly like screenshot) */}
      <div className="space-y-2.5 pt-2">
        <div className="flex items-center gap-3">
          <h1 className="text-5xl sm:text-6xl font-light tracking-tight text-white font-display lowercase">
            {name}
          </h1>
          {mode === 'editor' && (
            <button
              onClick={onOpenEditor}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors"
              title="Редактировать имя и описание"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </div>
        <p className="text-sm sm:text-base text-white/70 font-light leading-relaxed max-w-lg">
          {tagline}
        </p>
      </div>

      {/* Two Clean Frosted Glass Buttons (ONLY titles, NO descriptions inside) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-1">
        {/* Telegram Button */}
        <a
          href={telegramUrl}
          target="_blank"
          rel="noreferrer"
          className="glass-pill rounded-2xl p-4 flex items-center justify-center sm:justify-start gap-3 hover:bg-white/15 transition-all duration-300 group cursor-pointer shadow-lg"
        >
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Send className="w-4 h-4 text-white fill-current ml-[-1px]" />
          </div>
          <span className="text-sm font-medium text-white tracking-wide">
            Telegram
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors ml-auto hidden sm:block" />
        </a>

        {/* SoundCloud Button */}
        <a
          href={soundcloudUrl}
          target="_blank"
          rel="noreferrer"
          className="glass-pill rounded-2xl p-4 flex items-center justify-center sm:justify-start gap-3 hover:bg-white/15 transition-all duration-300 group cursor-pointer shadow-lg"
        >
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Cloud className="w-4 h-4 text-white fill-current" />
          </div>
          <span className="text-sm font-medium text-white tracking-wide">
            SoundCloud
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/70 transition-colors ml-auto hidden sm:block" />
        </a>
      </div>
    </div>
  );
};
