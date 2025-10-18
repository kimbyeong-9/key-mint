import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getContractAddress, NFT_ABI } from '../lib/contracts';

/**
 * NFT 발행 훅
 */
export function useMint() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const mint = async (to, tokenURI) => {
    try {
      await writeContract({
        address: getContractAddress('VaultNFT'),
        abi: NFT_ABI,
        functionName: 'mint',
        args: [to, tokenURI],
      });
    } catch (err) {
      console.error('민팅 실패:', err);
      throw err;
    }
  };

  return {
    mint,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * NFT 소유자 조회 훅
 */
export function useOwnerOf(tokenId) {
  const { data: owner, isLoading, error } = useReadContract({
    address: getContractAddress('VaultNFT'),
    abi: NFT_ABI,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    enabled: tokenId !== undefined && tokenId !== null,
  });

  return { owner, isLoading, error };
}

/**
 * NFT 토큰 URI 조회 훅
 */
export function useTokenURI(tokenId) {
  const { data: tokenURI, isLoading, error } = useReadContract({
    address: getContractAddress('VaultNFT'),
    abi: NFT_ABI,
    functionName: 'tokenURI',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    enabled: tokenId !== undefined && tokenId !== null,
  });

  return { tokenURI, isLoading, error };
}

/**
 * NFT 총 발행 수량 조회 훅
 */
export function useTotalSupply() {
  const { data: totalSupply, isLoading, error } = useReadContract({
    address: getContractAddress('VaultNFT'),
    abi: NFT_ABI,
    functionName: 'totalSupply',
  });

  return { totalSupply, isLoading, error };
}

/**
 * NFT approve 훅 (마켓플레이스에 판매 권한 부여)
 */
export function useApprove() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const approve = async (tokenId) => {
    try {
      const marketplaceAddress = getContractAddress('Marketplace');

      await writeContract({
        address: getContractAddress('VaultNFT'),
        abi: NFT_ABI,
        functionName: 'approve',
        args: [marketplaceAddress, BigInt(tokenId)],
      });
    } catch (err) {
      console.error('Approve 실패:', err);
      throw err;
    }
  };

  return {
    approve,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}
