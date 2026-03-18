/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0F1117',
        bg2: '#181C27',
        bg3: '#1E2336',
        card: '#232840',
        border: '#2E3450',
        border2: '#3A4060',
        accent: '#4ADE80',
        accent2: '#22C55E',
        'accent-dim': '#1A3028',
        'accent-text': '#86EFAC',
        text1: '#F0F4FF',
        text2: '#8B93B0',
        text3: '#555E7A',
      },
    },
  },
  plugins: [],
}
