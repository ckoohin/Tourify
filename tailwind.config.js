/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Quét tất cả các file React
  ],
  theme: {
    extend: {
      // Cấu hình màu và font chữ tùy chỉnh
      colors: {
        midnight: '#0F172A', // Xanh than chủ đạo
        primary: '#3B82F6',  // Xanh dương điểm nhấn
      },
      fontFamily: {
        // Đặt font Inter làm font chữ mặc định
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [
     import('@tailwindcss/forms'),
  ],
}