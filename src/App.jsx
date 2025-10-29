import Layout from "./components/Layout";
import AppRoutes from "./Route";
import { UserProvider, useUser } from "./contexts/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";
import NotificationProvider from "./components/NotificationSystem";
import WebSocketErrorHandler from "./components/WebSocketErrorHandler";
import "./lib/supabaseMCP"; // MCP 초기화

/**
 * 로딩 화면 컴포넌트
 */
function LoadingScreen() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#1a1a1a',
      color: 'white',
      fontSize: '18px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: '20px' }}>🔄</div>
        <div>세션을 복원하는 중...</div>
      </div>
    </div>
  );
}

/**
 * 앱 콘텐츠 컴포넌트 (사용자 상태 로딩 완료 후 렌더링)
 */
function AppContent() {
  const { isLoading } = useUser();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

/**
 * 메인 애플리케이션 컴포넌트
 * Layout으로 감싸진 라우팅 구조
 */
function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <NotificationProvider>
          <ErrorBoundary>
            <WebSocketErrorHandler />
            <AppContent />
          </ErrorBoundary>
        </NotificationProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;