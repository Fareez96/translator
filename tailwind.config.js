/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef5ff',
          500: '#3b82f6',
          700: '#1d4ed8',
        },
      },
      boxShadow: {
        glass: '0 8px 30px rgba(15, 23, 42, 0.18)',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
