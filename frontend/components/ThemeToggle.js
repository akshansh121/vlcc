'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light mode' : 'Switch to Dark mode'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-300 ${
        isDark
          ? 'border-amber-400/40 text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 hover:border-amber-400/60'
          : 'border-rose-300 text-rose-600 bg-rose-50 hover:bg-rose-100 hover:border-rose-400'
      } ${className}`}
    >
      {isDark ? (
        <>
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </>
      )}
    </button>
  );
}
