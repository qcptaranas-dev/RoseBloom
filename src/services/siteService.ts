import { CoupleData, DEFAULT_COUPLE_DATA, PlaylistItem, UserSiteProject } from '../types';
import { authService } from './authService';

const SITES_PREFIX = 'rosebloom_user_sites_';
const ACTIVE_SITE_PREFIX = 'rosebloom_active_site_';
const SHARED_REGISTRY_KEY = 'rosebloom_shared_sites_registry';

// Helper to generate clean, memorable receiver passkeys e.g. "ROSE-4821"
function generateShareCode(): string {
  const digits = Math.floor(1000 + Math.random() * 9000);
  return `ROSE-${digits}`;
}

function generateReceiverToken(): string {
  return 'rec_' + Math.random().toString(36).substring(2, 10);
}

// Initial sites for default Liam demo account
const DEFAULT_LIAM_SITES: UserSiteProject[] = [
  {
    id: 'site_primary_maya',
    title: 'Maya & Liam - 1st Year Love Story',
    girlfriendName: 'Maya',
    senderName: 'Liam',
    createdAt: '2024-10-24',
    updatedAt: '2024-10-24',
    ownerId: 'usr_maya_love_01',
    ownerEmail: 'mikuchanmawaifu@gmail.com',
    shareCode: 'ROSE-1024',
    receiverToken: 'rec_maya_forever',
    isPrivate: true,
    data: DEFAULT_COUPLE_DATA,
  },
  {
    id: 'site_spring_edition',
    title: 'Spring Rose Memories for Maya',
    girlfriendName: 'Maya',
    senderName: 'Liam',
    createdAt: '2025-04-14',
    updatedAt: '2025-04-14',
    ownerId: 'usr_maya_love_01',
    ownerEmail: 'mikuchanmawaifu@gmail.com',
    shareCode: 'ROSE-0414',
    receiverToken: 'rec_maya_spring',
    isPrivate: true,
    data: {
      ...DEFAULT_COUPLE_DATA,
      monthsaryGreeting: 'Six Months of Pure Magic',
      monthsaryDate: 'April 14, 2025',
      anniversarySubtitle: 'Six months of waking up with gratitude and endless laughter by your side.',
      theme: {
        ...DEFAULT_COUPLE_DATA.theme,
        palette: 'dusty-rose',
        roseStyle: 'blush',
      },
    },
  },
];

/**
 * Strips huge data URLs from JSON storage so localStorage 5MB quota is never exceeded.
 * MP3 audio binaries are persisted safely in IndexedDB via audioStorage.
 */
function sanitizeSiteForStorage(site: UserSiteProject): UserSiteProject {
  const clone = JSON.parse(JSON.stringify(site)) as UserSiteProject;
  if (clone.data?.music?.playlist) {
    clone.data.music.playlist = clone.data.music.playlist.map((t: PlaylistItem) => {
      if (t.audioUrl && t.audioUrl.startsWith('data:audio')) {
        return { ...t, audioUrl: undefined, audioStorageKey: t.audioStorageKey || t.id };
      }
      return t;
    });
  }
  if (clone.data?.music?.audioUrl && clone.data.music.audioUrl.startsWith('data:audio')) {
    clone.data.music.audioUrl = undefined;
  }
  return clone;
}

export function encodeSiteForReceiver(site: UserSiteProject): string {
  try {
    const minified = {
      id: site.id,
      title: site.title,
      girlfriendName: site.girlfriendName,
      senderName: site.senderName,
      createdAt: site.createdAt,
      data: sanitizeSiteForStorage(site).data,
      shareCode: site.shareCode,
    };
    const jsonStr = JSON.stringify(minified);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
  } catch (err) {
    console.warn('Could not encode site for receiver:', err);
    return '';
  }
}

export function decodeSiteFromReceiver(encoded: string): UserSiteProject | null {
  try {
    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !parsed.data) return null;
    return {
      id: parsed.id || 'site_' + Date.now(),
      title: parsed.title || `${parsed.girlfriendName || 'Beloved'}'s Letter`,
      girlfriendName: parsed.girlfriendName || 'My Love',
      senderName: parsed.senderName || 'Me',
      createdAt: parsed.createdAt || new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      data: parsed.data,
      shareCode: parsed.shareCode,
      isPrivate: true,
    };
  } catch (err) {
    console.warn('Could not decode site payload:', err);
    return null;
  }
}

class SiteService {
  private currentUserId: string = 'usr_maya_love_01';
  private currentUserName: string = 'Liam';
  private currentUserEmail: string = 'mikuchanmawaifu@gmail.com';
  private sites: UserSiteProject[] = [];
  private activeSiteId: string = '';
  private listeners: ((sites: UserSiteProject[], active: UserSiteProject) => void)[] = [];

