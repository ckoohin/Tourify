/** @type {import('tailwindcss').Config} */
export default {
  // Đây là phần quan trọng nhất
  // Nó báo cho Tailwind quét TẤT CẢ các file .html, .jsx, .js
  // trong dự án để tìm các class (như 'bg-midnight', 'text-white')
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: '#0F172A', // Xanh than chủ đạo
        primary: '#3B82F6',  // Xanh dương điểm nhấn
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}