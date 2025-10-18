import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  /* CSS Reset & 기본 설정 */
  :root {
    color-scheme: dark;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }

  body {
    margin: 0;
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.font.family};
    font-size: ${({ theme }) => theme.font.size.md};
    font-weight: ${({ theme }) => theme.font.weight.normal};
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  /* 링크 스타일 */
  a {
    color: inherit;
    text-decoration: none;
    transition: ${({ theme }) => theme.transition.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  }

  /* 버튼 기본 스타일 */
  button {
    font: inherit;
    border: none;
    background: none;
    cursor: pointer;
    transition: ${({ theme }) => theme.transition.normal};

    &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
  }

  /* 인풋 기본 스타일 */
  input, textarea, select {
    font: inherit;
    color: inherit;
    border: none;
    outline: none;
    background: transparent;

    &::placeholder {
      color: ${({ theme }) => theme.colors.textDark};
    }
  }

  /* 이미지 기본 스타일 */
  img {
    max-width: 100%;
    height: auto;
    display: block;
  }

  /* 스크롤바 커스터마이징 */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.bg};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;

    &:hover {
      background: ${({ theme }) => theme.colors.borderLight};
    }
  }

  /* 리스트 스타일 제거 */
  ul, ol {
    list-style: none;
  }

  /* h태그 기본 스타일 */
  h1, h2, h3, h4, h5, h6 {
    font-weight: ${({ theme }) => theme.font.weight.bold};
    line-height: 1.2;
  }

  h1 {
    font-size: ${({ theme }) => theme.font.size.xxl};
  }

  h2 {
    font-size: ${({ theme }) => theme.font.size.xl};
  }

  h3 {
    font-size: ${({ theme }) => theme.font.size.lg};
  }

  /* 셀렉션 스타일 */
  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }

  ::-moz-selection {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.text};
  }

  /* 포커스 아웃라인 */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
`;

export default GlobalStyle;
