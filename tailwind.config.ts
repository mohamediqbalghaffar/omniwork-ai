import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/renderer/**/*.{html,js,ts,jsx,tsx}',
    './src/renderer/index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        english: ['Inter', 'system-ui', 'sans-serif'],
        kurdish: ['"Noto Sans Arabic"', 'system-ui', 'sans-serif'],
      },
      colors: {
        'bg-primary': '#0f172a',
        'bg-secondary': '#1e293b',
        'accent-blue': '#3b82f6',
        'accent-green': '#22c55e',
        'accent-orange': '#f97316',
        'accent-blue-word': '#2563eb',
        'accent-red': '#ef4444',
      }
    },
  },
  plugins: [],
};

export default config;
