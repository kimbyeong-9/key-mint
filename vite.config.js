import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    open: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 가능
    strictPort: true, // 포트가 사용 중이면 오류 발생
    hmr: false, // HMR 완전 비활성화 (WebSocket 오류 근본 해결)
    watch: {
      usePolling: true, // 파일 시스템 폴링 사용
      interval: 1000, // 폴링 간격 증가
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/.next/**']
    },
    cors: true, // CORS 활성화
    origin: 'http://localhost:3001' // 명시적 origin 설정
  },
  build: {
    sourcemap: false, // 소스맵 비활성화로 빌드 속도 향상
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          wagmi: ['wagmi', 'viem']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@supabase/supabase-js', 'wagmi', 'viem']
  }
})
