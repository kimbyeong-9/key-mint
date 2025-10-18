import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia, mainnet } from 'wagmi/chains';
import { http } from 'viem';

// Wagmi 설정
export const config = getDefaultConfig({
  appName: 'Key Mint - NFT Marketplace',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // WalletConnect Project ID (https://cloud.walletconnect.com)
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: false,
});

// 현재 사용 중인 체인 (개발 환경에서는 Sepolia 테스트넷 사용)
export const CURRENT_CHAIN = sepolia;
export const CHAIN_ID = sepolia.id;
