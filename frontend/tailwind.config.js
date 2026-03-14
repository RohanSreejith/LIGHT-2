/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Professional Pastels Theme Colors
        'primary-bg': '#F8F9FB',      // Soft Off-White
        'surface-white': '#FFFFFF',   // Pure White
        'accent-lavender': '#7C3AED', // Action/Neural Link
        'status-online': '#10B981',   // Sage Green
        'text-slate': '#1E293B',      // Deep Slate text
        'border-grey': '#E2E8F0',     // Light Steel Grey
        'text-muted': '#64748B',      // Slate 500 for secondary text
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shatter': 'shatter 0.5s ease-in-out forwards',
      },
      keyframes: {
        shatter: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(1.1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
