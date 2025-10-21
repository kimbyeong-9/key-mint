import React, { createContext, useContext, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const slideIn = keyframes`
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideOut = keyframes`
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
`;

const NotificationContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 400px;
`;

const Notification = styled.div`
  background: ${({ theme, $type }) => {
    switch ($type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      case 'info': return '#3B82F6';
      default: return theme.colors.card;
    }
  }};
  color: white;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: ${({ $isRemoving }) => $isRemoving ? slideOut : slideIn} 0.3s ease-in-out;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(-5px);
  }
`;

const NotificationIcon = styled.div`
  font-size: 20px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  font-size: 13px;
  opacity: 0.9;
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 8px;
  opacity: 0.7;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
`;

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification,
    };

    setNotifications(prev => [...prev, newNotification]);

    // 자동 제거
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRemoving: true }
          : notification
      )
    );

    // 애니메이션 완료 후 실제 제거
    setTimeout(() => {
      setNotifications(prev => prev.filter(notification => notification.id !== id));
    }, 300);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // 구매 성공 알림
  const notifyPurchaseSuccess = (nftId, amount) => {
    addNotification({
      type: 'success',
      title: '구매 완료!',
      message: `NFT #${nftId}을(를) ${amount} ETH에 구매했습니다.`,
      duration: 6000,
    });
  };

  // 결제 실패 알림
  const notifyPaymentFailed = (error) => {
    addNotification({
      type: 'error',
      title: '결제 실패',
      message: error || '결제 처리 중 오류가 발생했습니다.',
      duration: 8000,
    });
  };

  // 포트폴리오 업데이트 알림
  const notifyPortfolioUpdate = () => {
    addNotification({
      type: 'info',
      title: '포트폴리오 업데이트',
      message: '포트폴리오가 업데이트되었습니다.',
      duration: 4000,
    });
  };

  // 일반 알림
  const notify = (title, message, type = 'info', duration = 5000) => {
    addNotification({
      type,
      title,
      message,
      duration,
    });
  };

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAllNotifications,
    notifyPurchaseSuccess,
    notifyPaymentFailed,
    notifyPortfolioUpdate,
    notify,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer>
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            $type={notification.type}
            $isRemoving={notification.isRemoving}
            onClick={() => removeNotification(notification.id)}
          >
            <NotificationIcon>
              {notification.type === 'success' && '✓'}
              {notification.type === 'error' && '✕'}
              {notification.type === 'warning' && '⚠'}
              {notification.type === 'info' && 'ℹ'}
            </NotificationIcon>
            <NotificationContent>
              <NotificationTitle>{notification.title}</NotificationTitle>
              <NotificationMessage>{notification.message}</NotificationMessage>
            </NotificationContent>
            <CloseButton onClick={(e) => {
              e.stopPropagation();
              removeNotification(notification.id);
            }}>
              ×
            </CloseButton>
          </Notification>
        ))}
      </NotificationContainer>
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
