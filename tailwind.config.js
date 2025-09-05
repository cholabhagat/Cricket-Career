/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#1a73e8',
        'secondary': '#5f6368',
        'light-grey': '#dadce0',
        'danger': '#d93025',
        'success': '#1e8e3e',
        'warning': '#ff9800',

        'dark-bg': '#202124',
        'dark-card': '#28292d',
        'dark-text': '#e8eaed',
        'dark-secondary-text': '#bdc1c6',
        'dark-border': '#3c4043',
      },
    },
  },
  plugins: [],
}
