/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Send, Cloud } from 'lucide-react';
import { LeftBlurredSidebar } from './components/LeftBlurredSidebar';
import { TelegramFeed } from './components/TelegramFeed';
import { SoundCloudIsland } from './components/SoundCloudIsland';
import { WinterSnowflake } from './components/WinterSnowflake';
import { MusicPlaybackAura } from './components/MusicPlaybackAura';
import { CustomCursor } from './components/CustomCursor';
import { EditorModal } from './components/EditorModal';
import { LightboxModal } from './components/LightboxModal';
import {
  BioProfile,
  ActiveIslandTab,
  TelegramPost,
  INITIAL_BIO_PROFILE,
  INITIAL_TELEGRAM_POSTS,
} from './types/bio';
import { TELEGRAM_CHANNEL_URL } from './data/artistTracks';

const STORAGE_KEY = 'slipp_seraphim_bio_v8';

export default function App() {
  const [profile, setProfile] = useState<BioProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_BIO_PROFILE;
  });

  const [activeTab, setActiveTab] = useState<ActiveIslandTab>('telegram');
  const [posts, setPosts] = useState<TelegramPost[]>(INITIAL_TELEGRAM_POSTS);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; caption?: string } | null>(null);

  // Sync profile to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // Quota handling
    }
  }, [profile]);

  // Evaluate 3-hour "NEW" post badge logic
  const applyNewBadgeRules = useCallback((rawPosts: TelegramPost[]) => {
    const now = Date.now();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    let newestMarked = false;

    return rawPosts.map((p, idx) => {
      let isPostNew = false;
      const postTimestamp = p.timestamp || (p.rawDateTime ? new Date(p.rawDateTime).getTime() : 0);

      // Only the single newest post within 3 hours gets the badge
      if (!newestMarked && idx === 0 && postTimestamp > 0 && (now - postTimestamp) <= threeHoursMs) {
        isPostNew = true;
        newestMarked = true;
      }

      return {
        ...p,
        isNew: isPostNew,
      };
    });
  }, []);

  // Fetch real channel posts from Telegram proxy
  const fetchChannel = useCallback(async () => {
    try {
      const handle = profile.channelUrl.replace(/^https?:\/\/t\.me\/(s\/)?/, '').replace(/^@/, '').split('/')[0];
      if (!handle) return;
      const res = await fetch(`/api/fetch-telegram?url=${encodeURIComponent(`https://t.me/s/${handle}`)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.posts && data.posts.length > 0) {
          const formatted: TelegramPost[] = data.posts.map((p: any) => ({
            id: p.id,
            date: p.date,
            rawDateTime: p.rawDateTime,
            timestamp: p.timestamp || (p.rawDateTime ? new Date(p.rawDateTime).getTime() : 0),
            views: p.views || (INITIAL_TELEGRAM_POSTS.find(ip => ip.id === p.id)?.views) || '',
            text: p.text || '',
            quote: p.quote,
            links: p.links,
            mediaUrl: p.mediaUrl,
            reactions: p.reactions && p.reactions.length > 0 ? p.reactions : [],
            voiceNote: p.voiceNote,
          }));

          setPosts(applyNewBadgeRules(formatted));
        }
      }
    } catch {
      // Fall back to updated initial posts
      setPosts((prev) => applyNewBadgeRules(prev.length > 0 ? prev : INITIAL_TELEGRAM_POSTS));
    }
  }, [profile.channelUrl, applyNewBadgeRules]);

  // Initial fetch and 45s polling interval for newly published posts
  useEffect(() => {
    fetchChannel();
    const interval = setInterval(fetchChannel, 45000);
    return () => clearInterval(interval);
  }, [fetchChannel]);

  const handleResetToDefault = () => {
    setProfile(INITIAL_BIO_PROFILE);
    setPosts(applyNewBadgeRules(INITIAL_TELEGRAM_POSTS));
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden font-sans text-white select-none selection:bg-white/20 selection:text-white bg-black">
      {/* Pure Monochrome Dark Canvas & Subtle Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[#040404]" />
        {/* Soft monochrome ambient halos */}
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Mobile Top Navigation Bar (Visible only on < md screens) */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-black/85 backdrop-blur-2xl border-b border-white/10 shadow-xl">
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/15 border border-white/15 text-xs text-white transition-all cursor-pointer"
        >
          <div className="w-4 h-4 rounded-full overflow-hidden bg-white/20 shrink-0">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover grayscale" />
            ) : (
              <User className="w-full h-full p-0.5 text-white" />
            )}
          </div>
          <span className="font-medium tracking-tight truncate max-w-[110px]">{profile.name}</span>
          <span className="text-[10px] text-white/40 font-mono">Профиль</span>
        </button>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10">
          <button
            onClick={() => {
              setActiveTab('telegram');
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'telegram'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Send className="w-3 h-3" />
            <span>TG</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('soundcloud');
              setIsMobileSidebarOpen(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono transition-all cursor-pointer ${
              activeTab === 'soundcloud'
                ? 'bg-white text-black shadow-md'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Cloud className="w-3 h-3 fill-current" />
            <span>SC</span>
          </button>
        </div>
      </header>

      {/* Gentle White-Neon Music Playback Atmosphere with Floating Neon Notes (Behind UI) */}
      <MusicPlaybackAura isPlaying={isPlaying} />

      {/* Centered Framed Layout with Side Margins (квадратность / пустое пространство по бокам) */}
      <div className="w-full max-w-[1360px] 2xl:max-w-[1420px] mx-auto min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 flex flex-col md:flex-row items-center md:items-start justify-center gap-6 lg:gap-8 pt-18 md:pt-6 pb-6 relative z-10">
        {/* Left Column: Glass Window with Snowflake anchored behind it at SoundCloud position */}
        <div className="relative w-full md:w-[320px] lg:w-[340px] shrink-0 md:sticky md:top-6 md:h-[calc(100vh-48px)] flex flex-col justify-center">
          {/* Luminous Hyper-Detailed Snowflake - Anchored in place right behind the left window */}
          <WinterSnowflake isPlaying={isPlaying} />

          {/* Left Blurred Sidebar Window */}
          <LeftBlurredSidebar
            profile={profile}
            activeTab={activeTab}
            onSelectTab={(tab) => setActiveTab(tab)}
            onOpenEditor={() => setIsEditorOpen(true)}
            currentTrackIndex={currentTrackIndex}
            onSelectTrack={(idx) => setCurrentTrackIndex(idx)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            isMobileOpen={isMobileSidebarOpen}
            onCloseMobile={() => setIsMobileSidebarOpen(false)}
          />
        </div>

        {/* Backdrop overlay for mobile sidebar */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity"
          />
        )}

        {/* Right Column: Floating Island with Smooth Tab Switch Transition */}
        <main
          id="main-content"
          className="flex-1 min-w-0 w-full flex flex-col justify-center items-center py-2"
        >
          <div
            key={activeTab}
            className="w-full flex flex-col items-center justify-center animate-in fade-in zoom-in-[0.98] duration-300 fill-mode-both"
          >
            {activeTab === 'telegram' ? (
              /* Telegram Channel Feed Island */
              <TelegramFeed
                posts={posts}
                channelUrl={profile.channelUrl || TELEGRAM_CHANNEL_URL}
                channelHandle={
                  profile.channelUrl.includes('t.me/')
                    ? `@${profile.channelUrl.split('t.me/')[1].replace(/^s\//, '')}`
                    : '@sserapphim'
                }
                onViewImage={(url, caption) => setLightbox({ url, caption })}
              />
            ) : (
              /* SoundCloud Artist Releases Island */
              <SoundCloudIsland
                currentTrackIndex={currentTrackIndex}
                isPlaying={isPlaying}
                onSelectTrack={(idx) => setCurrentTrackIndex(idx)}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
              />
            )}
          </div>
        </main>
      </div>

      {/* Profile Editor Modal */}
      <EditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        profile={profile}
        onUpdateProfile={(updated) => setProfile(updated)}
        onResetToDefault={handleResetToDefault}
      />

      {/* Lightbox Modal for Post Images */}
      {lightbox && (
        <LightboxModal
          isOpen={true}
          imageUrl={lightbox.url}
          caption={lightbox.caption}
          onClose={() => setLightbox(null)}
        />
      )}

      {/* Custom Sleek Glowing Monochrome Winter Cursor */}
      <CustomCursor />
    </div>
  );
}
