import React, { useState } from 'react';
import { X, KeyRound, Heart, ArrowRight, AlertCircle, ShieldCheck } from 'lucide-react';
import { siteService } from '../services/siteService';
import { UserSiteProject } from '../types';

interface ReceiverCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLetterUnlocked: (site: UserSiteProject) => void;
}

export const ReceiverCodeModal: React.FC<ReceiverCodeModalProps> = ({
  isOpen,
  onClose,
  onLetterUnlocked,
}) => {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const clean = code.trim().toUpperCase();
    if (!clean) {
      setError('Please enter your secret letter code.');
      return;
    }

    const found = siteService.findSiteForReceiver(clean);
    if (found) {
      onLetterUnlocked(found);
      onClose();
    } else {
      setError('No private love letter found with this code. Please check with your partner.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-rose-100 text-center relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 mx-auto rounded-full bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center mb-3">
          <KeyRound className="w-6 h-6" />
        </div>

        <h3 className="font-cormorant text-2xl font-bold text-rose-950 mb-1">
          Open Private Love Letter
        </h3>
        <p className="text-xs text-stone-500 mb-5 font-sans-custom">
          Enter the secret access code sent by your partner (e.g. ROSE-1024)
        </p>

        {error && (
          <div className="mb-4 p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-1.5 text-left">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans-custom">
          <input
            type="text"
            required
            autoFocus
            placeholder="e.g. ROSE-1024"
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            className="w-full text-center tracking-widest font-mono text-base font-bold py-2.5 px-4 border border-rose-300 rounded-xl text-rose-950 uppercase placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-400 bg-rose-50/30"
          />

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Unlock My Letter</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-rose-100 flex items-center justify-center gap-1 text-[11px] text-stone-400 font-sans-custom">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Private Work: Isolated &amp; confidential</span>
        </div>
      </div>
    </div>
  );
};
