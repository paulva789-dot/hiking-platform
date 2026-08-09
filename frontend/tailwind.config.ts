import type { Config } from 'tailwindcss';

/**
 * Palette is built around the colours you actually see on these trails:
 * volcanic basalt, highland grass, laterite earth.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f0f7f2',
          100: '#dcece1',
          200: '#bbd9c6',
          300: '#8ebda2',
          400: '#5b9b79',
          500: '#3a7f5d',
          600: '#296549',
          700: '#20513c',
          800: '#1b4131',
          900: '#17362a',
          950: '#0b1e17',
        },
        laterite: {
          50: '#fdf5f0',
          100: '#fae8dc',
          200: '#f4cdb8',
          300: '#ecab8a',
          400: '#e2815a',
          500: '#d9603a',
          600: '#c74a2c',
          700: '#a53a26',
          800: '#863225',
          900: '#6e2c22',
        },
        basalt: {
          50: '#f6f7f8',
          100: '#eceef1',
          200: '#d5dae0',
          300: '#b0bac5',
          400: '#8494a4',
          500: '#657789',
          600: '#516071',
          700: '#424e5c',
          800: '#39424e',
          900: '#333a44',
          950: '#22262d',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
      },
      backgroundImage: {
        'topo-grid':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
      },
    },
  },
  plugins: [],
};

export default config;
