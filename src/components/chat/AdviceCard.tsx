import React from 'react';
import { FashionAdvice } from '../../types';
import { Shirt, PartyPopper, ShoppingBag, Sparkles } from 'lucide-react';

const AdviceCard: React.FC<{ advice: FashionAdvice }> = ({ advice }) => {
  const sections = [
    { title: 'Essential Pairings', items: advice.complementary_items, icon: <Shirt className="w-5 h-5" /> },
    { title: 'Complete Outfits', items: advice.outfits, icon: <ShoppingBag className="w-5 h-5" /> },
    { title: 'Perfect Occasions', items: advice.occasions, icon: <PartyPopper className="w-5 h-5" /> },
    { title: 'Styling Tips', items: advice.styling_tips, icon: <Sparkles className="w-5 h-5" /> }
  ];

  return (
    <div className="mt-4 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {sections.map(section => (
        section.items && section.items.length > 0 && (
          <div key={section.title}>
            <h4 className="flex items-center gap-2 text-md font-semibold text-gray-800 dark:text-gray-200 mb-2">
              {section.icon}
              {section.title}
            </h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400 text-sm pl-2">
              {section.items.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )
      ))}
    </div>
  );
};

export default AdviceCard; 