import styled from 'styled-components';

const Badge = styled.span`
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${({ theme }) => theme.radius.full};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};

  ${({ $status, theme }) => {
    switch ($status) {
      case 'completed':
        return `
          background: #10B981;
          color: white;
        `;
      case 'pending':
        return `
          background: #F59E0B;
          color: white;
        `;
      case 'failed':
        return `
          background: #EF4444;
          color: white;
        `;
      default:
        return `
          background: ${theme.colors.bgLight};
          color: ${theme.colors.textSub};
        `;
    }
  }}
`;

function StatusBadge({ status, children }) {
  return <Badge $status={status}>{children}</Badge>;
}

export default StatusBadge;
