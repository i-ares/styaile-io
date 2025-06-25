import React from 'react';

const values = [
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><circle cx="16" cy="16" r="15" stroke="#222" strokeWidth="1.5" /><path d="M10 18c2 2 6 2 8 0" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    title: 'serenity',
    desc: 'A calm, editorial approach to style.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="6" stroke="#222" strokeWidth="1.5" /><path d="M10 16h12" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    title: 'clarity',
    desc: 'Minimal, focused, and easy to use.'
  },
  {
    icon: (
      <svg width="32" height="32" fill="none" viewBox="0 0 32 32"><path d="M16 6v20M6 16h20" stroke="#222" strokeWidth="1.5" strokeLinecap="round" /></svg>
    ),
    title: 'elevation',
    desc: 'Elevating everyday style with intelligence.'
  },
];

export function BrandStory() {
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto">
      <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-10 text-center tracking-tight title-case">our story</h2>
      <div className="flex flex-col md:flex-row justify-center items-center gap-10 mb-12">
        {values.map((v, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-3">
            <span className="mb-2">{v.icon}</span>
            <span className="text-lg font-medium lowercase tracking-wide title-case">{v.title}</span>
            <span className="text-gray-500 dark:text-gray-400 text-base max-w-xs">{v.desc}</span>
          </div>
        ))}
      </div>
      <div className="text-center text-lg text-gray-700 dark:text-gray-200 font-light max-w-2xl mx-auto title-case">
        Styaile.io is a serene, editorial platform for discovering your personal style. We blend intelligent recommendations with a calm, sophisticated experience—so you can focus on what matters: feeling your best, every day.
      </div>
    </section>
  );
} 