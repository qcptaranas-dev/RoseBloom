export interface PhotoItem {
  id: number;
  url: string;
  caption: string;
  title: string;
  dateOrLocation: string;
}

export interface LetterContent {
  title: string;
  greeting: string;
  body: string;
  closing: string;
  signature: string;
}

export type TrackSourceType = 'builtin' | 'mp3' | 'youtube' | 'spotify';

export interface PlaylistItem {
  id: string;
  title: string;
  artist: string;
  type?: TrackSourceType;
  audioUrl?: string; // custom audio data URL / MP3, or undefined for built-in romantic melody
  audioStorageKey?: string; // key in IndexedDB for local audio
  fileName?: string;
  fileSize?: string;
  externalUrl?: string; // YouTube or Spotify URL
  embedUrl?: string; // converted embed URL for iframe preview
  youtubeId?: string; // extracted YouTube video ID for audio playback
}

export interface MusicSettings {
  title: string;
  artist: string;
  audioUrl?: string;
  volume: number;
  playlist: PlaylistItem[];
  currentTrackIndex: number;
  externalPlaylistUrl?: string; // Quick Spotify or YouTube playlist URL
}

export interface PasscodeConfig {
  enabled: boolean;
  code: string; // e.g. "1024" or custom phrase
  hint: string; // e.g. "Our anniversary date (MMDD)"
}

export type ThemePalette = 'blush' | 'dusty-rose' | 'cream-pink' | 'soft-lavender' | 'white-sage';
export type BackgroundPattern = 'floral' | 'soft-rose' | 'simple-cream' | 'minimal-pink';
export type RoseStyle = 'classic' | 'blush' | 'damask';
export type FontOption = 'cormorant' | 'playfair' | 'modern';
export type AnimationIntensity = 'subtle' | 'normal' | 'expressive';
export type MusicPlacement = 'bottom' | 'top' | 'corner';

export interface ThemeConfig {
  palette: ThemePalette;
  backgroundPattern: BackgroundPattern;
  roseStyle: RoseStyle;
  fontStyle: FontOption;
  animationIntensity: AnimationIntensity;
  playerPlacement: MusicPlacement;
}

