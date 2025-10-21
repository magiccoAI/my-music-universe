/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      textShadow: {
        'glow': '0 0 80px rgba(128, 0, 128, 0.8), 0 0 30px rgba(255, 0, 255, 0.6)',
      },
      keyframes: {
        'text-glow': {
          '0%, 100%': { textShadow: '0 0 80px rgba(128, 0, 128, 0.8), 0 0 30px rgba(255, 0, 255, 0.6)' },
          '50%': { textShadow: '0 0 90px rgba(0, 128, 128, 0.9), 0 0 40px rgba(0, 255, 255, 0.7)' },
        }
      },
      animation: {
        'text-glow': 'text-glow 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
};