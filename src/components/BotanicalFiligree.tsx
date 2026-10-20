import React from 'react';

interface BotanicalCornerProps {
  className?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export const BotanicalCorner: React.FC<BotanicalCornerProps> = ({
  className = '',
  position = 'top-left',
}) => {
  const getRotation = () => {
    switch (position) {
      case 'top-right':
        return 'rotate-90 origin-top-right';
      case 'bottom-right':
        return 'rotate-180 origin-center';
      case 'bottom-left':
        return '-rotate-90 origin-bottom-left';
      default:
        return '';
    }
  };

  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-16 h-16 sm:w-20 sm:h-20 pointer-events-none select-none text-rose-300/70 transition-transform ${getRotation()} ${className}`}
      fill="none"
      stroke="currentColor"
    >
      {/* Delicate floral curves */}
      <path
        d="M 5,95 Q 15,35 60,15 Q 85,8 95,5"
        strokeWidth="1.2"
        strokeLinecap="round"
        className="opacity-70"
      />
      <path
        d="M 5,95 Q 35,65 75,45 Q 90,38 95,35"
        strokeWidth="0.8"
        strokeDasharray="2,3"
        className="opacity-50"
      />

      {/* Rosebud motif in the corner */}
      <circle cx="22" cy="42" r="4.5" fill="currentColor" className="text-rose-400/40" />
      <circle cx="20" cy="40" r="3" fill="currentColor" className="text-rose-500/60" />
      <circle cx="18" cy="38" r="1.5" fill="#FFF" className="opacity-80" />

      {/* Delicate leaves */}
      <path
        d="M 40,25 C 45,15 55,18 52,28 C 48,32 42,30 40,25 Z"
        fill="currentColor"
        className="text-emerald-700/25"
      />
      <path
        d="M 28,60 C 20,62 18,72 26,72 C 32,70 30,62 28,60 Z"
        fill="currentColor"
        className="text-emerald-700/25"
      />
      <path
        d="M 68,14 C 74,8 82,12 80,18 C 76,22 70,18 68,14 Z"
        fill="currentColor"
        className="text-emerald-700/25"
      />

      {/* Tiny starlight motes */}
      <circle cx="78" cy="38" r="1.2" fill="#E11D48" className="opacity-60" />
      <circle cx="92" cy="22" r="1.5" fill="#E11D48" className="opacity-70" />
      <circle cx="34" cy="78" r="1.2" fill="#E11D48" className="opacity-60" />
    </svg>
  );
};
