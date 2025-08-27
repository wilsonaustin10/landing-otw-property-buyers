/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        primary: '#1e3a8a', // Blue-900
        secondary: '#dc2626', // Red-600
        accent: '#b91c1c', // Red-700
        highlight: '#172554', // Blue-950
        background: '#ffffff', // White
        text: '#333333', // Dark gray for regular text
        footer: {
          bg: '#ffffff',
          text: '#333333', 
          hover: '#1e3a8a',
        }
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      },
    },
  },
  plugins: [],
}; 