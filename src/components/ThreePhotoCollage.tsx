import React, { useRef } from 'react';
import { PhotoItem } from '../types/bio';
import { Plus, Image as ImageIcon, Trash2 } from 'lucide-react';

interface ThreePhotoCollageProps {
  photos: [PhotoItem, PhotoItem, PhotoItem];
  mode: 'guest' | 'editor';
  onViewImage: (url: string, caption?: string) => void;
  onUpdatePhoto: (index: number, url: string) => void;
}

export const ThreePhotoCollage: React.FC<ThreePhotoCollageProps> = ({
  photos,
  mode,
  onViewImage,
  onUpdatePhoto,
}) => {
  const fileInputRefs = [
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
    useRef<HTMLInputElement | null>(null),
  ];

  const handleFileChange = (index: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        onUpdatePhoto(index, e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const renderSlot = (index: number, className: string) => {
    const photo = photos[index];
    const hasImage = Boolean(photo?.url);

    return (
      <div
        key={index}
        className={`relative rounded-2xl overflow-hidden border border-white/10 transition-all duration-300 group ${className} ${
          hasImage ? 'cursor-zoom-in' : 'cursor-pointer hover:border-white/30 bg-white/[0.03]'
        }`}
        onClick={() => {
          if (hasImage) {
            onViewImage(photo.url, photo.caption);
          } else {
            fileInputRefs[index].current?.click();
          }
        }}
      >
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRefs[index]}
          onChange={(e) => e.target.files?.[0] && handleFileChange(index, e.target.files[0])}
        />

        {hasImage ? (
          <>
            <img
              src={photo.url}
              alt={photo.caption || `Photo ${index + 1}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/15 group-hover:bg-transparent transition-colors" />

            {/* Quick action buttons in editor mode */}
            {mode === 'editor' && (
              <div
                className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => fileInputRefs[index].current?.click()}
                  className="p-1.5 rounded-lg bg-black/70 hover:bg-black text-white text-xs backdrop-blur-md"
                  title="Заменить фото"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onUpdatePhoto(index, '')}
                  className="p-1.5 rounded-lg bg-red-950/80 hover:bg-red-900 text-red-300 text-xs backdrop-blur-md"
                  title="Сделать серым слотом"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </>
        ) : (
          /* Neutral Dark Grey Placeholder Slot */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center select-none bg-gradient-to-b from-white/[0.04] to-transparent">
            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 group-hover:text-white/70 group-hover:scale-105 transition-all mb-2">
              <ImageIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-light text-white/40 group-hover:text-white/80 transition-colors">
              Слот #{index + 1}
            </span>
            <span className="text-[10px] text-white/25 mt-0.5 group-hover:text-white/50 transition-colors">
              нажмите для загрузки
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full glass-card rounded-3xl p-3 sm:p-4 shadow-2xl">
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 h-64 sm:h-80">
        {/* Left tall slot */}
        {renderSlot(0, 'h-full')}

        {/* Right side 2 stacked slots */}
        <div className="flex flex-col gap-2.5 sm:gap-3 h-full">
          {renderSlot(1, 'h-1/2')}
          {renderSlot(2, 'h-1/2')}
        </div>
      </div>
    </div>
  );
};
