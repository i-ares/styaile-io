import React from 'react';

const carouselData = [
  {
    text: 'Your serene fashion recommender',
    image: '/hero-elegant1.jpg',
  },
  {
    text: 'Discover your personal style',
    image: '/hero-elegant2.jpg',
  },
  {
    text: 'Effortless, intelligent outfit ideas',
    image: '/hero-elegant3.jpg',
  },
  {
    text: 'Curated looks, just for you',
    image: '/hero-elegant4.jpg',
  },
];

export function HeroSection({ onGetRecommendationClick = () => {} }: { onGetRecommendationClick?: () => void }) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % carouselData.length);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hero" className="relative h-screen flex items-center justify-center bg-black/70 overflow-hidden">
      {carouselData.map((item, i) => (
        <img
          key={i}
          src={item.image}
          alt="editorial fashion"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ${i === index ? 'opacity-80' : 'opacity-0'}`}
          style={{zIndex: 1}}
        />
      ))}
      <div className="relative z-10 flex flex-col items-center justify-center w-full px-4 py-24">
        <h1 className="text-4xl md:text-6xl font-serif font-bold text-white dark:text-white mb-8 drop-shadow-lg tracking-tight text-center logo">Styaile.io</h1>
        <div className="h-12 flex items-center justify-center mb-8">
          <span className="text-xl md:text-2xl font-light text-white/90 dark:text-white transition-all duration-700 ease-in-out text-center title-case" key={index}>
            {carouselData[index].text}
          </span>
        </div>
        <button
          onClick={onGetRecommendationClick}
          className="mt-2 px-8 py-3 rounded-full bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-white font-semibold text-lg shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all"
        >
          Get a Recommendation
        </button>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
    </section>
  );
} 