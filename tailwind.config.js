/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ink-brown': '#3a2d24',
        'parchment': '#fdf6e3',
        'parchment-highlight': '#fffcf2',
        'gold-leaf': '#b48c2c', // A warm, medieval gold for accents
      },
      fontFamily: {
        'serif': ['"EB Garamond"', 'serif'],
      },
      // Here we define our custom animations
      keyframes: {
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(180, 140, 44, 0.4)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 10px 3px rgba(180, 140, 44, 0.6)' },
        },
      },
      animation: {
        'fade-in-down': 'fadeInDown 1s ease-out forwards',
        'fade-in-up': 'fadeInUp 1s ease-out 0.5s forwards',
        'fade-in': 'fadeIn 1s ease-out forwards',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'reveal-up': 'fadeInUp 0.5s ease-out forwards',
      },
      boxShadow: {
        'glow': '0 0 15px 5px rgba(180, 140, 44, 0.4)',
      },

      transitionProperty: {
        'grid-rows': 'grid-template-rows',
      },
    },
  },
  plugins: [],
}