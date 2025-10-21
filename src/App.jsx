import Layout from "./components/Layout";
import AppRoutes from "./Route";
import { UserProvider } from "./contexts/UserContext";
import ErrorBoundary from "./components/ErrorBoundary";
import "./lib/supabaseMCP"; // MCP 초기화

/**
 * 메인 애플리케이션 컴포넌트
 * Layout으로 감싸진 라우팅 구조
 */
function App() {
  return (
    <ErrorBoundary>
      <UserProvider>
        <ErrorBoundary>
          <Layout>
            <AppRoutes />
          </Layout>
        </ErrorBoundary>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;