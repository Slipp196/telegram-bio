import React, { useState, useRef } from 'react';
import { Send, Eye, Share2, Pin, ExternalLink, Mic, Play, Film } from 'lucide-react';
import { TelegramPost } from '../types/bio';
import { TELEGRAM_CHANNEL_URL } from '../data/artistTracks';

interface TelegramFeedProps {
  posts: TelegramPost[];
  channelUrl?: string;
  channelHandle?: string;
  onViewImage?: (url: string, caption?: string) => void;
}

export const TelegramFeed: React.FC<TelegramFeedProps> = ({
  posts,
  channelUrl = TELEGRAM_CHANNEL_URL,
  channelHandle = '@sserapphim',
  onViewImage,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  const handleCopyPost = (postId: string) => {
    navigator.clipboard.writeText(`${channelUrl}/${postId.replace(/\D/g, '') || '1'}`);
    setCopiedId(postId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Decode common HTML entities like &#33; -> !
  const decodeEntities = (str: string) => {
    if (!str) return '';
    return str
      .replace(/&#33;/g, '!')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 animate-in fade-in slide-in-from-right-4 duration-400">
      {/* Island Top Header Card */}
      <div className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl p-6 sm:p-7 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-neutral-900 border border-white/20 shrink-0 shadow-lg flex items-center justify-center">
            <Send className="w-7 h-7 text-white -translate-x-0.5 translate-y-0.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase bg-white/10 text-white/80 border border-white/10">
                TELEGRAM
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-light text-white font-display tracking-tight">
              {channelHandle}
            </h2>
          </div>
        </div>

        {/* Action Button: ПЕРЕЙТИ В КАНАЛ */}
        <a
          href={channelUrl}
          target="_blank"
          rel="noreferrer"
          className="w-full sm:w-auto px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-medium text-xs flex items-center justify-center gap-2.5 shadow-xl shadow-white/5 group shrink-0"
        >
          <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          <span>Перейти в канал</span>
          <ExternalLink className="w-3.5 h-3.5 text-black/60" />
        </a>
      </div>

      {/* Main Posts Scroll Container with NO scrollbar visible and butter-smooth scrolling */}
      <div
        ref={scrollContainerRef}
        className="rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl p-5 sm:p-7 shadow-2xl max-h-[calc(100vh-230px)] overflow-y-auto space-y-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain"
      >
        {posts.map((post) => {
          const hasImage = Boolean(post.mediaUrl);
          const hasText = Boolean(post.text);

          return (
            <article
              key={post.id}
              className="p-5 sm:p-6 rounded-2xl bg-white/[0.025] hover:bg-white/[0.045] border border-white/10 hover:border-white/15 space-y-4 transition-all duration-500 ease-out shadow-md"
            >
              {/* Post Meta Header */}
              <div className="flex items-center justify-between text-xs text-white/50 pb-2.5 border-b border-white/5">
                <div className="flex items-center gap-2 flex-wrap">
                  {post.isNew && (
                    <span className="flex items-center gap-1.5 text-[10px] text-black font-semibold font-mono bg-white px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(255,255,255,0.45)]">
                      <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                      НОВЫЙ ПОСТ
                    </span>
                  )}
                  {post.isPinned && (
                    <span className="flex items-center gap-1 text-[11px] text-white font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/10">
                      <Pin className="w-3 h-3" /> Закреплено
                    </span>
                  )}
                  <span className="font-light text-white/60">{post.date}</span>
                </div>

                <div className="flex items-center gap-3 text-[11px] font-mono text-white/40">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 text-white/40" />
                    {post.views}
                  </span>

                  <button
                    onClick={() => handleCopyPost(post.id)}
                    className="hover:text-white transition-colors cursor-pointer"
                    title="Скопировать ссылку на пост"
                  >
                    {copiedId === post.id ? (
                      <span className="text-white">Скопировано!</span>
                    ) : (
                      <Share2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>

              {/* Post Content with Image on the Right Corner */}
              <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                {/* Left Side: Text, Links, and Quote */}
                <div className="flex-1 min-w-0 space-y-3.5">
                  {/* Post Text */}
                  {hasText && (
                    <div className="text-sm sm:text-base text-white/90 leading-relaxed font-light whitespace-pre-wrap">
                      {decodeEntities(post.text!)}
                    </div>
                  )}

                  {/* Links inside Post (SoundCloud, TikTok, etc.) */}
                  {post.links && post.links.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {post.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black border border-white/15 text-xs font-medium transition-all group"
                        >
                          <span>{decodeEntities(link.title)}</span>
                          <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Quote Formatting: Fully Rounded Smooth Corners with soft glass */}
                  {post.quote && (
                    <blockquote className="border-l-4 border-l-white/60 border border-white/10 bg-white/[0.04] p-4 sm:p-5 rounded-2xl text-white/80 font-mono text-xs sm:text-sm my-2 whitespace-pre-wrap leading-relaxed shadow-inner">
                      {decodeEntities(post.quote)}
                    </blockquote>
                  )}
                </div>

                {/* Right Side: Image Thumbnail in the Corner (clicking opens full screen) */}
                {hasImage && (
                  <div
                    onClick={() => onViewImage && onViewImage(post.mediaUrl!, post.text)}
                    className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 shrink-0 cursor-pointer group shadow-xl transition-transform duration-300 hover:scale-[1.02]"
                    title="Нажмите, чтобы открыть фото на весь экран"
                  >
                    <img
                      src={post.mediaUrl}
                      alt="Post media preview"
                      className="w-full h-full object-cover grayscale contrast-125 brightness-95 transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="text-[11px] font-mono bg-black/85 backdrop-blur-md px-3 py-1 rounded-full text-white border border-white/20 shadow-lg">
                        Увеличить
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Video Player Card (if post contains a video) */}
              {post.video && (
                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/50 p-3 sm:p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs text-white/60">
                    <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-white/80">
                      <Film className="w-3.5 h-3.5" /> Видео ({post.video.duration || '0:33'})
                    </span>
                    <a
                      href={post.video.sourceUrl || `https://t.me/sserapphim/${post.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition-colors flex items-center gap-1 text-[11px] font-mono"
                    >
                      <span>Открыть в Telegram</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {activeVideoId === post.id ? (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-white/10">
                      <iframe
                        src={post.video.embedUrl || `https://t.me/sserapphim/${post.id}?embed=1`}
                        title={`Telegram Video ${post.id}`}
                        className="w-full h-full border-none"
                        allow="autoplay; encrypted-media; fullscreen"
                      />
                    </div>
                  ) : (
                    <div
                      onClick={() => setActiveVideoId(post.id)}
                      className="relative w-full h-52 sm:h-64 rounded-xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer group flex items-center justify-center shadow-lg"
                    >
                      {post.video.thumbUrl ? (
                        <img
                          src={post.video.thumbUrl}
                          alt="Video thumbnail"
                          className="w-full h-full object-cover grayscale contrast-125 brightness-90 transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-950 flex items-center justify-center" />
                      )}
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <div className="w-14 h-14 rounded-full bg-white text-black flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 active:scale-95">
                          <Play className="w-6 h-6 fill-current translate-x-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-black/80 backdrop-blur-md text-white font-mono text-[10px] border border-white/10">
                        {post.video.duration || '0:33'}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Voice Note Component with Exact Publication Time */}
              {post.voiceNote && (
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 select-none">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center bg-white/10 text-white border border-white/15 shrink-0 shadow-sm">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-white">Голосовое сообщение</span>
                        <span className="text-xs font-mono text-white/50">({post.voiceNote.duration})</span>
                      </div>
                      {/* Publication Date */}
                      <p className="text-[11px] font-mono text-white/50">
                        Опубликовано: <span className="text-white/80">{post.date} (МСК)</span>
                      </p>
                      {/* Subtle waveform graphic */}
                      <div className="flex items-center gap-1 h-3 mt-1.5 opacity-60">
                        {post.voiceNote.waveform.slice(0, 22).map((val: number, idx: number) => (
                          <div
                            key={idx}
                            style={{ height: `${Math.max(20, (val / 100) * 100)}%` }}
                            className="w-1 rounded-full bg-white/40"
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <a
                    href={`https://t.me/sserapphim/${post.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-medium flex items-center justify-center gap-2 transition-all shadow-md group shrink-0 active:scale-95"
                  >
                    <span>Слушать в канале</span>
                    <ExternalLink className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>
              )}

              {/* Reactions Bar: ONLY shown if real reactions exist, and NOT clickable */}
              {post.reactions && post.reactions.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5 pointer-events-none select-none">
                  {post.reactions.map((r, rIdx) => (
                    <div
                      key={rIdx}
                      className="px-3 py-1 rounded-full text-xs flex items-center gap-1.5 bg-white/5 border border-white/10 text-white/70"
                    >
                      <span>{r.emoji}</span>
                      <span className="font-mono text-[11px]">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          );
        })}

        {/* Bottom CTA Card: "Подписаться, чтобы читать дальше" */}
        <div className="pt-6 pb-2 flex flex-col items-center justify-center text-center space-y-3.5 border-t border-white/10">
          <p className="text-xs text-white/40 font-mono tracking-wider uppercase">
            Вы посмотрели последние публикации канала
          </p>
          <a
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
            className="px-6 py-3 rounded-full bg-white text-black hover:bg-neutral-200 transition-all font-medium text-xs flex items-center gap-2.5 shadow-xl shadow-white/10 group cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            <span>Подписаться, чтобы читать дальше</span>
            <ExternalLink className="w-3.5 h-3.5 text-black/60" />
          </a>
        </div>
      </div>
    </div>
  );
};
