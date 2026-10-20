import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Music,
  Sparkles,
  Minimize2,
  Maximize2,
  Upload,
  Check,
  ListMusic,
  SkipForward,
  SkipBack,
  Trash2,
  X,
  ExternalLink,
  Link as LinkIcon,
  AlertCircle,
} from 'lucide-react';
import { MusicSettings, MusicPlacement, PlaylistItem } from '../types';
import { romanticAudio } from '../utils/audioEngine';
import { extractYouTubeVideoId } from '../utils/mediaHelpers';
import { audioStorage } from '../utils/audioStorage';
import { MusicUploadModal } from './MusicUploadModal';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Singleton helper to load YouTube IFrame API script once
let isApiLoading = false;
const loadYouTubeIframeApi = (): Promise<void> => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.YT && window.YT.Player) {
      resolve();
      return;
    }

    const prevCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (prevCallback) prevCallback();
      resolve();
    };

    if (!isApiLoading && typeof document !== 'undefined' && !document.getElementById('yt-iframe-api-tag')) {
      isApiLoading = true;
      const tag = document.createElement('script');
      tag.id = 'yt-iframe-api-tag';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }
  });
};

interface RomanticMusicPlayerProps {
  settings: MusicSettings;
  placement: MusicPlacement;
  autoplayBlocked: boolean;
  onDismissAutoplayPrompt: () => void;
  onTriggerPlay: () => void;
  onUpdateMusicSettings?: (updated: Partial<MusicSettings>) => void;
}

