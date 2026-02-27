

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
              // ✅ Khmer font FIRST so Unicode shaping works immediately
        sans: ['"Noto Sans Khmer"', '"Plus Jakarta Sans"', 'sans-serif'],
        khmer: ['"Noto Sans Khmer"', 'sans-serif'],
      },
      colors: {
        brand: {
          blue:   '#3B82F6',
          green:  '#10B981',
          purple: '#9F7AEA',
          orange: '#F97316',
          danger: '#F56565',
        },
      },
      keyframes: {
        slideIn: {
          from: { transform: 'translateX(400px)', opacity: 0 },
          to:   { transform: 'translateX(0)',     opacity: 1 },
        },
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease forwards',
      },
    },
  },
  plugins: [],
}
