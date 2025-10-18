import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi';
import { getContractAddress, MARKET_ABI } from '../lib/contracts';
import { parseEther } from '../lib/format';

/**
 * NFT 판매 등록 훅
 */
export function useList() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const list = async (tokenId, priceInEther) => {
    try {
      const nftAddress = getContractAddress('VaultNFT');
      const priceWei = parseEther(priceInEther);

      await writeContract({
        address: getContractAddress('Marketplace'),
        abi: MARKET_ABI,
        functionName: 'list',
        args: [nftAddress, BigInt(tokenId), priceWei],
      });
    } catch (err) {
      console.error('판매 등록 실패:', err);
      throw err;
    }
  };

  return {
    list,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * NFT 구매 훅
 */
export function useBuy() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const buy = async (listingId, priceWei) => {
    try {
      await writeContract({
        address: getContractAddress('Marketplace'),
        abi: MARKET_ABI,
        functionName: 'buy',
        args: [BigInt(listingId)],
        value: BigInt(priceWei),
      });
    } catch (err) {
      console.error('구매 실패:', err);
      throw err;
    }
  };

  return {
    buy,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 판매 취소 훅
 */
export function useCancel() {
  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const cancel = async (listingId) => {
    try {
      await writeContract({
        address: getContractAddress('Marketplace'),
        abi: MARKET_ABI,
        functionName: 'cancel',
        args: [BigInt(listingId)],
      });
    } catch (err) {
      console.error('취소 실패:', err);
      throw err;
    }
  };

  return {
    cancel,
    hash,
    isPending,
    isConfirming,
    isSuccess,
    error,
  };
}

/**
 * 판매 목록 조회 훅
 */
export function useListing(listingId) {
  const { data, isLoading, error } = useReadContract({
    address: getContractAddress('Marketplace'),
    abi: MARKET_ABI,
    functionName: 'getListing',
    args: listingId !== undefined ? [BigInt(listingId)] : undefined,
    enabled: listingId !== undefined && listingId !== null,
  });

  // data는 [seller, nftContract, tokenId, price, active] 형태
  const listing = data ? {
    seller: data[0],
    nftContract: data[1],
    tokenId: data[2],
    price: data[3],
    active: data[4],
  } : null;

  return { listing, isLoading, error };
}

/**
 * 전체 판매 목록 수 조회 훅
 */
export function useListingCounter() {
  const { data: listingCounter, isLoading, error } = useReadContract({
    address: getContractAddress('Marketplace'),
    abi: MARKET_ABI,
    functionName: 'listingCounter',
  });

  return { listingCounter, isLoading, error };
}

/**
 * 수수료 비율 조회 훅
 */
export function useFeePercent() {
  const { data: feePercent, isLoading, error } = useReadContract({
    address: getContractAddress('Marketplace'),
    abi: MARKET_ABI,
    functionName: 'feePercent',
  });

  return { feePercent, isLoading, error };
}
