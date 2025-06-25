import React from 'react';

export function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-8 px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-gray-500 dark:text-gray-300 text-sm">
      <div className="flex items-center gap-2">
        <svg width="28" height="28" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" stroke="currentColor" strokeWidth="1.5" /><path d="M10 18c2 2 6 2 8 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <span className="font-medium tracking-wide">Styaile.io</span>
      </div>
      <nav className="flex gap-6">
        <a href="#collections" className="hover:text-gray-900 dark:hover:text-white transition-colors">collections</a>
        <a href="#lookbook" className="hover:text-gray-900 dark:hover:text-white transition-colors">lookbook</a>
        <a href="#story" className="hover:text-gray-900 dark:hover:text-white transition-colors">our story</a>
        <a href="#chat" className="hover:text-gray-900 dark:hover:text-white transition-colors">recommend</a>
      </nav>
      <div className="flex items-center gap-3">
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-900 dark:hover:text-white transition-colors" aria-label="Instagram">
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="2.5" y="2.5" width="15" height="15" rx="4" stroke="currentColor" strokeWidth="1.2" /><circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.2" /><circle cx="15.2" cy="4.8" r="0.8" fill="currentColor" /></svg>
        </a>
      </div>
    </footer>
  );
} 