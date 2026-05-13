import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FAFAF8',
        'bg-soft': '#FFFFFF',
        ink: '#111111',
        muted: '#7A7A75',
        'muted-2': '#9A9A93',
        line: '#E5E5E5',
        'line-soft': '#EDEDEA',
        pill: '#F0F0EE',
        'pill-hover': '#E8E7E2',
        accent: '#7C2D12',
        'accent-hover': '#5A1F0C',
      },
      fontFamily: {
        sans: ['Geist', 'Söhne', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        body: '-0.005em',
        wordmark: '-0.045em',
      },
      borderRadius: {
        DEFAULT: '4px',
      },
      boxShadow: {
        soft: '0 1px 4px rgba(0,0,0,.06)',
        modal: '0 1px 4px rgba(0,0,0,.06), 0 20px 60px -30px rgba(0,0,0,.18)',
      },
    },
  },
  plugins: [],
};

export default config;
