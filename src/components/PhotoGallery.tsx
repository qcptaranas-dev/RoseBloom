import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhotoItem } from '../types';
import { ChevronLeft, ChevronRight, X, Camera, Edit3, Heart, ZoomIn } from 'lucide-react';

interface PhotoGalleryProps {
  photos: [PhotoItem, PhotoItem, PhotoItem, PhotoItem];
  isReceiverMode: boolean;
  onUpdatePhoto: (index: number, updated: Partial<PhotoItem>) => void;
}

export const PhotoGallery: React.FC<PhotoGalleryProps> = ({
  photos,
  isReceiverMode,
  onUpdatePhoto,
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [editingPhotoIndex, setEditingPhotoIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeUploadIndex, setActiveUploadIndex] = useState<number | null>(null);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);

  // Keyboard navigation & ESC close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setSelectedIndex((prev) => (prev !== null ? (prev === 0 ? photos.length - 1 : prev - 1) : null));
      } else if (e.key === 'ArrowRight') {
        setSelectedIndex((prev) => (prev !== null ? (prev === photos.length - 1 ? 0 : prev + 1) : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null || selectedIndex === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    const minSwipeDistance = 45;

    if (diff > minSwipeDistance) {
      // Swiped left -> Next
      setSelectedIndex((prev) => (prev !== null ? (prev === photos.length - 1 ? 0 : prev + 1) : null));
    } else if (diff < -minSwipeDistance) {
      // Swiped right -> Previous
      setSelectedIndex((prev) => (prev !== null ? (prev === 0 ? photos.length - 1 : prev - 1) : null));
    }

    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (activeUploadIndex === null) return;
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdatePhoto(activeUploadIndex, { url: reader.result });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const triggerUpload = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveUploadIndex(index);
    fileInputRef.current?.click();
  };

  return (
    <section className="w-full max-w-5xl mx-auto px-4 py-12">
      {/* Hidden file input for photo uploads */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Section Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-rose-500 mb-2">
          <Heart className="w-4 h-4 fill-rose-300 text-rose-400" />
          <span className="text-xs font-semibold tracking-widest uppercase font-sans-custom">
            Our Cherished Moments
          </span>
          <Heart className="w-4 h-4 fill-rose-300 text-rose-400" />
        </div>
        <h3 className="font-cormorant text-3xl md:text-4xl text-rose-950 font-medium tracking-tight">
          Four Chapters of Us
        </h3>
        <p className="text-sm text-stone-600 mt-2 max-w-md mx-auto font-sans-custom">
          Click any photograph to read the story and tender memory behind it.
        </p>
      </div>

      {/* Exactly 4 Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {photos.map((photo, idx) => (
          <div
            key={photo.id}
            onClick={() => setSelectedIndex(idx)}
            className={`group relative bg-[#FFFDF9] p-3 rounded-2xl border border-rose-200/80 shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col hover:-translate-y-1.5 ${
              idx % 2 === 0 ? 'hover:rotate-0.5' : 'hover:-rotate-0.5'
            }`}
          >
            {/* Image frame */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-rose-50 shadow-inner">
              <img
                src={photo.url}
                alt={photo.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                onError={(e) => {
                  // Fallback styled visual container
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              {/* Hover overlay hint */}
              <div className="absolute inset-0 bg-gradient-to-t from-rose-950/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                <span className="text-[11px] text-white/95 font-sans-custom">
                  {photo.dateOrLocation}
                </span>
                <span className="p-1 rounded-full bg-white/25 backdrop-blur-xs text-white shadow-xs">
                  <ZoomIn className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Photo Card Summary */}
            <div className="mt-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[11px] text-rose-600 font-medium uppercase tracking-wider mb-1">
                  <span>Memory 0{idx + 1}</span>
                  <span className="text-[10px] text-stone-400 capitalize font-normal">{photo.dateOrLocation}</span>
                </div>
                <h4 className="font-cormorant text-lg font-semibold text-rose-950 leading-snug truncate group-hover:text-rose-700 transition-colors">
                  {photo.title}
                </h4>
                <p className="text-xs text-stone-600 line-clamp-2 mt-1 font-sans-custom leading-relaxed">
                  {photo.caption}
                </p>
              </div>

              {/* Editor controls */}
              {!isReceiverMode && (
                <div className="mt-3 pt-2 border-t border-rose-100 flex items-center justify-between text-[11px]">
                  <button
                    onClick={(e) => triggerUpload(idx, e)}
                    className="flex items-center gap-1 text-rose-700 hover:text-rose-900 font-medium cursor-pointer"
                    title="Upload replacement photo"
                  >
                    <Camera className="w-3 h-3" />
                    <span>Replace Photo</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingPhotoIndex(idx);
                    }}
                    className="flex items-center gap-1 text-stone-500 hover:text-rose-700 cursor-pointer"
                    title="Edit title & message"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit Note</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ENLARGED PHOTO VIEWER (LIGHTBOX) */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setSelectedIndex(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Lightbox Inner Container */}
          <div
            className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center bg-transparent rounded-2xl select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar with Counter & Close */}
            <div className="w-full flex items-center justify-between text-white/90 px-2 py-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono tracking-wider bg-white/10 px-2.5 py-1 rounded-full text-rose-200">
                  {selectedIndex + 1} of 4
                </span>
                <span className="text-xs text-white/70 hidden sm:inline">
                  {photos[selectedIndex].dateOrLocation}
                </span>
              </div>

              <button
                onClick={() => setSelectedIndex(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label="Close viewer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Stage: Preserves aspect ratio completely with soft romantic cross-fade */}
            <div className="relative w-full flex items-center justify-center min-h-[260px] sm:min-h-[360px] max-h-[60vh] sm:max-h-[68vh] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.img
                  key={`lightbox_photo_${photos[selectedIndex].id}_${selectedIndex}`}
                  src={photos[selectedIndex].url}
                  alt={photos[selectedIndex].title}
                  referrerPolicy="no-referrer"
                  initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, scale: 1.015, filter: 'blur(3px)' }}
                  transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                  className="max-h-[60vh] sm:max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-2xl select-none"
                />
              </AnimatePresence>

              {/* Prev Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev !== null ? (prev === 0 ? photos.length - 1 : prev - 1) : null));
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer z-10"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Next Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((prev) => (prev !== null ? (prev === photos.length - 1 ? 0 : prev + 1) : null));
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-sm transition-transform hover:scale-110 cursor-pointer z-10"
                aria-label="Next photo"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Quick Indicator Dots */}
            <div className="flex items-center justify-center gap-2 mt-2.5">
              {photos.map((p, i) => (
                <button
                  key={p.id || i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIndex(i);
                  }}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${
                    i === selectedIndex
                      ? 'w-7 h-2 bg-gradient-to-r from-rose-400 to-pink-300 shadow-xs'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/75'
                  }`}
                  aria-label={`Switch to memory ${i + 1}`}
                  title={`View Memory ${i + 1}`}
                />
              ))}
            </div>

            {/* Individual Photo Message Underneath the Image with Soft Fade */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`lightbox_msg_${photos[selectedIndex].id}_${selectedIndex}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="w-full mt-2.5 p-4 bg-white/95 backdrop-blur-sm rounded-xl border border-rose-100 shadow-xl max-h-36 overflow-y-auto"
              >
                <div className="flex items-center justify-between gap-3 mb-1">
                  <h4 className="font-cormorant text-xl font-semibold text-rose-950">
                    {photos[selectedIndex].title}
                  </h4>
                  {!isReceiverMode && (
                    <button
                      onClick={() => setEditingPhotoIndex(selectedIndex)}
                      className="text-xs text-rose-600 hover:text-rose-800 flex items-center gap-1 font-sans-custom cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit message</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-stone-700 leading-relaxed font-sans-custom whitespace-pre-line">
                  {photos[selectedIndex].caption}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Editor Modal for Photo Details */}
      {editingPhotoIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-rose-100">
            <h3 className="font-cormorant text-2xl font-bold text-rose-950 mb-4">
              Edit Memory #{editingPhotoIndex + 1}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Photo Title
                </label>
                <input
                  type="text"
                  value={photos[editingPhotoIndex].title}
                  onChange={(e) => onUpdatePhoto(editingPhotoIndex, { title: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Date / Location Tag
                </label>
                <input
                  type="text"
                  value={photos[editingPhotoIndex].dateOrLocation}
                  onChange={(e) => onUpdatePhoto(editingPhotoIndex, { dateOrLocation: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Personal Message for This Photo
                </label>
                <textarea
                  rows={4}
                  value={photos[editingPhotoIndex].caption}
                  onChange={(e) => onUpdatePhoto(editingPhotoIndex, { caption: e.target.value })}
                  className="w-full px-3 py-2 border border-rose-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
                  placeholder="Write your sweet memory here..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Replace Photo File
                </label>
                <button
                  onClick={(e) => triggerUpload(editingPhotoIndex, e)}
                  className="w-full py-2 border-2 border-dashed border-rose-300 rounded-lg text-xs text-rose-700 hover:bg-rose-50 flex items-center justify-center gap-1.5 cursor-pointer font-medium"
                >
                  <Camera className="w-4 h-4" />
                  <span>Choose new image from computer or phone</span>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditingPhotoIndex(null)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
