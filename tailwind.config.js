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
          '0%, 100%': { filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.5))' },
          '50%': { filter: 'drop-shadow(0 0 24px rgba(255, 255, 255, 0.8))' },
        },
        'spin-slow': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        'spin-slower': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(-360deg)' },
        },
      },
      animation: {
        'text-glow': 'text-glow 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 6s linear infinite',
        'spin-slower': 'spin-slower 9s linear infinite',
      }
    },
  },
  plugins: [],
};