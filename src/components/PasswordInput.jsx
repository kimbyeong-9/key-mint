import React, { useState } from 'react';
import styled from 'styled-components';

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
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
  padding-right: 48px; /* 버튼을 위한 공간 확보 */
  border: 1px solid ${({ theme, $hasError }) => 
    $hasError ? theme.colors.error : theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.base};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: ${({ theme }) => theme.transition.fast};

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) => 
      $hasError ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme, $hasError }) => 
      $hasError ? theme.colors.errorLight : theme.colors.primaryLight};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSub};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.disabled};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const PasswordInput = ({
  id,
  name,
  placeholder = "비밀번호를 입력하세요",
  value,
  onChange,
  onBlur,
  autoComplete = "new-password",
  autoCorrect = "off",
  autoCapitalize = "off",
  spellCheck = "false",
  required = false,
  minLength,
  disabled = false,
  hasError = false,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <PasswordInputContainer>
      <Input
        type={showPassword ? "text" : "password"}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        autoComplete={autoComplete}
        autoCorrect={autoCorrect}
        autoCapitalize={autoCapitalize}
        spellCheck={spellCheck}
        required={required}
        minLength={minLength}
        disabled={disabled}
        $hasError={hasError}
        {...props}
      />
      <PasswordToggleButton
        type="button"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
        disabled={disabled}
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
  );
};

export default PasswordInput;
