/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif']
      },
      boxShadow: {
        glow: '0 24px 60px rgba(0, 0, 0, 0.45)'
      },
      backgroundImage: {
        'cyber-grid': 'linear-gradient(rgba(87, 215, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(87, 215, 255, 0.05) 1px, transparent 1px)'
      }
    }
  },
  plugins: []
};
