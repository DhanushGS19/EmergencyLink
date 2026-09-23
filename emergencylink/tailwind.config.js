/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        emergency: {
          red: '#dc2626',
          dark: '#0f172a',
          blue: '#2563eb'
        }
      }
    },
  },
  plugins: [],
}
