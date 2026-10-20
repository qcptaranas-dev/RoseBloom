import React from 'react';
import {
  Eye,
  Edit3,
  Share2,
  Sparkles,
  Download,
  Layers,
  User,
  LogOut,
  Lock,
  KeyRound,
  Heart,
  ShieldCheck,
} from 'lucide-react';
import { AppRoute, UserProfile } from '../types';

interface TopNavProps {
  currentRoute: AppRoute;
  currentUser: UserProfile | null;
  isReceiverMode: boolean;
  girlfriendName?: string;
  senderName?: string;
  passcodeEnabled?: boolean;
  onNavigate: (route: AppRoute) => void;
  onToggleReceiverMode: () => void;
  onOpenCustomizer: () => void;
  onOpenShareModal: () => void;
  onOpenPasscodeModal?: () => void;
  onOpenReceiverCodeModal?: () => void;
  onDownloadWebsite: () => void;
  onSignOut: () => void;
  onReplayBloom?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentRoute,
  currentUser,
  isReceiverMode,
  girlfriendName = 'My Love',
  senderName = 'Me',
  passcodeEnabled = false,
  onNavigate,
  onToggleReceiverMode,
  onOpenCustomizer,
  onOpenShareModal,
  onOpenPasscodeModal,
  onOpenReceiverCodeModal,
  onDownloadWebsite,
  onSignOut,
  onReplayBloom,
}) => {
  if (isReceiverMode) {
    // Dedicated, intimate romantic receiver mode header
    return (
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-rose-100/80 transition-all font-sans-custom py-2 px-4 shadow-2xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🌹</span>
            <div>
              <span className="font-cormorant text-base sm:text-lg font-bold text-rose-950">
                A Private Love Letter for {girlfriendName}
              </span>
              <span className="hidden sm:inline text-xs text-rose-600 italic ml-2">
                from {senderName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onReplayBloom && (
              <button
                onClick={onReplayBloom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-xs text-rose-800 hover:text-rose-950 border border-rose-200/80 shadow-2xs transition-all cursor-pointer font-medium"
                title="Replay the romantic rose bloom ceremony"
              >
                <span>🌹 Replay Rose</span>
              </button>
            )}
            <button
              onClick={onToggleReceiverMode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white hover:bg-stone-50 text-xs text-stone-600 hover:text-stone-900 border border-stone-200 shadow-2xs transition-all cursor-pointer"
              title="Return to editing interface"
            >
              <Edit3 className="w-3 h-3 text-rose-500" />
              <span>Back to Editor</span>
            </button>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-rose-100 transition-all font-sans-custom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="font-cormorant text-xl font-bold tracking-tight text-rose-950 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer text-left"
        >
          <span>Rosebloom</span>
          <span className="text-xs font-sans-custom font-normal text-rose-500 italic">Monthsary</span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
          <button
            onClick={() => onNavigate('home')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
              currentRoute === 'home' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
            }`}
          >
            Editor
          </button>
          <button
            onClick={() => onNavigate('my-work')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              currentRoute === 'my-work' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-rose-500" />
            <span>My Work</span>
          </button>
          <button
            onClick={() => onNavigate('account')}
            className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
              currentRoute === 'account' ? 'text-rose-600 font-semibold' : 'hover:text-rose-600'
            }`}
          >
            <User className="w-3.5 h-3.5 text-rose-500" />
            <span>Account</span>
          </button>

          {onOpenReceiverCodeModal && (
            <button
              onClick={onOpenReceiverCodeModal}
              className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
              title="Unlock a letter with a recipient access code"
            >
              <KeyRound className="w-3.5 h-3.5 text-rose-500" />
              <span>Enter Code</span>
            </button>
          )}

          {currentRoute === 'home' && (
            <>
              <button
                onClick={onOpenCustomizer}
                className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Customize</span>
              </button>
              {onOpenPasscodeModal && (
                <button
                  onClick={onOpenPasscodeModal}
                  className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Configure or test receiver passcode"
                >
                  <Lock className="w-3 h-3 text-rose-500" />
                  <span>Passcode {passcodeEnabled ? '✓' : ''}</span>
                </button>
              )}
              {onReplayBloom && (
                <button
                  onClick={onReplayBloom}
                  className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
                  title="Replay the romantic rose bloom ceremony"
                >
                  <span className="text-xs">🌹</span>
                  <span>Replay Rose</span>
                </button>
              )}
              <button
                onClick={onDownloadWebsite}
                className="hover:text-rose-600 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3 h-3 text-rose-500" />
                <span>Download</span>
              </button>
            </>
          )}
        </nav>

        {/* Zone 3: Primary Actions (View as Receiver & Share) */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser && (
            <div className="hidden sm:flex items-center gap-2 pr-2 border-r border-rose-100">
              <button
                onClick={() => onNavigate('account')}
                className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-rose-700 font-medium cursor-pointer"
                title="Account Settings"
              >
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name.charAt(0).toUpperCase()}
                </span>
                <span className="max-w-[80px] truncate">{currentUser.name}</span>
              </button>
              <button
                onClick={onSignOut}
                className="p-1 text-stone-400 hover:text-stone-700 cursor-pointer"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={onToggleReceiverMode}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Preview the website without any editing tools"
          >
            <Eye className="w-3.5 h-3.5 text-rose-600" />
            <span>View as Receiver</span>
          </button>

          <button
            onClick={onOpenShareModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs shadow-rose-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Publish &amp; Share</span>
          </button>
        </div>
      </div>
    </header>
  );
};
