import React, { useState } from 'react';
import { ThemeConfig, ThemePalette, BackgroundPattern, RoseStyle, FontOption, AnimationIntensity, MusicPlacement } from '../types';
import { X, Check, RotateCcw, Palette, Flower2, Type, Activity, Sliders, Music } from 'lucide-react';

interface CustomizeDesignModalProps {
  currentTheme: ThemeConfig;
  isOpen: boolean;
  onClose: () => void;
  onSaveTheme: (theme: ThemeConfig) => void;
  onResetDefault: () => void;
}

export const CustomizeDesignModal: React.FC<CustomizeDesignModalProps> = ({
  currentTheme,
  isOpen,
  onClose,
  onSaveTheme,
  onResetDefault,
}) => {
  const [themeDraft, setThemeDraft] = useState<ThemeConfig>(currentTheme);

  if (!isOpen) return null;

  const palettes: { id: ThemePalette; name: string; colors: string[] }[] = [
    { id: 'blush', name: 'Blush Pink', colors: ['#FFF0F5', '#F4A9B8', '#C74A69'] },
    { id: 'dusty-rose', name: 'Dusty Rose', colors: ['#FAF2F3', '#DE738D', '#9E3D52'] },
    { id: 'cream-pink', name: 'Cream & Pink', colors: ['#FFFDF9', '#F8C8D4', '#B45167'] },
    { id: 'soft-lavender', name: 'Soft Lavender', colors: ['#FAF5FC', '#D8B4E2', '#7D5295'] },
    { id: 'white-sage', name: 'White & Muted Green', colors: ['#F9FAF9', '#A3B899', '#4E7456'] },
  ];

  const backgrounds: { id: BackgroundPattern; name: string; desc: string }[] = [
    { id: 'floral', name: 'Floral Background', desc: 'Subtle ambient petal illumination and floral glow' },
    { id: 'soft-rose', name: 'Soft Rose', desc: 'Gentle blush warmth across the whole canvas' },
    { id: 'simple-cream', name: 'Simple Cream', desc: 'Clean, warm editorial parchment look' },
    { id: 'minimal-pink', name: 'Minimal Pink', desc: 'Airy, restrained modern pastel pink tone' },
  ];

  const roseStyles: { id: RoseStyle; name: string; desc: string }[] = [
    { id: 'classic', name: 'Classic Garden Rose', desc: 'Vibrant pink outer petals with deep ruby heart' },
    { id: 'blush', name: 'Soft Blush Rose', desc: 'Porcelain blush pink petals with pale cream highlights' },
    { id: 'damask', name: 'Deep Damask Rose', desc: 'Rich romantic velvety wine and deep crimson tones' },
  ];

  const fontOptions: { id: FontOption; name: string; sample: string }[] = [
    { id: 'cormorant', name: 'Romantic Serif (Cormorant)', sample: 'Forever and always in love' },
    { id: 'playfair', name: 'Editorial Serif (Playfair)', sample: 'A timeless story of us' },
    { id: 'modern', name: 'Modern Clean (Plus Jakarta)', sample: 'Gentle, modern romantic tone' },
  ];

  const intensities: { id: AnimationIntensity; name: string; desc: string }[] = [
    { id: 'subtle', name: 'Subtle', desc: 'Calmer petal speed & lighter density' },
    { id: 'normal', name: 'Normal (Recommended)', desc: 'Full cinematic bloom & 3D petal rush' },
    { id: 'expressive', name: 'Expressive', desc: 'Extra dense petal storm & dramatic camera sweep' },
  ];

  const placements: { id: MusicPlacement; name: string }[] = [
    { id: 'bottom', name: 'Bottom Floating Bar' },
    { id: 'top', name: 'Top Floating Bar' },
    { id: 'corner', name: 'Discreet Bottom Corner' },
  ];

  const handleSave = () => {
    onSaveTheme(themeDraft);
    onClose();
  };

  const handleReset = () => {
    onResetDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-rose-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-100 mb-6">
          <div className="flex items-center gap-2 text-rose-950">
            <Palette className="w-5 h-5 text-rose-500" />
            <h3 className="font-cormorant text-2xl font-bold">
              Customize Website Design
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-1">
          {/* 1. Theme Color Palettes */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 uppercase tracking-wider mb-2.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" />
              Theme Color Palette
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {palettes.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setThemeDraft({ ...themeDraft, palette: p.id })}
                  className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    themeDraft.palette === p.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                      : 'border-stone-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <span className="text-xs font-medium text-stone-800">{p.name}</span>
                  <div className="flex items-center -space-x-1">
                    {p.colors.map((c, i) => (
                      <span
                        key={i}
                        className="w-4 h-4 rounded-full border border-white shadow-xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Background Style */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 uppercase tracking-wider mb-2.5">
              <Sliders className="w-3.5 h-3.5 text-rose-500" />
              Background Canvas Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {backgrounds.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setThemeDraft({ ...themeDraft, backgroundPattern: b.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    themeDraft.backgroundPattern === b.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                      : 'border-stone-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-stone-900">{b.name}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">{b.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Rose Style */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 uppercase tracking-wider mb-2.5">
              <Flower2 className="w-3.5 h-3.5 text-rose-500" />
              Pink Rose Bloom Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {roseStyles.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setThemeDraft({ ...themeDraft, roseStyle: r.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    themeDraft.roseStyle === r.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                      : 'border-stone-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-stone-900">{r.name}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Font Pairings */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 uppercase tracking-wider mb-2.5">
              <Type className="w-3.5 h-3.5 text-rose-500" />
              Typography Style
            </label>
            <div className="space-y-2">
              {fontOptions.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setThemeDraft({ ...themeDraft, fontStyle: f.id })}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    themeDraft.fontStyle === f.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                      : 'border-stone-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <div>
                    <div className="text-xs font-semibold text-stone-900">{f.name}</div>
                    <div className="text-sm text-stone-600 italic mt-0.5">{f.sample}</div>
                  </div>
                  {themeDraft.fontStyle === f.id && <Check className="w-4 h-4 text-rose-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Animation Intensity */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 uppercase tracking-wider mb-2.5">
              <Activity className="w-3.5 h-3.5 text-rose-500" />
              Petal Animation Intensity
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {intensities.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setThemeDraft({ ...themeDraft, animationIntensity: item.id })}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    themeDraft.animationIntensity === item.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400'
                      : 'border-stone-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-stone-900">{item.name}</div>
                  <div className="text-[11px] text-stone-500 mt-0.5 leading-tight">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 6. Music Player Placement */}
          <div>
            <label className="flex items-center gap-2 text-xs font-semibold text-rose-950 uppercase tracking-wider mb-2.5">
              <Music className="w-3.5 h-3.5 text-rose-500" />
              Music Player Placement
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {placements.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setThemeDraft({ ...themeDraft, playerPlacement: pos.id })}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    themeDraft.playerPlacement === pos.id
                      ? 'border-rose-500 bg-rose-50/70 shadow-xs ring-1 ring-rose-400 font-medium'
                      : 'border-stone-200 hover:border-rose-200 bg-white'
                  }`}
                >
                  <span className="text-xs text-stone-800">{pos.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-4 border-t border-rose-100 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-stone-500 hover:text-stone-800 text-xs font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-stone-600 hover:text-stone-800 text-xs font-medium cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-medium cursor-pointer shadow-sm shadow-rose-200"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
