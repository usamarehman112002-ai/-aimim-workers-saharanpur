import React, { useState } from 'react';

interface AimimLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
  useImageOnly?: boolean;
}

export const AimimLogo: React.FC<AimimLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  className = '',
  useImageOnly = false,
}) => {
  const [imgError, setImgError] = useState(false);

  const dimensionClasses = {
    xs: 'w-7 h-7',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24 sm:w-28 sm:h-28',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Emblem / Badge Container */}
      <div className={`relative flex-shrink-0 ${dimensionClasses[size]} rounded-full overflow-hidden border-2 border-amber-400 shadow-md shadow-emerald-950/60 bg-emerald-950 ring-2 ring-emerald-600/40`}>
        {!imgError ? (
          <img
            src="/logo.png"
            alt="AIMIM Workers जिला सहारनपुर लोगो"
            className="w-full h-full object-cover object-center select-none"
            onError={() => setImgError(true)}
          />
        ) : (
          /* High-Fidelity SVG Fallback */
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-1">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Kite Diamond */}
              <polygon points="50,15 85,50 50,68 15,50" fill="#10b981" stroke="#f59e0b" strokeWidth="2.5" />
              <polygon points="50,15 85,50 50,45" fill="#f59e0b" opacity="0.85" />
              <line x1="50" y1="12" x2="50" y2="72" stroke="#fef08a" strokeWidth="2.5" />
              <path d="M 15,50 Q 50,30 85,50" fill="none" stroke="#fef08a" strokeWidth="2.5" />
              {/* Tail */}
              <polygon points="42,72 58,72 50,86" fill="#f59e0b" />
            </svg>
          </div>
        )}
      </div>

      {!useImageOnly && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-extrabold tracking-tight text-white font-sans text-sm sm:text-base leading-tight">
              AIMIM Workers
            </span>
            <span className="inline-block px-1.5 py-0.2 text-[10px] sm:text-[11px] font-bold bg-amber-400 text-emerald-950 rounded shadow-sm border border-amber-300">
              जिला सहारनपुर
            </span>
          </div>
          {showSubtitle && (
            <p className="text-[10px] sm:text-xs text-emerald-300 truncate font-medium">
              पतंग निशान • ऑल इंडिया मजलिस-ए-इत्तेहादुल मुस्लिमीन
            </p>
          )}
        </div>
      )}
    </div>
  );
};
