import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

/**
 * 사용자 ETH 잔액을 관리하는 커스텀 훅
 */
export function useETHBalance() {
  const { user } = useUser();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ETH 잔액 조회
  const fetchBalance = useCallback(async () => {
    if (!user?.id) {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_eth_balance', {
        user_uuid: user.id
      });

      if (error) {
        throw new Error(`ETH 잔액 조회 실패: ${error.message}`);
      }

      setBalance(parseFloat(data) || 0);
      console.log('✅ ETH 잔액 조회 성공:', data);

    } catch (err) {
      console.error('❌ ETH 잔액 조회 실패:', err);
      setError(err.message);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // ETH 잔액 업데이트
  const updateBalance = useCallback(async (newBalance) => {
    if (!user?.id) return;

    try {
      const { error } = await supabase.rpc('update_user_eth_balance', {
        user_uuid: user.id,
        new_balance: newBalance
      });

      if (error) {
        throw new Error(`ETH 잔액 업데이트 실패: ${error.message}`);
      }

      setBalance(newBalance);
      console.log('✅ ETH 잔액 업데이트 성공:', newBalance);

    } catch (err) {
      console.error('❌ ETH 잔액 업데이트 실패:', err);
      setError(err.message);
    }
  }, [user?.id]);

  // ETH 잔액 증가
  const addBalance = useCallback(async (amount) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('add_eth_balance', {
        user_uuid: user.id,
        amount: amount
      });

      if (error) {
        throw new Error(`ETH 잔액 증가 실패: ${error.message}`);
      }

      setBalance(parseFloat(data) || 0);
      console.log('✅ ETH 잔액 증가 성공:', data);

    } catch (err) {
      console.error('❌ ETH 잔액 증가 실패:', err);
      setError(err.message);
    }
  }, [user?.id]);

  // ETH 잔액 차감
  const subtractBalance = useCallback(async (amount) => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase.rpc('subtract_eth_balance', {
        user_uuid: user.id,
        amount: amount
      });

      if (error) {
        throw new Error(`ETH 잔액 차감 실패: ${error.message}`);
      }

      setBalance(parseFloat(data) || 0);
      console.log('✅ ETH 잔액 차감 성공:', data);

    } catch (err) {
      console.error('❌ ETH 잔액 차감 실패:', err);
      setError(err.message);
      throw err; // 호출자에게 에러 전달
    }
  }, [user?.id]);

  // 컴포넌트 마운트 시 잔액 조회
  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    fetchBalance,
    updateBalance,
    addBalance,
    subtractBalance
  };
}
