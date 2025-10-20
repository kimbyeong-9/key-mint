import { getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { sepolia, mainnet } from 'wagmi/chains';
import { http } from 'viem';
import { createConfig } from 'wagmi';

// 환경 변수에서 WalletConnect Project ID 가져오기 (placeholder 무시)
const rawProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const projectId = rawProjectId && rawProjectId !== 'demo_project_id_for_development' ? rawProjectId : undefined;

// 허용 지갑만 등록 (MetaMask, Base Account) - projectId가 없을 때도 안전하게 생성
const chains = [sepolia, mainnet];
const appName = 'Key Mint - NFT Marketplace';

// RainbowKit이 내부에서 옵션을 주입할 수 있도록 wallet 팩토리 함수를 그대로 전달
const walletFactories = [metaMaskWallet, coinbaseWallet];

const rkOptions = projectId ? { appName, projectId, chains } : { appName, chains };

const allowedConnectors = connectorsForWallets([
  {
    groupName: '지갑',
    wallets: walletFactories,
  },
], rkOptions);

// Wagmi 설정 (Project ID가 있을 때만 RainbowKit의 getDefaultConfig 사용)
export const config = createConfig({
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  connectors: allowedConnectors,
  ssr: false,
});

// 현재 사용 중인 체인 (개발 환경에서는 Sepolia 테스트넷 사용)
export const CURRENT_CHAIN = sepolia;
export const CHAIN_ID = sepolia.id;

// 안내: 환경 변수 미설정 시 지갑 초기화를 생략하고 로컬 설정으로만 동작합니다.
if (!projectId) {
  console.warn(
    '⚠️ WalletConnect Project ID가 설정되지 않았습니다.\n' +
    '1) https://cloud.walletconnect.com 에서 Project ID를 발급\n' +
    '2) .env.local 의 VITE_WALLETCONNECT_PROJECT_ID 값으로 설정\n' +
    '3) Allowed Origins 에 http://localhost:3000 추가 후 dev 서버 재시작'
  );
}
