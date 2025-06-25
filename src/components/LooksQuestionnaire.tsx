import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const questions = [
  {
    key: 'occasion',
    label: "What's the occasion?",
    options: ['Everyday / Casual', 'Work / Office', 'Party / Night Out', 'Special Event', 'Vacation / Travel'],
  },
  {
    key: 'style',
    label: 'Preferred style?',
    options: ['Minimal / Clean', 'Trendy / Statement', 'Classic / Timeless', 'Sporty / Relaxed', 'Elegant / Chic'],
  },
  {
    key: 'color',
    label: 'Color palette?',
    options: ['Neutrals', 'Earthy', 'Pastels', 'Bold', 'Monochrome'],
  },
  {
    key: 'footwear',
    label: 'Go-to footwear?',
    options: ['Sneakers', 'Loafers / Flats', 'Boots', 'Heels', 'Sandals'],
  },
  {
    key: 'fit',
    label: 'Preferred fit?',
    options: ['Relaxed / Oversized', 'Tailored / Fitted', 'Mix of both'],
  },
  {
    key: 'musthave',
    label: 'Must-have item?',
    options: ['Blazer', 'Statement top', 'Dress / Skirt', 'Denim', 'Accessories'],
  },
  {
    key: 'budget',
    label: 'Budget?',
    options: ['$50–$100', '$100–$250', '$250–$500', '$500+'],
  },
];

export function LooksQuestionnaire({ onSubmit, onClose }: { onSubmit: (prompt: string) => void; onClose: () => void }) {
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSelect = (value: string) => {
    const key = questions[step].key;
    setAnswers((a) => ({ ...a, [key]: value }));
    if (step < questions.length - 1) {
      setTimeout(() => setStep((s) => s + 1), 350);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const prompt = `Suggest a full look for a ${answers.occasion || ''} that is ${answers.style || ''}, in ${answers.color || ''} colors, with ${answers.footwear || ''}, ${answers.fit || ''} fit, must include ${answers.musthave || ''}, and within a budget of ${answers.budget || ''}.`;
    onSubmit(prompt);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-md mx-auto p-6 md:p-10 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden min-h-[350px] flex flex-col justify-center">
      <button type="button" onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold">&times;</button>
      <h2 className="text-2xl md:text-3xl font-serif font-semibold mb-8 text-center">Curate My Look</h2>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="flex flex-col gap-6"
        >
          <label className="block text-lg font-medium mb-2 text-center">{questions[step].label}</label>
          <div className="flex flex-wrap justify-center gap-3">
            {questions[step].options.map((opt) => (
              <button
                type="button"
                key={opt}
                className={`px-4 py-2 rounded-full border cursor-pointer transition-all text-base font-light whitespace-nowrap ${answers[questions[step].key] === opt ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                onClick={() => handleSelect(opt)}
                tabIndex={0}
              >
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {step === questions.length - 1 && (
        <button
          type="submit"
          disabled={Object.keys(answers).length < questions.length || submitting}
          className="w-full mt-10 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-semibold text-lg shadow-lg hover:bg-gray-900 dark:hover:bg-gray-200 transition-all disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Get My Look'}
        </button>
      )}
    </form>
  );
} 