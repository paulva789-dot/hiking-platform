import type { Config } from 'tailwindcss';

/**
 * Palette is built around the colours you actually see on these trails:
 * volcanic basalt, highland grass, laterite earth.
 */
const config: Config = {
  darkMode: 'class',
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
        /* Flag of Cameroon: green / red / yellow with a yellow star. */
        cameroon: {
          green: '#007A5E',
          red: '#CE1126',
          yellow: '#FCD116',
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
        'flag-flow': {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'star-twinkle': {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.6', transform: 'scale(0.85) rotate(8deg)' },
        },
        'wave': {
          '0%, 100%': { transform: 'translateY(0) skewX(0deg)' },
          '50%': { transform: 'translateY(-2px) skewX(-1deg)' },
        },
        'locate-pulse': {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        'cloud-drift': {
          '0%': { transform: 'translateX(-10%)' },
          '100%': { transform: 'translateX(110%)' },
        },
        'water-glint': {
          '0%': { transform: 'translateX(-30%) skewX(-12deg)' },
          '100%': { transform: 'translateX(130%) skewX(-12deg)' },
        },
        'water-bob': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(3%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        shimmer: 'shimmer 1.6s infinite',
        'flag-flow': 'flag-flow 6s linear infinite',
        'star-twinkle': 'star-twinkle 2.4s ease-in-out infinite',
        wave: 'wave 3s ease-in-out infinite',
        'locate-pulse': 'locate-pulse 1.8s ease-out infinite',
        'cloud-drift-slow': 'cloud-drift 38s linear infinite',
        'cloud-drift-fast': 'cloud-drift 24s linear infinite',
        'water-glint': 'water-glint 5s ease-in-out infinite',
        'water-bob': 'water-bob 4s ease-in-out infinite',
      },
      backgroundImage: {
        'topo-grid':
          'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)',
        'flag-gradient':
          'linear-gradient(90deg, #007A5E 0%, #007A5E 33%, #CE1126 33%, #CE1126 66%, #FCD116 66%, #FCD116 100%)',
        'flag-flow-gradient':
          'linear-gradient(90deg, #007A5E, #CE1126, #FCD116, #007A5E, #CE1126, #FCD116)',
      },
    },
  },
  plugins: [],
};

export default config;
