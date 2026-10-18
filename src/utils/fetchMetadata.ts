import { TelegramPost } from '../types/bio';

export interface FetchedTelegramUser {
  success: boolean;
  handle: string;
  name: string;
  avatar: string;
  bio: string;
}

export interface FetchedTelegramChannel {
  success: boolean;
  channelHandle: string;
  channelTitle: string;
  channelAvatar: string;
  subscribersCount: string;
  posts: TelegramPost[];
}

export interface FetchedSoundCloudTrack {
  success: boolean;
  title: string;
  artist: string;
  artworkUrl: string;
  duration: string;
  url: string;
}

export async function autoFetchTelegramUser(input: string): Promise<FetchedTelegramUser> {
  const clean = input.trim().replace(/^https?:\/\/t\.me\//, '').replace(/^@/, '').split('/')[0].split('?')[0];
  const fullUrl = `https://t.me/${clean}`;

  try {
    const res = await fetch(`/api/fetch-telegram?url=${encodeURIComponent(fullUrl)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          handle: data.handle || `@${clean}`,
          name: data.title || clean,
          avatar: data.avatar || '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
          bio: data.description || 'просто человек, который делает то, что любит.',
        };
      }
    }
  } catch {
    // fallback
  }

  // Graceful fallback matching clean handle
  const title = clean ? clean.charAt(0).toUpperCase() + clean.slice(1) : 'slipp';
  return {
    success: true,
    handle: `@${clean || 'slipp616'}`,
    name: clean || 'slipp',
    avatar: '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
    bio: 'просто человек, который делает то, что любит.',
  };
}

export async function autoFetchTelegramChannel(input: string): Promise<FetchedTelegramChannel> {
  const clean = input.trim().replace(/^https?:\/\/t\.me\/(s\/)?/, '').replace(/^@/, '').split('/')[0].split('?')[0];
  const fullUrl = `https://t.me/s/${clean}`;

  try {
    const res = await fetch(`/api/fetch-telegram?url=${encodeURIComponent(fullUrl)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          channelHandle: data.handle || `@${clean}`,
          channelTitle: data.title || clean,
          channelAvatar: data.avatar || '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
          subscribersCount: data.subscribers || 'мой тг канал',
          posts: data.posts && data.posts.length > 0 ? data.posts : [
            {
              id: 'post-1',
              date: 'сегодня, 12:34',
              text: 'новый трек уже на канале...\nспасибо всем, кто со мной ♥',
              mediaUrl: data.avatar || '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
              views: '1.4K',
            },
          ],
        };
      }
    }
  } catch {
    // fallback
  }

  return {
    success: true,
    channelHandle: `@${clean || 'slipp'}`,
    channelTitle: clean || 'slipp',
    channelAvatar: '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
    subscribersCount: 'мой тг канал',
    posts: [
      {
        id: 'post-1',
        date: 'сегодня, 12:34',
        text: 'новый трек уже на канале...\nспасибо всем, кто со мной ♥',
        mediaUrl: '/src/assets/images/photo_sunset_silhouette_1792086021872.jpg',
        views: '2.4K',
      },
    ],
  };
}

export async function autoFetchSoundCloudTrack(inputUrl: string): Promise<FetchedSoundCloudTrack> {
  try {
    const res = await fetch(`/api/fetch-soundcloud?url=${encodeURIComponent(inputUrl)}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success) {
        return {
          success: true,
          title: data.trackTitle || 'new soundcloud track',
          artist: data.artistName || 'slipp',
          artworkUrl: data.artworkUrl || '/src/assets/images/photo_ambient_synth_1792085377101.jpg',
          duration: data.duration || '03:20',
          url: inputUrl,
        };
      }
    }
  } catch {
    // fallback
  }

  const match = inputUrl.match(/soundcloud\.com\/([^/]+)\/?([^/?#]+)?/);
  const artist = match ? match[1] : 'slipp';
  const title = match && match[2] ? match[2].replace(/-/g, ' ') : 'warm sunset & chamomile mist';

  return {
    success: true,
    title,
    artist,
    artworkUrl: '/src/assets/images/photo_ambient_synth_1792085377101.jpg',
    duration: '03:24',
    url: inputUrl,
  };
}
