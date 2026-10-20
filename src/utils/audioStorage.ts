/**
 * Audio Storage Engine using IndexedDB:
 * - Stores MP3 / audio blobs safely up to hundreds of megabytes
 * - Completely avoids localStorage 5MB quota errors
 * - Manages object URLs for smooth browser audio streaming & preview
 */

const DB_NAME = 'rosebloom_audio_db';
const DB_VERSION = 1;
const STORE_NAME = 'audio_tracks';

class AudioStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;
  private memoryCache: Map<string, { blob: Blob; objectUrl: string }> = new Map();

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.warn('Could not open IndexedDB for audio storage, falling back to memory', request.error);
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  public formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  public async saveAudioTrack(
    trackId: string,
    fileOrBlob: Blob
  ): Promise<{ objectUrl: string; fileSizeFormatted: string }> {
    const objectUrl = URL.createObjectURL(fileOrBlob);
    this.memoryCache.set(trackId, { blob: fileOrBlob, objectUrl });

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(fileOrBlob, trackId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      console.warn('Saved audio to memory cache only (IndexedDB unavailable):', err);
    }

    return {
      objectUrl,
      fileSizeFormatted: this.formatBytes(fileOrBlob.size),
    };
  }

  public async getAudioTrackUrl(trackId: string): Promise<string | null> {
    // Check in-memory cache first
    const cached = this.memoryCache.get(trackId);
    if (cached) {
      return cached.objectUrl;
    }

    try {
      const db = await this.getDB();
      const blob = await new Promise<Blob | null>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(trackId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });

      if (blob) {
        const objectUrl = URL.createObjectURL(blob);
        this.memoryCache.set(trackId, { blob, objectUrl });
        return objectUrl;
      }
    } catch (err) {
      console.warn('Error reading audio from IndexedDB:', err);
    }

    return null;
  }

  public async deleteAudioTrack(trackId: string): Promise<void> {
    const cached = this.memoryCache.get(trackId);
    if (cached) {
      try {
        URL.revokeObjectURL(cached.objectUrl);
      } catch {
        // Ignore
      }
      this.memoryCache.delete(trackId);
    }

    try {
      const db = await this.getDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(trackId);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    } catch {
      // Ignore
    }
  }
}

export const audioStorage = new AudioStorageManager();
