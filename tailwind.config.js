/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#10B981',
          light: '#D1FAE5',
        },
        accent: '#F9A825',
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403C',
          800: '#292524',
        },
      },
    },
  },
  plugins: [],
};
