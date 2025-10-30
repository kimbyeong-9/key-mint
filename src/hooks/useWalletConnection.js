import { useState, useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import { supabase, updateUserMetadata } from '../lib/supabase';

/**
 * 지갑 연결 상태를 관리하고 Supabase에 저장하는 커스텀 훅
 */
export const useWalletConnection = (user) => {
  const { address, isConnected, connector } = useAccount();
  const { disconnect } = useDisconnect();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 지갑 연결 정보를 Supabase에 저장
  const saveWalletConnection = async (walletAddress, walletType, chainId = 1) => {
    if (!user || !walletAddress) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log('💾 지갑 연결 정보 저장 중...', { walletAddress, walletType, chainId });

      // 기존 활성 연결을 비활성화
      await supabase
        .from('wallet_connections')
        .update({ is_active: false, disconnected_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_active', true);

      // 새로운 지갑 연결 정보 저장
      const { data: insertData, error: insertError } = await supabase
        .from('wallet_connections')
        .insert({
          user_id: user.id,
          wallet_address: walletAddress,
          wallet_type: walletType,
          chain_id: chainId,
          is_active: true,
          connected_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      console.log('✅ 지갑 연결 정보 저장 완료:', insertData);

      // 사용자 메타데이터 업데이트 (클라이언트 허용 방식을 사용)
      await updateUserMetadata({
        wallet_address: walletAddress,
        is_web3_user: true,
        wallet_type: walletType,
      });

      return insertData;
    } catch (error) {
      console.error('❌ 지갑 연결 정보 저장 실패:', error);
      setError('지갑 연결 정보 저장에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 지갑 연결 해제
  const disconnectWallet = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('🔌 지갑 연결 해제 중...');

      // Supabase에서 지갑 연결 정보 비활성화
      if (user) {
        await supabase
          .from('wallet_connections')
          .update({ is_active: false, disconnected_at: new Date().toISOString() })
          .eq('user_id', user.id)
          .eq('is_active', true);

        // 사용자 메타데이터에서 지갑 정보 제거
        await updateUserMetadata({
          wallet_address: null,
          is_web3_user: false,
          wallet_type: null,
        });
      }

      // 실제 지갑 연결 해제
      await disconnect();
      
      console.log('✅ 지갑 연결 해제 완료');
    } catch (error) {
      console.error('❌ 지갑 연결 해제 실패:', error);
      setError('지갑 연결 해제에 실패했습니다.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // 지갑 연결 상태 감지 및 자동 저장
  useEffect(() => {
    const handleWalletConnection = async () => {
      if (isConnected && address && user && connector) {
        try {
          const walletType = connector.name.toLowerCase().includes('metamask') ? 'metamask' :
                           connector.name.toLowerCase().includes('coinbase') ? 'coinbase' :
                           'walletconnect';
          
          const chainId = connector.chains?.[0]?.id || 1;
          
          await saveWalletConnection(address, walletType, chainId);
        } catch (error) {
          console.error('❌ 지갑 연결 상태 동기화 실패:', error);
        }
      }
    };

    handleWalletConnection();
  }, [isConnected, address, user, connector]);

  // 사용자의 활성 지갑 연결 정보 조회
  const getActiveWalletConnection = async () => {
    if (!user) return null;

    try {
      const { data, error: selectError } = await supabase
        .from('wallet_connections')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('connected_at', { ascending: false })
        .limit(1);

      if (selectError) {
        throw selectError;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error('❌ 활성 지갑 연결 정보 조회 실패:', error);
      return null;
    }
  };

  return {
    address,
    isConnected,
    connector,
    isLoading,
    error,
    saveWalletConnection,
    disconnectWallet,
    getActiveWalletConnection
  };
};