export const RomanticMusicPlayer: React.FC<RomanticMusicPlayerProps> = ({
  settings,
  placement,
  autoplayBlocked,
  onDismissAutoplayPrompt,
  onTriggerPlay,
  onUpdateMusicSettings,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(72);
  const [volume, setVolume] = useState<number>(settings.volume);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [showPlaylistDrawer, setShowPlaylistDrawer] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [youtubeError, setYoutubeError] = useState<string | null>(null);

  // Music Settings Modal state (with YouTube tab support)
  const [isMusicModalOpen, setIsMusicModalOpen] = useState<boolean>(false);
  const [modalInitialTab, setModalInitialTab] = useState<'upload' | 'youtube' | 'spotify' | 'builtin' | 'playlist'>('youtube');

  // YouTube player references
  const ytPlayerRef = useRef<any>(null);
  const lastLoadedVideoIdRef = useRef<string | null>(null);

  const playlist = settings.playlist || [];
  const currentTrackIndex = settings.currentTrackIndex || 0;
  const activeTrack: PlaylistItem | undefined = playlist[currentTrackIndex] || playlist[0];

  const isYouTubeTrack = activeTrack?.type === 'youtube';
  const isSpotifyTrack = activeTrack?.type === 'spotify';

  const handleRemoveTrack = (trackId: string | undefined, indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const trackIndex = playlist.findIndex((t, i) => (trackId && t.id === trackId) || i === indexToRemove);
    if (trackIndex === -1) return;

    const trackToRemove = playlist[trackIndex];
    if (trackToRemove && trackToRemove.type === 'mp3') {
      const storageKey = trackToRemove.audioStorageKey || trackToRemove.id;
      if (storageKey) {
        audioStorage.deleteAudioTrack(storageKey).catch(() => {});
      }
    }
    let updated = playlist.filter((_, i) => i !== trackIndex);

    // If all songs are deleted, safely fall back to romantic default serenade
    if (updated.length === 0) {
      updated = [
        {
          id: 'default_melody_' + Date.now(),
          title: 'Golden Petals & Starlight',
          artist: 'Acoustic Serenade for Maya',
          type: 'builtin',
        },
      ];
      setToastMessage('Song removed. Reset to default romantic melody.');
    } else {
      setToastMessage(`Deleted "${trackToRemove?.title || 'Song'}" from playlist`);
    }

    setTimeout(() => setToastMessage(null), 3000);

    // Determine correct next index
    let nextIdx = currentTrackIndex;
    if (trackIndex < currentTrackIndex) {
      nextIdx = currentTrackIndex - 1;
    } else if (nextIdx >= updated.length) {
      nextIdx = Math.max(0, updated.length - 1);
    }

    const nextTrack = updated[nextIdx] || updated[0];

    // Single unified update to parent so playlist change is never overwritten
    if (onUpdateMusicSettings) {
      onUpdateMusicSettings({
        playlist: updated,
        currentTrackIndex: nextIdx,
        title: nextTrack.title,
        artist: nextTrack.artist,
        audioUrl: nextTrack.audioUrl,
      });
    }

    // Stop YouTube audio if removed track was playing YouTube
    if (trackToRemove?.type === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch {
        // ignore
      }
    }

    // Audio setup for nextTrack if currently playing
    if (isPlaying) {
      if (nextTrack.type === 'youtube') {
        romanticAudio.pause();
        const ytId = nextTrack.youtubeId || extractYouTubeVideoId(nextTrack.externalUrl || '') || '';
        if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
          try {
            lastLoadedVideoIdRef.current = ytId;
            ytPlayerRef.current.loadVideoById(ytId);
          } catch {
            // ignore
          }
        }
      } else if (nextTrack.type === 'spotify') {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {
            // ignore
          }
        }
        romanticAudio.pause();
      } else {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {
            // ignore
          }
        }
        romanticAudio.setCustomAudio(nextTrack.audioUrl || null, nextIdx % 3);
        romanticAudio.play();
      }
    }
  };

  const openMusicSettingsTab = (tab: 'upload' | 'youtube' | 'spotify' | 'builtin' | 'playlist') => {
    setModalInitialTab(tab);
    setIsMusicModalOpen(true);
  };

  // Listen to Web Audio / local engine updates
  useEffect(() => {
    romanticAudio.subscribe(
      (playing) => {
        if (!isYouTubeTrack && !isSpotifyTrack) {
          setIsPlaying(playing);
        }
      },
      (time, total) => {
        if (!isYouTubeTrack && !isSpotifyTrack) {
          setCurrentTime(time);
          if (total > 0) setDuration(total);
        }
      }
    );
    romanticAudio.setVolume(settings.volume);

    romanticAudio.setTrackEndedCallback(() => {
      handleNextTrack();
    });

    let isMounted = true;
    const loadAndSetupAudio = async () => {
      if (!activeTrack) return;

      if (activeTrack.type === 'spotify' || activeTrack.type === 'youtube') {
        romanticAudio.pause();
        return;
      }

      let audioSource = activeTrack.audioUrl || null;
      if (activeTrack.type === 'mp3' && (!audioSource || audioSource.startsWith('blob:'))) {
        const stored = await audioStorage.getAudioTrackUrl(activeTrack.audioStorageKey || activeTrack.id);
        if (stored) {
          audioSource = stored;
        }
      }

      if (isMounted) {
        romanticAudio.setCustomAudio(audioSource, currentTrackIndex % 3);
      }
    };

    loadAndSetupAudio();

    return () => {
      isMounted = false;
    };
  }, [currentTrackIndex, activeTrack?.audioUrl, activeTrack?.audioStorageKey, activeTrack?.type, settings.volume, isYouTubeTrack, isSpotifyTrack]);

  // YouTube IFrame Player Lifecycle (hidden container, audio-only playback)
  useEffect(() => {
    if (!isYouTubeTrack) {
      // Pause YouTube player if switched away to another track type
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore
        }
      }
      return;
    }

    romanticAudio.pause();
    setYoutubeError(null);

    const ytVideoId = activeTrack?.youtubeId || extractYouTubeVideoId(activeTrack?.externalUrl || '') || '';
    if (!ytVideoId) {
      setYoutubeError('Invalid YouTube video link. Please verify the URL.');
      setIsPlaying(false);
      return;
    }

    let isSubscribed = true;

    loadYouTubeIframeApi().then(() => {
      if (!isSubscribed) return;

      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          ytPlayerRef.current.setVolume(Math.round(volume * 100));
          if (isMuted || volume === 0) ytPlayerRef.current.mute();
          else ytPlayerRef.current.unMute();

          if (lastLoadedVideoIdRef.current !== ytVideoId) {
            lastLoadedVideoIdRef.current = ytVideoId;
            if (isPlaying) {
              ytPlayerRef.current.loadVideoById(ytVideoId);
            } else {
              ytPlayerRef.current.cueVideoById(ytVideoId);
            }
          }
        } catch (err) {
          console.warn('YouTube player cue error:', err);
        }
      } else {
        try {
          lastLoadedVideoIdRef.current = ytVideoId;
          ytPlayerRef.current = new window.YT.Player('hidden-youtube-player-element', {
            videoId: ytVideoId,
            playerVars: {
              autoplay: 0,
              controls: 0,
              disablekb: 1,
              fs: 0,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: (event: any) => {
                event.target.setVolume(Math.round(volume * 100));
                if (isMuted || volume === 0) event.target.mute();
                else event.target.unMute();

                const d = event.target.getDuration();
                if (d && d > 0) setDuration(d);

                if (isPlaying) {
                  event.target.playVideo();
                }
              },
              onStateChange: (event: any) => {
                // YT.PlayerState: PLAYING = 1, PAUSED = 2, ENDED = 0, BUFFERING = 3
                if (event.data === 1) {
                  setIsPlaying(true);
                  setYoutubeError(null);
                  const d = event.target.getDuration();
                  if (d && d > 0) setDuration(d);
                } else if (event.data === 2) {
                  setIsPlaying(false);
                } else if (event.data === 0) {
                  setIsPlaying(false);
                  handleNextTrack();
                }
              },
              onError: (event: any) => {
                setIsPlaying(false);
                let msg = 'Could not play YouTube audio. The video may be private or restricted.';
                if (event.data === 101 || event.data === 150) {
                  msg = 'The video owner restricted external site playback for this song. Please try another video.';
                } else if (event.data === 100) {
                  msg = 'This YouTube video was removed or is unavailable.';
                } else if (event.data === 2) {
                  msg = 'Invalid YouTube video link parameter.';
                }
                setYoutubeError(msg);
              },
            },
          });
        } catch (err) {
          console.warn('Failed to initialize YouTube player:', err);
        }
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [isYouTubeTrack, activeTrack?.id, activeTrack?.youtubeId, activeTrack?.externalUrl]);

  // Real-time synchronization of progress bar & current time for YouTube playback
  useEffect(() => {
    if (!isYouTubeTrack || !isPlaying) return;

    const timer = setInterval(() => {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
        try {
          const cur = ytPlayerRef.current.getCurrentTime() || 0;
          const dur = ytPlayerRef.current.getDuration() || 0;
          setCurrentTime(cur);
          if (dur > 0) setDuration(dur);
        } catch {
          // Transition state
        }
      }
    }, 400);

    return () => clearInterval(timer);
  }, [isYouTubeTrack, isPlaying]);

  const togglePlay = async () => {
    onDismissAutoplayPrompt();
    setYoutubeError(null);

    if (isYouTubeTrack) {
      romanticAudio.pause();
      const ytVideoId = activeTrack?.youtubeId || extractYouTubeVideoId(activeTrack?.externalUrl || '') || '';

      if (!isPlaying) {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === 'function') {
          try {
            if (lastLoadedVideoIdRef.current !== ytVideoId && ytVideoId) {
              ytPlayerRef.current.loadVideoById(ytVideoId);
              lastLoadedVideoIdRef.current = ytVideoId;
            } else {
              ytPlayerRef.current.playVideo();
            }
            setIsPlaying(true);
          } catch {
            setIsPlaying(true);
          }
        } else {
          setIsPlaying(true);
        }
      } else {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
          try {
            ytPlayerRef.current.pauseVideo();
          } catch {
            // Ignore
          }
        }
        setIsPlaying(false);
      }
      return;
    }

    if (isSpotifyTrack) {
      setIsPlaying(!isPlaying);
      return;
    }

    // Local / Serenade audio
    if (isPlaying) {
      romanticAudio.pause();
    } else {
      await romanticAudio.play();
    }
  };

  const handleNextTrack = async () => {
    if (playlist.length <= 1) return;
    const nextIdx = (currentTrackIndex + 1) % playlist.length;
    switchTrack(nextIdx);
  };

  const handlePrevTrack = async () => {
    if (playlist.length <= 1) return;
    const prevIdx = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    switchTrack(prevIdx);
  };

  const switchTrack = async (index: number) => {
    const track = playlist[index];
    if (!track) return;

    setYoutubeError(null);

    if (onUpdateMusicSettings) {
      onUpdateMusicSettings({
        currentTrackIndex: index,
        title: track.title,
        artist: track.artist,
        audioUrl: track.audioUrl,
      });
    }

    if (track.type === 'youtube') {
      romanticAudio.pause();
      const ytId = track.youtubeId || extractYouTubeVideoId(track.externalUrl || '') || '';
      if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
        try {
          lastLoadedVideoIdRef.current = ytId;
          ytPlayerRef.current.loadVideoById(ytId);
          setIsPlaying(true);
        } catch {
          setIsPlaying(true);
        }
      } else {
        setIsPlaying(true);
      }
    } else if (track.type === 'spotify') {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore
        }
      }
      romanticAudio.pause();
      setIsPlaying(true);
    } else {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.pauseVideo === 'function') {
        try {
          ytPlayerRef.current.pauseVideo();
        } catch {
          // Ignore
        }
      }
      romanticAudio.setCustomAudio(track.audioUrl || null, index % 3);
      await romanticAudio.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);

    if (isYouTubeTrack) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.seekTo === 'function') {
        try {
          ytPlayerRef.current.seekTo(newTime, true);
        } catch {
          // Ignore
        }
      }
    } else {
      romanticAudio.seek(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    setIsMuted(newVol === 0);

    if (isYouTubeTrack) {
      if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === 'function') {
        try {
          ytPlayerRef.current.setVolume(Math.round(newVol * 100));
          if (newVol === 0) ytPlayerRef.current.mute();
          else ytPlayerRef.current.unMute();
        } catch {
          // Ignore
        }
      }
    } else {
      romanticAudio.setVolume(newVol);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      if (isYouTubeTrack) {
        try {
          ytPlayerRef.current?.unMute();
          ytPlayerRef.current?.setVolume(Math.round((volume || 0.5) * 100));
        } catch {
          // Ignore
        }
      } else {
        romanticAudio.setVolume(volume || 0.5);
      }
    } else {
      setIsMuted(true);
      if (isYouTubeTrack) {
        try {
          ytPlayerRef.current?.mute();
        } catch {
          // Ignore
        }
      } else {
        romanticAudio.setVolume(0);
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const getSourceBadge = (track: PlaylistItem) => {
    if (track.type === 'spotify') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          Spotify
        </span>
      );
    }
    if (track.type === 'youtube') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          YouTube Audio
        </span>
      );
    }
    if (track.type === 'mp3') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-medium">
          MP3 Audio
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-medium">
        Serenade
      </span>
    );
  };

  const placementStyles: Record<MusicPlacement, string> = {
    bottom: isMinimized
      ? 'fixed bottom-4 right-4 z-40'
      : 'fixed bottom-4 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-40',
    top: isMinimized
      ? 'fixed top-16 right-4 z-40'
      : 'fixed top-16 left-1/2 -translate-x-1/2 w-[94%] max-w-lg z-40',
    corner: 'fixed bottom-4 right-4 max-w-xs z-40',
  };

  return (
    <>
      {/* Visually hidden container for YouTube IFrame Player (Audio playback only, video is strictly invisible) */}
      <div
        style={{
          position: 'fixed',
          top: -9999,
          left: -9999,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: -999,
        }}
        aria-hidden="true"
      >
        <div id="hidden-youtube-player-element" />
      </div>

      {/* Autoplay Prompt Floating Banner */}
      {autoplayBlocked && !isPlaying && !isSpotifyTrack && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 animate-bounce">
          <button
            onClick={() => {
              onTriggerPlay();
              onDismissAutoplayPrompt();
              togglePlay();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-rose-600/95 hover:bg-rose-700 text-white text-xs font-medium shadow-lg backdrop-blur-sm cursor-pointer transition-transform hover:scale-105"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-200" />
            <span>Tap to play our playlist 🎵</span>
            <span className="text-[10px] opacity-75">("{activeTrack?.title || settings.title}")</span>
          </button>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 right-4 z-50 bg-emerald-800 text-white text-xs px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 animate-fade-in font-sans-custom">
          <Check className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Music Settings & YouTube Tab Modal */}
      <MusicUploadModal
        settings={settings}
        isOpen={isMusicModalOpen}
        initialTab={modalInitialTab}
        onClose={() => setIsMusicModalOpen(false)}
        onSaveMusic={(newSettings) => {
          if (onUpdateMusicSettings) {
            onUpdateMusicSettings(newSettings);
          }
          setToastMessage('Music settings updated successfully 🎵');
          setTimeout(() => setToastMessage(null), 3500);
        }}
      />

      {/* Main Compact Music Player Bar Container */}
      <div className={placementStyles[placement]}>
        {isMinimized ? (
          /* Minimized Floating Disc Widget */
          <div className="bg-white/90 backdrop-blur-md border border-rose-200/80 shadow-xl rounded-full p-1.5 pl-3 pr-2 flex items-center gap-2.5 transition-all duration-300 hover:scale-105">
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-tr ${
                activeTrack?.type === 'spotify'
                  ? 'from-emerald-400 to-emerald-600'
                  : activeTrack?.type === 'youtube'
                  ? 'from-red-400 to-red-600'
                  : 'from-rose-300 to-rose-500'
              } flex items-center justify-center text-white shrink-0 shadow-xs ${
                isPlaying && !isSpotifyTrack ? 'animate-spin [animation-duration:6s]' : ''
              }`}
            >
              <Music className="w-3.5 h-3.5" />
            </div>

            <div className="max-w-[110px] truncate text-left">
              <span className="text-xs font-semibold text-rose-950 block truncate">
                {activeTrack?.title || settings.title}
              </span>
              <span className="text-[10px] text-rose-600 block truncate">
                {activeTrack?.type === 'spotify' ? 'Spotify' : activeTrack?.type === 'youtube' ? 'YouTube' : 'Playing'}
              </span>
            </div>

            {!isSpotifyTrack && (
              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs cursor-pointer shrink-0"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white ml-0.5" />}
              </button>
            )}

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 text-stone-500 hover:text-rose-700 cursor-pointer"
              title="Expand music player & playlist"
              aria-label="Expand player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Full Expanded Compact Music Player Bar */
          <div className="relative bg-white/95 backdrop-blur-md border border-rose-200/90 shadow-2xl rounded-2xl p-3 px-4 flex flex-col gap-2 transition-all duration-300">
            {/* YouTube Error Notice if unavailable */}
            {youtubeError && (
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <div className="flex items-center gap-1.5 min-w-0">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="truncate">{youtubeError}</span>
                </div>
                <button
                  onClick={() => setYoutubeError(null)}
                  className="text-amber-500 hover:text-amber-800 p-0.5 cursor-pointer shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Top Bar with Track Info & Core Controls */}
            <div className="flex items-center justify-between gap-3">
              {/* Song info & vinyl/flower icon */}
              <div
                onClick={() => openMusicSettingsTab(isYouTubeTrack ? 'youtube' : 'upload')}
                className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer group"
                title="Click to edit or change song settings"
              >
                <div
                  className={`w-9 h-9 rounded-full bg-gradient-to-tr ${
                    activeTrack?.type === 'spotify'
                      ? 'from-emerald-400 to-emerald-600'
                      : activeTrack?.type === 'youtube'
                      ? 'from-red-400 to-red-600'
                      : 'from-rose-200 to-rose-400'
                  } flex items-center justify-center text-white shrink-0 shadow-sm ${
                    isPlaying && !isSpotifyTrack ? 'animate-spin [animation-duration:6s]' : ''
                  }`}
                >
                  <Music className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-semibold text-rose-950 truncate tracking-tight group-hover:text-rose-600 transition-colors">
                      {activeTrack?.title || settings.title}
                    </h4>
                    {activeTrack && getSourceBadge(activeTrack)}
                  </div>
                  <p className="text-[11px] text-rose-700/70 truncate font-sans-custom">
                    {activeTrack?.artist || settings.artist} · Track {currentTrackIndex + 1} of {playlist.length}
                  </p>
                </div>
              </div>

              {/* Player Controls (Prev, Play, Next) */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handlePrevTrack}
                  disabled={playlist.length <= 1}
                  className="p-1.5 text-stone-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                  title="Previous song"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                {!isSpotifyTrack ? (
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-200 hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0"
                    aria-label={isPlaying ? 'Pause song' : 'Play song'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
                  </button>
                ) : (
                  <a
                    href={activeTrack?.externalUrl || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-medium border border-rose-200 cursor-pointer"
                    title="Open song in Spotify"
                  >
                    <ExternalLink className="w-3 h-3 text-rose-500" />
                    <span>Open Spotify</span>
                  </a>
                )}

                <button
                  onClick={handleNextTrack}
                  disabled={playlist.length <= 1}
                  className="p-1.5 text-stone-500 hover:text-rose-700 disabled:opacity-30 cursor-pointer"
                  title="Next song"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Playlist Drawer Button */}
              <button
                onClick={() => setShowPlaylistDrawer(!showPlaylistDrawer)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer shrink-0 ${
                  showPlaylistDrawer
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-800 border-rose-200/70'
                }`}
                title="View & manage playlist"
              >
                <ListMusic className="w-3.5 h-3.5" />
                <span className="font-mono">({playlist.length})</span>
              </button>

              {/* Music Settings Buttons: YouTube link & MP3 upload */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => openMusicSettingsTab('youtube')}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 transition-colors cursor-pointer"
                  title="Add or edit YouTube Song"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => openMusicSettingsTab('upload')}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/70 transition-colors cursor-pointer"
                  title="Upload MP3 file"
                >
                  <Upload className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Volume Control (active for both local audio and YouTube audio) */}
              {!isSpotifyTrack && (
                <div className="relative flex items-center shrink-0">
                  <button
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    className="p-1.5 text-rose-800/70 hover:text-rose-950 transition-colors cursor-pointer"
                    aria-label="Toggle mute"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {showVolumeSlider && (
                    <div
                      onMouseLeave={() => setShowVolumeSlider(false)}
                      className="absolute bottom-full right-0 mb-2 p-2 bg-white/95 backdrop-blur-md rounded-xl border border-rose-200 shadow-lg flex items-center gap-1.5"
                    >
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="w-20 h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500"
                      />
                      <span className="text-[10px] text-rose-800 font-mono w-6 text-right">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Minimize Button */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer shrink-0"
                title="Minimize player"
                aria-label="Minimize player"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Spotify Embed Widget (strictly Spotify only, NEVER YouTube video) */}
            {isSpotifyTrack && activeTrack?.embedUrl && (
              <div className="my-1 rounded-xl overflow-hidden border border-rose-200/80 shadow-inner bg-black/5">
                <iframe
                  src={activeTrack.embedUrl}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title={activeTrack.title}
                  className="rounded-xl"
                />
              </div>
            )}

            {/* Progress Bar & Timestamps (synchronized for local audio AND YouTube audio) */}
            {!isSpotifyTrack && (
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-[10px] text-rose-700/60 font-mono w-7 text-right select-none">
                  {formatTime(currentTime)}
                </span>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  step="0.5"
                  value={currentTime}
                  onChange={handleSeek}
                  className="flex-1 h-1.5 bg-rose-100 rounded-lg appearance-none cursor-pointer accent-rose-500 hover:h-2 transition-all"
                />
                <span className="text-[10px] text-rose-700/60 font-mono w-7 select-none">
                  {formatTime(duration)}
                </span>
              </div>
            )}

            {/* EXPANDABLE PLAYLIST DRAWER */}
            {showPlaylistDrawer && (
              <div className="mt-2 pt-3 border-t border-rose-100 max-h-60 overflow-y-auto space-y-1.5 font-sans-custom">
                <div className="flex items-center justify-between mb-2 px-1">
                  <span className="text-[11px] font-semibold text-rose-950 uppercase tracking-wider">
                    Our Romantic Playlist ({playlist.length})
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openMusicSettingsTab('youtube')}
                      className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                    >
                      <LinkIcon className="w-3 h-3" />
                      <span>+ YouTube URL</span>
                    </button>
                    <span className="text-stone-300">·</span>
                    <button
                      onClick={() => openMusicSettingsTab('upload')}
                      className="flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                    >
                      <Upload className="w-3 h-3" />
                      <span>+ MP3s</span>
                    </button>
                  </div>
                </div>

                {playlist.map((track, idx) => {
                  const isCurrent = idx === currentTrackIndex;
                  return (
                    <div
                      key={track.id}
                      onClick={() => switchTrack(idx)}
                      className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors cursor-pointer ${
                        isCurrent
                          ? 'bg-rose-50 border-rose-300 font-semibold text-rose-950 shadow-xs'
                          : 'bg-white hover:bg-stone-50 border-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="w-5 text-center font-mono text-[10px] text-rose-400">
                          {isCurrent ? '▶' : `${idx + 1}`}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs">{track.title}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-stone-400 truncate font-normal">
                              {track.artist}
                            </span>
                            {getSourceBadge(track)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-200/70 text-rose-800">
                            Active
                          </span>
                        )}
                        {track.externalUrl && (
                          <a
                            href={track.externalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-stone-400 hover:text-rose-700"
                            title="Open external link"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={(e) => handleRemoveTrack(track.id, idx, e)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0 z-10"
                          title={`Delete "${track.title}" from playlist`}
                          aria-label={`Delete ${track.title}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 pointer-events-none" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
