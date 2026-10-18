export type ActiveIslandTab = 'telegram' | 'soundcloud';
export type ProfileSectionType = 'telegram' | 'soundcloud';

export interface BioProfile {
  id?: string;
  username: string; // e.g. "@slipp616"
  name: string; // e.g. "slipp"
  bio: string;
  avatarUrl: string; // custom avatar or empty
  telegramUrl: string; // "https://t.me/slipp616"
  channelUrl: string; // "https://t.me/sserapphim"
  soundcloudUrl: string; // "https://soundcloud.com/916otryvok"
  sections?: ProfileSectionType[]; // order and visibility of bio sections
  backgroundEffect?: BackgroundEffectType;
  isCustom?: boolean;
  createdAt?: number;
  badge?: string; // e.g. "Автор", "Артист", "Снежинка"
}

export interface TelegramReaction {
  emoji: string;
  count: number;
}

export interface TelegramPost {
  id: string;
  date: string; // e.g. "16 сент. 2026, 21:21"
  rawDateTime?: string; // ISO string e.g. "2026-09-16T21:21:25+00:00"
  timestamp?: number; // epoch ms for 3-hour check
  isPinned?: boolean;
  isNew?: boolean; // dynamic 3-hour new badge
  text?: string;
  quote?: string;
  links?: Array<{ title: string; url: string }>;
  views: string;
  mediaUrl?: string;
  reactions?: TelegramReaction[];
  voiceNote?: {
    duration: string;
    secondsTotal: number;
    waveform: number[];
    isPlayable?: boolean;
  };
  video?: {
    thumbUrl?: string;
    duration?: string;
    embedUrl?: string;
    sourceUrl?: string;
  };
}