  constructor() {
    const initialUser = authService.getCurrentUser();
    if (initialUser) {
      this.currentUserId = initialUser.id;
      this.currentUserName = initialUser.name;
      this.currentUserEmail = initialUser.email;
    }

    this.loadSitesForCurrentUser();

    // Dynamically react to account logins, signups, or switchers
    authService.subscribe((user) => {
      const nextId = user ? user.id : 'guest';
      const nextName = user ? user.name : 'Guest';
      const nextEmail = user ? user.email : '';
      if (nextId !== this.currentUserId) {
        this.switchAccount(nextId, nextName, nextEmail);
      }
    });
  }

  public switchAccount(userId: string, userName: string, userEmail: string): void {
    // Save current user state before switching
    this.saveSites();

    this.currentUserId = userId;
    this.currentUserName = userName;
    this.currentUserEmail = userEmail;

    this.loadSitesForCurrentUser();
    this.notify();
  }

  private getStorageKey(): string {
    return `${SITES_PREFIX}${this.currentUserId}`;
  }

  private getActiveSiteKey(): string {
    return `${ACTIVE_SITE_PREFIX}${this.currentUserId}`;
  }

  private loadSitesForCurrentUser(): void {
    try {
      const stored = localStorage.getItem(this.getStorageKey());
      if (stored) {
        this.sites = JSON.parse(stored);
      } else {
        // Initialize private workspace for this account
        if (this.currentUserId === 'usr_maya_love_01') {
          this.sites = DEFAULT_LIAM_SITES;
        } else {
          // Fresh account: create their own private initial work
          const today = new Date().toISOString().split('T')[0];
          const initialProject: UserSiteProject = {
            id: 'site_' + Math.random().toString(36).substring(2, 9),
            title: `${this.currentUserName}'s Love Letter`,
            girlfriendName: 'My Beloved',
            senderName: this.currentUserName,
            createdAt: today,
            updatedAt: today,
            ownerId: this.currentUserId,
            ownerEmail: this.currentUserEmail,
            shareCode: generateShareCode(),
            receiverToken: generateReceiverToken(),
            isPrivate: true,
            data: {
              ...DEFAULT_COUPLE_DATA,
              senderName: this.currentUserName,
              girlfriendName: 'My Beloved',
              monthsaryGreeting: `For My Dearest Love`,
              anniversarySubtitle: `Every second with you is a gift I cherish beyond words.`,
              letter: {
                ...DEFAULT_COUPLE_DATA.letter,
                greeting: 'My Dearest Love,',
                signature: `With all my heart, ${this.currentUserName}`,
              },
            },
          };
          this.sites = [initialProject];
        }
        this.saveSites();
      }

      // Ensure every site has ownerId, shareCode, and receiverToken
      let updatedMetadata = false;
      this.sites.forEach((site) => {
        if (!site.ownerId) {
          site.ownerId = this.currentUserId;
          site.ownerEmail = this.currentUserEmail;
          updatedMetadata = true;
        }
        if (!site.shareCode) {
          site.shareCode = generateShareCode();
          updatedMetadata = true;
        }
        if (!site.receiverToken) {
          site.receiverToken = generateReceiverToken();
          updatedMetadata = true;
        }
      });
      if (updatedMetadata) {
        this.saveSites();
      }

      const activeId = localStorage.getItem(this.getActiveSiteKey());
      if (activeId && this.sites.some((s) => s.id === activeId)) {
        this.activeSiteId = activeId;
      } else {
        this.activeSiteId = this.sites[0]?.id || '';
      }
    } catch (err) {
      console.warn('Error loading sites for user:', err);
      this.sites = DEFAULT_LIAM_SITES;
      this.activeSiteId = DEFAULT_LIAM_SITES[0].id;
    }
  }

  private saveSites(): void {
    try {
      const sanitized = this.sites.map((s) => sanitizeSiteForStorage(s));
      localStorage.setItem(this.getStorageKey(), JSON.stringify(sanitized));
      localStorage.setItem(this.getActiveSiteKey(), this.activeSiteId);

      // Also register into shared receiver registry so receiver links can lookup by code/id/token
      this.updateSharedRegistry();
    } catch (err) {
      console.warn('Could not write sites to localStorage:', err);
    }
  }

  private updateSharedRegistry(): void {
    try {
      const raw = localStorage.getItem(SHARED_REGISTRY_KEY);
      const registry: Record<string, UserSiteProject> = raw ? JSON.parse(raw) : {};

      this.sites.forEach((site) => {
        const sanitized = sanitizeSiteForStorage(site);
        registry[site.id] = sanitized;
        if (site.shareCode) registry[site.shareCode.toUpperCase()] = sanitized;
        if (site.receiverToken) registry[site.receiverToken] = sanitized;
      });

      localStorage.setItem(SHARED_REGISTRY_KEY, JSON.stringify(registry));
    } catch {
      // Ignore
    }
  }

  private notify(): void {
    const active = this.getActiveSite();
    this.listeners.forEach((l) => l(this.sites, active));
  }

