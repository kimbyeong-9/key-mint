import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAccount } from 'wagmi';
import { useRegister } from '../hooks/useUserRegistry';
import { signUpWithEmail, checkUserByEmail, checkUserByUsername } from '../lib/supabase';

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

const SignupBox = styled.div`
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

const WalletInfo = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => `${theme.colors.primary}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.primary}40`};
  border-radius: ${({ theme }) => theme.radius.md};
  margin-bottom: ${({ theme }) => theme.spacing(3)};
  text-align: center;

  p {
    font-size: ${({ theme }) => theme.font.size.sm};
    color: ${({ theme }) => theme.colors.textSub};
    margin-bottom: ${({ theme }) => theme.spacing(1)};
  }

  strong {
    font-size: ${({ theme }) => theme.font.size.md};
    color: ${({ theme }) => theme.colors.primary};
    word-break: break-all;
  }
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
  border: 1px solid ${({ theme, $hasError }) => $hasError ? theme.colors.danger : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};
  width: 100%;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => $hasError ? theme.colors.danger : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => $hasError ? `${theme.colors.danger}20` : `${theme.colors.primary}20`};
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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.hover};
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadow.primary};
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const Info = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => `${theme.colors.secondary}15`};
  border: 1px solid ${({ theme }) => `${theme.colors.secondary}40`};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.colors.textSub};
  line-height: 1.6;

  strong {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;


const InputWithButton = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  align-items: flex-start;

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing(1.5)};
  }
`;

const PasswordInputContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const PasswordToggleButton = styled.button`
  position: absolute;
  right: ${({ theme }) => theme.spacing(1)};
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSub};
  cursor: pointer;
  padding: ${({ theme }) => theme.spacing(0.5)};
  border-radius: ${({ theme }) => theme.radius.sm};
  transition: ${({ theme }) => theme.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  width: 32px;
  height: 32px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.card};
  }

  &:focus {
    outline: none;
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.card};
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const CheckButton = styled.button`
  padding: ${({ theme }) => theme.spacing(1.5)} ${({ theme }) => theme.spacing(2)};
  background: ${({ $status, theme }) => {
    if ($status === false) return theme.colors.success;
    if ($status === true) return theme.colors.danger;
    return theme.colors.primary;
  }};
  color: white;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transition.fast};
  white-space: nowrap;
  min-width: 80px;

  &:hover:not(:disabled) {
    opacity: 0.8;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100%;
    min-width: unset;
  }
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};

  &::before {
    content: '⚠️';
    font-size: 12px;
  }
`;

const SuccessMessage = styled.div`
  color: ${({ theme }) => theme.colors.success};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(0.5)};

  &::before {
    font-size: 12px;
  }
`;

const LoginLink = styled.div`
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


