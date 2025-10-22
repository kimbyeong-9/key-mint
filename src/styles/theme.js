// 프로젝트 테마 설정
// 주요 색상: #00539C (블루), #EEA47F (오렌지), 검은색, 흰색, 그레이
export default {
  colors: {
    // 메인 컬러
    primary: "#00539C",      // 메인 블루
    secondary: "#EEA47F",    // 메인 오렌지

    // 배경
    bg: "#0a0a0a",          // 다크 블랙
    bgLight: "#1a1a1a",     // 라이트 블랙
    card: "#161616",        // 카드 배경

    // 텍스트
    text: "#ffffff",        // 화이트
    textSub: "#a0a0a0",     // 그레이
    textDark: "#707070",    // 다크 그레이

    // 보더/구분선
    border: "#2a2a2a",      // 다크 그레이
    borderLight: "#3a3a3a", // 라이트 그레이

    // 상태 컬러
    success: "#2ecc71",     // 성공
    danger: "#ff6b6b",      // 에러/위험
    warning: "#f39c12",     // 경고
    info: "#3498db",        // 정보

    // 호버 상태
    hover: "#003d7a",       // primary 호버
    hoverSecondary: "#d98d67", // secondary 호버
    warningHover: "#d97706"  // warning 호버
  },

  // 폰트
  font: {
    family: "'Inter', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    size: {
      xs: "12px",
      sm: "14px",
      md: "16px",
      lg: "18px",
      xl: "24px",
      xxl: "32px"
    },
    weight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    }
  },

  // 간격
  spacing: (n) => `${n * 8}px`,

  // 보더 반경
  radius: {
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "24px",
    round: "50%"
  },

  // 그림자
  shadow: {
    sm: "0 2px 8px rgba(0, 0, 0, 0.1)",
    md: "0 4px 16px rgba(0, 0, 0, 0.2)",
    lg: "0 8px 32px rgba(0, 0, 0, 0.3)",
    primary: "0 4px 20px rgba(0, 83, 156, 0.3)",
    secondary: "0 4px 20px rgba(238, 164, 127, 0.3)"
  },

  // 트랜지션
  transition: {
    fast: "0.15s ease",
    normal: "0.3s ease",
    slow: "0.5s ease"
  },

  // 브레이크포인트
  breakpoints: {
    mobile: "480px",
    tablet: "768px",
    desktop: "1024px",
    wide: "1280px"
  }
};
