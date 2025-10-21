import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';
import { useETHBalance } from './useETHBalance';

/**
 * NFT 구매를 관리하는 커스텀 훅
 */
export function useNFTPurchase() {
  const { user } = useUser();
  const { balance, subtractBalance } = useETHBalance();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState(null);

  // NFT 구매 처리
  const purchaseNFT = useCallback(async (nftId, ethAmount) => {
    if (!user?.id) {
      throw new Error('로그인이 필요합니다.');
    }

    if (balance < ethAmount) {
      throw new Error(`ETH 잔액이 부족합니다. 현재: ${balance} ETH, 필요: ${ethAmount} ETH`);
    }

    setIsPurchasing(true);
    setPurchaseError(null);

    try {
      console.log('🛒 NFT 구매 시작:', { nftId, ethAmount, userId: user.id });

      // Supabase에 NFT 구매 처리
      const { data, error } = await supabase.rpc('process_nft_purchase', {
        user_uuid: user.id,
        nft_id_param: nftId,
        eth_amount_param: ethAmount
      });

      if (error) {
        throw new Error(`NFT 구매 실패: ${error.message}`);
      }

      console.log('✅ NFT 구매 성공:', data);

      // ETH 잔액 차감 (Supabase에서 이미 처리되었지만 UI 동기화를 위해)
      await subtractBalance(ethAmount);

      return {
        success: true,
        purchaseId: data,
        nftId,
        ethAmount
      };

    } catch (err) {
      console.error('❌ NFT 구매 실패:', err);
      setPurchaseError(err.message);
      throw err;
    } finally {
      setIsPurchasing(false);
    }
  }, [user?.id, balance, subtractBalance]);

  // 구매 내역 조회
  const getPurchaseHistory = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_purchases', {
        user_uuid: user.id
      });

      if (error) {
        throw new Error(`구매 내역 조회 실패: ${error.message}`);
      }

      return data || [];

    } catch (err) {
      console.error('❌ 구매 내역 조회 실패:', err);
      return [];
    }
  }, [user?.id]);

  // 결제 내역 조회
  const getPaymentHistory = useCallback(async () => {
    if (!user?.id) return [];

    try {
      const { data, error } = await supabase.rpc('get_user_payments', {
        user_uuid: user.id
      });

      if (error) {
        throw new Error(`결제 내역 조회 실패: ${error.message}`);
      }

      return data || [];

    } catch (err) {
      console.error('❌ 결제 내역 조회 실패:', err);
      return [];
    }
  }, [user?.id]);

  return {
    purchaseNFT,
    getPurchaseHistory,
    getPaymentHistory,
    isPurchasing,
    purchaseError,
    balance
  };
}
