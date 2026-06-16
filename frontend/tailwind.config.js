/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace']
      },
      colors: {
        ink: {
          50: '#f5f3ef',
          100: '#e8e3d8',
          200: '#d1c9b5',
          300: '#b5a98e',
          400: '#9a8c6e',
          500: '#7d7057',
          600: '#635847',
          700: '#4a4236',
          800: '#322e27',
          900: '#1c1a16',
          950: '#0e0d0b'
        },
        warm: {
          50: '#fdfaf6',
          100: '#f9f3e8',
          200: '#f2e6d0',
          300: '#e8d3b0',
          400: '#d9ba87',
          500: '#c9a060',
          600: '#b58540',
          700: '#8f6730',
          800: '#6b4e25',
          900: '#48351a'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'fade-up': 'fadeUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' }
        },
        shrink: {
          '0%': { width: '100%' },
          '100%': { width: '0%' }
        }
      }
    }
  },
  plugins: []
};