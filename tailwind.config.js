/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E8F5F0',
          100: '#C5E6D9',
          200: '#9AD4BE',
          300: '#6BC2A2',
          400: '#3FAF87',
          500: '#1F8A66',
          600: '#0F3D2E',
          700: '#0C3226',
          800: '#09271E',
          900: '#061C15',
        },
      },
    },
  },
  plugins: [],
};
