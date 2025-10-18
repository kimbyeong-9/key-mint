import Layout from "./components/Layout";
import AppRoutes from "./Route";

/**
 * 메인 애플리케이션 컴포넌트
 * Layout으로 감싸진 라우팅 구조
 */
function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

export default App;