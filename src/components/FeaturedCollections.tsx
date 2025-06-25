import React from 'react';

const collections = [
  {
    name: 'summer edit',
    image: '/editorial1.jpg',
    link: '#',
  },
  {
    name: 'minimal luxe',
    image: '/editorial2.jpg',
    link: '#',
  },
  {
    name: 'campus cool',
    image: '/editorial3.jpg',
    link: '#',
  },
  {
    name: 'timeless black',
    image: '/editorial4.jpg',
    link: '#',
  },
];

export function FeaturedCollections() {
  return (
    <section className="py-20 px-4">
      <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-10 text-center tracking-tight title-case">featured collections</h2>
      <div className="flex space-x-8 overflow-x-auto pb-4">
        {collections.map((col, i) => (
          <div key={i} className="min-w-[320px] max-w-xs bg-white dark:bg-gray-800 rounded-2xl shadow-soft flex flex-col items-start overflow-hidden relative">
            <img src={col.image} alt={col.name} className="w-full h-64 object-cover rounded-t-2xl" />
            <div className="p-6 flex flex-col flex-1 w-full">
              <span className="text-lg lowercase font-light tracking-wide mb-4 text-gray-800 dark:text-gray-100 title-case">{col.name}</span>
              <a href={col.link} className="mt-auto px-6 py-2 rounded-pill border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-900/80 shadow-pill text-base font-medium tracking-wide transition-all hover:shadow-lg focus:outline-none">
                explore
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 