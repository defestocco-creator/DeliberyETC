/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./{App,index}.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-900': '#121212',
        'gray-800': '#1e1e1e',
        'gray-700': '#2d2d2d',
        'gray-600': '#444444',
        'gray-400': '#a0a0a0',
        'gray-100': '#eeeeee',
        'indigo-500': '#6366f1',
        'indigo-600': '#4f46e5',
      }
    },
  },
  plugins: [],
}