// Convert any UTC / ISO date to exact Moscow Time (MSK, UTC+3)
export const formatMoscowTime = (rawDateTime?: string | number | Date): string => {
  if (!rawDateTime) return '';
  const d = new Date(rawDateTime);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export type AmbientSoundPreset = 'tape-dream' | 'deep-forest' | 'rain-synth' | 'ambient-night';

export type BackgroundEffectType =
  | 'none'
  | 'particles'
  | 'frost'
  | 'snow'
  | 'stars'
  | 'fireflies'
  | 'stardust'
  | 'mist'
  | 'rain'
  | 'spores';

export interface SoundCloudTrackConfig {
  trackUrl: string;
  url?: string;
  title: string;
  artist: string;
  artworkUrl: string;
  duration: string;
  plays?: string;
  likes?: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption?: string;
  aspect?: string;
}

// Initial bio profile
export const INITIAL_BIO_PROFILE: BioProfile = {
  id: 'slipp-seraphim',
  username: '@slipp616',
  name: 'slipp',
  bio: 'просто человек, который делает то, что любит.',
  avatarUrl: '', // empty by default so user can set own avatar!
  telegramUrl: 'https://t.me/slipp616',
  channelUrl: 'https://t.me/sserapphim',
  soundcloudUrl: 'https://soundcloud.com/916otryvok',
  sections: ['telegram', 'soundcloud'],
  backgroundEffect: 'snow',
  badge: 'Автор',
  isCustom: false,
};

// Featured community profiles for directory & search
export const COMMUNITY_PROFILES: BioProfile[] = [
  INITIAL_BIO_PROFILE,
  {
    id: 'k1llstation',
    username: '@k1llstation',
    name: 'KILLSTATION',
    bio: 'dark ambient acoustic poetry & raw frequencies.',
    avatarUrl: 'https://i1.sndcdn.com/artworks-000572719601-5qj47h-t500x500.jpg',
    telegramUrl: 'https://t.me/k1llstation',
    channelUrl: 'https://t.me/k1llstation',
    soundcloudUrl: 'https://soundcloud.com/killstation',
    sections: ['soundcloud', 'telegram'],
    backgroundEffect: 'mist',
    badge: 'Артист',
    isCustom: false,
  },
  {
    id: 'archive-916',
    username: '@archive916',
    name: '916 ARCHIVE',
    bio: 'unreleased cuts, demos, snippets and dark poetry excerpts.',
    avatarUrl: 'https://i1.sndcdn.com/artworks-vWsKYosnwudv0TYG-rGpp4g-t500x500.jpg',
    telegramUrl: 'https://t.me/sserapphim',
    channelUrl: 'https://t.me/sserapphim',
    soundcloudUrl: 'https://soundcloud.com/916otryvok',
    sections: ['telegram', 'soundcloud'],
    backgroundEffect: 'stardust',
    badge: 'Архив',
    isCustom: false,
  },
];

// Exactly 10 real posts from https://t.me/s/sserapphim ordered newest first with exact Moscow Time (MSK)
export const INITIAL_TELEGRAM_POSTS: TelegramPost[] = [
  {
    id: '737',
    date: '17 сент. 2026 г., 00:21',
    rawDateTime: '2026-09-16T21:21:25+00:00',
    timestamp: new Date('2026-09-16T21:21:25+00:00').getTime(),
    views: '42',
    mediaUrl: 'https://cdn4.telesco.pe/file/gzzYSObvOMx9-S_oOxAg42jwX9jY63ZBMN1REyu7-tWMJmmDq8iL55X-zlZ0GMAhUogICRQT78IeyJmjJH1BQKQHm-IzH8OIfbaChAZ2253h4brR61ePOWAorgMtzWuDZleB3nOaB6e4v2SEP1DGLNiGrAdDvmTOFSMBcEEq2V-2X81Lu7xSKSLDLE2ZoCK-a0EuDNT978U_6SD23S_MCVgq0FKbc_OMd6qamZdRef5qJnM-O3bzBCJht_He4TmwIhj3NrrlrDCuQqCD-5VjN1Oc3uKvyQ_kpKjXUeu7CSTXizbFTfXMCD4YGMozaXLf4DOXv1xd-WEM8pjkQfttuQ.jpg',
    text: '916отрывок - archive',
    links: [
      { title: 'слушать', url: 'https://soundcloud.com/916otryvok/sets/archive' },
    ],
    quote: '1. !!\n2. гитара\n3. история о любви\n4. мания\n5. но все равно ты лучше меня\n6. опоздавший\n7. прайм\n8. принцесса диана\n9. рекламный банер\n10. стреляй по мне стреляй в упор\n11. темно оранжевый закат\n12. убийца сентября\n13. я бы убивал',
    reactions: [], // Real: no reactions on this post
  },
  {
    id: '736',
    date: '9 авг. 2026 г., 21:39',
    rawDateTime: '2026-08-09T18:39:11+00:00',
    timestamp: new Date('2026-08-09T18:39:11+00:00').getTime(),
    views: '81',
    voiceNote: {
      duration: '0:36',
      secondsTotal: 36,
      waveform: [25, 40, 65, 80, 50, 70, 90, 85, 45, 60, 75, 95, 60, 40, 55, 70, 50, 35, 60, 80, 45, 30, 20],
      isPlayable: false,
    },
    reactions: [{ emoji: '🕊', count: 1 }],
  },
  {
    id: '734',
    date: '3 авг. 2026 г., 16:23',
    rawDateTime: '2026-08-03T13:23:49+00:00',
    timestamp: new Date('2026-08-03T13:23:49+00:00').getTime(),
    views: '94',
    mediaUrl: 'https://cdn4.telesco.pe/file/jam_WHX6JYAlxPEvnTLoYmOaoL1Vn3P5AavEiD03LrrGHCKxUsrZZVjw1NG-ISOJ0c-JlAMou28fqjJq-XLcmXxlmS2pWllZY5UCqMR88DDEHNMFdlvcA26LLGVXPTOGbme40acAowLaaqZbVGUFfKSNkIvbe3_tO66OvkcegKKLdz9okJY5friG9OlBFV7d1f1o-teDiGFO7-GOJvpU8PG9nJKdbXmmFhW61fxwSDYkIm4UaDpCAyfrqeNqH-KGbmyHgfLgxA81cose6yOBV8908EOe8sKtLudCiWNZXgxGk_0ILSKqnNM_1QQzAD6l6kcwmmSFXUIzysZH2B-WrA.jpg',
    text: '916отрывок - conclusion',
    links: [
      { title: 'слушать', url: 'https://soundcloud.com/916otryvok/conclusion' },
    ],
    reactions: [],
  },
  {
    id: '732',
    date: '13 июля 2026 г., 07:24',
    rawDateTime: '2026-07-13T04:24:18+00:00',
    timestamp: new Date('2026-07-13T04:24:18+00:00').getTime(),
    views: '139',
    text: 'ПОД ТВОИ КОЛЕСА УУУУ 🛞',
    reactions: [],
  },
  {
    id: '731',
    date: '11 июля 2026 г., 20:28',
    rawDateTime: '2026-07-11T17:28:32+00:00',
    timestamp: new Date('2026-07-11T17:28:32+00:00').getTime(),
    views: '129',
    text: 'мега тиктокерский теперь',
    links: [
      { title: 'лайк поставьте', url: 'https://www.tiktok.com/@sc916otrivok/video/7661322208391761173' },
    ],
    video: {
      thumbUrl: 'https://cdn4.telesco.pe/file/G8myUCO-RIu7SEdon0Q9z6WPdv_h4w-c734m2k2GYGbZoYdKtya0K7sVQQO7Zy2FuprD5I-5qWxrVG1u5z6yaJl5J1qpuTDk_yrYvm7tbgkTccaC_jRwBmgW1ZJ38EdiWVdseussOwMbLoXvIgDjSygtosjWSzqDaDh9r60_cmU6sY-anoB32JMe8-kD7x32RxXWi2QiMwNGqZcug8YzSQ5nCwKmn_RCy0a8eXfsGCIFes2IyPFc-wRg5nGZJudieXvrs_7ol4sNnQgwZTiWDEuoGearSjJNjJpmYMpSIgKStXBpzcW_8JTdjY1IiNlobN0Mxo3CvaiIi8JHBx9_3g',
      duration: '0:33',
      embedUrl: 'https://t.me/sserapphim/731?embed=1',
      sourceUrl: 'https://t.me/sserapphim/731'
    },
    reactions: [],
  },
  {
    id: '729',
    date: '10 июля 2026 г., 18:25',
    rawDateTime: '2026-07-10T15:25:52+00:00',
    timestamp: new Date('2026-07-10T15:25:52+00:00').getTime(),
    views: '102',
    mediaUrl: 'https://cdn4.telesco.pe/file/H1Bv-SULsAZcEfYqyDuZ05GUFyYy3qwh-1BJvli9uwDQgI4-ikJ4Af_h08Iwc6yQCKY8OlwdfCOFpOApsfXYLoxOkCsI3TGNbLAQbfRqjF4RdkqeAxYFUv5CM9pI60LTE94cOKoIIVIKirP_7i_7kdZpfA7MYgDdVeVLtKnrNML1zeVaPHw9zYEiY_fFGc7f5kze4AXpIiTSskHsbprAwsDRArgjpO96_tPch1XMVWpq2Vb8Eq5KjGgLRW29ZwWHHu88q-ogbuXRK6VpzWt-O0ae_6nwbomXK4ZOsT-2X4HBSTcYBGOofGoccwQeGEqXhMDv6KD-nZ6IIMM_vYXmQg.jpg',
    text: '916 отрывок - ДТТП4',
    links: [
      { title: 'слушать', url: 'https://on.soundcloud.com/9NSrWUhHTkGbIYjEvJ' },
    ],
    quote: '1. ДТТП5/3\n2. НЕНАВИЖУ ТЕБЯ\n3. ПРЫГАЙ В ТАКТ ДУРА\n4. УБЬЮ СЕБЯ\n5. ЛЮБИМАЯ СЕМЬЯ\n6. МЕРТВЫЕ ПСЫ\n7. КАНИБАЛ\n8. ЕБАНУТЫЙ НА ГОЛОВУ\n9. НА НИЗИНЕ\n10. СДОХНИ\n11. АЛКАШ\n12. СТРЕЛЯЙ\n13. Я ТЕБЯ ТЕРЯЮ\n14. курение убивает\n15. БЕЗ ТЕБЯ\n16. ВЕСЯЩЕЕ ТЕЛО\n17. ПУСТЬ ТАК НО НЕ НАЗАД\n18. мне сложно сказать так\n19. одиночество\n20. ДИС НА СУНКЛАУД АРТИСТОВ\n21. второй я в аду\n22. СЕЛФХАРМ\n23. шум',
    reactions: [],
  },
  {
    id: '728',
    date: '10 июля 2026 г., 18:21',
    rawDateTime: '2026-07-10T15:21:49+00:00',
    timestamp: new Date('2026-07-10T15:21:49+00:00').getTime(),
    views: '69',
    mediaUrl: 'https://cdn4.telesco.pe/file/SzD_eRjeqCIf8xcc4xyXt86ssgbGm_GktkEN4gZvVUbP5KAWaI2iZJv4FdouCw_hh5EV-bYm5W_6a-ZWvBN57qSpuR7Xv5ya8IwkQT4j-6dPFvjd6R7UXTFVg9LQIgmHgMHaE_4iq8-SeJyg-kjMwJvDzgmd5DVULMl4YTUbbt6u10CuuikF-7EO5_BC_p0AshO3kbVpgUi-R1LMycGQJCM7Fg9KCcdXhmLiSMOoiS7E2z6uS_r5f5OoPT4tVovOi29awCDF7m8QuM5-DiYo0IOZY2Xjemk3zfGx-7EOjyXmtjy2uS9rGg_PJH6prAz37Sgj0GqnTwNfDt8uRXT6nA.jpg',
    text: 'ПАМПАМПАМ',
    reactions: [],
  },
  {
    id: '727',
    date: '2 июля 2026 г., 08:27',
    rawDateTime: '2026-07-02T05:27:43+00:00',
    timestamp: new Date('2026-07-02T05:27:43+00:00').getTime(),
    views: '77',
    text: 'бля как я жду человека паука сукии',
    reactions: [],
  },
  {
    id: '726',
    date: '28 июня 2026 г., 07:25',
    rawDateTime: '2026-07-02T05:27:43+00:00',
    timestamp: new Date('2026-06-28T04:25:13+00:00').getTime(),
    views: '91',
    mediaUrl: 'https://cdn4.telesco.pe/file/dCuJZ3g1eSafwvhyzWIu5bUXAqcHirTYwMXJc0UqnIxRG9kjZMvYUWu019NBiwoXdZ4UsT4C2GQg4a6sYSim4yY4gJ2q7W1MiC29cf2Io_SzQsoazy_kUbsvU-lx3mR30IYOG2hQY4WW_VnnDXJmhp03FMaUjQjNiyap5y-1_9BiCqSJCfYqOhXDoCsOU4XYdiYZDWz6wFvh6T0rF68VhtWpNiRTc_gk_y7uQ7J2rz6xhIiDKUzvRg4Frl8EdPT4UMHoDoLhCYSAwGHIu_yTBRMVWM9lYm-OlQwbB7CVjfbUyQxEXud8zsxhkdsjc-92XjKzXxzkkIiwbLPCVXYvGg.jpg',
    reactions: [],
  },
  {
    id: '725',
    date: '26 июня 2026 г., 22:03',
    rawDateTime: '2026-06-26T19:03:57+00:00',
    timestamp: new Date('2026-06-26T19:03:57+00:00').getTime(),
    views: '85',
    mediaUrl: 'https://cdn4.telesco.pe/file/Mc2yGSX-DeHi80Ver_qgU5pjkISEeGyJZtSenC6m_hCX-50C43WZ1moOmyhofFJxMLaG9XX86U7uvYU_UMz0oLdwTbGKLLRCWHtCsWePewSoU_2iCcd9dLiH0S4NwWvndDXZ5iEC-FHtOHL0oq4_g624R5b6KOLm5vK3lCcrWhIdeEazf8fIo4--bJEMWCAuEPM9H6KFgcnmzPlAInIOepnLd_D8tnv66PHH7ptvxHLeGBebhlVLEpv26D4sbBiDykfyMAndco7ilNZHkb8cHrvYhAZcieCWnhDpk3XJALFk_ET9IRtPN2tZjCHZylOGepKT5gn9d5L_mxVQeXvj8g.jpg',
    text: '916отрывок - mechanical rain',
    links: [
      { title: 'слушать', url: 'https://soundcloud.com/916otryvok/mechanical-rain' },
    ],
    reactions: [],
  },
];
