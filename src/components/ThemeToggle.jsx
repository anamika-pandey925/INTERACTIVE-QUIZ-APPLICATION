import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative flex items-center justify-center p-2.5 rounded-full 
        backdrop-blur-md bg-white/20 dark:bg-black/30 border border-white/20 dark:border-gray-700/50
        shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] 
        transition-all duration-500 ease-in-out hover:scale-110 active:scale-95
        overflow-hidden group cursor-pointer
      `}
      aria-label="Toggle Dark Mode"
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent dark:via-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 flex items-center justify-center w-6 h-6">
        <Sun 
          className={`
            absolute transition-all duration-500 ease-in-out text-yellow-300
            ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}
          `}
          size={22} 
        />
        
        <Moon 
          className={`
            absolute transition-all duration-500 ease-in-out text-white
            ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}
          `}
          size={22} 
        />
      </div>
    </button>
  );
}
