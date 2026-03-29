/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/renderer/**/*.{html,tsx,ts}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
          950: '#0a1929'
        },
        accent: {
          50: '#e6f0ff',
          100: '#b3d1ff',
          200: '#80b3ff',
          300: '#4d94ff',
          400: '#2680ff',
          500: '#0066ff',
          600: '#0052cc',
          700: '#003d99',
          800: '#002966',
          900: '#001433'
        }
      },
      boxShadow: {
        'card': '0 1px 3px rgba(16, 42, 67, 0.08), 0 1px 2px rgba(16, 42, 67, 0.06)',
        'card-hover': '0 4px 12px rgba(16, 42, 67, 0.12), 0 2px 4px rgba(16, 42, 67, 0.08)',
        'elevated': '0 10px 25px rgba(16, 42, 67, 0.15), 0 4px 10px rgba(16, 42, 67, 0.08)'
      }
    }
  },
  plugins: []
}
