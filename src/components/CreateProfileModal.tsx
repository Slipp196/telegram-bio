import React, { useState } from 'react';
import {
  X,
  Upload,
  User,
  Sparkles,
  Send,
  Cloud,
  Check,
  AlertCircle,
  Wand2,
} from 'lucide-react';
import { BioProfile, BackgroundEffectType } from '../types/bio';

interface CreateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProfile: (newProfile: BioProfile) => void;
}

const BACKGROUND_OPTIONS: Array<{ id: BackgroundEffectType; label: string }> = [
  { id: 'snow', label: '❄️ Снег' },
  { id: 'stardust', label: '✨ Звездная пыль' },
  { id: 'fireflies', label: '🌕 Светлячки' },
  { id: 'mist', label: '🌫️ Туман' },
  { id: 'rain', label: '🌧️ Дождь' },
  { id: 'none', label: '🚫 Без эффекта' },
];

export const CreateProfileModal: React.FC<CreateProfileModalProps> = ({
  isOpen,
  onClose,
  onCreateProfile,
}) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [channelUrl, setChannelUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [backgroundEffect, setBackgroundEffect] = useState<BackgroundEffectType>('snow');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleAvatarFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setAvatarUrl(e.target?.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const applyTemplate = (type: 'artist' | 'channel' | 'minimal') => {
    if (type === 'artist') {
      setName('Acoustic Echo');
      setUsername('@echo_frequency');
      setBio('глубокий эмбиент, пленочные кассеты и ночная меланхолия.');
      setChannelUrl('https://t.me/sserapphim');
      setSoundcloudUrl('https://soundcloud.com/916otryvok');
      setBackgroundEffect('mist');
    } else if (type === 'channel') {
      setName('Ночной Дневник');
      setUsername('@night_thoughts');
      setBio('мысли, отрывки текстов и подборки атмосферной музыки.');
      setChannelUrl('https://t.me/sserapphim');
      setBackgroundEffect('fireflies');
    } else {
      setName('Аноним');
      setUsername('@aether_mind');
      setBio('тишина и чистое пространство.');
      setBackgroundEffect('stardust');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Пожалуйста, укажите имя профиля.');
      return;
    }

    let formattedUsername = username.trim();
    if (formattedUsername && !formattedUsername.startsWith('@')) {
      formattedUsername = `@${formattedUsername}`;
    }
    if (!formattedUsername) {
      formattedUsername = `@${name.toLowerCase().replace(/[^a-z0-9_]/g, '') || 'user'}`;
    }

    const newProfile: BioProfile = {
      id: `profile-${Date.now()}`,
      name: name.trim(),
      username: formattedUsername,
      bio: bio.trim() || 'Новый профиль в сообществе.',
      avatarUrl: avatarUrl.trim(),
      telegramUrl: formattedUsername ? `https://t.me/${formattedUsername.replace('@', '')}` : '',
      channelUrl: channelUrl.trim() || 'https://t.me/sserapphim',
      soundcloudUrl: soundcloudUrl.trim() || 'https://soundcloud.com/916otryvok',
      sections: ['telegram', 'soundcloud'],
      backgroundEffect,
      isCustom: true,
      createdAt: Date.now(),
      badge: 'Новый',
    };

    onCreateProfile(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-3xl border border-white/15 bg-[#0a0a0a]/95 backdrop-blur-2xl shadow-2xl overflow-hidden text-white flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-white" />
            <h3 className="text-base font-normal tracking-wide font-display text-white">
              Создать свой профиль
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto no-scrollbar flex-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Preset Templates */}
          <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs text-white/70">
              <span className="flex items-center gap-1.5 font-mono text-[11px]">
                <Wand2 className="w-3.5 h-3.5 text-white/80" />
                Быстрый шаблон для старта:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => applyTemplate('artist')}
                className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
              >
                🎵 Артист / Музыкант
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('channel')}
                className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
              >
                📢 Телеграм-блог
              </button>
              <button
                type="button"
                onClick={() => applyTemplate('minimal')}
                className="px-3 py-1 rounded-full text-xs font-mono bg-white/10 hover:bg-white/20 border border-white/15 transition-colors cursor-pointer"
              >
                ❄️ Минималист
              </button>
            </div>
          </div>

          {/* Avatar Upload / Preview */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
            <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/20 shrink-0 flex items-center justify-center shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Превью" className="w-full h-full object-cover grayscale" />
              ) : (
                <User className="w-7 h-7 text-white/30" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-xs text-white/80 font-medium block font-mono">
                Аватарка профиля
              </label>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs text-white flex items-center gap-1.5 cursor-pointer transition-colors shadow">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Загрузить фото</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleAvatarFile(e.target.files[0])}
                    className="hidden"
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
                  >
                    Удалить
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
                Имя / Никнейм *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="например: slipp"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
                Юзернейм (@username)
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="@username"
                className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors font-mono"
              />
            </div>
          </div>

          {/* Bio Description */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
              Описание (Био)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Короткий рассказ о себе, цитата или мысли..."
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors resize-none"
            />
          </div>

          {/* Telegram Channel Link */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Send className="w-3.5 h-3.5" />
              Ссылка на Telegram канал
            </label>
            <input
              type="text"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              placeholder="https://t.me/sserapphim"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors font-mono"
            />
            <p className="text-[10px] text-white/40 font-mono">
              Посты с открытого канала будут автоматически отображаться в островном окне Telegram!
            </p>
          </div>

          {/* SoundCloud Link */}
          <div className="space-y-1.5">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Cloud className="w-3.5 h-3.5 fill-current" />
              Ссылка на SoundCloud
            </label>
            <input
              type="text"
              value={soundcloudUrl}
              onChange={(e) => setSoundcloudUrl(e.target.value)}
              placeholder="https://soundcloud.com/916otryvok"
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-white placeholder-white/30 text-sm focus:outline-none focus:border-white transition-colors font-mono"
            />
          </div>

          {/* Background Visual Effect */}
          <div className="space-y-2">
            <label className="text-xs text-white/80 font-medium uppercase tracking-wider block font-mono">
              Фоновый визуальный эффект
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BACKGROUND_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setBackgroundEffect(opt.id)}
                  className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${
                    backgroundEffect === opt.id
                      ? 'bg-white text-black font-medium border-white shadow-md'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span>{opt.label}</span>
                  {backgroundEffect === opt.id && <Check className="w-3.5 h-3.5 text-black" />}
                </button>
              ))}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            Отмена
          </button>

          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 font-medium text-xs transition-all shadow-xl cursor-pointer"
          >
            Создать профиль
          </button>
        </div>
      </div>
    </div>
  );
};
