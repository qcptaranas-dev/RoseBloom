import React, { useState } from 'react';
import { Sparkles, Heart } from 'lucide-react';

interface WaxSealProps {
  senderName: string;
  girlfriendName: string;
  isBroken: boolean;
  onToggleBreak: () => void;
}

export const WaxSeal: React.FC<WaxSealProps> = ({
  senderName,
  girlfriendName,
  isBroken,
  onToggleBreak,
}) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);

  const initial1 = senderName.charAt(0).toUpperCase() || 'L';
  const initial2 = girlfriendName.charAt(0).toUpperCase() || 'M';

  return (
    <div className="relative inline-flex flex-col items-center select-none my-4">
      {/* Interactive Wax Stamp Badge */}
      <button
        type="button"
        onClick={onToggleBreak}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative cursor-pointer outline-none focus:ring-4 focus:ring-rose-300/40 rounded-full transition-transform active:scale-95 hover:scale-105"
        title={isBroken ? 'Click to re-seal letter' : 'Click to break the wax seal & unfold letter'}
        aria-label="Toggle wax seal"
      >
        {/* Glow halo */}
        <div className="absolute inset-0 rounded-full bg-radial from-rose-500/25 to-transparent blur-md group-hover:from-rose-500/45 transition-all" />

        {/* 3D Wax Seal Body */}
        <div
          className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full flex items-center justify-center transition-all duration-700 shadow-xl border-2 ${
            isBroken
              ? 'border-rose-400/50 bg-gradient-to-br from-[#96263F] via-[#7B1B32] to-[#551022] scale-95 opacity-85 rotate-6'
              : 'border-[#F4A9B8]/70 bg-gradient-to-br from-[#BE185D] via-[#9F1239] to-[#881337] shadow-rose-950/40'
          }`}
          style={{
            boxShadow: isBroken
              ? 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.25)'
              : 'inset 0 3px 6px rgba(255,255,255,0.35), inset 0 -3px 6px rgba(0,0,0,0.4), 0 8px 20px rgba(136, 19, 55, 0.35)',
          }}
        >
          {/* Dripped uneven wax edge rings */}
          <div className="absolute -inset-1 rounded-full border border-rose-400/20 pointer-events-none opacity-70" />
          <div className="absolute inset-1 rounded-full border border-rose-300/30 pointer-events-none" />

          {/* Inner embossed medallion */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-rose-300/40 flex flex-col items-center justify-center shadow-inner bg-gradient-to-tr from-[#881337] to-[#B91C1C]/90 text-rose-100">
            {/* Embossed Initials */}
            <div className="flex items-center gap-0.5 font-cormorant font-bold text-lg sm:text-xl tracking-wider text-rose-100 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <span>{initial1}</span>
              <Heart className="w-2.5 h-2.5 fill-rose-300 text-rose-200 mx-0.5" />
              <span>{initial2}</span>
            </div>

            {/* Tiny botanical leaf wreath */}
            <div className="text-[9px] uppercase tracking-widest font-sans-custom text-rose-200/80 mt-0.5 scale-90">
              {isBroken ? 'Unsealed' : 'Sealed'}
            </div>
          </div>
        </div>

        {/* Floating Sparkles when hovered */}
        {isHovered && !isBroken && (
          <div className="absolute -top-1 -right-1 text-amber-300 animate-pulse pointer-events-none">
            <Sparkles className="w-4 h-4" />
          </div>
        )}
      </button>

      {/* Caption hint */}
      <span className="text-[11px] font-sans-custom text-stone-500 mt-2 italic transition-colors group-hover:text-rose-700">
        {isBroken ? 'Wax seal broken · Tap to re-seal' : 'Hand-sealed with love · Tap to break seal'}
      </span>
    </div>
  );
};
