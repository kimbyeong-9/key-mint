import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../contexts/UserContext';

/**
 * 사용자 포트폴리오를 관리하는 커스텀 훅
 */
export function usePortfolio() {
  const { user } = useUser();
  const [portfolio, setPortfolio] = useState(null);
  const [nftOwnership, setNftOwnership] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 포트폴리오 조회
  const fetchPortfolio = useCallback(async () => {
    if (!user?.id) {
      setPortfolio(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_portfolio', {
        user_uuid: user.id
      });

      if (error) {
        throw new Error(`포트폴리오 조회 실패: ${error.message}`);
      }

      setPortfolio(data[0] || {
        total_nfts: 0,
        total_spent_eth: 0,
        total_spent_krw: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

      console.log('✅ 포트폴리오 조회 성공:', data[0]);

    } catch (err) {
      console.error('❌ 포트폴리오 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // NFT 소유권 조회
  const fetchNftOwnership = useCallback(async () => {
    if (!user?.id) {
      setNftOwnership([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_nft_ownership', {
        user_uuid: user.id
      });

      if (error) {
        throw new Error(`NFT 소유권 조회 실패: ${error.message}`);
      }

      setNftOwnership(data || []);
      console.log('✅ NFT 소유권 조회 성공:', data?.length || 0, '개');

    } catch (err) {
      console.error('❌ NFT 소유권 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 활동 로그 조회
  const fetchActivityLogs = useCallback(async (limit = 50) => {
    if (!user?.id) {
      setActivityLogs([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_activity_logs', {
        user_uuid: user.id,
        limit_count: limit
      });

      if (error) {
        throw new Error(`활동 로그 조회 실패: ${error.message}`);
      }

      setActivityLogs(data || []);
      console.log('✅ 활동 로그 조회 성공:', data?.length || 0, '개');

    } catch (err) {
      console.error('❌ 활동 로그 조회 실패:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // 포트폴리오 강제 새로고침
  const refreshPortfolio = useCallback(async () => {
    await fetchPortfolio();
    await fetchNftOwnership();
    await fetchActivityLogs();
  }, [fetchPortfolio, fetchNftOwnership, fetchActivityLogs]);

  // 모든 데이터 새로고침
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPortfolio(),
      fetchNftOwnership(),
      fetchActivityLogs()
    ]);
  }, [fetchPortfolio, fetchNftOwnership, fetchActivityLogs]);

  // 컴포넌트 마운트 시 데이터 조회
  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  return {
    portfolio,
    nftOwnership,
    activityLogs,
    loading,
    error,
    fetchPortfolio,
    fetchNftOwnership,
    fetchActivityLogs,
    refreshAll,
    refreshPortfolio
  };
}
