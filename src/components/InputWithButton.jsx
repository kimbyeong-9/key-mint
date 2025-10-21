import React from 'react';
import styled from 'styled-components';
import TextInput from './TextInput';

const InputContainer = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: ${({ theme }) => theme.spacing(1)};

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    flex-direction: row;
    gap: ${({ theme }) => theme.spacing(1.5)};
    align-items: stretch;
  }
`;

const StyledInput = styled(TextInput)`
  flex: 1;
  width: 100%;
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
  min-width: 90px;
  flex-shrink: 0;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.mobile}) {
    min-width: 100px;
  }
`;

const InputWithButton = ({
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
  buttonText,
  buttonStatus,
  onButtonClick,
  buttonDisabled = false,
  ...props
}) => {
  return (
    <InputContainer>
      <StyledInput
        id={id}
        name={name}
        type={type}
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
        hasError={hasError}
        {...props}
      />
      <CheckButton
        type="button"
        onClick={onButtonClick}
        disabled={buttonDisabled || disabled}
        $status={buttonStatus}
      >
        {buttonText}
      </CheckButton>
    </InputContainer>
  );
};

export default InputWithButton;
