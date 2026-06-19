/** @type {import('tailwindcss').Config} */
module.exports = {
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
        dark: {
          900: '#0a0a0a',
          800: '#111111',
          700: '#1a1a1a',
          600: '#2a2a2a',
          500: '#3a3a3a',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        shimmer: 'shimmer 2s linear infinite',
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
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
