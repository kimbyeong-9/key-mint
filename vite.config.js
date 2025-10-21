import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    // 크롬을 기본 브라우저로 설정
    host: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3001,
      clientPort: 3001
    },
    // WebSocket 연결 안정성을 위한 설정
    watch: {
      usePolling: false,
      interval: 100
    }
  }
})
