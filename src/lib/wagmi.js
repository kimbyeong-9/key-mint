import { getDefaultConfig, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { metaMaskWallet, coinbaseWallet } from '@rainbow-me/rainbowkit/wallets';
import { http } from 'viem';
import { createConfig } from 'wagmi';

// 환경 변수에서 WalletConnect Project ID 가져오기 (placeholder 무시)
const rawProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;
const projectId = rawProjectId && rawProjectId !== 'demo_project_id_for_development' ? rawProjectId : undefined;

// Infura API 키
const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY || '844d7f2e5572493b86e8307eacd23f72';

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

// Sepolia 테스트넷 설정
const sepolia = {
  id: 11155111,
  name: 'Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ethereum',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: [`https://sepolia.infura.io/v3/${INFURA_API_KEY}`],
    },
    public: {
      http: [`https://sepolia.infura.io/v3/${INFURA_API_KEY}`],
    },
  },
  blockExplorers: {
    default: {
      name: 'Etherscan',
      url: 'https://sepolia.etherscan.io'
    },
  },
  testnet: true,
};

// 허용 지갑만 등록 (MetaMask, Coinbase) - Sepolia만 지원 (프로덕션 배포 시)
// localhost는 로컬 개발 시에만 활성화
const chains = [sepolia]; // 프로덕션에서는 Sepolia만 사용
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

// Wagmi 설정 (Sepolia만 지원 - 프로덕션 배포 시)
export const config = createConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
  },
  connectors: allowedConnectors,
  ssr: false,
});

// 네트워크 정보 export
export const LOCALHOST = localhost;
export const SEPOLIA = sepolia;

// 기본 체인 (프로덕션에서는 Sepolia 사용)
export const CURRENT_CHAIN = sepolia;
export const CHAIN_ID = sepolia.id;

// 안내: 환경 변수 미설정 시 지갑 초기화를 생략하고 로컬 설정으로만 동작합니다.
if (!projectId) {
  // WalletConnect 없이도 MetaMask는 정상 작동하므로 경고 수준을 낮춤
  console.log(
    'ℹ️ WalletConnect 미설정 - MetaMask/Coinbase Wallet은 정상 작동합니다.\n' +
    '   다른 지갑(Trust Wallet, Rainbow 등)을 사용하려면:\n' +
    '   1) https://cloud.walletconnect.com 에서 Project ID 발급\n' +
    '   2) .env.local 에 VITE_WALLETCONNECT_PROJECT_ID 설정'
  );
}
