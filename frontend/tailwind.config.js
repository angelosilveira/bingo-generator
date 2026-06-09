/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bingo: {
          blue: '#1a3a6b',
          yellow: '#f5a623',
          light: '#e8f0fe',
        }
      }
    }
  },
  plugins: []
}
