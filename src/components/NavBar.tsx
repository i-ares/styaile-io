import React from 'react';

export function NavBar({ onDiscoverClick, onToggleDark, dark, onLooksClick }: { onDiscoverClick: () => void; onToggleDark: () => void; dark: boolean; onLooksClick: () => void }) {
  const handleNav = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };
  return (
    <nav className="w-full flex items-center justify-between px-8 py-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-none z-20">
      <div className="flex items-center gap-3">
        <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" /><path d="M10 18c2 2 6 2 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <span className="font-bold text-xl tracking-wide logo">Styaile.io</span>
      </div>
      <div className="flex gap-8 items-center">
        <button onClick={() => handleNav('hero')} className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition">Home</button>
        <button onClick={onDiscoverClick} className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition px-2 py-1 rounded">Discover</button>
        <button onClick={onLooksClick} className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition">Looks</button>
        <button onClick={() => handleNav('story')} className="text-base font-medium text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white transition">Profile</button>
        <button
          className="rounded-full border border-gray-300 dark:border-gray-600 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition ml-4"
          aria-label="toggle light/dark mode"
          onClick={onToggleDark}
        >
          {dark ? (
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="1.2" /><path d="M15 10a5 5 0 01-5 5V5a5 5 0 015 5z" fill="#fff" /></svg>
          ) : (
            <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8" stroke="#222" strokeWidth="1.2" /><path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.42 1.42M14.66 14.66l1.41 1.41M4.93 15.07l1.42-1.42M14.66 5.34l1.41-1.41" stroke="#222" strokeWidth="1.2" strokeLinecap="round" /></svg>
          )}
        </button>
      </div>
    </nav>
  );
} 