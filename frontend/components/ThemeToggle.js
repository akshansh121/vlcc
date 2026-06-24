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
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative p-2 rounded-full transition-all duration-300 ${
        isDark
          ? 'text-amber-400 hover:bg-white/10 hover:text-amber-300'
          : 'text-rose-500 hover:bg-rose-100 hover:text-rose-700'
      } ${className}`}
    >
      <span className="sr-only">{isDark ? 'Light mode' : 'Dark mode'}</span>
      {isDark ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
