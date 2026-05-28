import { useState, useEffect } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage for saved theme
    if (typeof window !== 'undefined' && window.localStorage.getItem('theme')) {
      return window.localStorage.getItem('theme');
    }
    // Check system preference if no saved theme
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light'; // Default fallback
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove the old theme class and add the current one
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    
    // Save to localStorage
    window.localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
