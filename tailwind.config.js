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
        primary: '#2563eb', // Vibrant blue
        secondary: '#f59e0b', // Warm amber
        accent: '#10b981', // Fresh emerald green
        highlight: '#8b5cf6', // Rich purple
        background: '#ffffff', // White
        text: '#1f2937', // Charcoal gray for regular text
        footer: {
          bg: '#1e40af', // Deep blue
          text: '#ffffff', // White
          hover: '#fbbf24', // Bright yellow
        }
      },
    },
  },
  plugins: [],
}; 