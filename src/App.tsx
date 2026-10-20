/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppRoute, CoupleData, DEFAULT_COUPLE_DATA, ThemeConfig, UserProfile, UserSiteProject, PasscodeConfig } from './types';
import { TopNav } from './components/TopNav';
import { LandingHero } from './components/LandingHero';
import { RoseBloomExperience } from './components/RoseBloomExperience';
import { LoveLetter } from './components/LoveLetter';
import { PhotoGallery } from './components/PhotoGallery';
import { RomanticMusicPlayer } from './components/RomanticMusicPlayer';
import { CustomizeDesignModal } from './components/CustomizeDesignModal';
import { SharePublishModal } from './components/SharePublishModal';
import { PasscodeModal } from './components/PasscodeModal';
import { GlowingDustOverlay } from './components/GlowingDustOverlay';
import { FloatingPetalsOverlay } from './components/FloatingPetalsOverlay';
import { AuthPage } from './pages/AuthPage';
import { AccountSettingsPage } from './pages/AccountSettingsPage';
import { MySitesPage } from './pages/MySitesPage';
import { ReasonsWhyILoveYou } from './components/ReasonsWhyILoveYou';
import { exportStandaloneHtml } from './utils/exporter';
import { romanticAudio } from './utils/audioEngine';
import { authService } from './services/authService';
import { siteService } from './services/siteService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => authService.getCurrentUser());
  const [currentRoute, setCurrentRoute] = useState<AppRoute>('home');
  const [sites, setSites] = useState<UserSiteProject[]>(() => siteService.getSites());
  const [activeSite, setActiveSite] = useState<UserSiteProject>(() => siteService.getActiveSite());
  const [data, setData] = useState<CoupleData>(() => activeSite.data || DEFAULT_COUPLE_DATA);

  const [isReceiverMode, setIsReceiverMode] = useState<boolean>(false);
  const [showBloomExperience, setShowBloomExperience] = useState<boolean>(false);
  const [letterRevealed, setLetterRevealed] = useState<boolean>(false);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);

  // Passcode verification state for receiver
  const [isPasscodeUnlocked, setIsPasscodeUnlocked] = useState<boolean>(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState<boolean>(false);
  const [isAuthorPreviewPasscode, setIsAuthorPreviewPasscode] = useState<boolean>(false);

  // Subscribe to AuthService
  useEffect(() => {
    const unsubscribeAuth = authService.subscribe((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // Subscribe to SiteService
  useEffect(() => {
    const unsubscribeSites = siteService.subscribe((allSites, active) => {
      setSites(allSites);
      setActiveSite(active);
      setData(active.data);
    });
    return () => unsubscribeSites();
  }, []);

  // Check URL query parameters and pathname/hash on initial load
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'receiver') {
      setIsReceiverMode(true);
    }
    const toName = params.get('to');
    const fromName = params.get('from');
    if (toName || fromName) {
      setData((prev) => ({
        ...prev,
        girlfriendName: toName ? decodeURIComponent(toName) : prev.girlfriendName,
        senderName: fromName ? decodeURIComponent(fromName) : prev.senderName,
      }));
    }

    // Check pathname or hash for routes
    const path = window.location.pathname;
    const hash = window.location.hash;
    if (path === '/account' || hash === '#account') {
      setCurrentRoute('account');
    } else if (path === '/my-work' || hash === '#my-work' || path === '/my-sites' || hash === '#my-sites') {
      setCurrentRoute('my-work');
    }
  }, []);

  // Sync data updates to siteService
  const updateCurrentData = (updater: CoupleData | ((prev: CoupleData) => CoupleData)) => {
    setData((prev) => {
      const nextData = typeof updater === 'function' ? updater(prev) : updater;
      siteService.updateActiveSiteData(nextData, true);
      return nextData;
    });
  };

  // Attempt romantic audio autoplay on initial load
  useEffect(() => {
    let hasAttempted = false;
    const attemptAutoplay = async () => {
      if (hasAttempted) return;
      hasAttempted = true;
      const success = await romanticAudio.play();
      if (!success) {
        setAutoplayBlocked(true);
      }
    };

    attemptAutoplay();

    // Fallback: start on first user interaction if autoplay was blocked
    const handleFirstInteraction = () => {
      if (!romanticAudio.getIsPlaying()) {
        romanticAudio.play();
        setAutoplayBlocked(false);
      }
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);

    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleOpenLetter = async () => {
    // If passcode is enabled and not yet unlocked by receiver, prompt passcode first
    if (data.passcode?.enabled && !isPasscodeUnlocked) {
      setIsAuthorPreviewPasscode(false);
      setShowPasscodeModal(true);
      return;
    }

    await romanticAudio.play();
    setAutoplayBlocked(false);
    setShowBloomExperience(true);
  };

  const handlePasscodeSuccess = async () => {
    setIsPasscodeUnlocked(true);
    setShowPasscodeModal(false);
    await romanticAudio.play();
    setAutoplayBlocked(false);
    setShowBloomExperience(true);
  };

  const handleOpenPasscodeTest = () => {
    setIsAuthorPreviewPasscode(true);
    setShowPasscodeModal(true);
  };

  const handleBloomComplete = () => {
    setShowBloomExperience(false);
    setLetterRevealed(true);

    setTimeout(() => {
      const letterEl = document.getElementById('letter');
      if (letterEl) {
        letterEl.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleSkipBloom = () => {
    setShowBloomExperience(false);
    setLetterRevealed(true);
    const letterEl = document.getElementById('letter');
    if (letterEl) {
      letterEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReplayBloom = () => {
    setShowBloomExperience(true);
  };

  const handleUpdateHeader = (updated: {
    senderName?: string;
    girlfriendName?: string;
    monthsaryGreeting?: string;
    monthsaryDate?: string;
    startMonth?: string;
    currentMonth?: string;
    relationshipStartDate?: string;
    currentCelebrationDate?: string;
    customDaysCount?: number | null;
    anniversarySubtitle?: string;
    passcode?: PasscodeConfig;
  }) => {
    const updatedData = { ...data, ...updated };
    updateCurrentData(updatedData);
  };

  const handleUpdatePhoto = (index: number, updated: Partial<typeof data.photos[0]>) => {
    const newPhotos = [...data.photos] as typeof data.photos;
    newPhotos[index] = { ...newPhotos[index], ...updated };
    const updatedData = { ...data, photos: newPhotos };
    updateCurrentData(updatedData);
  };

  const handleUpdateLetter = (updated: Partial<typeof data.letter>) => {
    const updatedData = { ...data, letter: { ...data.letter, ...updated } };
    updateCurrentData(updatedData);
  };

  const handleSaveTheme = (newTheme: ThemeConfig) => {
    const updatedData = { ...data, theme: newTheme };
    updateCurrentData(updatedData);
  };

  const handleResetDefault = () => {
    updateCurrentData(DEFAULT_COUPLE_DATA);
  };

  const handleSelectSite = (siteId: string) => {
    siteService.setActiveSite(siteId);
    const selected = siteService.getActiveSite();
    setActiveSite(selected);
    setData(selected.data);
  };

  const handlePreviewReceiver = (siteId: string) => {
    handleSelectSite(siteId);
    setIsReceiverMode(true);
    setCurrentRoute('home');
  };

  // Background style classes based on theme
  const getThemeBackgroundClass = () => {
    switch (data.theme.palette) {
      case 'soft-lavender':
        return 'bg-gradient-to-b from-[#FAF5FC] via-[#F6EEFA] to-[#F1E5F7] text-stone-800';
      case 'white-sage':
        return 'bg-gradient-to-b from-[#F9FAF9] via-[#F2F5F3] to-[#E9EFEA] text-stone-800';
      case 'dusty-rose':
        return 'bg-gradient-to-b from-[#FAF2F4] via-[#F7E7EA] to-[#F3DCE0] text-stone-800';
      case 'cream-pink':
        return 'bg-gradient-to-b from-[#FFFDF9] via-[#FFF3F5] to-[#FDE7EC] text-stone-800';
      default: // blush
        return 'bg-gradient-to-b from-[#FAF7F5] via-[#FFF5F7] to-[#FDEEF1] text-stone-800';
    }
  };

  // Font styling class based on theme
  const getFontClass = () => {
    switch (data.theme.fontStyle) {
      case 'playfair':
        return 'font-playfair';
      case 'modern':
        return 'font-sans-custom';
      default:
        return 'font-cormorant';
    }
  };

  // MANDATORY AUTH GATE: When opening app, require sign in first unless viewing as receiver
  if (!currentUser && !isReceiverMode) {
    return <AuthPage onSignedIn={() => setCurrentRoute('home')} />;
  }

  return (
    <div className={`min-h-screen relative selection:bg-rose-200 selection:text-rose-900 ${getThemeBackgroundClass()}`}>
      {/* Subtle overlay of floating, softly glowing dust particles */}
      <GlowingDustOverlay density={50} />

      {/* Top Navigation Bar */}
      <TopNav
        currentRoute={currentRoute}
        currentUser={currentUser}
        isReceiverMode={isReceiverMode}
        passcodeEnabled={data.passcode?.enabled}
        onNavigate={(route) => setCurrentRoute(route)}
        onToggleReceiverMode={() => setIsReceiverMode(!isReceiverMode)}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenShareModal={() => setIsShareModalOpen(true)}
        onOpenPasscodeModal={handleOpenPasscodeTest}
        onDownloadWebsite={() => exportStandaloneHtml(data)}
        onSignOut={() => authService.signOut()}
        onReplayBloom={handleReplayBloom}
      />

      {/* Subtle floating petals that remain gently drifting after the letter appears */}
      {letterRevealed && !showBloomExperience && (
        <FloatingPetalsOverlay theme={data.theme} count={7} />
      )}

      {/* Signature Pink Rose Bloom & 3D Petal Rush Experience */}
      {showBloomExperience && (
        <RoseBloomExperience
          theme={data.theme}
          onComplete={handleBloomComplete}
          onSkip={handleSkipBloom}
        />
      )}

      {/* ROUTE 1: Account Settings Page (/account) */}
      {currentRoute === 'account' && currentUser && (
        <main className="relative z-10 pt-4 pb-28">
          <AccountSettingsPage
            user={currentUser}
            onNavigateHome={() => setCurrentRoute('home')}
            onNavigateSites={() => setCurrentRoute('my-work')}
            onSignOut={() => authService.signOut()}
          />
        </main>
      )}

      {/* ROUTE 2: My Work Dashboard (/my-work) */}
      {currentRoute === 'my-work' && (
        <main className="relative z-10 pt-4 pb-28">
          <MySitesPage
            sites={sites}
            activeSite={activeSite}
            onSelectSite={handleSelectSite}
            onPreviewReceiver={handlePreviewReceiver}
            onNavigateHome={() => setCurrentRoute('home')}
          />
        </main>
      )}

      {/* ROUTE 3: Main Monthsary Website Experience */}
      {currentRoute === 'home' && (
        <main id="top" className={`relative z-10 ${getFontClass()}`}>
          {/* Landing Hero View */}
          <div id="hero">
            <LandingHero
              data={data}
              isReceiverMode={isReceiverMode}
              onOpenLetter={handleOpenLetter}
              onUpdateHeader={handleUpdateHeader}
              onViewReceiver={() => setIsReceiverMode(true)}
              onOpenCustomizer={() => setIsCustomizerOpen(true)}
              onOpenPasscodeTest={handleOpenPasscodeTest}
            />
          </div>

          {/* Revealed Love Letter */}
          <div
            id="letter"
            className={`transition-all duration-1000 ${
              letterRevealed ? 'opacity-100 translate-y-0' : 'opacity-90'
            }`}
          >
            <LoveLetter
              letter={data.letter}
              senderName={data.senderName}
              girlfriendName={data.girlfriendName}
              isReceiverMode={isReceiverMode}
              onUpdateLetter={handleUpdateLetter}
              onReplayBloom={handleReplayBloom}
            />
          </div>

          {/* Keepsake Reasons Why I Love You */}
          <div id="reasons" className="mt-4">
            <ReasonsWhyILoveYou
              isReceiverMode={isReceiverMode}
              girlfriendName={data.girlfriendName}
            />
          </div>

          {/* Four Cherished Moments Photo Gallery */}
          <div id="gallery" className="mt-6 pb-28">
            <PhotoGallery
              photos={data.photos}
              isReceiverMode={isReceiverMode}
              onUpdatePhoto={handleUpdatePhoto}
            />
          </div>
        </main>
      )}

      {/* Romantic Music Player with Multi-song Playlist & YouTube/Spotify Links */}
      <RomanticMusicPlayer
        settings={data.music}
        placement={data.theme.playerPlacement}
        autoplayBlocked={autoplayBlocked}
        onDismissAutoplayPrompt={() => setAutoplayBlocked(false)}
        onTriggerPlay={() => romanticAudio.play()}
        onUpdateMusicSettings={(updated) => {
          updateCurrentData((prev) => ({
            ...prev,
            music: { ...prev.music, ...updated },
          }));
        }}
      />

      {/* Secret Passcode Protection Lock Modal */}
      <PasscodeModal
        isOpen={showPasscodeModal}
        passcodeConfig={data.passcode || { enabled: true, code: '1024', hint: 'Our anniversary date (MMDD) 🌸' }}
        girlfriendName={data.girlfriendName}
        senderName={data.senderName}
        isAuthorPreview={isAuthorPreviewPasscode}
        onSuccess={handlePasscodeSuccess}
        onClose={() => setShowPasscodeModal(false)}
      />

      {/* Design Customizer Modal */}
      <CustomizeDesignModal
        currentTheme={data.theme}
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        onSaveTheme={handleSaveTheme}
        onResetDefault={handleResetDefault}
      />

      {/* Share & Publish Modal */}
      <SharePublishModal
        data={data}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        onDownloadWebsite={() => exportStandaloneHtml(data)}
      />
    </div>
  );
}
