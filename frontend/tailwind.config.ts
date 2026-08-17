import type { Config } from 'tailwindcss';

/**
 * Palette is built around the colours you actually see on these trails:
 * volcanic basalt, highland grass, and a deep terracotta accent — the red
 * laterite soil and roads the trail write-ups keep mentioning. A calmer,
 * darker take on an earlier orange/laterite accent that read as too loud
 * the first time round, not a return to it.
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
        /**
         * Cameroon's own red laterite soil — the trail write-ups mention it
         * repeatedly — rather than the plum this replaced, which was picked
         * only for being calmer than an earlier orange, not for meaning
         * anything. Still a genuine complement to forest green on the wheel.
         */
        terracotta: {
          50: '#faf4f0',
          100: '#f2e2da',
          200: '#e6c6b0',
          300: '#d29f7c',
          400: '#bd7850',
          500: '#ad5c39',
          600: '#9c4a2e',
          700: '#7a3a20',
          800: '#61301a',
          900: '#4a2513',
        },
        /**
         * Warm ink-on-paper neutral, not a cool blue-grey — the "topographic"
         * direction: 50 reads as a survey sheet, 950 as ink. 200 and 500 are
         * pinned to exact --rule / --ash values so hairlines and secondary
         * text land on purpose, not by interpolation.
         */
        basalt: {
          50: '#f7f6f0',
          100: '#ece9df',
          200: '#d8d6cc',
          300: '#b8b4a6',
          400: '#93907f',
          500: '#6e736b',
          600: '#565951',
          700: '#3f423c',
          800: '#2b2e28',
          900: '#1e211c',
          950: '#14170f',
        },
        /* Flag of Cameroon: green / red / yellow with a yellow star. */
        cameroon: {
          green: '#007A5E',
          red: '#CE1126',
          yellow: '#FCD116',
        },
        /**
         * Reserved for weather verdicts and hazard warnings — nowhere else.
         * If yellow always means "pay attention," the live-conditions
         * verdict reads at a glance instead of blending into decoration.
         */
        signal: {
          DEFAULT: '#e0a012',
          bg: '#fdf3dc',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SF Mono', 'Consolas', 'monospace'],
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
        /** Nested contour-line rings, the site's topographic motif — used as
         * low-opacity texture behind hero photos, section dividers and empty
         * states. `currentColor` doesn't cross the url() boundary in a
         * background-image, so this ships two fixed-stroke variants instead
         * of one that would silently render black everywhere: `contours` for
         * light/paper surfaces (basalt-200 stroke), `contours-invert` for
         * dark surfaces and photo overlays (white stroke). */
        contours:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Cg fill='none' stroke='%23d8d6cc' stroke-width='1'%3E%3Cpath d='M80,10 C115,10 145,35 148,65 C151,95 125,115 90,112 C55,109 25,90 22,60 C19,35 45,10 80,10 Z'/%3E%3Cpath d='M80,28 C105,28 128,46 130,68 C132,90 112,104 86,102 C60,100 38,86 36,64 C34,46 55,28 80,28 Z'/%3E%3Cpath d='M80,46 C98,46 114,58 115,72 C116,88 102,98 84,96 C66,95 50,85 49,70 C48,58 62,46 80,46 Z'/%3E%3Cpath d='M14,95 C34,90 56,92 62,105 C66,113 55,120 40,119 C25,118 8,110 8,102 C8,98 10,96 14,95 Z'/%3E%3C/g%3E%3C/svg%3E\")",
        'contours-invert':
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='1'%3E%3Cpath d='M80,10 C115,10 145,35 148,65 C151,95 125,115 90,112 C55,109 25,90 22,60 C19,35 45,10 80,10 Z'/%3E%3Cpath d='M80,28 C105,28 128,46 130,68 C132,90 112,104 86,102 C60,100 38,86 36,64 C34,46 55,28 80,28 Z'/%3E%3Cpath d='M80,46 C98,46 114,58 115,72 C116,88 102,98 84,96 C66,95 50,85 49,70 C48,58 62,46 80,46 Z'/%3E%3Cpath d='M14,95 C34,90 56,92 62,105 C66,113 55,120 40,119 C25,118 8,110 8,102 C8,98 10,96 14,95 Z'/%3E%3C/g%3E%3C/svg%3E\")",
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
