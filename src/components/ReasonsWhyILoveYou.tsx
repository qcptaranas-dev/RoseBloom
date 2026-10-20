import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, Edit3, Plus, Trash2, Check, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { BotanicalCorner } from './BotanicalFiligree';

export interface RomanticReason {
  id: number;
  title: string;
  detail: string;
}

const DEFAULT_REASONS: RomanticReason[] = [
  {
    id: 1,
    title: 'Your Radiant Morning Smile',
    detail: 'How you look at me over our morning coffee, smiling before a single word is said, making every day instantly brighter.',
  },
  {
    id: 2,
    title: 'The Way You Hold My Hand',
    detail: 'Subtle, gentle, and reassuring—reminding me without words that you are right here beside me through everything.',
  },
  {
    id: 3,
    title: 'Your Kind & Compassionate Heart',
    detail: 'The patient empathy you show to everyone around you. You inspire me to be a gentler, better person every single day.',
  },
  {
    id: 4,
    title: 'How We Laugh Until We Cry',
    detail: 'Our silly inside jokes, quiet midnight giggles, and spontaneous moments that no one else in the world understands but us.',
  },
  {
    id: 5,
    title: 'My Favorite Person in Every Room',
    detail: 'No matter where we go or how crowded a place gets, my eyes and my heart will always look for you first.',
  },
];

interface ReasonsWhyILoveYouProps {
  isReceiverMode: boolean;
  girlfriendName: string;
}

