import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabels = true }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {showLabels && (
        <span
          className={`text-xs font-semibold transition-colors cursor-pointer ${
            !isDark ? 'text-bright-gold-700 font-bold' : 'text-slate-400 hover:text-slate-300'
          }`}
          onClick={() => isDark && toggleTheme()}
        >
          Light
        </span>
      )}

      {/* Pill Toggle Switch styled like screenshot */}
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        onClick={toggleTheme}
        className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out focus:outline-none relative flex items-center shadow-inner ${
          isDark
            ? 'bg-bright-gold-500'
            : 'bg-slate-300 dark:bg-slate-700'
        }`}
        title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
      >
        <span className="sr-only">Toggle theme</span>
        <div
          className={`w-4 h-4 rounded-full bg-slate-950 shadow-md transform transition-transform duration-200 ease-in-out flex items-center justify-center ${
            isDark ? 'translate-x-6 bg-slate-950 text-bright-gold-400' : 'translate-x-0 bg-white text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="w-2.5 h-2.5 text-bright-gold-400" />
          ) : (
            <Sun className="w-2.5 h-2.5 text-amber-500" />
          )}
        </div>
      </button>

      {showLabels && (
        <span
          className={`text-xs font-semibold transition-colors cursor-pointer ${
            isDark ? 'text-bright-gold-400 font-bold' : 'text-slate-500 hover:text-slate-700'
          }`}
          onClick={() => !isDark && toggleTheme()}
        >
          Dark
        </span>
      )}
    </div>
  );
};
