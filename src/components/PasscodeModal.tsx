import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Heart, Sparkles, HelpCircle, Delete, Check, X, ShieldAlert } from 'lucide-react';
import { PasscodeConfig } from '../types';

interface PasscodeModalProps {
  passcodeConfig: PasscodeConfig;
  girlfriendName: string;
  senderName: string;
  isOpen: boolean;
  onSuccess: () => void;
  onClose?: () => void;
  isAuthorPreview?: boolean;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  passcodeConfig,
  girlfriendName,
  senderName,
  isOpen,
  onSuccess,
  onClose,
  isAuthorPreview = false,
}) => {
  const [inputCode, setInputCode] = useState<string>('');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const targetCode = passcodeConfig.code?.trim() || '1024';

  useEffect(() => {
    if (isOpen) {
      setInputCode('');
      setShowHint(false);
      setIsError(false);
      setIsSuccess(false);
      setErrorMessage('');
    }
  }, [isOpen]);

  // Handle physical keyboard inputs
  useEffect(() => {
    if (!isOpen || isSuccess) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleSubmit(inputCode);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, inputCode, isSuccess]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (inputCode.length >= 8) return;
    const newCode = inputCode + digit;
    setInputCode(newCode);
    setIsError(false);

    // Auto-check if matches target length
    if (newCode.length === targetCode.length) {
      handleSubmit(newCode);
    }
  };

  const handleBackspace = () => {
    setInputCode((prev) => prev.slice(0, -1));
    setIsError(false);
  };

  const handleClear = () => {
    setInputCode('');
    setIsError(false);
  };

  const handleSubmit = (codeToTest: string) => {
    if (!codeToTest) return;

    if (codeToTest.toLowerCase().trim() === targetCode.toLowerCase().trim()) {
      setIsSuccess(true);
      setIsError(false);
      setTimeout(() => {
        onSuccess();
      }, 700);
    } else {
      setIsError(true);
      setErrorMessage('Not quite, my sweetheart. Think of our special moment or check the hint! 🌹');
      setTimeout(() => {
        setInputCode('');
        setIsError(false);
      }, 1200);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto animate-fade-in font-sans-custom">
      <div
        className={`relative bg-gradient-to-b from-[#FFFDFD] via-[#FFF5F7] to-[#FCE8ED] rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-rose-200 text-center my-8 transition-transform duration-300 ${
          isError ? 'animate-bounce [animation-iteration-count:2]' : ''
        } ${isSuccess ? 'scale-105 shadow-rose-300' : ''}`}
      >
        {/* Close button if author preview */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-rose-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Lock / Unlock Icon Badge */}
        <div className="mx-auto mb-4 relative">
          <div
            className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center transition-all duration-500 shadow-md ${
              isSuccess
                ? 'bg-emerald-500 text-white scale-110 shadow-emerald-200'
                : isError
                ? 'bg-rose-500 text-white shadow-rose-300'
                : 'bg-white text-rose-500 border border-rose-200 shadow-rose-100'
            }`}
          >
            {isSuccess ? (
              <Unlock className="w-8 h-8 animate-pulse" />
            ) : (
              <Lock className="w-8 h-8" />
            )}
          </div>
          {/* Subtle flower accents */}
          <span className="absolute -top-1 left-1/2 ml-7 text-xs">🌸</span>
          <span className="absolute -bottom-1 left-1/2 -ml-9 text-xs">✨</span>
        </div>

        {/* Romantic Headlines */}
        <h3 className="font-cormorant text-2xl sm:text-3xl font-bold text-rose-950 mb-1">
          {isSuccess ? 'Passcode Accepted!' : 'A Secret Surprise'}
        </h3>
        <p className="text-xs text-rose-700/80 mb-5 leading-relaxed">
          {isSuccess ? (
            <span className="font-semibold text-emerald-700">Unlocking your romantic love letter...</span>
          ) : (
            <>
              For <span className="font-semibold text-rose-950">{girlfriendName}</span>, sealed with love by{' '}
              <span className="font-semibold text-rose-950">{senderName}</span>.
            </>
          )}
        </p>

        {/* Heart Passcode Visual Dots Display */}
        <div className="flex items-center justify-center gap-3 mb-5 py-3 px-4 rounded-2xl bg-white/80 border border-rose-200/80 shadow-inner">
          {Array.from({ length: Math.max(targetCode.length, 4) }).map((_, idx) => {
            const hasChar = idx < inputCode.length;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200 ${
                  hasChar
                    ? isSuccess
                      ? 'bg-emerald-500 scale-125'
                      : isError
                      ? 'bg-rose-600 scale-110'
                      : 'bg-rose-500 scale-110 shadow-xs'
                    : 'border-2 border-rose-200 bg-rose-50/50'
                }`}
              >
                {hasChar && (
                  <Heart className="w-2.5 h-2.5 fill-white text-white" />
                )}
              </div>
            );
          })}
        </div>

        {/* Error Feedback Message */}
        {errorMessage && (
          <div className="mb-4 text-xs font-medium text-rose-600 bg-rose-50 py-1.5 px-3 rounded-xl border border-rose-200 animate-fade-in">
            {errorMessage}
          </div>
        )}

        {/* Touch Keypad */}
        <div className="grid grid-cols-3 gap-2.5 mb-5 max-w-[260px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              disabled={isSuccess}
              className="h-12 rounded-2xl bg-white/95 hover:bg-rose-100/70 active:bg-rose-200/80 border border-rose-200/80 text-rose-950 text-lg font-semibold font-mono shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {digit}
            </button>
          ))}

          {/* Clear Button */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isSuccess || inputCode.length === 0}
            className="h-12 rounded-2xl bg-white/70 hover:bg-rose-50 text-stone-500 text-xs font-medium border border-rose-100 transition-all active:scale-95 cursor-pointer disabled:opacity-30"
          >
            Clear
          </button>

          {/* Zero Button */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            disabled={isSuccess}
            className="h-12 rounded-2xl bg-white/95 hover:bg-rose-100/70 active:bg-rose-200/80 border border-rose-200/80 text-rose-950 text-lg font-semibold font-mono shadow-xs transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          >
            0
          </button>

          {/* Backspace Button */}
          <button
            type="button"
            onClick={handleBackspace}
            disabled={isSuccess || inputCode.length === 0}
            className="h-12 rounded-2xl bg-white/70 hover:bg-rose-50 text-stone-600 flex items-center justify-center border border-rose-100 transition-all active:scale-95 cursor-pointer disabled:opacity-30"
          >
            <Delete className="w-5 h-5 text-rose-700" />
          </button>
        </div>

        {/* Hint Section */}
        <div className="pt-2 border-t border-rose-100">
          <button
            type="button"
            onClick={() => setShowHint(!showHint)}
            className="inline-flex items-center gap-1.5 text-xs text-rose-700 hover:text-rose-900 font-medium cursor-pointer transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>{showHint ? 'Hide Hint' : 'Need a hint? 💕'}</span>
          </button>

          {showHint && (
            <div className="mt-2.5 p-3 rounded-2xl bg-white/90 border border-rose-200 text-xs text-stone-700 text-left animate-fade-in shadow-xs">
              <div className="font-semibold text-rose-950 mb-0.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>Love Hint from {senderName}:</span>
              </div>
              <p className="text-stone-600 italic">
                "{passcodeConfig.hint || 'Think of our special anniversary date (MMDD) 🌸'}"
              </p>
            </div>
          )}
        </div>

        {/* Author Testing Bypass Note */}
        {isAuthorPreview && (
          <div className="mt-4 pt-2 text-[10px] text-stone-400">
            <span>Author Mode Preview · Target Code: </span>
            <span className="font-mono font-bold text-rose-700">{targetCode}</span>
          </div>
        )}
      </div>
    </div>
  );
};
