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
        railway: {
          blue: '#0B2545',
          navy: '#13315C',
          lightBlue: '#134074',
          ice: '#EEF4F8',
          saffron: '#FF6F00',
          saffronLight: '#FFE8D6',
          alertRed: '#DC2626',
          cautionYellow: '#D97706',
          safeGreen: '#15803D'
        }
      }
    },
  },
  plugins: [],
}
