import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // 크롬을 기본 브라우저로 설정
    host: true
  }
})