  public subscribe(listener: (sites: UserSiteProject[], active: UserSiteProject) => void) {
    this.listeners.push(listener);
    listener(this.sites, this.getActiveSite());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getCurrentUserId(): string {
    return this.currentUserId;
  }

  public getSites(): UserSiteProject[] {
    // Strictly return only sites owned by current user
    return this.sites.filter((s) => !s.ownerId || s.ownerId === this.currentUserId);
  }

  public getActiveSite(): UserSiteProject {
    const found = this.sites.find((s) => s.id === this.activeSiteId);
    if (found) return found;
    return this.sites[0] || DEFAULT_LIAM_SITES[0];
  }

  public setActiveSite(id: string): void {
    if (this.sites.some((s) => s.id === id)) {
      this.activeSiteId = id;
      try {
        localStorage.setItem(this.getActiveSiteKey(), id);
      } catch {
        // Ignore
      }
      this.notify();
    }
  }

  public createSite(
    title: string,
    girlfriendName: string,
    senderName: string,
    monthsaryDate: string
  ): UserSiteProject {
    const newSiteId = 'site_' + Math.random().toString(36).substring(2, 9);
    const today = new Date().toISOString().split('T')[0];

    const partnerName = girlfriendName.trim() || 'My Love';
    const authorName = senderName.trim() || this.currentUserName;

    const newCoupleData: CoupleData = {
      ...DEFAULT_COUPLE_DATA,
      girlfriendName: partnerName,
      senderName: authorName,
      monthsaryDate: monthsaryDate.trim() || 'Today',
      monthsaryGreeting: `Happy Monthsary, ${partnerName}`,
      letter: {
        ...DEFAULT_COUPLE_DATA.letter,
        greeting: `My Dearest ${partnerName},`,
        signature: `Your ${authorName}`,
      },
    };

    const newProject: UserSiteProject = {
      id: newSiteId,
      title: title.trim() || `${partnerName}'s Monthsary Site`,
      girlfriendName: partnerName,
      senderName: authorName,
      createdAt: today,
      updatedAt: today,
      ownerId: this.currentUserId,
      ownerEmail: this.currentUserEmail,
      shareCode: generateShareCode(),
      receiverToken: generateReceiverToken(),
      isPrivate: true,
      data: newCoupleData,
    };

    this.sites.unshift(newProject);
    this.activeSiteId = newSiteId;
    this.saveSites();
    this.notify();
    return newProject;
  }

  public updateActiveSiteData(newData: CoupleData, silent = false): void {
    const idx = this.sites.findIndex((s) => s.id === this.activeSiteId);
    if (idx !== -1) {
      this.sites[idx].data = newData;
      this.sites[idx].girlfriendName = newData.girlfriendName;
      this.sites[idx].senderName = newData.senderName;
      this.sites[idx].updatedAt = new Date().toISOString().split('T')[0];
      this.saveSites();
      if (!silent) {
        this.notify();
      }
    }
  }

  public duplicateSite(siteId: string): UserSiteProject {
    const original = this.sites.find((s) => s.id === siteId);
    if (!original) throw new Error('Site not found');

    const copyId = 'site_' + Math.random().toString(36).substring(2, 9);
    const today = new Date().toISOString().split('T')[0];

    const duplicated: UserSiteProject = {
      ...original,
      id: copyId,
      title: `${original.title} (Copy)`,
      createdAt: today,
      updatedAt: today,
      ownerId: this.currentUserId,
      ownerEmail: this.currentUserEmail,
      shareCode: generateShareCode(),
      receiverToken: generateReceiverToken(),
      isPrivate: true,
      data: JSON.parse(JSON.stringify(original.data)),
    };

    this.sites.unshift(duplicated);
    this.activeSiteId = copyId;
    this.saveSites();
    this.notify();
    return duplicated;
  }

  public deleteSite(siteId: string): void {
    if (this.sites.length <= 1) {
      throw new Error('You must keep at least one romantic letter.');
    }
    this.sites = this.sites.filter((s) => s.id !== siteId);
    if (this.activeSiteId === siteId) {
      this.activeSiteId = this.sites[0].id;
    }
    this.saveSites();
    this.notify();
  }

  /**
   * Safe lookup for receiver mode:
   * Finds a site by ID, share code (e.g. ROSE-1024), or receiver token
   */
  public findSiteForReceiver(identifier: string): UserSiteProject | null {
    if (!identifier) return null;
    const cleanId = identifier.trim();

    // Check currently loaded sites
    const direct = this.sites.find(
      (s) =>
        s.id === cleanId ||
        s.shareCode?.toUpperCase() === cleanId.toUpperCase() ||
        s.receiverToken === cleanId
    );
    if (direct) return direct;

    // Check shared registry
    try {
      const raw = localStorage.getItem(SHARED_REGISTRY_KEY);
      if (raw) {
        const registry: Record<string, UserSiteProject> = JSON.parse(raw);
        if (registry[cleanId]) return registry[cleanId];
        if (registry[cleanId.toUpperCase()]) return registry[cleanId.toUpperCase()];
      }
    } catch {
      // Ignore
    }

    return null;
  }
}

export const siteService = new SiteService();
