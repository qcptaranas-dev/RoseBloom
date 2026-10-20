import React, { useState } from 'react';
import { CoupleData, calculateDaysBetween, PasscodeConfig } from '../types';
import { Heart, Sparkles, Calendar, Edit3, ArrowRight, Eye, Clock, Lock, Music, ExternalLink } from 'lucide-react';

interface LandingHeroProps {
  data: CoupleData;
  isReceiverMode: boolean;
  onOpenLetter: () => void;
  onUpdateHeader: (updated: {
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
  }) => void;
  onViewReceiver: () => void;
  onOpenCustomizer: () => void;
  onOpenPasscodeTest?: () => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  data,
  isReceiverMode,
  onOpenLetter,
  onUpdateHeader,
  onViewReceiver,
  onOpenCustomizer,
  onOpenPasscodeTest,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'details' | 'days' | 'passcode'>('details');

  const [editValues, setEditValues] = useState({
    senderName: data.senderName,
    girlfriendName: data.girlfriendName,
    monthsaryGreeting: data.monthsaryGreeting,
    monthsaryDate: data.monthsaryDate,
    startMonth: data.startMonth || '2024-10',
    currentMonth: data.currentMonth || '2026-10',
    relationshipStartDate: data.relationshipStartDate || '2024-10-24',
    currentCelebrationDate: data.currentCelebrationDate || '2026-10-19',
    customDaysCount: data.customDaysCount,
    anniversarySubtitle: data.anniversarySubtitle,
    passcodeEnabled: data.passcode?.enabled ?? true,
    passcodeCode: data.passcode?.code || '1024',
    passcodeHint: data.passcode?.hint || 'Our special anniversary date (MMDD) 🌸',
  });

  const timeTogether = calculateDaysBetween(
    data.relationshipStartDate || data.startMonth,
    data.currentCelebrationDate || data.currentMonth,
    data.customDaysCount
  );

  const previewTimeTogether = calculateDaysBetween(
    editValues.relationshipStartDate || editValues.startMonth,
    editValues.currentCelebrationDate || editValues.currentMonth,
    editValues.customDaysCount
  );

  const handleSave = () => {
    onUpdateHeader({
      ...editValues,
      customDaysCount: editValues.customDaysCount ? Number(editValues.customDaysCount) : null,
      passcode: {
        enabled: editValues.passcodeEnabled,
        code: editValues.passcodeCode.trim() || '1024',
        hint: editValues.passcodeHint.trim(),
      },
    });
    setIsEditing(false);
  };

  const openEditModalWithTab = (tab: 'details' | 'days' | 'passcode') => {
    setEditValues({
      senderName: data.senderName,
      girlfriendName: data.girlfriendName,
      monthsaryGreeting: data.monthsaryGreeting,
      monthsaryDate: data.monthsaryDate,
      startMonth: data.startMonth || '2024-10',
      currentMonth: data.currentMonth || '2026-10',
      relationshipStartDate: data.relationshipStartDate || '2024-10-24',
      currentCelebrationDate: data.currentCelebrationDate || '2026-10-19',
      customDaysCount: data.customDaysCount,
      anniversarySubtitle: data.anniversarySubtitle,
      passcodeEnabled: data.passcode?.enabled ?? true,
      passcodeCode: data.passcode?.code || '1024',
      passcodeHint: data.passcode?.hint || 'Our special anniversary date (MMDD) 🌸',
    });
    setActiveTab(tab);
    setIsEditing(true);
  };

  // Check if Spotify or YouTube playlist is linked
  const externalPlaylistUrl = data.music?.externalPlaylistUrl;

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 py-16 overflow-hidden">
      {/* Gentle Botanical Ambient Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-rose-200/40 via-pink-100/30 to-amber-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Floating gentle petal decorations */}
      <div className="absolute top-12 left-10 text-rose-300/60 hidden md:block animate-floral-breathe">
        🌸
      </div>
      <div className="absolute bottom-20 right-14 text-rose-300/60 hidden md:block animate-floral-breathe [animation-delay:2s]">
        ✨
      </div>

