import React from 'react';
import styled from 'styled-components';

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing(3)};
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

const TextInput = ({
  id,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  autoComplete,
  autoCorrect = "off",
  autoCapitalize = "off",
  spellCheck = "false",
  required = false,
  minLength,
  maxLength,
  disabled = false,
  hasError = false,
  ...props
}) => {
  return (
    <Input
      type={type}
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
      maxLength={maxLength}
      disabled={disabled}
      $hasError={hasError}
      {...props}
    />
  );
};

export default TextInput;
