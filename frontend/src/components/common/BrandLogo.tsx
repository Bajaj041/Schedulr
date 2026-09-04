import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  isLight?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', isLight = false }) => {
  const iconSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';

  return (
    <Link to="/app/dashboard" className={`inline-flex items-center gap-2.5 group transition-transform ${className}`}>
      <div className="relative flex items-center justify-center p-2 rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-bright-gold-300 shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform duration-200">
        <svg
          className={`${iconSize} text-slate-950`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3v4M8 3v4M3 11h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" />
          <path d="M8 15h.01M12 15h.01M16 15h.01M8 19h.01M12 19h.01M16 19h.01" />
        </svg>
      </div>
      <span
        className={`font-extrabold tracking-tight ${textSize} ${
          isLight ? 'text-slate-900' : 'text-white'
        }`}
      >
        Schedul<span className="text-brand-500">r</span>
      </span>
    </Link>
  );
};
