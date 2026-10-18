import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface LightboxModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  isOpen,
  imageUrl,
  caption,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/95 backdrop-blur-2xl animate-in fade-in duration-200"
    >
      {/* High contrast close button */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50 cursor-pointer"
        aria-label="Закрыть просмотр"
      >
        <X className="w-5 h-5" />
      </button>

      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-4xl max-h-[92vh] flex flex-col items-center justify-center w-full"
      >
        <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-white/15 max-h-[70vh] flex items-center justify-center bg-black/50">
          <img
            src={imageUrl}
            alt={caption || 'Fullscreen photo'}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-[70vh] object-contain rounded-2xl grayscale contrast-125 brightness-95"
          />
        </div>

        {/* Caption placed at the bottom below the photo */}
        {caption && (
          <div className="mt-4 w-full max-w-2xl px-5 py-3.5 rounded-2xl bg-black/85 backdrop-blur-xl border border-white/15 text-center text-sm sm:text-base text-white/90 font-light leading-relaxed whitespace-pre-wrap shadow-2xl max-h-36 overflow-y-auto">
            {caption}
          </div>
        )}
      </div>
    </div>
  );
};
