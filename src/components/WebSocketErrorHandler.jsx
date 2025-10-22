import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const ErrorBanner = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== 'show'
})`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #fef3c7;
  border-bottom: 1px solid #f59e0b;
  padding: 8px 16px;
  z-index: 9999;
  display: ${props => props.show ? 'block' : 'none'};
`;

const ErrorContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  margin: 0 auto;
`;

const ErrorText = styled.div`
  color: #92400e;
  font-size: 14px;
  font-weight: 500;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #92400e;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 16px;
  
  &:hover {
    opacity: 0.7;
  }
`;

const WebSocketErrorHandler = () => {
  // HMR이 비활성화되어 있으므로 WebSocket 오류가 발생하지 않음
  // 컴포넌트는 유지하지만 실제로는 표시되지 않음
  return null;
};

export default WebSocketErrorHandler;
