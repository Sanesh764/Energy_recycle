/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#053123',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#0f6836',
          800: '#0a4927',
          900: '#06361d',
          950: '#022111',
        },
        surface: {
          canvas: '#fbfbfb',
          card: '#ffffff',
          muted: '#f4f4f5',
          border: '#e4e4e7',
          'border-subtle': '#f0f0f2',
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 3px 1px rgba(0, 0, 0, 0.02)',
        'premium': '0 4px 20px -2px rgba(10, 20, 15, 0.06), 0 2px 6px -1px rgba(10, 20, 15, 0.03)',
        'elevated': '0 12px 36px -4px rgba(10, 20, 15, 0.08), 0 4px 12px -2px rgba(10, 20, 15, 0.04)',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ],
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace'
        ]
      }
    },
  },
  plugins: [],
};
