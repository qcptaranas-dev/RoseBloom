import { UserProfile } from '../types';

const AUTH_STORAGE_KEY = 'rosebloom_auth_user';
const USERS_DB_KEY = 'rosebloom_registered_users';

interface StoredUserAccount {
  profile: UserProfile;
  passwordHash: string;
}

// Default initial user for convenient testing
const DEFAULT_USER: UserProfile = {
  id: 'usr_maya_love_01',
  name: 'Liam',
  email: 'mikuchanmawaifu@gmail.com',
  googleLinked: true,
  googleEmail: 'mikuchanmawaifu@gmail.com',
  avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=Liam&backgroundColor=ffd5dc',
  createdAt: '2024-10-24',
};

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: ((user: UserProfile | null) => void)[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      }
    } catch {
      this.currentUser = null;
    }
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  public subscribe(listener: (user: UserProfile | null) => void) {
    this.listeners.push(listener);
    listener(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  public async signInWithEmail(email: string, pass: string): Promise<UserProfile> {
    // Check if matching registered user exists
    const users = this.getStoredUsers();
    const existing = users.find((u) => u.profile.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      if (existing.passwordHash !== pass) {
        throw new Error('Incorrect password. Please try again.');
      }
      this.currentUser = existing.profile;
    } else {
      // First time sign-in with these credentials: auto-create account
      const newUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        name: email.split('@')[0],
        email: email,
        googleLinked: false,
        avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${email}&backgroundColor=ffd5dc`,
        createdAt: new Date().toISOString().split('T')[0],
      };
      this.saveUserAccount(newUser, pass);
      this.currentUser = newUser;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async signUpWithEmail(name: string, email: string, pass: string): Promise<UserProfile> {
    const users = this.getStoredUsers();
    if (users.some((u) => u.profile.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists. Please sign in instead.');
    }

    const newUser: UserProfile = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      name: name.trim() || email.split('@')[0],
      email: email.trim(),
      googleLinked: false,
      avatarUrl: `https://api.dicebear.com/7.x/notionists/svg?seed=${name}&backgroundColor=ffd5dc`,
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.saveUserAccount(newUser, pass);
    this.currentUser = newUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async signInWithGoogle(): Promise<UserProfile> {
    // Simulates quick Google OAuth verification with user's verified email
    const googleUser: UserProfile = {
      id: 'usr_google_7400624',
      name: 'Liam & Maya',
      email: 'mikuchanmawaifu@gmail.com',
      googleLinked: true,
      googleEmail: 'mikuchanmawaifu@gmail.com',
      avatarUrl: 'https://api.dicebear.com/7.x/notionists/svg?seed=LiamMaya&backgroundColor=ffd5dc',
      createdAt: new Date().toISOString().split('T')[0],
    };

    this.currentUser = googleUser;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public signOut(): void {
    this.currentUser = null;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    this.notify();
  }

  public async updateEmail(newEmail: string): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');
    const emailClean = newEmail.trim().toLowerCase();
    if (!emailClean.includes('@') || !emailClean.includes('.')) {
      throw new Error('Please enter a valid email address.');
    }

    this.currentUser = {
      ...this.currentUser,
      email: emailClean,
    };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));

    // Update in users registry
    const users = this.getStoredUsers();
    const idx = users.findIndex((u) => u.profile.id === this.currentUser?.id);
    if (idx !== -1) {
      users[idx].profile = this.currentUser;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }

    this.notify();
    return this.currentUser;
  }

  public async changePassword(oldPass: string, newPass: string): Promise<void> {
    if (!this.currentUser) throw new Error('Not authenticated');
    if (newPass.length < 6) {
      throw new Error('New password must be at least 6 characters long.');
    }

    const users = this.getStoredUsers();
    const userAcc = users.find((u) => u.profile.id === this.currentUser?.id);
    if (userAcc && userAcc.passwordHash && userAcc.passwordHash !== oldPass) {
      throw new Error('Current password does not match.');
    }

    if (userAcc) {
      userAcc.passwordHash = newPass;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }
  }

  public async linkGoogleAccount(googleEmail: string): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');

    this.currentUser = {
      ...this.currentUser,
      googleLinked: true,
      googleEmail: googleEmail.trim() || 'mikuchanmawaifu@gmail.com',
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  public async unlinkGoogleAccount(): Promise<UserProfile> {
    if (!this.currentUser) throw new Error('Not authenticated');

    this.currentUser = {
      ...this.currentUser,
      googleLinked: false,
      googleEmail: undefined,
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(this.currentUser));
    this.notify();
    return this.currentUser;
  }

  private getStoredUsers(): StoredUserAccount[] {
    try {
      const data = localStorage.getItem(USERS_DB_KEY);
      if (data) return JSON.parse(data);
    } catch {
      // Ignore
    }
    return [
      {
        profile: DEFAULT_USER,
        passwordHash: 'love2024',
      },
    ];
  }

  private saveUserAccount(profile: UserProfile, passwordHash: string) {
    const users = this.getStoredUsers();
    users.push({ profile, passwordHash });
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  }
}

export const authService = new AuthService();
