import React, { useState, useEffect, useRef } from 'react';
import { LetterContent } from '../types';
import { Edit3, RotateCcw, Heart, Check, BookOpen, Flower2 } from 'lucide-react';
import { BotanicalCorner } from './BotanicalFiligree';
import { WaxSeal } from './WaxSeal';

interface LoveLetterProps {
  letter: LetterContent;
  senderName?: string;
  girlfriendName?: string;
  isReceiverMode: boolean;
  onUpdateLetter: (updated: Partial<LetterContent>) => void;
  onReplayBloom: () => void;
}

export const LoveLetter: React.FC<LoveLetterProps> = ({
  letter,
  senderName = 'Liam',
  girlfriendName = 'Maya',
  isReceiverMode,
  onUpdateLetter,
  onReplayBloom,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [tempLetter, setTempLetter] = useState<LetterContent>(letter);
  const [isSealBroken, setIsSealBroken] = useState<boolean>(true);

  // Handwritten Unfolding & Gradual Text Reveal States
  const [isUnfolding, setIsUnfolding] = useState<boolean>(true);
  const [revealStep, setRevealStep] = useState<number>(0);
  const revealTimeoutsRef = useRef<number[]>([]);

  // Split body text into paragraphs for graceful progressive reveal
  const paragraphs = (letter.body || '').split(/\n\n+/).filter((p) => p.trim().length > 0);

  const startGradualReveal = () => {
    // Clear any previous scheduled reveal timers
    revealTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    revealTimeoutsRef.current = [];

    setIsUnfolding(true);
    setRevealStep(0);
    setIsSealBroken(false);

    // Timeline for gentle stationary unfolding & progressive ink reveal:
    // 0ms: Wax seal unseals
    // 500ms: Letter unfolds open with smooth 3D perspective
    // 900ms: Title & Greeting appear in handwritten font
    // 1400ms+: Paragraphs fade in sequentially
    // Last step: Closing & Signature flow in
    const t0 = window.setTimeout(() => {
      setIsSealBroken(true);
      setRevealStep(1); // Title & greeting
    }, 450);

    const t1 = window.setTimeout(() => {
      setIsUnfolding(false);
      setRevealStep(2); // First paragraph
    }, 950);

    const t2 = window.setTimeout(() => {
      setRevealStep(3); // Remaining paragraphs
    }, 1500);

    const t3 = window.setTimeout(() => {
      setRevealStep(4); // Closing & handwritten signature
    }, 2200);

    revealTimeoutsRef.current = [t0, t1, t2, t3];
  };

  useEffect(() => {
    startGradualReveal();
    return () => {
      revealTimeoutsRef.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const handleReadAgain = () => {
    setIsEditing(false);
    startGradualReveal();
    // Scroll smoothly to letter top
    const letterEl = document.getElementById('letter');
    if (letterEl) {
      letterEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSave = () => {
    onUpdateLetter(tempLetter);
    setIsEditing(false);
  };

  return (
    <section className="w-full max-w-3xl mx-auto px-4 py-8">
      {/* Decorative Floral Header Ornament */}
      <div className="flex items-center justify-center gap-3 mb-6 text-rose-300">
        <span className="h-[1px] w-16 bg-gradient-to-r from-transparent to-rose-300" />
        <Heart className="w-4 h-4 fill-rose-200 text-rose-400" />
        <span className="text-xs uppercase tracking-widest font-sans-custom text-rose-800/80 font-medium">
          A Letter For You
        </span>
        <Heart className="w-4 h-4 fill-rose-200 text-rose-400" />
        <span className="h-[1px] w-16 bg-gradient-to-l from-transparent to-rose-300" />
      </div>

      {/* Parchment Love Letter Card with Authentic Stationery Unfolding */}
      <div
        className={`relative bg-[#FFFDF9] rounded-3xl p-6 sm:p-12 shadow-2xl border border-rose-200/80 overflow-hidden transition-all duration-700 ${
          isUnfolding
            ? 'scale-y-95 -rotate-1 shadow-md opacity-90'
            : 'scale-y-100 rotate-0 shadow-2xl opacity-100'
        }`}
        style={{
          transformOrigin: 'top center',
        }}
      >
        {/* Subtle Horizontal Crease Shadows simulating folded keepsake stationery */}
        <div
          className={`absolute inset-x-0 top-1/3 h-[2px] bg-gradient-to-r from-transparent via-rose-950/5 to-transparent pointer-events-none transition-opacity duration-1000 ${
            isUnfolding ? 'opacity-80' : 'opacity-20'
          }`}
        />
        <div
          className={`absolute inset-x-0 top-2/3 h-[2px] bg-gradient-to-r from-transparent via-rose-950/5 to-transparent pointer-events-none transition-opacity duration-1000 ${
            isUnfolding ? 'opacity-80' : 'opacity-20'
          }`}
        />

        {/* Real Botanical Corner Flourishes */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <BotanicalCorner position="top-left" />
        </div>
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <BotanicalCorner position="top-right" />
        </div>
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <BotanicalCorner position="bottom-left" />
        </div>
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <BotanicalCorner position="bottom-right" />
        </div>

        {/* Ambient subtle paper watermark */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-radial from-rose-100/40 to-transparent pointer-events-none rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-36 h-36 bg-radial from-rose-100/40 to-transparent pointer-events-none rounded-tr-full" />

        {/* Double hairline gold/rose inner border */}
        <div className="relative border border-rose-200/60 rounded-2xl p-6 sm:p-10 bg-white/40 backdrop-blur-[2px]">
          {/* Interactive Embossed Wax Seal Badge */}
          <div className="flex justify-center -mt-2 mb-4">
            <WaxSeal
              senderName={senderName}
              girlfriendName={girlfriendName}
              isBroken={isSealBroken}
              onToggleBreak={() => setIsSealBroken(!isSealBroken)}
            />
          </div>

          {!isEditing ? (
            <div
              className={`space-y-6 transition-all duration-700 ${
                isSealBroken ? 'opacity-100' : 'opacity-40 filter blur-[1px]'
              }`}
            >
              {/* Letter Title */}
              <div
                className={`text-center pb-4 border-b border-rose-100 transition-all duration-700 ${
                  revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <h2 className="font-cormorant text-2xl sm:text-4xl font-semibold text-rose-950 tracking-tight">
                  {letter.title}
                </h2>
              </div>

              {/* Greeting in Readable Romantic Handwriting font */}
              <div
                className={`transition-all duration-700 ${
                  revealStep >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                }`}
              >
                <span className="font-handwriting text-2xl sm:text-3xl text-rose-900 font-semibold tracking-wide block">
                  {letter.greeting}
                </span>
              </div>

              {/* Letter Body in clean, elegant, comfortable font */}
              <div className="font-cormorant text-stone-700 text-base sm:text-lg sm:leading-relaxed space-y-4">
                {paragraphs.map((p, idx) => {
                  const isVisible = idx === 0 ? revealStep >= 2 : revealStep >= 3;
                  return (
                    <p
                      key={idx}
                      className={`transition-all duration-700 leading-relaxed ${
                        isVisible
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 translate-y-4 pointer-events-none'
                      }`}
                      style={{
                        transitionDelay: `${idx * 150}ms`,
                      }}
                    >
                      {p}
                    </p>
                  );
                })}
              </div>

              {/* Closing & Handwritten Style Signature */}
              <div
                className={`pt-6 border-t border-rose-100 flex flex-col items-end transition-all duration-700 ${
                  revealStep >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
              >
                <p className="font-cormorant text-base sm:text-lg text-stone-600 italic">
                  {letter.closing}
                </p>
                <div className="font-handwriting text-3xl sm:text-4xl text-rose-700 mt-1 mr-2 font-bold tracking-wide">
                  {letter.signature}
                </div>
              </div>
            </div>
          ) : (
            /* Inline Editor */
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-rose-950 mb-1">
                  Letter Title
                </label>
                <input
                  type="text"
                  value={tempLetter.title}
                  onChange={(e) => setTempLetter({ ...tempLetter, title: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-950 mb-1">
                  Greeting / Salutation (Handwritten Style)
                </label>
                <input
                  type="text"
                  value={tempLetter.greeting}
                  onChange={(e) => setTempLetter({ ...tempLetter, greeting: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white font-handwriting text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-rose-950 mb-1">
                  Letter Body (Use double enters for paragraphs)
                </label>
                <textarea
                  rows={8}
                  value={tempLetter.body}
                  onChange={(e) => setTempLetter({ ...tempLetter, body: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 font-cormorant text-base leading-relaxed bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-rose-950 mb-1">
                    Closing
                  </label>
                  <input
                    type="text"
                    value={tempLetter.closing}
                    onChange={(e) => setTempLetter({ ...tempLetter, closing: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-rose-950 mb-1">
                    Signature (Handwritten Style)
                  </label>
                  <input
                    type="text"
                    value={tempLetter.signature}
                    onChange={(e) => setTempLetter({ ...tempLetter, signature: e.target.value })}
                    className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300 bg-white font-handwriting text-base"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Letter</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action Bar Below Letter */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            {/* Read my letter again button (unfolds & reveals without full bloom replay) */}
            <button
              onClick={handleReadAgain}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200/80 transition-all cursor-pointer font-medium shadow-xs"
              title="Gently unfold and reveal the letter again"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-600" />
              <span>Read my letter again</span>
            </button>

            {/* Replay Rose Animation Button */}
            <button
              onClick={onReplayBloom}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-800 border border-rose-200 transition-colors cursor-pointer font-medium"
              title="Replay the Rose Bloom and Petal Rush sequence"
            >
              <Flower2 className="w-3.5 h-3.5 text-rose-500" />
              <span>Replay Rose Bloom 🌹</span>
            </button>
          </div>

          {!isReceiverMode && !isEditing && (
            <button
              onClick={() => {
                setTempLetter(letter);
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition-colors cursor-pointer font-medium"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Letter Content</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
