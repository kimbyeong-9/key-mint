import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

/**
 * 환불 시스템을 관리하는 커스텀 훅
 */
export function useRefund() {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 환불 요청 생성
  const createRefundRequest = useCallback(async (paymentId, nftId, reason) => {
    if (!user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 환불 요청 생성:', { paymentId, nftId, reason });

      const { data, error } = await supabase.rpc('create_refund_request', {
        payment_id_param: paymentId,
        user_uuid: user.id,
        nft_id_param: nftId,
        refund_reason_param: reason
      });

      if (error) {
        throw new Error(`환불 요청 생성 실패: ${error.message}`);
      }

      console.log('✅ 환불 요청 생성 성공:', data);
      return data;

    } catch (err) {
      console.error('❌ 환불 요청 생성 실패:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 사용자 환불 요청 조회
  const getRefundRequests = useCallback(async (limit = 50) => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_refund_requests', {
        user_uuid: user.id,
        limit_count: limit
      });

      if (error) {
        throw new Error(`환불 요청 조회 실패: ${error.message}`);
      }

      return data || [];

    } catch (err) {
      console.error('❌ 환불 요청 조회 실패:', err);
      return [];
    }
  }, [user?.id]);

  // 환불 상태 업데이트 (관리자용)
  const updateRefundStatus = useCallback(async (refundId, status, adminNotes = null) => {
    if (!user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 환불 상태 업데이트:', { refundId, status, adminNotes });

      const { data, error } = await supabase.rpc('update_refund_status', {
        refund_request_id_param: refundId,
        new_status: status,
        admin_uuid: user.id,
        admin_notes_param: adminNotes
      });

      if (error) {
        throw new Error(`환불 상태 업데이트 실패: ${error.message}`);
      }

      console.log('✅ 환불 상태 업데이트 성공:', data);
      return data;

    } catch (err) {
      console.error('❌ 환불 상태 업데이트 실패:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // 환불 가능 여부 확인
  const checkRefundEligibility = useCallback(async (paymentId) => {
    if (!user?.id) return { eligible: false, reason: '로그인이 필요합니다.' };

    try {
      const { data: payment, error } = await supabase
        .from('payment_history')
        .select('*')
        .eq('id', paymentId)
        .eq('user_id', user.id)
        .single();

      if (error || !payment) {
        return { eligible: false, reason: '결제 내역을 찾을 수 없습니다.' };
      }

      // 24시간 이내인지 확인
      const paymentTime = new Date(payment.created_at);
      const now = new Date();
      const hoursDiff = (now - paymentTime) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return { eligible: false, reason: '환불 가능 시간이 지났습니다. (24시간)' };
      }

      // 이미 환불 요청이 있는지 확인
      const { data: existingRefund } = await supabase
        .from('refund_requests')
        .select('id, status')
        .eq('payment_id', paymentId)
        .in('status', ['pending', 'approved'])
        .single();

      if (existingRefund) {
        return { 
          eligible: false, 
          reason: '이미 환불 요청이 진행 중입니다.',
          existingRefund
        };
      }

      return { 
        eligible: true, 
        payment,
        hoursRemaining: Math.max(0, 24 - hoursDiff)
      };

    } catch (err) {
      console.error('❌ 환불 가능 여부 확인 실패:', err);
      return { eligible: false, reason: '확인 중 오류가 발생했습니다.' };
    }
  }, [user?.id]);

  return {
    createRefundRequest,
    getRefundRequests,
    updateRefundStatus,
    checkRefundEligibility,
    isLoading,
    error
  };
}
