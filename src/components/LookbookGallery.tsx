import React from 'react';

const lookbook = [
  { image: '/look1.jpg', caption: 'soft tailoring' },
  { image: '/look2.jpg', caption: 'monochrome layers' },
  { image: '/look3.jpg', caption: 'airy neutrals' },
  { image: '/look4.jpg', caption: 'urban minimal' },
  { image: '/look5.jpg', caption: 'evening ease' },
  { image: '/look6.jpg', caption: 'weekend edit' },
];

export function LookbookGallery() {
  return (
    <section className="py-20 px-4 bg-[#f8f8f7] dark:bg-gray-900">
      <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-10 text-center tracking-tight title-case">lookbook</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {lookbook.map((item, i) => (
          <div key={i} className="group relative rounded-2xl overflow-hidden shadow-soft bg-white dark:bg-gray-800">
            <img src={item.image} alt={item.caption} className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300 flex items-end">
              <span className="p-4 text-white text-lg font-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 lowercase tracking-wide title-case">
                {item.caption}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
} 