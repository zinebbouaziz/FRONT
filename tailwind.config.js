/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors extracted from design reference
        brand: {
          50: '#f0edff',
          100: '#e0dbff',
          200: '#c2b7ff',
          300: '#a393ff',
          400: '#846fff',
          500: '#6550e8',  // primary purple
          600: '#5240ca',
          700: '#3f30ac',
          800: '#2d2090',
          900: '#1c1274',
        },
        accent: {
          blue: '#4f8ef7',
          purple: '#8b5cf6',
          indigo: '#6366f1',
        },
        surface: {
          DEFAULT: '#ffffff',
          secondary: '#f8f9fc',
          tertiary: '#f0f2f8',
          border: '#e4e7f0',
          'border-light': '#eef0f8',
        },
        dark: {
          bg: '#0f1117',
          surface: '#1a1d26',
          card: '#1e2130',
          border: '#2a2d3e',
          'border-light': '#323650',
        },
        text: {
          primary: '#1a1d2e',
          secondary: '#6b7194',
          tertiary: '#9ba3c4',
          muted: '#b8bdd6',
        },
        status: {
          active: '#22c55e',
          'active-bg': '#dcfce7',
          archived: '#94a3b8',
          'archived-bg': '#f1f5f9',
          pending: '#f59e0b',
          'pending-bg': '#fef3c7',
          accepted: '#10b981',
          'accepted-bg': '#d1fae5',
          rejected: '#ef4444',
          'rejected-bg': '#fee2e2',
        }
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-sora)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'sidebar': '1px 0 0 0 #e4e7f0',
        'modal': '0 20px 60px rgba(0,0,0,0.15)',
        'brand': '0 4px 14px rgba(101, 80, 232, 0.25)',
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
    },
  },
  plugins: [],
};
