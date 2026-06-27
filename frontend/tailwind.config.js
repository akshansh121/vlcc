/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          50: '#fdf9e7',
          100: '#faf0c0',
          200: '#f5e17b',
          300: '#f0d050',
          400: '#e8c11c',
          500: '#D4AF37',
          600: '#c49b2a',
          700: '#a67c20',
          800: '#7d5d17',
          900: '#5c420f',
        },
        // Warm champagne highlight for gradients & sheens
        champagne: {
          200: '#fdf0a0',
          300: '#f7e08a',
          400: '#f0d050',
        },
        // Soft rose — secondary accent / light-mode primary
        blush: {
          300: '#fda4af',
          400: '#fb7185',
          500: '#f43f5e',
          600: '#e11d48',
        },
        dark: {
          900: 'rgb(var(--dark-900) / <alpha-value>)',
          800: 'rgb(var(--dark-800) / <alpha-value>)',
          700: 'rgb(var(--dark-700) / <alpha-value>)',
          600: 'rgb(var(--dark-600) / <alpha-value>)',
          500: 'rgb(var(--dark-500) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.28em',
      },
      boxShadow: {
        gold: '0 10px 30px -10px rgba(212, 175, 55, 0.45)',
        'gold-lg': '0 20px 50px -12px rgba(212, 175, 55, 0.55)',
        glow: '0 0 0 1px rgba(212,175,55,0.15), 0 8px 40px -8px rgba(212,175,55,0.35)',
        'premium': '0 24px 60px -20px rgba(0, 0, 0, 0.7)',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)',
        silk: 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
      backgroundSize: {
        '200': '200% auto',
        '300': '300% 300%',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        shimmer: 'shimmer 2s linear infinite',
        'shimmer-slow': 'shimmer 6s linear infinite',
        float: 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite',
        'gradient-pan': 'gradientPan 8s ease infinite',
        'ken-burns': 'kenBurns 20s ease-out forwards',
        'spin-slow': 'spin 14s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.35', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.08)' },
        },
        gradientPan: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.12) translate(-1.5%, -1.5%)' },
        },
      },
    },
  },
  plugins: [],
}
