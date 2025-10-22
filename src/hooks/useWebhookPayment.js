import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

/**
 * 웹훅 기반 결제 확인을 관리하는 커스텀 훅
 */
export function useWebhookPayment() {
  const { user } = useUser();
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  // 웹훅 상태 확인
  const checkWebhookStatus = useCallback(async (orderId) => {
    if (!orderId) return null;

    try {
      const { data, error } = await supabase.rpc('get_webhook_status', {
        order_id_param: orderId
      });

      if (error) {
        throw new Error(`웹훅 상태 확인 실패: ${error.message}`);
      }

      return data || [];

    } catch (err) {
      console.error('❌ 웹훅 상태 확인 실패:', err);
      return null;
    }
  }, []);

  // 결제 상태 폴링
  const pollPaymentStatus = useCallback(async (orderId, maxAttempts = 30, interval = 2000) => {
    if (!orderId) return { success: false, error: 'Order ID is required' };

    setIsChecking(true);
    setError(null);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        console.log(`🔄 결제 상태 확인 시도 ${attempt + 1}/${maxAttempts}:`, orderId);

        const webhookStatus = await checkWebhookStatus(orderId);
        
        if (webhookStatus && webhookStatus.length > 0) {
          const latestStatus = webhookStatus[0];
          
          if (latestStatus.processed && latestStatus.processing_status === 'completed') {
            console.log('✅ 결제 완료 확인:', latestStatus);
            setIsChecking(false);
            return { 
              success: true, 
              status: latestStatus,
              message: '결제가 성공적으로 완료되었습니다.'
            };
          }
          
          if (latestStatus.processing_status === 'failed') {
            console.log('❌ 결제 실패 확인:', latestStatus);
            setIsChecking(false);
            return { 
              success: false, 
              error: '결제 처리에 실패했습니다.',
              status: latestStatus
            };
          }
        }

        // 다음 시도까지 대기
        if (attempt < maxAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, interval));
        }

      } catch (err) {
        console.error(`❌ 결제 상태 확인 시도 ${attempt + 1} 실패:`, err);
        
        if (attempt === maxAttempts - 1) {
          setError(err.message);
          setIsChecking(false);
          return { success: false, error: err.message };
        }
      }
    }

    // 최대 시도 횟수 초과
    setIsChecking(false);
    return { 
      success: false, 
      error: '결제 상태 확인 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' 
    };

  }, [checkWebhookStatus]);

  // 결제 완료 대기 (자동 폴링)
  const waitForPaymentCompletion = useCallback(async (orderId) => {
    if (!orderId) return { success: false, error: 'Order ID is required' };

    return new Promise((resolve) => {
      const poll = async () => {
        const result = await pollPaymentStatus(orderId, 30, 2000);
        resolve(result);
      };
      
      poll();
    });
  }, [pollPaymentStatus]);

  // 수동 결제 확인
  const verifyPayment = useCallback(async (orderId) => {
    if (!orderId) return { success: false, error: 'Order ID is required' };

    try {
      setIsChecking(true);
      setError(null);

      const result = await pollPaymentStatus(orderId, 5, 1000);
      return result;

    } catch (err) {
      console.error('❌ 결제 확인 실패:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsChecking(false);
    }
  }, [pollPaymentStatus]);

  return {
    checkWebhookStatus,
    pollPaymentStatus,
    waitForPaymentCompletion,
    verifyPayment,
    isChecking,
    error
  };
}

