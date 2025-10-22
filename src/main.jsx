import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { ThemeProvider } from 'styled-components';

import App from './App.jsx';
import { config } from './lib/wagmi.js';
import GlobalStyle from './styles/GlobalStyle.js';
import theme from './styles/theme.js';

// WebSocket 오류 수정 스크립트 로드
import './lib/websocket-fix.js';

// RainbowKit 스타일
import '@rainbow-me/rainbowkit/styles.css';
// RainbowKit 커스텀 스타일 (지갑 주소 숨기기)
import './styles/rainbowkit-custom.css';

// React Query 클라이언트
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// RainbowKit 커스텀 테마
const customTheme = darkTheme({
  accentColor: theme.colors.primary,
  accentColorForeground: 'white',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          <ThemeProvider theme={theme}>
            <GlobalStyle />
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
