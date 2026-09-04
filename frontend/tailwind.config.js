/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'bright-gold': {
          50: '#fffce5',
          100: '#fff8cc',
          200: '#fff199',
          300: '#ffeb66',
          400: '#ffe433',
          500: '#ffdd00',
          600: '#ccb100',
          700: '#998500',
          800: '#665800',
          900: '#332c00',
          950: '#241f00',
        },
        brand: {
          50: '#fffce5',
          100: '#fff8cc',
          200: '#fff199',
          300: '#ffeb66',
          400: '#ffe433',
          500: '#ffdd00',
          600: '#ccb100',
          700: '#998500',
          800: '#665800',
          900: '#332c00',
          950: '#241f00',
        },
        dark: {
          50: '#fbfaf5',
          100: '#f5f3e9',
          200: '#eae6d6',
          800: '#222222',
          850: '#1a1a1a',
          900: '#141414',
          950: '#0e0e0e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(255, 221, 0, 0.45)',
        'glow-lg': '0 0 35px -5px rgba(255, 221, 0, 0.6)',
        'card': '0 10px 30px -10px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.7)',
        'gold-sm': '0 2px 10px rgba(255, 221, 0, 0.25)',
        'gold-md': '0 8px 20px -4px rgba(255, 221, 0, 0.35)',
      }
    },
  },
  plugins: [],
}
