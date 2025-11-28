import React from 'react';

interface PhotoDisplayProps {
  currentImage: string;
  originalImage: string;
  hasChanges: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onReset: () => void;
}

export const PhotoDisplay: React.FC<PhotoDisplayProps> = ({
  currentImage,
  hasChanges,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onReset,
}) => {
  // Create a large array to ensure coverage for the background pattern
  const watermarks = Array.from({ length: 150 });

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentImage;
    link.download = `gemini-edit-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center group overflow-hidden">
      
      {/* Repeated Watermark Pattern (Behind image) */}
      <div className="absolute inset-0 flex flex-wrap items-center justify-center content-center gap-16 md:gap-24 opacity-[0.05] pointer-events-none z-0 overflow-hidden select-none transform scale-125">
        {watermarks.map((_, i) => (
          <span 
            key={i} 
            className="text-5xl md:text-7xl font-black text-white -rotate-45 whitespace-nowrap"
          >
            WID
          </span>
        ))}
      </div>

      {/* Main Image Container */}
      <div className="relative max-w-full max-h-full flex items-center justify-center p-4 z-10">
        <img
          src={currentImage}
          alt="Editing Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-[8px] shadow-2xl ring-1 ring-white/10"
        />
      </div>

      {/* Floating Controls Section - Minimalist Capsule */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center gap-1 bg-black/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 shadow-xl shadow-black/50">
          
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-3 rounded-full transition-all duration-200 ${
              canUndo
                ? 'hover:bg-white/20 text-white'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="Undo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 14 4 9l5-5"/>
              <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>
            </svg>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-3 rounded-full transition-all duration-200 ${
              canRedo
                ? 'hover:bg-white/20 text-white'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="Redo"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 9l-5 5"/>
              <path d="M4 14.5v0A5.5 5.5 0 0 1 9.5 9H20"/>
              <path d="M15 4l5 5"/>
            </svg>
          </button>

          <div className="w-px h-5 bg-white/10 mx-1"></div>

          <button
            onClick={onReset}
            disabled={!hasChanges}
            className={`p-3 rounded-full transition-all duration-200 ${
              hasChanges
                ? 'hover:bg-white/20 text-white hover:text-red-400'
                : 'text-white/20 cursor-not-allowed'
            }`}
            title="Reset"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
            </svg>
          </button>

          <div className="w-px h-5 bg-white/10 mx-1"></div>

          <button
            onClick={handleDownload}
            className="p-3 rounded-full hover:bg-white/20 text-white hover:text-indigo-400 transition-all duration-200"
            title="Download"
          >
             <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
             </svg>
          </button>

        </div>
      </div>
    </div>
  );
};