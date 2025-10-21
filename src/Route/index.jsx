import { Routes, Route, Navigate } from "react-router-dom";

// 페이지 import
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import Home from "../Pages/Home";
import Detail from "../Pages/Detail";
import Create from "../Pages/Create";
import Checkout from "../Pages/Checkout";
import PaymentSuccess from "../Pages/PaymentSuccess";
import PaymentFail from "../Pages/PaymentFail";
import Portfolio from "../Pages/Portfolio";
import PurchaseHistory from "../Pages/PurchaseHistory";

// 🔥 테스트용 간단한 회원가입/로그인
import SignupSimple from "../Pages/Signup-simple";
import LoginSimple from "../Pages/Login-simple";

/**
 * 애플리케이션 라우팅 설정
 * React Router v6 사용
 */
function AppRoutes() {
  return (
    <Routes>
      {/* 홈 페이지 */}
      <Route path="/" element={<Home />} />

      {/* 🔥 테스트용 간단한 회원가입/로그인 */}
      <Route path="/signup-test" element={<SignupSimple />} />
      <Route path="/login-test" element={<LoginSimple />} />

      {/* 인증 페이지 */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

            {/* NFT 관련 페이지 */}
            <Route path="/item/:id" element={<Detail />} />
            <Route path="/create" element={<Create />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/purchases" element={<PurchaseHistory />} />

      {/* 결제 페이지 */}
      <Route path="/checkout/:listingId" element={<Checkout />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/fail" element={<PaymentFail />} />

      {/* 404 페이지 - 홈으로 리다이렉트 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;