import React, { useState } from 'react';
import {
  X,
  Search,
  User,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Copy,
  Check,
  Sparkles,
  Download,
  Upload,
} from 'lucide-react';
import { BioProfile } from '../types/bio';

interface ProfilesDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: BioProfile[];
  activeProfileId: string;
  onSelectProfile: (id: string) => void;
  onOpenCreateModal: () => void;
  onDeleteProfile: (id: string) => void;
  onExportProfiles: () => void;
  onImportProfiles: (json: string) => void;
}

export const ProfilesDirectoryModal: React.FC<ProfilesDirectoryModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onOpenCreateModal,
  onDeleteProfile,
  onExportProfiles,
  onImportProfiles,
}) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'custom' | 'community'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = profiles.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.bio && p.bio.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === 'custom') return !!p.isCustom;
    if (filter === 'community') return !p.isCustom;
    return true;
  });

  const handleCopyLink = (p: BioProfile) => {
    const url = `${window.location.origin}${window.location.pathname}#profile=${p.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedId(p.id || p.username);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      if (typeof evt.target?.result === 'string') {
        onImportProfiles(evt.target.result);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-white" />
            <div>
              <h3 className="text-base font-normal tracking-wide font-display text-white">
                Каталог профилей
              </h3>
              <p className="text-[11px] font-mono text-white/40">
                Всего доступно профилей: {profiles.length}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 sm:px-6 border-b border-white/10 bg-white/[0.01] flex flex-col sm:flex-row items-center gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск по имени, @username или био..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Все ({profiles.length})
            </button>
            <button
              onClick={() => setFilter('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                filter === 'custom'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Созданные ({profiles.filter((p) => p.isCustom).length})
            </button>
            <button
              onClick={() => setFilter('community')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                filter === 'community'
                  ? 'bg-white text-black font-medium'
                  : 'bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              Базовые
            </button>
          </div>
        </div>

        {/* Profiles Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto no-scrollbar flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filtered.map((p) => {
            const isActive = p.id === activeProfileId;
            const initial = (p.name || p.username || 'U').charAt(0).toUpperCase();

            return (
              <div
                key={p.id || p.username}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 relative ${
                  isActive
                    ? 'bg-white/[0.08] border-white shadow-xl shadow-white/5 ring-1 ring-white/50'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.05]'
                }`}
              >
                {/* Active Tag */}
                {isActive && (
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-mono tracking-wider uppercase bg-white text-black font-bold shadow-md">
                    Активен
                  </span>
                )}

                {/* Profile Identity */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-white/5 border border-white/15 shrink-0 flex items-center justify-center shadow">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.name}
                        className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-950 flex items-center justify-center text-white/70 font-display font-medium text-base">
                        {initial}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 pr-8">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-sm font-semibold text-white tracking-tight truncate font-display">
                        {p.name}
                      </h4>
                      {p.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/10 text-white/80 border border-white/15">
                          {p.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-white/50 truncate">
                      {p.username}
                    </p>
                  </div>
                </div>

                {/* Bio Excerpt */}
                <p className="text-xs text-white/70 line-clamp-2 leading-relaxed">
                  {p.bio || 'Нет описания'}
                </p>

                {/* Actions Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
                  <div className="flex items-center gap-1.5">
                    {/* Switch to this profile */}
                    {!isActive ? (
                      <button
                        onClick={() => {
                          if (p.id) {
                            onSelectProfile(p.id);
                            onClose();
                          }
                        }}
                        className="px-3 py-1 rounded-xl bg-white text-black hover:bg-neutral-200 font-medium text-[11px] transition-colors cursor-pointer shadow"
                      >
                        Выбрать
                      </button>
                    ) : (
                      <span className="text-[11px] font-mono text-white/50">
                        Текущий профиль
                      </span>
                    )}

                    {/* Copy Link Button */}
                    <button
                      onClick={() => handleCopyLink(p)}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                      title="Скопировать ссылку на профиль"
                    >
                      {copiedId === (p.id || p.username) ? (
                        <Check className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>

                  {/* Delete button (only for custom user-created profiles) */}
                  {p.isCustom && (
                    <button
                      onClick={() => {
                        if (confirm(`Удалить профиль «${p.name}»?`)) {
                          p.id && onDeleteProfile(p.id);
                        }
                      }}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                      title="Удалить профиль"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer with Create, Import, Export */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={onExportProfiles}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Экспорт всех профилей в файл JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт</span>
            </button>

            <label className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-white/70 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Импорт</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
            </label>
          </div>

          <button
            onClick={() => {
              onClose();
              onOpenCreateModal();
            }}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-white text-black hover:bg-neutral-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-xl cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Создать новый профиль</span>
          </button>
        </div>
      </div>
    </div>
  );
};
