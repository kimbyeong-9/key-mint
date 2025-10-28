import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import styled from 'styled-components';
import { signUpWithEmail, checkUsernameAvailable, checkEmailAvailable } from '../lib/supabase';
import { validateField, validateSignupForm } from '../lib/formValidation';
import PasswordInput from '../components/PasswordInput';
import InputWithButton from '../components/InputWithButton';
import InputGroup from '../components/InputGroup';
import StatusMessage from '../components/StatusMessage';

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

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2.5)};
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

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 중복 확인 상태
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState(false);
  const [emailChecked, setEmailChecked] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(false);
  const [emailAvailable, setEmailAvailable] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 입력값이 변경되면 중복 확인 상태 초기화
    if (name === 'username') {
      setUsernameChecked(false);
      setUsernameAvailable(false);
    } else if (name === 'email') {
      setEmailChecked(false);
      setEmailAvailable(false);
    }

    // 실시간 유효성 검사
    if (errors[name]) {
      const errorMessage = validateField(name, value, { password: name === 'password' ? value : formData.password });
      if (errorMessage) {
        setErrors({ ...errors, [name]: errorMessage });
      } else {
        const newErrors = { ...errors };
        delete newErrors[name];
        setErrors(newErrors);
      }
    }

    // 비밀번호가 변경되면 비밀번호 확인도 재검증
    if (name === 'password' && formData.confirmPassword) {
      const confirmError = validateField('confirmPassword', formData.confirmPassword, { password: value });
      if (confirmError) {
        setErrors({ ...errors, confirmPassword: confirmError });
      } else {
        const newErrors = { ...errors };
        delete newErrors.confirmPassword;
        setErrors(newErrors);
      }
    }
  };

  // 사용자명 중복 확인
  const handleCheckUsername = async () => {
    if (!formData.username || formData.username.length < 2) {
      setErrors({ ...errors, username: '사용자명을 2자 이상 입력해주세요.' });
      return;
    }

    setCheckingUsername(true);
    try {
      const result = await checkUsernameAvailable(formData.username);

      if (result.available) {
        setUsernameAvailable(true);
        setUsernameChecked(true);
        delete errors.username;
      } else {
        setUsernameAvailable(false);
        setUsernameChecked(true);
        setErrors({ ...errors, username: result.message });
      }
    } catch (error) {
      console.error('사용자명 확인 실패:', error);
      setErrors({ ...errors, username: '중복 확인 중 오류가 발생했습니다.' });
    } finally {
      setCheckingUsername(false);
    }
  };

  // 이메일 중복 확인
  const handleCheckEmail = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      setErrors({ ...errors, email: '올바른 이메일을 입력해주세요.' });
      return;
    }

    setCheckingEmail(true);
    try {
      const result = await checkEmailAvailable(formData.email);

      if (result.available) {
        setEmailAvailable(true);
        setEmailChecked(true);
        delete errors.email;
      } else {
        setEmailAvailable(false);
        setEmailChecked(true);
        setErrors({ ...errors, email: result.message });
      }
    } catch (error) {
      console.error('이메일 확인 실패:', error);
      setErrors({ ...errors, email: '중복 확인 중 오류가 발생했습니다.' });
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 전체 폼 유효성 검사 (validateSignupForm 유틸리티 사용)
    const newErrors = validateSignupForm(formData);

    // 에러 상태 업데이트
    setErrors(newErrors);

    // 에러가 있으면 제출 중단
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      // Supabase Auth 회원가입
      const result = await signUpWithEmail(
        {
          email: formData.email,
          password: formData.password,
        },
        {
          username: formData.username,
        }
      );

      if (result.user) {
        setSuccess('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다...');

        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (error) {
      console.error('❌ 회원가입 실패:', error);

      let errorMessage = '회원가입 중 오류가 발생했습니다.';

      if (error.message?.includes('User already registered') || error.message?.includes('이미 사용 중인')) {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <SignupBox>
        <Title>회원가입</Title>
        <Subtitle>블록체인 기반 NFT 마켓플레이스</Subtitle>

        <Form onSubmit={handleSubmit} autoComplete="off">
          <InputGroup
            label="사용자명"
            htmlFor="username"
            error={errors.username}
            success={usernameChecked && usernameAvailable ? "✅ 사용 가능한 사용자명입니다." : null}
          >
            <InputWithButton
              id="username"
              name="username"
              type="text"
              placeholder="사용자명을 입력하세요"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={20}
              hasError={!!errors.username}
              buttonText={checkingUsername ? '확인 중...' : '중복확인'}
              buttonStatus={usernameChecked ? (usernameAvailable ? false : true) : null}
              onButtonClick={handleCheckUsername}
              buttonDisabled={checkingUsername || formData.username.length < 2}
            />
          </InputGroup>

          <InputGroup
            label="이메일"
            htmlFor="email"
            error={errors.email}
            success={emailChecked && emailAvailable ? "✅ 사용 가능한 이메일입니다." : null}
          >
            <InputWithButton
              id="email"
              name="email"
              type="email"
              placeholder="이메일을 입력하세요"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              required
              hasError={!!errors.email}
              buttonText={checkingEmail ? '확인 중...' : '중복확인'}
              buttonStatus={emailChecked ? (emailAvailable ? false : true) : null}
              onButtonClick={handleCheckEmail}
              buttonDisabled={checkingEmail || !formData.email.includes('@')}
            />
          </InputGroup>

          <InputGroup
            label="비밀번호"
            htmlFor="password"
            error={errors.password}
          >
            <PasswordInput
              id="password"
              name="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              hasError={!!errors.password}
            />
          </InputGroup>

          <InputGroup
            label="비밀번호 확인"
            htmlFor="confirmPassword"
            error={errors.confirmPassword}
          >
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              hasError={!!errors.confirmPassword}
            />
          </InputGroup>

          <StatusMessage type="error">{error}</StatusMessage>
          <StatusMessage type="success">{success}</StatusMessage>

          <Button type="submit" disabled={loading}>
            {loading ? '회원가입 중...' : '회원가입'}
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
