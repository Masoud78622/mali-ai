/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      boxShadow: {
        'mds-lift': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'mds-glow': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'mds-premium': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      ringOffsetWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};