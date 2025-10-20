import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { keccak256, stringToBytes } from 'viem';
import { getContractAddress, REGISTRY_ABI } from '../lib/contracts';

/**
 * 사용자 등록 훅
 */
export function useRegister() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const register = async (username) => {
    try {
      // 사용자명을 해시로 변환 (프라이버시 보호)
      const usernameHash = keccak256(stringToBytes(username));

      await writeContract({
        address: getContractAddress('UserRegistry'),
        abi: REGISTRY_ABI,
        functionName: 'register',
        args: [usernameHash],
      });
    } catch (err) {
      console.error('등록 실패:', err);
      throw err;
    }
  };

  return {
    register,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 사용자 등록 여부 확인 훅
 */
export function useIsRegistered(address) {
  const { data: isRegistered, isLoading } = useReadContract({
    address: getContractAddress('UserRegistry'),
    abi: REGISTRY_ABI,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  return { isRegistered, isLoading };
}

/**
 * 사용자 프로필 조회 훅
 */
export function useProfile(address) {
  const { data, isLoading, error } = useReadContract({
    address: getContractAddress('UserRegistry'),
    abi: REGISTRY_ABI,
    functionName: 'getProfile',
    args: address ? [address] : undefined,
    enabled: !!address,
  });

  // data는 [usernameHash, createdAt] 형태의 배열
  const profile = data ? {
    usernameHash: data[0],
    createdAt: data[1],
  } : null;

  return { profile, isLoading, error };
}

// 향상된 기능은 추후 구현 예정
// UserRegistryEnhanced 컨트랙트 배포 후 사용 가능
