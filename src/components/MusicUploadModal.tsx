import React, { useState, useRef, useEffect } from 'react';
import { MusicSettings, PlaylistItem, DEFAULT_PLAYLIST } from '../types';
import {
  X,
  Upload,
  Music,
  Check,
  RotateCcw,
  Play,
  Pause,
  Sparkles,
  FileAudio,
  Trash2,
  ListMusic,
  Link,
  Radio,
  Loader2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { romanticAudio } from '../utils/audioEngine';
import { parseMediaUrl, extractYouTubeVideoId } from '../utils/mediaHelpers';
import { audioStorage } from '../utils/audioStorage';

interface MusicUploadModalProps {
  settings: MusicSettings;
  isOpen: boolean;
  onClose: () => void;
  onSaveMusic: (newSettings: MusicSettings) => void;
  initialTab?: 'upload' | 'youtube' | 'spotify' | 'builtin' | 'playlist';
}

const PRESET_ROMANTIC_THEMES = [
  {
    title: 'Acoustic Sunset Serenade',
    artist: 'Maya & Liam Special',
    desc: 'Soft fingerpicked acoustic guitar and warm mellow strings.',
    variant: 0,
  },
  {
    title: 'Midnight Stargazing Reverie',
    artist: 'Celestial Harp Romance',
    desc: 'Gentle harp arpeggios with floating starlight reverberations.',
    variant: 1,
  },
  {
    title: 'Rose Petal Waltz',
    artist: 'Classical Piano in D-Major',
    desc: 'Warm lyrical piano melody evoking falling roses and gentle embraces.',
    variant: 2,
  },
];

export const MusicUploadModal: React.FC<MusicUploadModalProps> = ({
  settings,
  isOpen,
  onClose,
  onSaveMusic,
  initialTab = 'upload',
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'youtube' | 'spotify' | 'builtin' | 'playlist'>(initialTab);
  const [title, setTitle] = useState<string>(settings.title);
  const [artist, setArtist] = useState<string>(settings.artist);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(settings.audioUrl);
  const [audioStorageKey, setAudioStorageKey] = useState<string | null>(null);
  const [mediaUrlInput, setMediaUrlInput] = useState<string>(settings.externalPlaylistUrl || '');
  const [directAudioUrlInput, setDirectAudioUrlInput] = useState<string>('');
  const [fileName, setFileName] = useState<string | null>(settings.audioUrl ? 'Custom Song Audio' : null);
  const [fileSize, setFileSize] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [previewPlaying, setPreviewPlaying] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessNotice, setUploadSuccessNotice] = useState<string | null>(null);

  // Managed local playlist for deletion & updates
  const [playlistDraft, setPlaylistDraft] = useState<PlaylistItem[]>(settings.playlist || DEFAULT_PLAYLIST);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  // Sync initialTab & settings when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialTab) setActiveTab(initialTab);
      setUploadError(null);
      setUploadSuccessNotice(null);
      setPlaylistDraft(settings.playlist || DEFAULT_PLAYLIST);
      setTitle(settings.title || '');
      setArtist(settings.artist || '');
      setAudioUrl(settings.audioUrl);
      setAudioStorageKey(null);
    }
  }, [isOpen, initialTab, settings]);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setUploadError(null);
    setUploadSuccessNotice(null);
    setIsProcessing(true);

    // Flexible audio detection across all browser file associations
    const isAudio =
      file.type.startsWith('audio/') ||
      /\.(mp3|wav|m4a|aac|ogg|webm|flac|m4p)$/i.test(file.name);

    if (!isAudio) {
      setUploadError('Please choose a valid audio file (.mp3, .wav, .m4a, .ogg).');
      setIsProcessing(false);
      return;
    }

    try {
      const trackKey = 'mp3_' + Date.now();
      const { objectUrl, fileSizeFormatted } = await audioStorage.saveAudioTrack(trackKey, file);

      setAudioUrl(objectUrl);
      setAudioStorageKey(trackKey);
      setFileName(file.name);
      setFileSize(fileSizeFormatted);

      const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      if (!title || title === 'Golden Petals & Starlight') {
        setTitle(cleanName);
      }
      if (!artist || artist === 'Acoustic Serenade for Maya') {
        setArtist('Special Track');
      }

      setUploadSuccessNotice(`Loaded "${file.name}" (${fileSizeFormatted}) successfully!`);

      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current.src = objectUrl;
        setPreviewPlaying(false);
      }
    } catch (err: unknown) {
      console.error('Audio processing error:', err);
      setUploadError('Failed to read and process audio file. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    // Reset file input value so re-selecting same file triggers change
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleApplyDirectAudioUrl = () => {
    if (!directAudioUrlInput.trim()) {
      setUploadError('Please enter a valid MP3 audio URL.');
      return;
    }
    const cleanUrl = directAudioUrlInput.trim();
    setAudioUrl(cleanUrl);
    setAudioStorageKey(null);
    setFileName('Online MP3 Stream');
    setFileSize('Cloud URL');
    setUploadSuccessNotice('Direct MP3 link attached!');
    if (!title || title === 'Golden Petals & Starlight') {
      setTitle('Romantic Online Song');
    }

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current.src = cleanUrl;
      setPreviewPlaying(false);
    }
  };

  const handleTogglePreview = () => {
    if (!audioUrl) return;
    if (previewPlaying) {
      previewAudioRef.current?.pause();
      setPreviewPlaying(false);
    } else {
      if (!previewAudioRef.current) {
        previewAudioRef.current = new Audio(audioUrl);
        previewAudioRef.current.onended = () => setPreviewPlaying(false);
      } else {
        previewAudioRef.current.src = audioUrl;
      }
      previewAudioRef.current
        .play()
        .then(() => {
          setPreviewPlaying(true);
        })
        .catch(() => {
          setUploadError('Could not play preview in browser. Your audio format may need user click.');
        });
    }
  };

  const handleDeleteSongInModal = async (trackId: string | undefined, indexToRemove: number) => {
    const targetIdx = playlistDraft.findIndex((t, i) => (trackId && t.id === trackId) || i === indexToRemove);
    if (targetIdx === -1) return;

    const trackToRemove = playlistDraft[targetIdx];
    let updated = playlistDraft.filter((_, i) => i !== targetIdx);

    // Delete from IndexedDB if it was an uploaded local MP3
    if (trackToRemove && trackToRemove.type === 'mp3') {
      const key = trackToRemove.audioStorageKey || trackToRemove.id;
      if (key) {
        await audioStorage.deleteAudioTrack(key);
      }
    }

    if (updated.length === 0) {
      updated = [
        {
          id: 'default_' + Date.now(),
          title: 'Golden Petals & Starlight',
          artist: 'Acoustic Serenade for Maya',
          type: 'builtin',
        },
      ];
    }

    setPlaylistDraft(updated);
    setDeleteNotice(`Deleted "${trackToRemove?.title || 'Song'}" from playlist`);
    setTimeout(() => setDeleteNotice(null), 3000);

    let nextIdx = settings.currentTrackIndex;
    if (targetIdx < settings.currentTrackIndex) {
      nextIdx = settings.currentTrackIndex - 1;
    } else if (nextIdx >= updated.length) {
      nextIdx = Math.max(0, updated.length - 1);
    }
    const nextTrack = updated[nextIdx] || updated[0];

    // Immediately persist deletion
    onSaveMusic({
      ...settings,
      playlist: updated,
      currentTrackIndex: nextIdx,
      title: nextTrack.title,
      artist: nextTrack.artist,
      audioUrl: nextTrack.audioUrl,
    });
  };

  const handleSave = () => {
    setUploadError(null);
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    let updatedPlaylist = [...playlistDraft];
    let newIndex = settings.currentTrackIndex;

    if (activeTab === 'youtube') {
      const videoId = extractYouTubeVideoId(mediaUrlInput);
      if (!videoId) {
        setUploadError('Please enter a valid YouTube video URL (e.g., https://www.youtube.com/watch?v=... or https://youtu.be/...).');
        return;
      }

      const newTrack: PlaylistItem = {
        id: 'yt_' + Date.now(),
        title: title.trim() || 'YouTube Romantic Song',
        artist: artist.trim() || 'YouTube Audio',
        type: 'youtube',
        externalUrl: mediaUrlInput.trim(),
        youtubeId: videoId,
      };
      updatedPlaylist = [newTrack, ...updatedPlaylist];
      newIndex = 0;
    } else if (activeTab === 'spotify') {
      const parsed = parseMediaUrl(mediaUrlInput);
      if (parsed.type !== 'spotify') {
        setUploadError('Please enter a valid Spotify track, album, or playlist URL.');
        return;
      }
      const newTrack: PlaylistItem = {
        id: 'spotify_' + Date.now(),
        title: title.trim() || parsed.suggestedTitle || 'Spotify Track',
        artist: artist.trim() || parsed.suggestedArtist || 'Spotify Music',
        type: 'spotify',
        externalUrl: mediaUrlInput.trim(),
        embedUrl: parsed.embedUrl,
      };
      updatedPlaylist = [newTrack, ...updatedPlaylist];
      newIndex = 0;
    } else if (activeTab === 'upload' && audioUrl) {
      const trackId = audioStorageKey || ('mp3_' + Date.now());
      const newTrack: PlaylistItem = {
        id: trackId,
        title: title.trim() || 'Uploaded Romantic Song',
        artist: artist.trim() || 'Custom Music',
        type: 'mp3',
        audioUrl: audioUrl,
        audioStorageKey: trackId,
        fileName: fileName || 'song.mp3',
        fileSize: fileSize || undefined,
      };
      updatedPlaylist = [newTrack, ...updatedPlaylist];
      newIndex = 0;
      romanticAudio.setCustomAudio(audioUrl);
      romanticAudio.play();
    } else if (activeTab === 'builtin') {
      romanticAudio.setCustomAudio(null);
      romanticAudio.play();
    }

    if (newIndex >= updatedPlaylist.length) {
      newIndex = 0;
    }

    const currentTrack = updatedPlaylist[newIndex] || updatedPlaylist[0];

    const updated: MusicSettings = {
      ...settings,
      title: activeTab === 'playlist' ? currentTrack.title : (title.trim() || currentTrack.title),
      artist: activeTab === 'playlist' ? currentTrack.artist : (artist.trim() || currentTrack.artist),
      audioUrl: activeTab === 'upload' ? audioUrl : currentTrack.audioUrl,
      externalPlaylistUrl: mediaUrlInput.trim() || settings.externalPlaylistUrl,
      playlist: updatedPlaylist,
      currentTrackIndex: newIndex,
    };

    onSaveMusic(updated);
    onClose();
  };

  const handleResetDefault = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    setTitle('Golden Petals & Starlight');
    setArtist('Acoustic Serenade for Maya');
    setAudioUrl(undefined);
    setAudioStorageKey(null);
    setFileName(null);
    setFileSize(null);
    setMediaUrlInput('');
    setDirectAudioUrlInput('');
    setPreviewPlaying(false);
    setPlaylistDraft(DEFAULT_PLAYLIST);
    setActiveTab('builtin');
  };

  const handleModalClose = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-rose-100 max-h-[92vh] overflow-y-auto">
        {/* Hidden standard file picker */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/mp4,audio/x-m4a"
          className="hidden"
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-rose-950 text-base">Romantic Music Player Settings</h3>
              <p className="text-xs text-stone-500">
                Upload MP3s, manage playlist songs, or stream YouTube & Spotify
              </p>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Source Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100/80 rounded-2xl my-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-white text-rose-600 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload MP3</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('playlist')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'playlist'
                ? 'bg-white text-rose-600 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" />
            <span>Playlist ({playlistDraft.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('youtube')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'youtube'
                ? 'bg-white text-red-600 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>YouTube</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('spotify')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'spotify'
                ? 'bg-white text-emerald-600 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>Spotify</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('builtin')}
            className={`flex-1 py-2 px-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'builtin'
                ? 'bg-white text-rose-600 shadow-xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Acoustic</span>
          </button>
        </div>

        {/* Notices and Alerts */}
        {uploadError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{uploadError}</span>
          </div>
        )}

        {uploadSuccessNotice && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{uploadSuccessNotice}</span>
          </div>
        )}

        {/* TAB 1: UPLOAD MP3 */}
        {activeTab === 'upload' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1.5">
                Upload Romantic Song File (.mp3, .wav, .m4a, .ogg)
              </label>

              {/* Drag and Drop Zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer group ${
                  isDragging
                    ? 'border-rose-500 bg-rose-100/70 scale-[1.01]'
                    : 'border-rose-300 hover:border-rose-500 bg-rose-50/40 hover:bg-rose-50/70'
                }`}
              >
                {isProcessing ? (
                  <div className="py-2 flex flex-col items-center">
                    <Loader2 className="w-7 h-7 text-rose-500 animate-spin mb-2" />
                    <span className="font-semibold text-rose-950">Processing MP3 into Romantic Storage...</span>
                    <span className="text-[11px] text-stone-500 mt-1">Preparing high-fidelity playback</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 mx-auto rounded-full bg-white shadow-xs border border-rose-200 flex items-center justify-center text-rose-500 mb-2.5 group-hover:scale-105 transition-transform">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="font-semibold text-rose-950 text-sm">
                      {fileName ? fileName : 'Click to Browse or Drag & Drop MP3'}
                    </div>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Supports MP3, WAV, M4A up to 50MB · Persisted safely in your private browser library
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Direct URL Alternative Option */}
            <div className="pt-2 border-t border-rose-100">
              <label className="block font-semibold text-stone-700 mb-1">
                Or Paste Direct MP3 Audio URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/romantic-song.mp3"
                  value={directAudioUrlInput}
                  onChange={(e) => setDirectAudioUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs font-mono focus:ring-2 focus:ring-rose-300"
                />
                <button
                  type="button"
                  onClick={handleApplyDirectAudioUrl}
                  className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs"
                >
                  Load URL
                </button>
              </div>
            </div>

            {/* Active Audio Preview Bar */}
            {audioUrl && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-200 mt-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-rose-200/80 flex items-center justify-center text-rose-700 shrink-0">
                    <FileAudio className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-rose-950 font-semibold truncate">
                      {fileName || 'Custom Romantic Song'}
                    </p>
                    <p className="text-[10px] text-stone-500">
                      {fileSize ? `${fileSize} · Ready to play` : 'Ready to apply'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleTogglePreview}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-medium cursor-pointer shadow-xs transition-colors shrink-0"
                >
                  {previewPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  <span>{previewPlaying ? 'Pause Test' : 'Test Audio'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PLAYLIST MANAGEMENT & SONG DELETION */}
        {activeTab === 'playlist' && (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-1">
              <span className="font-semibold text-rose-950">
                Current Playlist ({playlistDraft.length} {playlistDraft.length === 1 ? 'song' : 'songs'})
              </span>
              <span className="text-[11px] text-stone-500">
                Click trash to delete any song instantly
              </span>
            </div>

            {deleteNotice && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{deleteNotice}</span>
              </div>
            )}

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {playlistDraft.map((track, idx) => (
                <div
                  key={track.id || idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-rose-50/50 border border-stone-200/80 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="text-stone-400 font-mono text-[11px] w-4 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium text-stone-800 truncate text-xs flex items-center gap-1.5">
                        <span>{track.title}</span>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-stone-200/70 text-stone-600 font-sans">
                          {track.type || 'mp3'}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDeleteSongInModal(track.id, idx);
                    }}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                    title={`Delete "${track.title}" from playlist`}
                    aria-label={`Delete "${track.title}" from playlist`}
                  >
                    <Trash2 className="w-4 h-4 pointer-events-none" />
                  </button>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-stone-500 pt-1">
              Songs deleted here are updated immediately on your romantic website.
            </p>
          </div>
        )}

        {/* TAB 3: YOUTUBE LINK */}
        {activeTab === 'youtube' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                YouTube Video or Music Link
              </label>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={mediaUrlInput}
                onChange={(e) => {
                  setMediaUrlInput(e.target.value);
                  const parsed = parseMediaUrl(e.target.value);
                  if (parsed.suggestedTitle && !title) setTitle(parsed.suggestedTitle);
                  if (parsed.suggestedArtist && !artist) setArtist(parsed.suggestedArtist);
                }}
                className="w-full px-3 py-2 border border-red-200 rounded-xl text-stone-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-300"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Paste any YouTube song. Audio will stream smoothly in the background while browsing.
              </p>
            </div>
          </div>
        )}

        {/* TAB 4: SPOTIFY LINK */}
        {activeTab === 'spotify' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">
                Spotify Track, Album, or Playlist URL
              </label>
              <input
                type="url"
                placeholder="https://open.spotify.com/track/... or playlist/..."
                value={mediaUrlInput}
                onChange={(e) => {
                  setMediaUrlInput(e.target.value);
                  const parsed = parseMediaUrl(e.target.value);
                  if (parsed.suggestedTitle && !title) setTitle(parsed.suggestedTitle);
                  if (parsed.suggestedArtist && !artist) setArtist(parsed.suggestedArtist);
                }}
                className="w-full px-3 py-2 border border-emerald-200 rounded-xl text-stone-800 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Paste any link from the Spotify app: Share &gt; Copy link.
              </p>
            </div>
          </div>
        )}

        {/* TAB 5: BUILT-IN SERENADES */}
        {activeTab === 'builtin' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-rose-950">
                <Sparkles className="w-4 h-4 text-rose-500" />
                <span>Curated Romantic Instrumental Serenades</span>
              </div>
              <p className="text-stone-600 leading-relaxed text-[11px]">
                High-fidelity acoustic melodies rendered live via Web Audio API. 100% reliable, instant, and works offline or in any browser.
              </p>
            </div>

            <div className="space-y-2">
              {PRESET_ROMANTIC_THEMES.map((theme, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setTitle(theme.title);
                    setArtist(theme.artist);
                    setAudioUrl(undefined);
                    romanticAudio.setCustomAudio(null, theme.variant);
                    romanticAudio.play();
                  }}
                  className="p-3 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/60 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div>
                    <h5 className="font-semibold text-rose-950 group-hover:text-rose-600 transition-colors">
                      {theme.title}
                    </h5>
                    <p className="text-[10px] text-stone-500">{theme.desc}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-rose-600 px-2.5 py-1 bg-white rounded-lg border border-rose-200 shadow-2xs">
                    Select
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Title and Artist Fields (for YouTube, Upload, Spotify) */}
        {(activeTab === 'youtube' || activeTab === 'upload' || activeTab === 'spotify') && (
          <div className="mt-4 pt-3 border-t border-rose-100 space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Song Title</label>
              <input
                type="text"
                placeholder="e.g. Until I Found You"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-rose-300"
              />
            </div>
            <div>
              <label className="block font-semibold text-stone-700 mb-1">Artist Name</label>
              <input
                type="text"
                placeholder="e.g. Stephen Sanchez"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 border border-rose-200 rounded-xl text-stone-800 text-xs focus:ring-2 focus:ring-rose-300"
              />
            </div>
          </div>
        )}

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-rose-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1 text-stone-500 hover:text-stone-800 text-xs font-medium cursor-pointer"
            title="Reset to default acoustic serenade"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleModalClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs shadow-rose-200"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply & Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
