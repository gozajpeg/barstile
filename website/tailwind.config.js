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
        obsidian: {
          950: '#07080A',
          900: '#0B0C0E',
          850: '#111216',
          800: '#17191E',
          700: '#22252C',
        },
        brand: {
          emerald: '#10B981',
          indigo: '#6366F1',
          violet: '#8B5CF6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        display: ['Anton', 'Impact', 'sans-serif'],
      }
    },
  },
  plugins: [],
};
