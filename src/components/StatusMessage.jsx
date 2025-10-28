import styled from 'styled-components';

const Message = styled.div`
  padding: ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.md};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  text-align: center;

  ${({ $type, theme }) => {
    if ($type === 'error') {
      return `
        background: ${theme.colors.danger}15;
        color: ${theme.colors.danger};
        border: 1px solid ${theme.colors.danger}40;
      `;
    } else if ($type === 'success') {
      return `
        background: ${theme.colors.success}15;
        color: ${theme.colors.success};
        border: 1px solid ${theme.colors.success}40;
      `;
    } else if ($type === 'warning') {
      return `
        background: ${theme.colors.warning}15;
        color: ${theme.colors.warning};
        border: 1px solid ${theme.colors.warning}40;
      `;
    } else if ($type === 'info') {
      return `
        background: ${theme.colors.primary}15;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary}40;
      `;
    }
  }}
`;

function StatusMessage({ type = 'info', children }) {
  if (!children) return null;

  return <Message $type={type}>{children}</Message>;
}

export default StatusMessage;
