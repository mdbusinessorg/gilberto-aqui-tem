import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FF',
          100: '#D9E6FF',
          200: '#B3CCFF',
          300: '#7FA7FF',
          400: '#4A7EF5',
          500: '#1F5AE0',
          600: '#1546B8',
          700: '#103693',
          800: '#0D2A70',
          900: '#0A1F52',
          950: '#061238',
        },
        ink: {
          DEFAULT: '#1B1F29',
          soft: '#4B5563',
          muted: '#6B7280',
        },
        line: '#E5E8EF',
        surface: '#F6F8FB',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.06)',
        pop: '0 12px 32px -8px rgba(16, 24, 40, 0.18)',
      },
      maxWidth: { shell: '1280px' },
    },
  },
  plugins: [],
}
export default config
