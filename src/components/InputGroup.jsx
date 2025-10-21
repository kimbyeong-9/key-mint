import React from 'react';
import styled from 'styled-components';

const InputGroupContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  margin-bottom: ${({ theme }) => theme.spacing(3)};

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    margin-bottom: ${({ theme }) => theme.spacing(2)};
  }
`;

const Label = styled.label`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
  display: block;
`;

const InputGroup = ({ 
  label, 
  htmlFor, 
  children, 
  error, 
  success, 
  className 
}) => {
  return (
    <InputGroupContainer className={className}>
      {label && (
        <Label htmlFor={htmlFor}>
          {label}
        </Label>
      )}
      {children}
      {error && (
        <div style={{ 
          color: 'var(--color-danger)', 
          fontSize: 'var(--font-size-xs)',
          marginTop: 'var(--spacing-0-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-0-5)'
        }}>
          <span>⚠️</span>
          {error}
        </div>
      )}
      {success && (
        <div style={{ 
          color: 'var(--color-success)', 
          fontSize: 'var(--font-size-xs)',
          marginTop: 'var(--spacing-0-5)',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-0-5)'
        }}>
          <span>✅</span>
          {success}
        </div>
      )}
    </InputGroupContainer>
  );
};

export default InputGroup;
