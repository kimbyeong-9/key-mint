import React from 'react';
import styled from 'styled-components';

const ErrorContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.bg};
  text-align: center;
`;

const ErrorTitle = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const ErrorMessage = styled.p`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.colors.textSub};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  max-width: 600px;
  line-height: 1.6;
`;

const RetryButton = styled.button`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(4)};
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-2px);
  }
`;

const ErrorDetails = styled.details`
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  text-align: left;
  max-width: 800px;
  width: 100%;

  summary {
    cursor: pointer;
    font-weight: ${({ theme }) => theme.font.weight.semibold};
    color: ${({ theme }) => theme.colors.text};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  pre {
    background: ${({ theme }) => theme.colors.card};
    padding: ${({ theme }) => theme.spacing(2)};
    border-radius: ${({ theme }) => theme.radius.sm};
    overflow-x: auto;
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textSub};
    white-space: pre-wrap;
    word-break: break-word;
  }
`;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // 다음 렌더링에서 폴백 UI가 보이도록 상태를 업데이트합니다.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 에러 로깅 서비스에 에러를 기록할 수 있습니다.
    console.error('❌ ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorContainer>
          <ErrorTitle>🚨 오류가 발생했습니다</ErrorTitle>
          <ErrorMessage>
            애플리케이션에서 예상치 못한 오류가 발생했습니다.<br />
            페이지를 새로고침하거나 잠시 후 다시 시도해주세요.
          </ErrorMessage>
          
          <RetryButton onClick={this.handleRetry}>
            🔄 페이지 새로고침
          </RetryButton>

          {this.state.error && (
            <ErrorDetails>
              <summary>🔍 기술적 세부사항 (개발자용)</summary>
              <pre>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </ErrorDetails>
          )}
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