export const ReasonsWhyILoveYou: React.FC<ReasonsWhyILoveYouProps> = ({
  isReceiverMode,
  girlfriendName,
}) => {
  const [reasons, setReasons] = useState<RomanticReason[]>(() => {
    try {
      const saved = localStorage.getItem('rosebloom_reasons');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return DEFAULT_REASONS;
  });

  const [activeReasonId, setActiveReasonId] = useState<number>(() => reasons[0]?.id || 1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editList, setEditList] = useState<RomanticReason[]>(reasons);
  const [lovedReasons, setLovedReasons] = useState<Record<number, boolean>>({});

  const currentIndex = Math.max(0, reasons.findIndex((r) => r.id === activeReasonId));
  const activeReason = reasons[currentIndex] || reasons[0];

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + reasons.length) % reasons.length;
    setActiveReasonId(reasons[prevIdx].id);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % reasons.length;
    setActiveReasonId(reasons[nextIdx].id);
  };

  const toggleLoveReason = (id: number) => {
    setLovedReasons((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const saveReasons = (newReasons: RomanticReason[]) => {
    setReasons(newReasons);
    try {
      localStorage.setItem('rosebloom_reasons', JSON.stringify(newReasons));
    } catch {
      // Ignore
    }
  };

  const handleSaveModal = () => {
    saveReasons(editList);
    if (!editList.some((r) => r.id === activeReasonId) && editList.length > 0) {
      setActiveReasonId(editList[0].id);
    }
    setIsEditing(false);
  };

  const handleUpdateItem = (id: number, field: 'title' | 'detail', val: string) => {
    setEditList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleAddItem = () => {
    const nextId = Math.max(0, ...editList.map((r) => r.id)) + 1;
    setEditList([
      ...editList,
      {
        id: nextId,
        title: 'Another reason I adore you',
        detail: 'Write your sweet memory or heartfelt thought here...',
      },
    ]);
  };

  const handleDeleteItem = (id: number) => {
    if (editList.length <= 1) return;
    setEditList(editList.filter((r) => r.id !== id));
  };

  return (
    <section className="w-full max-w-4xl mx-auto px-4 py-12">
      {/* Section Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 text-rose-500 mb-2">
          <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-rose-300" />
          <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-400" />
          <span className="text-xs font-semibold tracking-widest uppercase font-sans-custom">
            Keepsake Whispers
          </span>
          <Heart className="w-3.5 h-3.5 fill-rose-300 text-rose-400" />
          <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-rose-300" />
        </div>
        <h3 className="font-cormorant text-3xl sm:text-4xl text-rose-950 font-semibold tracking-tight">
          Little Reasons Why I Love You, {girlfriendName}
        </h3>
        <p className="text-xs sm:text-sm text-stone-600 mt-2 max-w-md mx-auto font-sans-custom leading-relaxed">
          Tap through each cherished petal to uncover one of the countless reasons my heart chose you.
        </p>

        {!isReceiverMode && (
          <button
            onClick={() => {
              setEditList(reasons);
              setIsEditing(true);
            }}
            className="inline-flex items-center gap-1.5 mt-3.5 px-3.5 py-1.5 text-xs text-rose-700 hover:text-rose-900 bg-white/80 hover:bg-white rounded-full border border-rose-200 shadow-xs transition-all cursor-pointer font-sans-custom font-medium"
          >
            <Edit3 className="w-3 h-3" />
            <span>Customize Reasons</span>
          </button>
        )}
      </div>

      {/* Interactive Petals Selector Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        {reasons.map((item, idx) => {
          const isActive = activeReasonId === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveReasonId(item.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium font-sans-custom transition-all duration-300 cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-200/60 scale-105'
                  : 'bg-white/85 hover:bg-rose-50/80 text-stone-700 border border-rose-100 hover:border-rose-200'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-semibold ${
                  isActive ? 'bg-white/25 text-white' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {idx + 1}
              </span>
              <span className="line-clamp-1 max-w-[120px] sm:max-w-none">{item.title}</span>
            </button>
          );
        })}
      </div>

      {/* Featured Reason Card with Smooth Fluid Transitions */}
      {activeReason && (
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeReason.id}
              initial={{ opacity: 0, y: 12, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
              className="bg-[#FFFDF9] rounded-3xl p-6 sm:p-12 border border-rose-200/80 shadow-xl relative overflow-hidden backdrop-blur-xs"
            >
              {/* Botanical Corner Flourishes */}
              <div className="absolute top-2 left-2 pointer-events-none opacity-60">
                <BotanicalCorner position="top-left" />
              </div>
              <div className="absolute top-2 right-2 pointer-events-none opacity-60">
                <BotanicalCorner position="top-right" />
              </div>
              <div className="absolute bottom-2 left-2 pointer-events-none opacity-40">
                <BotanicalCorner position="bottom-left" />
              </div>
              <div className="absolute bottom-2 right-2 pointer-events-none opacity-40">
                <BotanicalCorner position="bottom-right" />
              </div>

              {/* Watermark radial glow */}
              <div className="absolute -top-10 -right-10 w-44 h-44 bg-radial from-rose-100/60 to-transparent rounded-full pointer-events-none" />

              {/* Top metadata row */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs uppercase tracking-wider text-rose-600 font-semibold bg-rose-50 px-3 py-1 rounded-full border border-rose-200/60 shadow-2xs">
                    Petal {currentIndex + 1} of {reasons.length}
                  </span>
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                </div>

                {/* Heart / Keepsake reaction button */}
                <button
                  type="button"
                  onClick={() => toggleLoveReason(activeReason.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans-custom transition-all cursor-pointer border ${
                    lovedReasons[activeReason.id]
                      ? 'bg-rose-500 text-white border-rose-500 shadow-xs scale-105'
                      : 'bg-white hover:bg-rose-50 text-rose-700 border-rose-200'
                  }`}
                  title="Mark this reason as extra special"
                  aria-label="Favorite this reason"
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      lovedReasons[activeReason.id] ? 'fill-white text-white' : 'text-rose-500'
                    }`}
                  />
                  <span>{lovedReasons[activeReason.id] ? 'Cherished' : 'Touch to Cherish'}</span>
                </button>
              </div>

              {/* Title */}
              <h4 className="font-cormorant text-2xl sm:text-3xl md:text-4xl font-semibold text-rose-950 mb-4 leading-snug">
                {activeReason.title}
              </h4>

              {/* Detail Quote */}
              <div className="relative pl-6 sm:pl-8 border-l-2 border-rose-300/80 my-4">
                <Quote className="absolute -top-1 left-1 w-4 h-4 text-rose-300 pointer-events-none rotate-180" />
                <p className="font-sans-custom text-stone-700 text-base sm:text-lg leading-relaxed sm:leading-loose">
                  {activeReason.detail}
                </p>
              </div>

              {/* Card Footer Navigation Controls */}
              <div className="mt-8 pt-4 border-t border-rose-100/80 flex items-center justify-between text-xs font-sans-custom">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="inline-flex items-center gap-1.5 text-stone-500 hover:text-rose-700 transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-50"
                  aria-label="Previous reason"
                >
                  <ChevronLeft className="w-4 h-4 text-rose-400" />
                  <span className="hidden sm:inline">Previous Reason</span>
                </button>

                <div className="flex items-center gap-1.5">
                  {reasons.map((r, i) => (
                    <button
                      key={r.id}
                      onClick={() => setActiveReasonId(r.id)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        i === currentIndex
                          ? 'w-6 h-1.5 bg-rose-500 shadow-2xs'
                          : 'w-1.5 h-1.5 bg-rose-200 hover:bg-rose-300'
                      }`}
                      aria-label={`Go to reason ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="inline-flex items-center gap-1.5 text-rose-600 hover:text-rose-800 font-medium transition-colors cursor-pointer py-1 px-2.5 rounded-lg hover:bg-rose-50"
                  aria-label="Next reason"
                >
                  <span>Next Reason</span>
                  <ChevronRight className="w-4 h-4 text-rose-500" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Editor Modal for Customizing Reasons */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-100 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-4">
              <h3 className="font-cormorant text-2xl font-bold text-rose-950">
                Edit Reasons Why I Love You
              </h3>
              <button
                onClick={handleAddItem}
                className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Reason</span>
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {editList.map((item, index) => (
                <div key={item.id} className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/30 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-rose-600 font-semibold">
                      Reason #{index + 1}
                    </span>
                    {editList.length > 1 && (
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 cursor-pointer"
                        title="Delete reason"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(item.id, 'title', e.target.value)}
                    placeholder="Short title"
                    className="w-full px-3 py-1.5 border border-rose-200 rounded-lg text-xs font-semibold text-stone-800 bg-white"
                  />

                  <textarea
                    rows={2}
                    value={item.detail}
                    onChange={(e) => handleUpdateItem(item.id, 'detail', e.target.value)}
                    placeholder="Sweet detail"
                    className="w-full px-3 py-1.5 border border-rose-200 rounded-lg text-xs text-stone-700 bg-white"
                  />
                </div>
              ))}
            </div>

            <div className="mt-6 pt-3 border-t border-rose-100 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="flex items-center gap-1 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Reasons</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
