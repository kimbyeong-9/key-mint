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
      clientPort: 3001,
      timeout: 60000, // 타임아웃 증가
      overlay: true,  // 오류 오버레이 활성화
      reconnect: true // 자동 재연결 활성화
    },
    // WebSocket 연결 안정성을 위한 설정
    watch: {
      usePolling: false,
      interval: 100,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**']
    },
    // WebSocket 연결 재시도 설정
    ws: {
      port: 3001,
      host: 'localhost',
      reconnect: true // WebSocket 재연결 활성화
    }
  }
})
