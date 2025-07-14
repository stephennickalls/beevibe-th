// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        'brand-yellow': '#F9E900',
        'brand-yellow-hover': '#E6D200',
        'gray-850': '#1f2937',
        'gray-750': '#374151'
      }
    }
  },
  plugins: []
}