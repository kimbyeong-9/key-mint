import { getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { http } from 'viem';
import { createConfig } from 'wagmi';

// 환경 변수에서 WalletConnect Project ID 가져오기 (placeholder 무시)
const rawProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const projectId = rawProjectId && rawProjectId !== 'demo_project_id_for_development' ? rawProjectId : undefined;

// Localhost 네트워크 설정 (Hardhat 로컬 노드용)
const localhost = {
  id: 31337,
  name: 'Localhost 8545',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Local Explorer',
      url: 'http://localhost:8545'
    },
  },
  testnet: true,
};

// 허용 지갑만 등록 (MetaMask, Base Account) - 개발 환경에서는 Localhost 사용
const chains = [localhost];
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

// Wagmi 설정 (Localhost 네트워크 사용)
export const config = createConfig({
  chains: [localhost],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
  },
  connectors: allowedConnectors,
  ssr: false,
});

// 현재 사용 중인 체인 (개발 환경에서는 Localhost 사용)
export const CURRENT_CHAIN = localhost;
export const CHAIN_ID = localhost.id;

// 안내: 환경 변수 미설정 시 지갑 초기화를 생략하고 로컬 설정으로만 동작합니다.
if (!projectId) {
  console.warn(
    '⚠️ WalletConnect Project ID가 설정되지 않았습니다.\n' +
    '1) https://cloud.walletconnect.com 에서 Project ID를 발급\n' +
    '2) .env.local 의 VITE_WALLETCONNECT_PROJECT_ID 값으로 설정\n' +
    '3) Allowed Origins 에 http://localhost:3000 추가 후 dev 서버 재시작\n' +
    '현재는 Localhost 8545 네트워크로 설정되어 있습니다.'
  );
}
