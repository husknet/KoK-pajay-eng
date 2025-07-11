/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',      // App Router pages
    './components/**/*.{js,ts,jsx,tsx}', // If you use component folders
    './lib/**/*.{js,ts,jsx,tsx}',      // For utility code like telegramLogger
  ],
  theme: {
    extend: {
      colors: {
        'light-blue': '#e6f7ff', // Very light blue background
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Use Inter or fallback to sans
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'xl-soft': '0 8px 24px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
