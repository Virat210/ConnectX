import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ size = 'default', showText = true, className = '', linkTo = '/' }) {
  // size options: 'sm', 'default', 'lg', 'xl'
  const iconSizes = {
    sm: 'w-7 h-7',
    default: 'w-9 h-9',
    lg: 'w-11 h-11',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-lg',
    default: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  };

  const logoGraphic = (
    <div className={`relative flex items-center gap-2.5 select-none ${className}`}>
      {/* Visual Logo Mark */}
      <div className={`relative ${iconSizes[size] || iconSizes.default} shrink-0 group`}>
        {/* Subtle Ambient Glow */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-amber-600/30 via-stone-500/20 to-amber-400/20 opacity-60 blur-[6px] group-hover:opacity-90 group-hover:blur-[8px] transition-all duration-300" />
        
        {/* Core Icon Badge */}
        <div className="relative w-full h-full rounded-xl bg-stone-950 border border-stone-800 dark:border-amber-500/25 flex items-center justify-center p-1.5 shadow-lg overflow-hidden">
          {/* Stylized Node Network X */}
          <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
            <defs>
              <linearGradient id="logo-line-grad" x1="4" y1="4" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#d97706" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d4af37" />
              </linearGradient>
            </defs>

            {/* Intersecting Cross Arms with Signal Nodes */}
            <line x1="8" y1="8" x2="32" y2="32" stroke="url(#logo-line-grad)" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="32" y1="8" x2="8" y2="32" stroke="url(#logo-line-grad)" strokeWidth="3.5" strokeLinecap="round" />
            
            {/* Center Nexus Circle */}
            <circle cx="20" cy="20" r="4.5" fill="#141416" stroke="url(#logo-line-grad)" strokeWidth="2.5" />
            <circle cx="20" cy="20" r="2" fill="#f59e0b" className="animate-ping origin-center" style={{ animationDuration: '3s' }} />

            {/* Connection Node Terminals */}
            <circle cx="8" cy="8" r="2.8" fill="#d97706" />
            <circle cx="32" cy="8" r="2.8" fill="#f59e0b" />
            <circle cx="8" cy="32" r="2.8" fill="#f59e0b" />
            <circle cx="32" cy="32" r="2.8" fill="#d4af37" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-center tracking-tight font-display font-bold">
          <span className={`${textSizes[size] || textSizes.default} text-stone-900 dark:text-stone-100 transition-colors`}>
            Connect
          </span>
          <span className={`${textSizes[size] || textSizes.default} bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent ml-0.5`}>
            X
          </span>
        </div>
      )}
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:focus-visible:ring-stone-600 rounded-lg">
        {logoGraphic}
      </Link>
    );
  }

  return logoGraphic;
}
