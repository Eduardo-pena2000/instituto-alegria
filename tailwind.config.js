/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0f3ff',
          100: '#e1e8ff',
          200: '#c3d1ff',
          300: '#94acee',
          400: '#6582d8',
          500: '#4560c0',
          600: '#2d47a0',
          700: '#1e3166',  // Azul marino del logo IEA
          800: '#162248',
          900: '#0e1630',
        },
        gold: {
          // Verde forestal del logo IEA ("Bilingüe" y detalles)
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22a84a',
          600: '#1a8a3c',
          700: '#15742f',
          800: '#166534',  // Verde oscuro del logo
          900: '#14532d',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
