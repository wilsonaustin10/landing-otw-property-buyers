/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7dd3c0', // Seafoam
        secondary: '#ff6b6b', // Coral
        accent: '#1e3a8a', // Navy blue
        highlight: '#fbbf24', // Warm yellow
        background: '#ffffff', // White
        text: '#1f2937', // Charcoal gray for regular text
        footer: {
          bg: '#1e3a8a', // Navy blue
          text: '#ffffff', // White
          hover: '#ff6b6b', // Coral
        }
      },
    },
  },
  plugins: [],
}; 