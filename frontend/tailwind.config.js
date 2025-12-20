/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add custom colors for glass theme
      colors: {
        glass: {
          white: {
            10: 'rgba(255, 255, 255, 0.1)',
            20: 'rgba(255, 255, 255, 0.2)',
            30: 'rgba(255, 255, 255, 0.3)',
            40: 'rgba(255, 255, 255, 0.4)',
            50: 'rgba(255, 255, 255, 0.5)',
            60: 'rgba(255, 255, 255, 0.6)',
            70: 'rgba(255, 255, 255, 0.7)',
          }
        }
      },
      // Add backdrop blur utilities
      backdropBlur: {
        xs: '2px',
      },
      // Add animations
      animation: {
        blob: "blob 7s infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(30px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-20px, 20px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
      },
    },
  },
  plugins: [],
}