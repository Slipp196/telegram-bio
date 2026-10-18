import React from 'react';
import { Eye, Edit3, Sparkles } from 'lucide-react';

interface TopBarProps {
  brandName: string;
  mode: 'guest' | 'editor';
  onToggleMode: () => void;
  onOpenEditor: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  brandName,
  mode,
  onToggleMode,
  onOpenEditor,
}) => {
  return (
    <header className="w-full z-40 px-6 sm:px-12 py-5 sm:py-6 flex items-center justify-between text-white/90">
      {/* Brand / Profile Title */}
      <div className="flex items-center gap-3">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_#38bdf8]" />
        <span className="text-base sm:text-lg font-light tracking-wide text-white/90 font-display lowercase">
          {brandName || 'slipp'}
        </span>
      </div>

      {/* Season Tag & Controls */}
      <div className="flex items-center gap-3">
        {/* Subtle Season Tag */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-950/30 border border-sky-400/20 text-[11px] text-sky-200/70 font-mono">
          <span className="w-1 h-1 rounded-full bg-sky-300" />
          <span>winter season</span>
        </div>

        {/* Mode Switcher: Guest vs Editor */}
        <button
          onClick={onToggleMode}
          className={`px-4 py-1.5 rounded-full text-xs transition-all flex items-center gap-1.5 ${
            mode === 'editor'
              ? 'bg-sky-400 text-black font-semibold shadow-[0_0_20px_rgba(56,189,248,0.4)]'
              : 'winter-pill text-white/80 hover:text-white hover:border-sky-300/40 hover:bg-sky-500/10'
          }`}
        >
          {mode === 'editor' ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>Вид гостя</span>
            </>
          ) : (
            <>
              <Edit3 className="w-3.5 h-3.5" />
              <span>Редактор</span>
            </>
          )}
        </button>

        {/* Editor Quick Trigger */}
        {mode === 'editor' && (
          <button
            onClick={onOpenEditor}
            className="p-2 rounded-full winter-pill text-sky-300 hover:text-white hover:border-sky-300/50 transition-all shadow-md"
            title="Открыть редактор профиля"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-300" />
          </button>
        )}
      </div>
    </header>
  );
};
