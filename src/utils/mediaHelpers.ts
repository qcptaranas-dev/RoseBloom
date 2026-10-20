/**
 * Helper utilities for parsing and formatting YouTube and Spotify playlist links
 */

export interface ParsedMediaLink {
  type: 'youtube' | 'spotify' | 'invalid';
  id?: string;
  embedUrl?: string;
  suggestedTitle?: string;
  suggestedArtist?: string;
  isPlaylist?: boolean;
}

export function extractYouTubeVideoId(url: string): string | null {
  const cleanUrl = url.trim();
  if (!cleanUrl) return null;

  // Direct 11-char video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(cleanUrl)) {
    return cleanUrl;
  }

  // 1. YouTube watch URL with query param ?v= or &v=
  const vMatch = cleanUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i);
  if (vMatch) return vMatch[1];

  // 2. youtu.be/ID
  const youtuMatch = cleanUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i);
  if (youtuMatch) return youtuMatch[1];

  // 3. youtube.com/shorts/ID
  const shortsMatch = cleanUrl.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/i);
  if (shortsMatch) return shortsMatch[1];

  // 4. youtube.com/embed/ID or /v/ID or /live/ID
  const pathMatch = cleanUrl.match(/youtube(?:-nocookie)?\.com\/(?:embed|v|live)\/([a-zA-Z0-9_-]{11})/i);
  if (pathMatch) return pathMatch[1];

  return null;
}

export function parseMediaUrl(url: string): ParsedMediaLink {
  const cleanUrl = url.trim();
  if (!cleanUrl) return { type: 'invalid' };

  // 1. YouTube Video Detection (supports watch?v=, youtu.be, shorts, embed, etc.)
  const videoId = extractYouTubeVideoId(cleanUrl);
  const ytPlaylistMatch = cleanUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/i);

  if (videoId) {
    return {
      type: 'youtube',
      id: videoId,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1`,
      suggestedTitle: 'YouTube Romantic Song',
      suggestedArtist: 'YouTube Audio',
      isPlaylist: !!ytPlaylistMatch,
    };
  }

  if (ytPlaylistMatch) {
    const listId = ytPlaylistMatch[1];
    return {
      type: 'youtube',
      id: listId,
      embedUrl: `https://www.youtube-nocookie.com/embed/videoseries?list=${listId}&enablejsapi=1`,
      suggestedTitle: 'YouTube Love Playlist',
      suggestedArtist: 'YouTube Playlist',
      isPlaylist: true,
    };
  }

  // 2. Spotify Detection
  // Matches: open.spotify.com/track/..., open.spotify.com/playlist/..., open.spotify.com/album/...
  const spotifyTrackMatch = cleanUrl.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/i);
  if (spotifyTrackMatch) {
    const trackId = spotifyTrackMatch[1];
    return {
      type: 'spotify',
      id: trackId,
      embedUrl: `https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`,
      suggestedTitle: 'Spotify Love Song',
      suggestedArtist: 'Spotify Music',
      isPlaylist: false,
    };
  }

  const spotifyPlaylistMatch = cleanUrl.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/i);
  if (spotifyPlaylistMatch) {
    const playlistId = spotifyPlaylistMatch[1];
    return {
      type: 'spotify',
      id: playlistId,
      embedUrl: `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`,
      suggestedTitle: 'Our Spotify Playlist',
      suggestedArtist: 'Spotify Playlist',
      isPlaylist: true,
    };
  }

  const spotifyAlbumMatch = cleanUrl.match(/open\.spotify\.com\/album\/([a-zA-Z0-9]+)/i);
  if (spotifyAlbumMatch) {
    const albumId = spotifyAlbumMatch[1];
    return {
      type: 'spotify',
      id: albumId,
      embedUrl: `https://open.spotify.com/embed/album/${albumId}?utm_source=generator&theme=0`,
      suggestedTitle: 'Our Spotify Album',
      suggestedArtist: 'Spotify Album',
      isPlaylist: true,
    };
  }

  return { type: 'invalid' };
}
