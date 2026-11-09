import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2D5A4A',
          hover: '#224438',
          subtle: '#EDF3F0',
        },
        accent: {
          DEFAULT: '#A16207',
          hover: '#854D0E',
          subtle: '#FEF9C3',
        },
        surface: {
          bg: '#F8FAFC',
          card: '#FFFFFF',
          hover: '#F1F5F9',
        },
        text: {
          primary: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
        border: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
        },
        status: {
          safe: '#16A34A',
          'safe-bg': '#F0FDF4',
          'safe-border': '#BBF7D0',
          warning: '#F59E0B',
          'warning-bg': '#FFFBEB',
          'warning-border': '#FDE68A',
          danger: '#DC2626',
          'danger-bg': '#FEF2F2',
          'danger-border': '#FECACA',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'SF Mono', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)',
        card: '0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.04)',
        elevated: '0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04)',
      },
    },
  },
  plugins: [],
} satisfies Config;

