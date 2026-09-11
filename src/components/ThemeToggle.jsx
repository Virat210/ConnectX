import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSound } from '../hooks/useSound';

export default function ThemeToggle({ className = '' }) {
  const { isDark, toggleTheme } = useTheme();
  const { playClick } = useSound();

  const handleToggle = () => {
    playClick();
    toggleTheme();
  };

  return (
    <button
      onClick={handleToggle}
      className={`relative p-2 rounded-xl text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-200/70 dark:hover:bg-stone-800/70 border border-stone-200/80 dark:border-stone-800/80 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 dark:focus-visible:ring-stone-600 cursor-pointer ${className}`}
      title={isDark ? 'Switch to Light Mode (Warm Ivory)' : 'Switch to Dark Mode (Obsidian)'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4.5 h-4.5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4.5 h-4.5 text-stone-800 transition-transform duration-300 -rotate-12 hover:rotate-0" />
      )}
    </button>
  );
}