function Signup() {
  const navigate = useNavigate();
  const { address } = useAccount();
  const { register, isPending, isConfirming, isSuccess, error } = useRegister();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [duplicateChecks, setDuplicateChecks] = useState({
    username: null, // null: 미확인, true: 중복, false: 사용가능
    email: null
  });
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState({
    username: false,
    email: false
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
    
    // 실시간 유효성 검사
    if (errors[name]) {
      validateField(name, type === 'checkbox' ? checked : value);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // 필드별 유효성 검사
  const validateField = (fieldName, value) => {
    const newErrors = { ...errors };
    
    switch (fieldName) {
      case 'username':
        if (!value) {
          newErrors.username = '사용자명을 입력해주세요.';
        } else if (value.length < 2) {
          newErrors.username = '사용자명은 2자 이상이어야 합니다.';
        } else if (value.length > 20) {
          newErrors.username = '사용자명은 20자 이하여야 합니다.';
        } else if (!/^[a-zA-Z0-9가-힣_]+$/.test(value)) {
          newErrors.username = '사용자명은 영문, 한글, 숫자, 언더스코어만 사용 가능합니다.';
        } else {
          delete newErrors.username;
        }
        break;
        
        
      case 'email':
        if (!value) {
          newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = '올바른 이메일 형식을 입력해주세요.';
        } else {
          delete newErrors.email;
        }
        break;
        
      case 'password':
        if (!value) {
          newErrors.password = '비밀번호를 입력해주세요.';
        } else if (value.length < 8) {
          newErrors.password = '비밀번호는 8자 이상이어야 합니다.';
        } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
          newErrors.password = '비밀번호는 영문과 숫자를 포함해야 합니다.';
        } else {
          delete newErrors.password;
        }
        break;
        
      case 'confirmPassword':
        if (!value) {
          newErrors.confirmPassword = '비밀번호 확인을 입력해주세요.';
        } else if (value !== formData.password) {
          newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        } else {
          delete newErrors.confirmPassword;
        }
        break;
        
    }
    
    setErrors(newErrors);
  };

  // 중복 확인 함수
  const checkDuplicate = async (type) => {
    if (type === 'username' && !formData.username) {
      return;
    }
    if (type === 'email' && !formData.email) {
      return;
    }

    setIsCheckingDuplicate(prev => ({ ...prev, [type]: true }));

    try {
      let result;
      if (type === 'username') {
        result = await checkUserByUsername(formData.username);
      } else if (type === 'email') {
        result = await checkUserByEmail(formData.email);
      }

      if (result) {
        setDuplicateChecks(prev => ({ ...prev, [type]: true }));
      } else {
        setDuplicateChecks(prev => ({ ...prev, [type]: false }));
      }
    } catch (error) {
      console.error(`${type} 중복 확인 오류:`, error);
    } finally {
      setIsCheckingDuplicate(prev => ({ ...prev, [type]: false }));
    }
  };

  // 전체 폼 유효성 검사
  const validateForm = () => {
    const newErrors = {};
    
    // 각 필드 검사
    Object.keys(formData).forEach(field => {
      validateField(field, formData[field]);
    });
    
    // 중복 확인 검사
    if (duplicateChecks.username === true) {
      newErrors.username = '이미 사용 중인 사용자명입니다.';
    }
    if (duplicateChecks.email === true) {
      newErrors.email = '이미 사용 중인 이메일입니다.';
    }
    
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 폼 유효성 검사
    if (!validateForm()) {
      return;
    }

    try {
      // 1단계: 이메일 중복 체크
      const existingEmail = await checkUserByEmail(formData.email);
      if (existingEmail) {
        return;
      }

      // 1.5단계: 사용자명 중복 체크
      const existingUsername = await checkUserByUsername(formData.username);
      if (existingUsername) {
        return;
      }

      // 2단계: Supabase에 일반 사용자 정보 저장
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password, // 실제로는 해시화 필요
        address: address || null, // 지갑 연결된 경우에만
        wallet_address: address || null, // 호환성
        is_web3_user: !!address // 지갑 연결 여부에 따라 결정
      };

      console.log('🔍 회원가입 데이터:', userData);
      
      // Supabase Auth를 사용한 회원가입
      const authResult = await signUpWithEmail(
        {
          email: formData.email,
          password: formData.password,
        },
        {
          username: formData.username,
          address: address || null,
        }
      );
      
      console.log('Auth 회원가입 성공:', authResult);

      // 3초 후 로그인 페이지로 이동
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('회원가입 오류:', error);
    }
  };

  // 트랜잭션 성공 시
  if (isSuccess) {
    setTimeout(() => {
      alert('회원가입이 완료되었습니다!');
      navigate('/');
    }, 2000);
  }

  return (
    <Container>
      <SignupBox>
        <Title>회원가입</Title>
        <Subtitle>블록체인 기반 NFT 마켓플레이스</Subtitle>

        <Form onSubmit={handleSubmit} autoComplete="off">
          <InputGroup>
            <Label htmlFor="username">사용자명</Label>
            <InputWithButton>
              <Input
                type="text"
                id="username"
                name="username"
                placeholder="사용자명을 입력하세요"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={20}
                $hasError={!!errors.username}
              />
              <CheckButton
                type="button"
                onClick={() => checkDuplicate('username')}
                disabled={isCheckingDuplicate.username || !formData.username}
                $status={duplicateChecks.username}
              >
                {isCheckingDuplicate.username ? '확인중...' : 
                 duplicateChecks.username === false ? '✓' : 
                 duplicateChecks.username === true ? '✗' : '중복확인'}
              </CheckButton>
            </InputWithButton>
            {errors.username && <ErrorMessage>{errors.username}</ErrorMessage>}
            {duplicateChecks.username === false && (
              <SuccessMessage>사용 가능한 사용자명입니다!</SuccessMessage>
            )}
            {duplicateChecks.username === true && (
              <ErrorMessage>이미 사용 중인 사용자명입니다.</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="email">이메일</Label>
            <InputWithButton>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="이메일을 입력하세요"
                value={formData.email}
                onChange={handleChange}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                $hasError={!!errors.email}
              />
              <CheckButton
                type="button"
                onClick={() => checkDuplicate('email')}
                disabled={isCheckingDuplicate.email || !formData.email}
                $status={duplicateChecks.email}
              >
                {isCheckingDuplicate.email ? '확인중...' : 
                 duplicateChecks.email === false ? '✓' : 
                 duplicateChecks.email === true ? '✗' : '중복확인'}
              </CheckButton>
            </InputWithButton>
            {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}
            {duplicateChecks.email === false && (
              <SuccessMessage>사용 가능한 이메일입니다!</SuccessMessage>
            )}
            {duplicateChecks.email === true && (
              <ErrorMessage>이미 사용 중인 이메일입니다.</ErrorMessage>
            )}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="password">비밀번호</Label>
            <PasswordInputContainer>
              <Input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                placeholder="비밀번호를 입력하세요"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                minLength={8}
                $hasError={!!errors.password}
              />
              <PasswordToggleButton
                type="button"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </PasswordToggleButton>
            </PasswordInputContainer>
            {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}
          </InputGroup>

          <InputGroup>
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <PasswordInputContainer>
              <Input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                placeholder="비밀번호를 다시 입력하세요"
                value={formData.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                required
                $hasError={!!errors.confirmPassword}
              />
              <PasswordToggleButton
                type="button"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showConfirmPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </PasswordToggleButton>
            </PasswordInputContainer>
            {errors.confirmPassword && <ErrorMessage>{errors.confirmPassword}</ErrorMessage>}
          </InputGroup>




          {error && (
            <StatusMessage $type="error">
              블록체인 에러: {error.message}
            </StatusMessage>
          )}

          <Button
            type="submit"
            disabled={isPending || isConfirming || isSuccess}
          >
            {isPending || isConfirming ? '등록 중...' : isSuccess ? '완료!' : '회원가입'}
          </Button>
        </Form>

        <LoginLink>
          이미 계정이 있으신가요?
          <Link to="/login">로그인</Link>
        </LoginLink>
      </SignupBox>
    </Container>
  );
}

export default Signup;
