/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './lib/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // ── Brand ─────────────────────────────────────────────────────────────
        primary: {
          DEFAULT: '#3E4C8C',
          dark:    '#2E3A6E',
          light:   '#6672AD',
        },
        secondary: {
          DEFAULT: '#5C7A5A',
          dark:    '#46603F',
        },
        accent:    '#E3A83D',
        tertiary:  '#C1694F',

        // ── Finance/HR shell ──────────────────────────────────────────────────
        slate:     '#52607A',

        // ── Neutrals ──────────────────────────────────────────────────────────
        bg:        '#F5F4F1',
        surface:   '#FFFFFF',
        border:    '#E2DFD8',
        ink:       '#1F2430',
        muted:     '#5B5F6B',

        // ── Semantic ──────────────────────────────────────────────────────────
        success:   '#4B8B6F',
        warning:   '#D6923B',
        danger:    '#B24C3E',
        info:      '#3E6FA8',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'sans-serif'],
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        playful: ['"Baloo 2"', 'sans-serif'],
        mono:    ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        lg: '0.625rem',
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card:  '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        modal: '0 20px 60px -12px rgb(0 0 0 / 0.18)',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.25s ease-out',
        'skeleton':   'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:   { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp:  { from: { opacity: 0, transform: 'translateY(8px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        skeleton: { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.4 } },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
