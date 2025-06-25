/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        ivory: '#F8F6F3',
        sage: '#C7D2C0',
        blush: '#F3E9E7',
        sand: '#E5DCC3',
        olive: '#B6BFA5',
        blue: '#A7B8C7',
        earth: '#D6CFC7',
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      borderRadius: {
        'xl': '1.25rem',
        '2xl': '2rem',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 24px 0 rgba(60,60,60,0.07)',
        'pill': '0 2px 12px 0 rgba(60,60,60,0.10)',
      },
    },
  },
  plugins: [],
};
