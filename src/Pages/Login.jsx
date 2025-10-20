import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useUser } from '../contexts/UserContext';
import { signInWithEmail } from '../lib/supabase';

const Container = styled.div`
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing(4)} ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(2)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)};
    align-items: flex-start;
  }
`;

const LoginBox = styled.div`
  width: 100%;
  max-width: 480px;
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  padding: ${({ theme }) => theme.spacing(4)};
  box-shadow: ${({ theme }) => theme.shadow.lg};

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing(3)};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing(2)};
    border-radius: ${({ theme }) => theme.radius.md};
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.font.size.xxl};
  font-weight: ${({ theme }) => theme.font.weight.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.textSub};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
`;

const Input = styled.input`
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}20`};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textDark};
  }
`;

const Button = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.primary};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
  margin: ${({ theme }) => theme.spacing(2)} 0;

  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }

  span {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textSub};
  }
`;

const GoogleButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1.5)};
  background: ${({ theme }) => theme.colors.bgLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.normal};

  &:hover {
    background: ${({ theme }) => theme.colors.card};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const LinkGroup = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledLink = styled(Link)`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  transition: ${({ theme }) => theme.transition.fast};

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const SignupLink = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing(3)};
  padding-top: ${({ theme }) => theme.spacing(3)};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: ${({ theme }) => theme.font.weight.semibold};
    margin-left: ${({ theme }) => theme.spacing(1)};

    &:hover {
      text-decoration: underline;
    }
  }
`;

function Login() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 필드 초기화
  useEffect(() => {
    setEmail('');
    setPassword('');
    
    // DOM이 렌더링된 후 필드 값 강제 초기화
    const timer = setTimeout(() => {
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      
      if (emailInput) {
        emailInput.value = '';
        emailInput.setAttribute('autocomplete', 'new-email');
      }
      if (passwordInput) {
        passwordInput.value = '';
        passwordInput.setAttribute('autocomplete', 'new-password');
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 로그인 시도:', { email });

      // Supabase Auth를 사용한 로그인
      const authResult = await signInWithEmail(email, password);
      
      if (authResult.user) {
        console.log('✅ Auth 로그인 성공:', authResult.user);
        
        // 사용자 정보를 UserContext에 설정
        const userData = {
          id: authResult.user.id,
          email: authResult.user.email,
          username: authResult.user.user_metadata?.username || 'Unknown',
          address: authResult.user.user_metadata?.address || null,
          wallet_address: authResult.user.user_metadata?.wallet_address || null,
          is_web3_user: authResult.user.user_metadata?.is_web3_user || false,
          created_at: authResult.user.created_at,
        };

        // UserContext의 setUser 함수 호출
        setUser(userData);
        
        alert(`로그인 성공! 환영합니다, ${userData.username}님!`);
        navigate('/');
      } else {
        alert('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
      }
    } catch (error) {
      console.error('❌ 로그인 오류:', error);
      
      // Supabase Auth 오류 메시지 처리
      let errorMessage = '로그인에 실패했습니다.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
      } else if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        errorMessage = '이메일 인증이 필요합니다. 잠시 후 다시 시도해주세요.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
      } else {
        errorMessage = `로그인 오류: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    // TODO: 구글 소셜 로그인 연동
    try {
      // Vercel API로 OAuth 요청
      window.location.href = '/api/auth/google';
    } catch (error) {
      console.error('Google login error:', error);
      alert('구글 로그인에 실패했습니다.');
    }
  };

  return (
    <Container>
      <LoginBox>
        <Title>로그인</Title>
        <Subtitle>Key Mint에 오신 것을 환영합니다</Subtitle>

        <Form 
          onSubmit={handleSubmit} 
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
        >
          {/* 더미 필드로 자동완성 혼란시키기 */}
          <div style={{ display: 'none' }}>
            <input type="text" name="fake-username" autoComplete="username" />
            <input type="password" name="fake-password" autoComplete="current-password" />
          </div>
          
          <InputGroup>
            <Label htmlFor="email">이메일</Label>
            <Input
              type="email"
              id="email"
              name="login-email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="new-email"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              required
            />
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">비밀번호</Label>
            <Input
              type="password"
              id="password"
              name="login-password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore="true"
              required
            />
          </InputGroup>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? '로그인 중...' : '로그인'}
          </Button>

          {error && (
            <div style={{ 
              color: '#ef4444', 
              fontSize: '14px', 
              textAlign: 'center', 
              marginTop: '10px',
              padding: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px'
            }}>
              {error}
            </div>
          )}

          <LinkGroup>
            <StyledLink to="#">아이디 찾기</StyledLink>
            <StyledLink to="#">비밀번호 찾기</StyledLink>
          </LinkGroup>
        </Form>

        <Divider>
          <span>또는</span>
        </Divider>

        <GoogleButton onClick={handleGoogleLogin}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
            <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
            <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC05"/>
            <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
          </svg>
          구글로 로그인
        </GoogleButton>

        <Divider>
          <span>또는</span>
        </Divider>

        <div style={{ textAlign: 'center' }}>
          <ConnectButton />
        </div>

        <SignupLink>
          계정이 없으신가요?
          <Link to="/signup">회원가입</Link>
        </SignupLink>
      </LoginBox>
    </Container>
  );
}

export default Login;
