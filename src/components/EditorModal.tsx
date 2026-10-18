import React, { useState } from 'react';
import {
  X,
  Send,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  Loader2,
  Trash2,
  User,
  Cloud,
} from 'lucide-react';
import { BioProfile } from '../types/bio';
import { autoFetchTelegramUser } from '../utils/fetchMetadata';

interface EditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: BioProfile;
  onUpdateProfile: (updated: BioProfile) => void;
  onResetToDefault: () => void;
}

export const EditorModal: React.FC<EditorModalProps> = ({
  isOpen,
  onClose,
  profile,
  onUpdateProfile,
  onResetToDefault,
}) => {
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const update = (updater: (prev: BioProfile) => BioProfile) => {
    onUpdateProfile(updater(profile));
  };

  // Auto-fetch username and pull nickname
  const handleFetchUsername = async (handle: string) => {
    if (!handle.trim()) return;
    setLoading(true);
    setStatusMsg('Подтягиваем имя пользователя...');
    try {
      const data = await autoFetchTelegramUser(handle);
      update((prev) => ({
        ...prev,
        username: data.handle.startsWith('@') ? data.handle : `@${data.handle}`,
        name: data.name || prev.name,
        telegramUrl: `https://t.me/${data.handle.replace('@', '')}`,
      }));
      setStatusMsg(`Ник «${data.name}» успешно подтянут!`);
    } catch {
      setStatusMsg('Не удалось получить данные с Telegram.');
    } finally {
      setLoading(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  // Upload custom avatar
  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        update((prev) => ({
          ...prev,
          avatarUrl: e.target?.result as string,
        }));
        setStatusMsg('Аватарка успешно установлена!');
        setTimeout(() => setStatusMsg(''), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <h3 className="text-base font-normal tracking-wide font-display text-white">
              Редактор био-профиля
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification */}
        {statusMsg && (
          <div className="px-6 py-2.5 bg-white/10 border-b border-white/20 text-xs text-white flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-white shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-sm max-h-[80vh] overflow-y-auto scrollbar-thin">
          {/* Section 1: Telegram Username & Auto-fetch */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
              Username в Telegram
            </label>
            <p className="text-xs text-white/60 font-light">
              Введите ваш юзернейм (например, <code className="text-white bg-white/10 px-1 py-0.5 rounded font-mono">@slipp616</code>) — система автоматически подтянет ваш никнейм.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={profile.username}
                onChange={(e) => update((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="@slipp616"
                className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => handleFetchUsername(profile.username)}
                disabled={loading}
                className="px-4 py-2 bg-white text-black hover:bg-neutral-200 disabled:opacity-50 font-medium rounded-xl text-xs flex items-center gap-1.5 transition-all shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Подтянуть</span>
              </button>
            </div>
          </div>

          {/* Section 2: Avatar Upload */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
              Аватарка профиля
            </label>
            <div className="flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 shrink-0 shadow-inner">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    className="w-full h-full object-cover grayscale contrast-125"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/40">
                    <User className="w-7 h-7" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2 flex-1">
                <label className="cursor-pointer px-4 py-2 bg-white text-black hover:bg-neutral-200 rounded-xl text-xs font-medium text-center flex items-center justify-center gap-2 transition-all shadow-sm">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Загрузить аватарку</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleAvatarUpload(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {profile.avatarUrl && (
                  <button
                    onClick={() => update((prev) => ({ ...prev, avatarUrl: '' }))}
                    className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors self-start"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Удалить аватарку</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Nickname & Bio */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
                Отображаемое имя (Никнейм)
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => update((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="slipp"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
                Описание профиля (Bio)
              </label>
              <textarea
                rows={3}
                value={profile.bio}
                onChange={(e) => update((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="просто человек, который делает то, что любит."
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section 4: Channel URL */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
              Ссылка на Telegram канал
            </label>
            <input
              type="text"
              value={profile.channelUrl}
              onChange={(e) => update((prev) => ({ ...prev, channelUrl: e.target.value }))}
              placeholder="https://t.me/sserapphim"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors font-mono"
            />
          </div>

          {/* Section 5: Background Visual Effect */}
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
              Фоновый визуальный эффект
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'snow', label: '❄️ Снег' },
                { id: 'stardust', label: '✨ Звездная пыль' },
                { id: 'fireflies', label: '🌕 Светлячки' },
                { id: 'mist', label: '🌫️ Туман' },
                { id: 'rain', label: '🌧️ Дождь' },
                { id: 'none', label: '🚫 Без эффекта' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => update((prev) => ({ ...prev, backgroundEffect: opt.id as any }))}
                  className={`p-2 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                    (profile.backgroundEffect || 'snow') === opt.id
                      ? 'bg-white text-black font-medium border-white shadow-md'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {(profile.backgroundEffect || 'snow') === opt.id && <Check className="w-3 h-3 text-black" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <button
            onClick={() => {
              onResetToDefault();
              setStatusMsg('Сброшено к начальным значениям!');
              setTimeout(() => setStatusMsg(''), 2000);
            }}
            className="text-xs text-white/40 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить всё</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-medium text-xs transition-all shadow-md cursor-pointer"
          >
            Готово
          </button>
        </div>
      </div>
    </div>
  );
};
