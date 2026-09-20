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
        navy: {
          50: '#F0F4F8',
          100: '#D9E2EC',
          800: '#132B45',
          900: '#0B1F33',
          950: '#070F1B',
        },
        ocean: {
          500: '#1591B2',
          600: '#0E7490',
          700: '#08546A',
        },
        tealAccent: {
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0D9488',
        },
        risk: {
          low: '#22C55E',
          medium: '#F59E0B',
          high: '#F97316',
          critical: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        card: '12px',
      }
    },
  },
  plugins: [],
}