export interface CoupleData {
  senderName: string;
  girlfriendName: string;
  monthsaryGreeting: string;
  monthsaryDate: string;
  startMonth?: string; // YYYY-MM e.g. "2024-10"
  currentMonth?: string; // YYYY-MM e.g. "2026-10"
  relationshipStartDate?: string; // YYYY-MM-DD e.g. "2024-10-24"
  currentCelebrationDate?: string; // YYYY-MM-DD e.g. "2026-10-19"
  customDaysCount?: number | null; // manual override if desired
  anniversarySubtitle: string;
  passcode?: PasscodeConfig;
  letter: LetterContent;
  photos: [PhotoItem, PhotoItem, PhotoItem, PhotoItem]; // Exactly 4 photos
  music: MusicSettings;
  theme: ThemeConfig;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  googleLinked: boolean;
  googleEmail?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserSiteProject {
  id: string;
  title: string;
  girlfriendName: string;
  senderName: string;
  createdAt: string;
  updatedAt: string;
  data: CoupleData;
  ownerId?: string;
  ownerEmail?: string;
  shareCode?: string; // 6-digit receiver code e.g. "ROSE-4912"
  receiverToken?: string; // secure access token for receiver
  isPrivate?: boolean;
}

export type AppRoute = 'home' | 'account' | 'my-work';

/**
 * Automatically calculates exact days, months, and years from first month/date to this month/date
 */
export function calculateDaysBetween(
  startStr?: string,
  endStr?: string,
  customCount?: number | null
): { days: number; months: number; years: number } {
  if (customCount && customCount > 0) {
    return {
      days: customCount,
      months: Math.floor(customCount / 30.4),
      years: +(customCount / 365.25).toFixed(1),
    };
  }

  try {
    let startD: Date;
    if (startStr && startStr.length === 7) {
      // "YYYY-MM"
      startD = new Date(`${startStr}-01T00:00:00`);
    } else if (startStr) {
      startD = new Date(startStr);
    } else {
      startD = new Date('2024-10-24T00:00:00');
    }

    let endD: Date;
    if (endStr && endStr.length === 7) {
      endD = new Date(`${endStr}-01T00:00:00`);
    } else if (endStr) {
      endD = new Date(endStr);
    } else {
      endD = new Date();
    }

    const diffTime = Math.abs(endD.getTime() - startD.getTime());
    const days = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const months = Math.max(
      1,
      (endD.getFullYear() - startD.getFullYear()) * 12 + (endD.getMonth() - startD.getMonth())
    );
    const years = +(days / 365.25).toFixed(1);

    return { days, months, years };
  } catch {
    return { days: 725, months: 24, years: 2 };
  }
}

export const DEFAULT_PLAYLIST: PlaylistItem[] = [
  {
    id: 'track_serenade_01',
    title: 'Golden Petals & Starlight',
    artist: 'Acoustic Serenade for Maya',
  },
  {
    id: 'track_waltz_02',
    title: 'Midnight Rose Waltz',
    artist: 'Gentle Piano & Strings',
  },
  {
    id: 'track_harp_03',
    title: 'Porcelain Whispers',
    artist: 'Romantic Classical Harp',
  },
];

export const DEFAULT_COUPLE_DATA: CoupleData = {
  senderName: 'Liam',
  girlfriendName: 'Maya',
  monthsaryGreeting: 'Happy Monthsary, My Love',
  monthsaryDate: 'October 24, 2024',
  startMonth: '2024-10',
  currentMonth: '2026-10',
  relationshipStartDate: '2024-10-24',
  currentCelebrationDate: '2026-10-19',
  customDaysCount: null,
  anniversarySubtitle: 'Every single day with you feels like a bloom of gentle joy, warm laughter, and endless gratitude.',
  passcode: {
    enabled: true,
    code: '1024',
    hint: 'Our special anniversary date (MMDD) 🌸',
  },
  letter: {
    title: 'To The One Who Holds My Heart',
    greeting: 'My Dearest Maya,',
    body: `From the very first moment our worlds crossed, you brought a warmth into my life that I never knew I was missing. With you, even the simplest afternoons turn into cherished memories—sharing coffee in the morning quiet, walking together hand-in-hand, and knowing that whatever life brings, I have you by my side.

Thank you for your gentle patience, your infectious laughter, and the endless kindness in your eyes. Every month with you has been a blessing I hold close to my heart. You make me want to be the best version of myself, simply by loving me the way you do.

As you read this, know that my promise to you remains unwavering: to cherish you, listen to you, laugh with you through every adventure, and hold your hand through every season. Happy Monthsary, my sweetheart. Here is to our story, blooming more beautifully with each passing day.`,
    closing: 'Forever and always, with all that I am,',
    signature: 'Your Liam',
  },
  photos: [
    {
      id: 1,
      url: '/src/assets/images/gallery_photo_1_1792474611387.jpg',
      title: 'Hand in Hand in the Rose Garden',
      caption: 'Our unforgettable walk through the blooming garden. The golden sunlight was shining down, but all I could look at was your radiant smile.',
      dateOrLocation: 'Botanical Roses · Spring',
    },
    {
      id: 2,
      url: '/src/assets/images/gallery_photo_2_1792474612310.jpg',
      title: 'Morning Coffee & Warm Laughter',
      caption: 'Sitting across from you at that cozy corner cafe. We spent hours talking about our dreams and lost track of all time. My favorite morning ever.',
      dateOrLocation: 'Cafe de Flore · Autumn',
    },
    {
      id: 3,
      url: '/src/assets/images/gallery_photo_3_1792474612607.jpg',
      title: 'Dancing Under the Gentle Rain',
      caption: 'When the sky opened up and we had only one umbrella to share. You leaned in close, laughing under the raindrops, and my heart felt completely at home.',
      dateOrLocation: 'Cobblestone Street · Twilight',
    },
    {
      id: 4,
      url: '/src/assets/images/gallery_photo_4_1792474612088.jpg',
      title: 'Sunset Whispers by the Sea',
      caption: 'Wrapped in a cozy blanket as the pink sunset melted into gentle ocean waves. In that peaceful silence, I knew I never wanted to let you go.',
      dateOrLocation: 'Golden Coast · Sunset',
    },
  ],
  music: {
    title: 'Golden Petals & Starlight',
    artist: 'Acoustic Serenade for Maya',
    volume: 0.75,
    playlist: DEFAULT_PLAYLIST,
    currentTrackIndex: 0,
  },
  theme: {
    palette: 'blush',
    backgroundPattern: 'floral',
    roseStyle: 'classic',
    fontStyle: 'cormorant',
    animationIntensity: 'normal',
    playerPlacement: 'bottom',
  },
};
