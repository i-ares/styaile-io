import React, { useState } from 'react';
import { HeroSection } from './components/HeroSection';
import { NavBar } from './components/NavBar';
import { FeaturedCollections } from './components/FeaturedCollections';
import { LookbookGallery } from './components/LookbookGallery';
import { BrandStory } from './components/BrandStory';
import { Footer } from './components/Footer';
import { ChatInterface } from './components/chat/ChatInterface';
import { LooksQuestionnaire } from './components/LooksQuestionnaire';

export default function App() {
  const [showRecommendation, setShowRecommendation] = useState(false);
  const [showLooks, setShowLooks] = useState(false);
  const [dark, setDark] = useState(false);
  const [looksPrompt, setLooksPrompt] = useState<string | null>(null);

  React.useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    if (dark) {
      html.classList.add('dark');
      body.classList.add('dark');
    } else {
      html.classList.remove('dark');
      body.classList.remove('dark');
    }
  }, [dark]);

  const handleDiscoverClick = () => {
    setShowLooks(false);
    setShowRecommendation(true);
  };

  const handleLooksClick = () => {
    setShowRecommendation(false);
    setShowLooks(true);
    setLooksPrompt(null);
  };

  const handleCloseModal = () => {
    setShowRecommendation(false);
    setShowLooks(false);
    setLooksPrompt(null);
  };

  const handleToggleDark = () => {
    setDark((d) => !d);
  };

  const handleLooksQuestionnaireSubmit = (prompt: string) => {
    setLooksPrompt(prompt);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white">
      <NavBar onDiscoverClick={handleDiscoverClick} onToggleDark={handleToggleDark} dark={dark} onLooksClick={handleLooksClick} />
      <main className="flex-1 w-full">
        <section id="hero">
          <HeroSection onGetRecommendationClick={handleDiscoverClick} />
        </section>
        <section id="collections">
          <FeaturedCollections />
        </section>
        <section id="lookbook">
          <LookbookGallery />
        </section>
        <section id="story">
          <BrandStory />
        </section>
      </main>
      <Footer />
      {showRecommendation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 text-black dark:text-white">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="modal-title">Get a Recommendation</h2>
            <ChatInterface />
          </div>
        </div>
      )}
      {showLooks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full mx-4 p-8 text-black dark:text-white min-h-[500px]">
            {!looksPrompt ? (
              <LooksQuestionnaire onSubmit={handleLooksQuestionnaireSubmit} onClose={handleCloseModal} />
            ) : (
              <>
                <button
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold"
                  onClick={handleCloseModal}
                  aria-label="Close"
                >
                  &times;
                </button>
                <h2 className="modal-title">Your Curated Look</h2>
                <ChatInterface initialUserMessage={looksPrompt} />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}