      <div className="max-w-2xl mx-auto flex flex-col items-center">
        {/* Header Ribbon / Names */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 backdrop-blur-sm border border-rose-200/80 shadow-xs mb-4 text-xs text-rose-800 font-sans-custom">
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
          <span className="font-semibold tracking-wide">{data.senderName}</span>
          <span className="text-rose-400">&amp;</span>
          <span className="font-semibold tracking-wide">{data.girlfriendName}</span>
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500" />
        </div>

        {/* Days Being With You Counter (Automatically Calculated) */}
        <div className="inline-flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 px-4 py-2 rounded-full bg-white/85 backdrop-blur-sm border border-rose-200/90 shadow-xs text-xs sm:text-sm text-rose-900 mb-5 font-sans-custom transition-all hover:scale-102">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500 fill-rose-200" />
            <span className="font-bold text-rose-950 font-mono text-base sm:text-lg">
              {timeTogether.days}
            </span>
            <span className="font-medium text-rose-800">Days Being With You</span>
            <Sparkles className="w-4 h-4 text-rose-500 fill-rose-200" />
          </div>
          <span className="hidden sm:inline text-rose-300">·</span>
          <span className="text-[11px] text-rose-600/80 font-medium">
            {timeTogether.months} Months of Love
          </span>
        </div>

        {/* Optional External Spotify / YouTube Playlist Badge */}
        {externalPlaylistUrl && (
          <a
            href={externalPlaylistUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/75 hover:bg-white border border-rose-200/80 text-[11px] text-rose-900 mb-4 transition-all shadow-xs"
          >
            <Music className="w-3.5 h-3.5 text-rose-600" />
            <span>Listen to our Dedicated Playlist</span>
            <ExternalLink className="w-3 h-3 text-rose-400" />
          </a>
        )}

        {/* Main Monthsary Greeting */}
        <h1 className="font-cormorant text-4xl sm:text-6xl md:text-7xl font-semibold text-rose-950 tracking-tight leading-[1.1] mb-4 text-balance">
          {data.monthsaryGreeting}
        </h1>

        {/* Date Marker */}
        <div className="flex items-center gap-2 text-rose-700/80 text-sm sm:text-base font-cormorant italic mb-5">
          <Calendar className="w-4 h-4 text-rose-500" />
          <span>{data.monthsaryDate}</span>
        </div>

        {/* Subtitle Message */}
        <p className="font-sans-custom text-stone-600 text-sm sm:text-base max-w-lg mb-8 leading-relaxed">
          {data.anniversarySubtitle}
        </p>

        {/* 4 Photos Preview Teaser Row */}
        <div className="flex items-center justify-center -space-x-3 mb-10 hover:space-x-1 transition-all duration-300">
          {data.photos.map((photo, i) => (
            <div
              key={photo.id}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-white shadow-md overflow-hidden bg-rose-100 transition-transform duration-300 hover:scale-110 hover:z-10"
              title={`Memory ${i + 1}: ${photo.title}`}
            >
              <img
                src={photo.url}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        {/* Main CTA: OPEN YOUR LETTER */}
        <button
          onClick={onOpenLetter}
          className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-full bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-medium text-base shadow-xl shadow-rose-300/50 hover:shadow-2xl hover:shadow-rose-400/60 hover:scale-103 active:scale-98 transition-all duration-300 cursor-pointer overflow-hidden"
        >
          {/* Subtle light sweep reflection */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
          <Sparkles className="w-5 h-5 text-rose-200 transition-transform group-hover:rotate-12" />
          <span className="tracking-wide font-sans-custom">Open Your Letter</span>
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>

        <p className="text-[11px] text-stone-500 mt-3 font-sans-custom">
          {data.passcode?.enabled
            ? 'Passcode protected with love 💕 · Tap above to unlock & unveil rose bloom'
            : 'Tap above to unveil your rose ceremony & love letter'}
        </p>

        {/* Author Mode Quick Actions */}
        {!isReceiverMode && (
          <div className="mt-8 pt-6 border-t border-rose-200/50 flex flex-wrap items-center justify-center gap-2 text-xs">
            <button
              onClick={() => openEditModalWithTab('details')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-rose-800 border border-rose-200 shadow-xs cursor-pointer font-sans-custom"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Greeting</span>
            </button>
            <button
              onClick={() => openEditModalWithTab('days')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-rose-800 border border-rose-200 shadow-xs cursor-pointer font-sans-custom"
            >
              <Clock className="w-3.5 h-3.5 text-rose-500" />
              <span>Days Calculator</span>
            </button>
            <button
              onClick={() => openEditModalWithTab('passcode')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-rose-800 border border-rose-200 shadow-xs cursor-pointer font-sans-custom"
            >
              <Lock className="w-3.5 h-3.5 text-rose-500" />
              <span>Set Passcode ({data.passcode?.enabled ? 'On' : 'Off'})</span>
            </button>
            <button
              onClick={onOpenCustomizer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/80 hover:bg-white text-rose-800 border border-rose-200 shadow-xs cursor-pointer font-sans-custom"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Customize</span>
            </button>
            <button
              onClick={onViewReceiver}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 shadow-xs cursor-pointer font-medium font-sans-custom"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View as Receiver</span>
            </button>
          </div>
        )}
      </div>

      {/* Greeting, Days & Passcode Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-rose-100 text-left my-8">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <h3 className="font-cormorant text-2xl font-bold text-rose-950">
                Personalize Surprise &amp; Lock
              </h3>
              <div className="flex rounded-xl bg-rose-50/80 p-0.5 text-xs font-medium border border-rose-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'details' ? 'bg-white text-rose-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  Greeting
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('days')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'days' ? 'bg-white text-rose-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  Days
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('passcode')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    activeTab === 'passcode' ? 'bg-white text-rose-900 shadow-xs font-semibold' : 'text-stone-600'
                  }`}
                >
                  Passcode
                </button>
              </div>
            </div>

            <div className="space-y-4 text-xs font-sans-custom">
              {/* TAB 1: GREETING & NAMES */}
              {activeTab === 'details' && (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Your Name / Nickname
                      </label>
                      <input
                        type="text"
                        value={editValues.senderName}
                        onChange={(e) => setEditValues({ ...editValues, senderName: e.target.value })}
                        className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-stone-700 mb-1">
                        Her Name / Nickname
                      </label>
                      <input
                        type="text"
                        value={editValues.girlfriendName}
                        onChange={(e) => setEditValues({ ...editValues, girlfriendName: e.target.value })}
                        className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Monthsary Greeting Headline
                    </label>
                    <input
                      type="text"
                      value={editValues.monthsaryGreeting}
                      onChange={(e) => setEditValues({ ...editValues, monthsaryGreeting: e.target.value })}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Monthsary Date Display Label
                    </label>
                    <input
                      type="text"
                      value={editValues.monthsaryDate}
                      onChange={(e) => setEditValues({ ...editValues, monthsaryDate: e.target.value })}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Subtitle / Romantic Note
                    </label>
                    <textarea
                      rows={2}
                      value={editValues.anniversarySubtitle}
                      onChange={(e) => setEditValues({ ...editValues, anniversarySubtitle: e.target.value })}
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DAYS CALCULATOR */}
              {activeTab === 'days' && (
                <div className="space-y-3.5">
                  <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/70 space-y-3">
                    <div className="flex items-center gap-1.5 text-rose-900 font-semibold text-xs">
                      <Clock className="w-3.5 h-3.5 text-rose-500" />
                      <span>Automatic Days Calculation</span>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">
                          First Month / Start Date
                        </label>
                        <input
                          type="date"
                          value={editValues.relationshipStartDate}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              relationshipStartDate: e.target.value,
                              startMonth: e.target.value.substring(0, 7),
                            })
                          }
                          className="w-full px-2.5 py-1.5 border border-rose-200 rounded-xl text-xs bg-white text-stone-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-stone-600 mb-1">
                          This Month / Current Date
                        </label>
                        <input
                          type="date"
                          value={editValues.currentCelebrationDate}
                          onChange={(e) =>
                            setEditValues({
                              ...editValues,
                              currentCelebrationDate: e.target.value,
                              currentMonth: e.target.value.substring(0, 7),
                            })
                          }
                          className="w-full px-2.5 py-1.5 border border-rose-200 rounded-xl text-xs bg-white text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-rose-200 flex items-center justify-between text-xs">
                      <span className="text-stone-600">Calculated Output:</span>
                      <div className="flex items-center gap-1 font-mono font-bold text-rose-600">
                        <span>{previewTimeTogether.days} Days</span>
                        <span className="text-stone-400 font-normal">({previewTimeTogether.months} Months)</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-stone-700 mb-1">
                      Manual Days Override (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Leave blank to use automatic calculation above"
                      value={editValues.customDaysCount || ''}
                      onChange={(e) =>
                        setEditValues({
                          ...editValues,
                          customDaysCount: e.target.value ? Number(e.target.value) : null,
                        })
                      }
                      className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: RECEIVER PASSCODE SETTINGS */}
              {activeTab === 'passcode' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4 text-rose-600" />
                        <div>
                          <span className="font-semibold text-rose-950 block">
                            Protect Letter with Passcode
                          </span>
                          <span className="text-[10px] text-stone-500">
                            She will need to enter this code to unlock the love letter
                          </span>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={editValues.passcodeEnabled}
                          onChange={(e) =>
                            setEditValues({ ...editValues, passcodeEnabled: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-rose-500" />
                      </label>
                    </div>

                    {editValues.passcodeEnabled && (
                      <div className="pt-2 border-t border-rose-200/70 space-y-3">
                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Secret Passcode (Numbers or Letters)
                          </label>
                          <input
                            type="text"
                            value={editValues.passcodeCode}
                            onChange={(e) =>
                              setEditValues({ ...editValues, passcodeCode: e.target.value })
                            }
                            placeholder="e.g. 1024 or anniversary date"
                            className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs font-mono font-bold text-rose-900 bg-white"
                          />
                          <p className="text-[10px] text-stone-500 mt-1">
                            Recommended: 4 digits (e.g. your anniversary date MMDD: 1024)
                          </p>
                        </div>

                        <div>
                          <label className="block font-semibold text-stone-700 mb-1">
                            Romantic Hint for {editValues.girlfriendName || 'Her'}
                          </label>
                          <input
                            type="text"
                            value={editValues.passcodeHint}
                            onChange={(e) =>
                              setEditValues({ ...editValues, passcodeHint: e.target.value })
                            }
                            placeholder="e.g. Our special anniversary date (MMDD) 🌸"
                            className="w-full px-3 py-2 border border-rose-200 rounded-xl text-xs bg-white"
                          />
                        </div>

                        {onOpenPasscodeTest && (
                          <div className="pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditing(false);
                                onOpenPasscodeTest();
                              }}
                              className="text-[11px] text-rose-600 hover:text-rose-800 font-medium underline cursor-pointer"
                            >
                              Test what the lock looks like for her →
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 pt-3 border-t border-rose-100 flex justify-end gap-2 text-xs">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium cursor-pointer shadow-xs shadow-rose-200"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
