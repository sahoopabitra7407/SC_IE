/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        paper:   '#F6F3EC',
        ink:     '#1F2022',
        lead:    '#4A4A4A',
        rule:    '#D8D4CB',
        leaf:    '#2F6B4F',
        'leaf-light': '#EAF2ED',
        'leaf-mid':   '#5A9C7D',
        amber:   '#B45309',
        'amber-light': '#FEF3C7',
        brick:   '#9E2A2B',
        'brick-light': '#FDECEA',
        // dark-mode surfaces
        'dark-paper': '#161716',
        'dark-surface': '#1E201E',
        'dark-rule': '#2E312E',
        'dark-ink': '#E8E5DD',
        'dark-lead': '#A0A89E',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans:  ['Inter', 'system-ui', 'sans-serif'],
        mono:  ['"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: {
        DEFAULT: '4px',
        sm: '2px',
        md: '4px',
        lg: '6px',
      },
      transitionDuration: {
        DEFAULT: '150ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4,0,0.2,1)',
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(31,32,34,0.08)',
        card:   '0 2px 6px rgba(31,32,34,0.10)',
        lift:   '0 4px 12px rgba(31,32,34,0.12)',
      },
    },
  },
  plugins: [],
}
