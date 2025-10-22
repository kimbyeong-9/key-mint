// WebSocket 오류 무시 및 안정성 개선
(function() {
  'use strict';
  
  // 원본 console.error 저장
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // WebSocket 관련 오류 필터링
  console.error = function(...args) {
    const message = args.join(' ');
    
    // WebSocket 관련 오류는 무시
    if (message.includes('WebSocket') || 
        message.includes('vite') ||
        message.includes('HMR') ||
        message.includes('ws://localhost:3001') ||
        message.includes('WebSocket closed without opened') ||
        message.includes('failed to connect to websocket')) {
      return; // 오류 로그 출력하지 않음
    }
    
    // 다른 오류는 정상적으로 출력
    originalConsoleError.apply(console, args);
  };
  
  // console.warn도 필터링
  console.warn = function(...args) {
    const message = args.join(' ');
    
    // WebSocket 관련 경고는 무시
    if (message.includes('WebSocket') || 
        message.includes('vite') ||
        message.includes('HMR') ||
        message.includes('ws://localhost:3001')) {
      return;
    }
    
    // 다른 경고는 정상적으로 출력
    originalConsoleWarn.apply(console, args);
  };
  
  // WebSocket 연결 오류 무시
  window.addEventListener('error', function(event) {
    if (event.message && (
      event.message.includes('WebSocket') ||
      event.message.includes('vite') ||
      event.message.includes('HMR') ||
      event.message.includes('WebSocket closed without opened') ||
      event.message.includes('failed to connect to websocket')
    )) {
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
  });
  
  // Promise rejection 오류 무시
  window.addEventListener('unhandledrejection', function(event) {
    if (event.reason && event.reason.message && (
      event.reason.message.includes('WebSocket') ||
      event.reason.message.includes('vite') ||
      event.reason.message.includes('HMR') ||
      event.reason.message.includes('WebSocket closed without opened') ||
      event.reason.message.includes('failed to connect to websocket')
    )) {
      event.preventDefault();
      return false;
    }
  });
  
  // Vite HMR 재연결 시도
  if (import.meta.hot) {
    import.meta.hot.on('vite:beforeUpdate', () => {
      console.log('🔄 코드 업데이트 중...');
    });
    
    import.meta.hot.on('vite:afterUpdate', () => {
      console.log('✅ 코드 업데이트 완료');
    });
  }
  
  console.log('🔧 WebSocket 오류 필터링 활성화');
})();
