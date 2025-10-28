# Key Mint - NFT 마켓플레이스 플랫폼

## 📋 프로젝트 개요

**Key Mint**는 블록체인 기반의 탈중앙화 NFT(Non-Fungible Token) 마켓플레이스입니다. 사용자들은 이더리움 네트워크에서 NFT를 생성, 구매, 판매하며, 실제 결제 시스템과 블록체인 기술이 결합된 Full-Stack Web3 애플리케이션입니다.

### 🎯 주요 기능
- **NFT 생성**: IPFS 기반 분산 스토리지를 활용한 NFT 발행
- **NFT 마켓플레이스**: ETH와 원화(KRW) 환율 변환 결제 시스템
- **블록체인 통합**: 이더리움 Sepolia Testnet에 스마트 컨트랙트 배포
- **토스페이먼츠**: 실시간 결제 처리 및 QR 코드 결제
- **포트폴리오 관리**: 사용자별 NFT 소유 현황 및 구매 내역
- **환불 시스템**: 결제 후 NFT 전송 이중 검증 및 환불 처리

---

## 🛠 기술 스택

### **Frontend**
```json
{
  "프레임워크": "React 19.2.0",
  "라우팅": "React Router v7.9.4",
  "상태관리": "React Context API",
  "스타일링": "Styled Components 6.1.19",
  "빌드 도구": "Vite 7.1.10",
  "아이콘": "React Icons 5.5.0"
}
```

### **Backend & Database**
```json
{
  "BaaS": "Supabase 2.75.1",
  "데이터베이스": "PostgreSQL",
  "인증": "Supabase Auth",
  "파일 스토리지": "Supabase Storage",
  "RPC": "Supabase Edge Functions (MCP)"
}
```

### **Blockchain & Web3**
```json
{
  "네트워크": "Ethereum Sepolia Testnet",
  "지갑 연동": "RainbowKit 2.2.9",
  "Web3 라이브러리": "Wagmi 2.18.1 + Viem 2.38.3",
  "스마트 컨트랙트": "Solidity 0.8.20",
  "개발 환경": "Hardhat 3.0.7",
  "컨트랙트 프레임워크": "OpenZeppelin 5.4.0"
}
```

### **Payment Gateway**
```json
{
  "결제 시스템": "Toss Payments SDK 1.9.1",
  "결제 방식": "휴대폰 QR 코드 결제",
  "환율 API": "Real-time ETH/KRW Exchange Rate"
}
```

### **IPFS (Distributed Storage)**
```json
{
  "스토리지": "Web3.Storage 4.5.5",
  "메타데이터": "IPFS URI 기반 NFT 표준",
  "이미지 최적화": "EXIF 데이터 추출 및 썸네일 생성"
}
```

### **Cloud & Deployment**
```json
{
  "배포 플랫폼": "Vercel",
  "RPC Provider": "Alchemy Sepolia API",
  "환경 변수": "Vercel Environment Variables"
}
```

---

## 🏗 프로젝트 아키텍처

### **1. 계층별 구조**

```
┌─────────────────────────────────────────┐
│         Frontend (React)                │
│  ┌────────────────────────────────────┐ │
│  │  Pages: Home, Create, Detail,      │ │
│  │  Portfolio, Purchase History       │ │
│  └────────────────────────────────────┘ │
│  ┌────────────────────────────────────┐ │
│  │  Components: NFT Cards, Payment,   │ │
│  │  Wallet Connect, Search/Filter     │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  ↕ API Calls
┌─────────────────────────────────────────┐
│      Backend (Supabase)                 │
│  ┌────────────────────────────────────┐ │
│  │  PostgreSQL: 18 Tables             │ │
│  │  RPC Functions: 38 Functions       │ │
│  │  Real-time: WebSocket Subscriptions│ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
                  ↕ Integration
┌─────────────────────────────────────────┐
│      Blockchain (Ethereum Sepolia)      │
│  ┌────────────────────────────────────┐ │
│  │  VaultNFT Contract (ERC-721)       │ │
│  │  IPFS Metadata                     │ │
│  │  Transaction Logging               │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### **2. 데이터베이스 스키마**

#### **핵심 테이블 (18개)**

**사용자 관리**
- `user_profiles`: 사용자 프로필 정보
- `wallet_connections`: 지갑 연결 이력
- `user_eth_balances`: ETH 잔액 관리

**NFT 관리**
- `nft_images`: 업로드된 이미지 메타데이터
- `nft_metadata`: NFT 메타데이터 (IPFS URI 포함)
- `nft_listings`: NFT 판매 목록
- `nft_transactions`: NFT 거래 이력
- `nft_purchases`: NFT 구매 기록

**결제 시스템**
- `payment_history`: 결제 이력 및 상태
- `exchange_rates`: ETH/KRW 실시간 환율
- `refund_requests`: 환불 요청 관리
- `refund_logs`: 환불 처리 로그
- `refund_policies`: 환불 정책 설정

**포트폴리오 & 활동**
- `user_portfolios`: 사용자 포트폴리오 통계
- `user_nft_ownership`: NFT 소유권 관리
- `user_activity_logs`: 사용자 활동 로그

**웹훅 & 시스템**
- `toss_webhook_logs`: Toss Payments 웹훅 로그
- `webhook_processing_status`: 웹훅 처리 상태

#### **주요 RPC 함수 (38개)**

**결제 처리**
- `create_payment_request`: 결제 요청 생성
- `process_payment_success`: 결제 성공 처리
- `process_payment_failure`: 결제 실패 처리
- `process_toss_webhook`: Toss 웹훅 처리

**NFT 관리**
- `mint_nft`: NFT 발행
- `create_nft_listing`: NFT 판매 목록 생성
- `process_nft_purchase`: NFT 구매 처리
- `transfer_nft`: NFT 소유권 이전

**포트폴리오**
- `get_user_portfolio`: 포트폴리오 조회
- `get_user_nft_ownership`: 소유 NFT 목록
- `get_purchase_history`: 구매 이력 조회
- `update_user_portfolio`: 포트폴리오 업데이트

**환불 시스템**
- `create_refund_request`: 환불 요청 생성
- `update_refund_status`: 환불 상태 업데이트
- `process_refund`: 환불 처리

**환율 관리**
- `convert_eth_to_krw`: ETH → KRW 변환
- `convert_krw_to_eth`: KRW → ETH 변환
- `get_current_exchange_rate`: 실시간 환율 조회

---

## 🔐 보안 및 인증

### **1. Row Level Security (RLS)**
모든 테이블에 RLS 활성화:
- 사용자는 자신의 데이터만 접근 가능
- Admin 권한 별도 관리
- Foreign Key 제약조건으로 데이터 무결성 보장

### **2. JWT 인증**
- Supabase Auth를 통한 JWT 토큰 기반 인증
- 자동 만료 및 갱신 메커니즘
- Secure HTTP-only 쿠키 옵션

### **3. 스마트 컨트랙트 보안**
- OpenZeppelin 표준 라이브러리 사용
- 재진입 공격 방지 (Reentrancy Guard)
- 함수 접근 제어 (onlyOwner, isMinter)

### **4. 결제 보안**
- Toss Payments 공식 SDK 사용
- 웹훅 검증 (signature & IP whitelist)
- 중복 결제 방지 로직

---

## 💳 결제 시스템 구현

### **1. Toss Payments 통합**

```javascript
// src/lib/tossPayments.js
export const requestPayment = async (nft, userId) => {
  const tossPayments = await initializeTossPayments();
  
  const response = await tossPayments.requestPayment('휴대폰', {
    amount: Math.max(amountKrw, 100),
    orderId: `NFT_${Date.now()}_${userId}`,
    orderName: nftName,
    customerName: 'NFT 구매자',
    successUrl: `${window.location.origin}/payment-success`,
    failUrl: `${window.location.origin}/payment-fail`
  });
  
  // QR 코드 자동 생성
  return response;
};
```

### **2. 결제 플로우**

```
사용자 → NFT 구매 버튼 클릭
    ↓
토스페이먼츠 QR 코드 생성
    ↓
휴대폰으로 QR 스캔
    ↓
결제 승인
    ↓
Webhook → Supabase RPC
    ↓
NFT 소유권 이전 (Blockchain)
    ↓
포트폴리오 업데이트
```

### **3. 환불 시스템**

```
환불 요청 (24시간 이내)
    ↓
블록체인 트랜잭션 검증
    ↓
중복 환불 방지
    ↓
Admin 승인
    ↓
Toss Payments 환불 API
    ↓
NFT 소유권 회수
```

---

## ⛓ 블록체인 통합

### **1. VaultNFT 스마트 컨트랙트**

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VaultNFT is ERC721URIStorage, Ownable {
    function mint(address to, string memory tokenURI) 
        external returns (uint256) {
        // IPFS URI를 포함한 NFT 발행
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        return newTokenId;
    }
}
```

**특징**:
- ERC-721 표준 준수
- IPFS URI 기반 메타데이터
- Minter 권한 관리
- OpenZeppelin 최신 버전

### **2. Wagmi + RainbowKit 통합**

```javascript
// src/lib/wagmi.js
import { createConfig } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';

export const config = createConfig({
  chains: [sepolia],
  providers: [
    alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY })
  ]
});
```

**기능**:
- 자동 네트워크 탐지
- 지갑 연결/연결 해제
- 실시간 잔액 조회
- 트랜잭션 전송

### **3. NFT 발행 플로우**

```
1. 사용자가 이미지 업로드
    ↓
2. IPFS 업로드 (Web3.Storage)
    ↓
3. 메타데이터 JSON 생성
    ↓
4. 메타데이터 IPFS 업로드
    ↓
5. Supabase에 NFT 정보 저장
    ↓
6. VaultNFT.mint() 호출
    ↓
7. 트랜잭션 해시 저장
```

---

## 📂 프로젝트 파일 구조

```
key-mint/
├── src/
│   ├── Pages/               # 페이지 컴포넌트
│   │   ├── Home.jsx        # NFT 마켓플레이스
│   │   ├── Create.jsx      # NFT 생성
│   │   ├── Detail.jsx      # NFT 상세
│   │   ├── Portfolio.jsx   # 포트폴리오
│   │   └── PurchaseHistory.jsx
│   │
│   ├── components/         # 재사용 컴포넌트
│   │   ├── NFTCard.jsx
│   │   ├── PaymentModal.jsx
│   │   ├── WalletConnectButton.jsx
│   │   └── NFTSearch.jsx
│   │
│   ├── hooks/              # Custom Hooks
│   │   ├── useNFTs.js      # NFT 목록 조회
│   │   ├── usePortfolio.js # 포트폴리오 관리
│   │   ├── useBlockchain.js # 블록체인 통합
│   │   └── useWebhookPayment.js
│   │
│   ├── lib/                # 유틸리티
│   │   ├── supabase.js     # Supabase 클라이언트
│   │   ├── tossPayments.js # 결제 시스템
│   │   ├── ipfs.js         # IPFS 업로드
│   │   ├── wagmi.js        # Web3 설정
│   │   └── contracts.js    # 컨트랙트 ABI
│   │
│   └── contexts/           # Context API
│       └── UserContext.jsx # 사용자 상태
│
├── contracts/              # 스마트 컨트랙트
│   └── VaultNFT.sol       # ERC-721 컨트랙트
│
├── api/                    # API 라우트 (Vercel)
│   ├── webhook/
│   │   └── toss.js        # Toss 웹훅
│   └── verify-payment.js  # 결제 검증
│
├── sql/                    # SQL 스키마
│   └── supabase-schema.sql
│
└── hardhat.config.js       # Hardhat 설정
```

---

## 🚀 배포 및 환경 설정

### **1. 환경 변수 (.env.local)**

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Toss Payments
VITE_TOSS_CLIENT_KEY=test_ck_xxx

# Blockchain
VITE_VAULT_NFT_ADDRESS=0x...
ALCHEMY_API_KEY=your_alchemy_key
PRIVATE_KEY=your_private_key
PRIVATE_KEY_STARTUP=your_startup_key

# IPFS
VITE_WEB3_STORAGE_TOKEN=your_web3_storage_token
```

### **2. 네트워크 설정**

**Sepolia Testnet**:
- Chain ID: 11155111
- RPC URL: Alchemy Sepolia
- Contract Address: 배포된 VaultNFT 주소

### **3. Supabase MCP 설정**

```javascript
// src/lib/supabaseMCP.js
import { MCPClient } from './supabase';

export const supabaseMCP = new MCPClient({
  projectUrl: process.env.VITE_SUPABASE_URL,
  anonKey: process.env.VITE_SUPABASE_ANON_KEY
});
```

---

## 📊 주요 성과 및 기술적 도전

### **1. Web3 + 결제 시스템 통합**
- 문제: 일반 결제와 블록체인 트랜잭션의 비동기성
- 해결: Webhook 기반 2단계 처리 (결제 → 블록체인 전송)

### **2. IPFS 분산 스토리지**
- 문제: 대용량 이미지 최적화
- 해결: EXIF 데이터 추출 및 썸네일 생성

### **3. 실시간 환율 변환**
- 문제: ETH/KRW 변동 환율
- 해결: Supabase RPC 함수로 실시간 환율 계산

### **4. 안전한 환불 시스템**
- 문제: 중복 환불 및 블록체인 검증
- 해결: 트랜잭션 해시 검증 + 상태 관리

### **5. RainbowKit 지갑 통합**
- 문제: 다양한 지갑 제공업체 지원
- 해결: RainbowKit을 통한 통합 인터페이스

---

## 🎨 UI/UX 특징

### **1. 반응형 디자인**
- Desktop: Grid 레이아웃 (최대 1400px)
- Mobile: 단일 컬럼 + 터치 최적화

### **2. Dark Theme**
- RainbowKit 다크 테마 통합
- 사용자 친화적 컬러 팔레트

### **3. 실시간 피드백**
- React Query 기반 로딩 상태
- Notification System 통합
- Error Boundary로 전역 에러 처리

### **4. 검색 및 필터**
- NFT 이름/가격 기반 검색
- 실시간 필터링
- 가격 정렬 (오름차순/내림차순)

---

## 📈 성능 최적화

### **1. 코드 분할**
```javascript
// vite.config.js
rollupOptions: {
  output: {
    manualChunks: {
      vendor: ['react', 'react-dom'],
      supabase: ['@supabase/supabase-js'],
      wagmi: ['wagmi', 'viem']
    }
  }
}
```

### **2. 이미지 최적화**
- IPFS 썸네일 생성
- Lazy Loading 적용
- Placeholder 표시

### **3. React Query 캐싱**
- 자동 리페칭 (Window Focus)
- Optimistic Updates
- Background Sync

---

## 🔄 개발 프로세스

### **1. Git Workflow**
```
main (production)
  ↑
develop (staging)
  ↑
feature branches
```

### **2. 스마트 컨트랙트 배포**
```bash
# Sepolia 배포
npm run deploy:vault-nft

# 로컬 테스트
hardhat node
npm run deploy:vault-nft:local
```

### **3. Supabase MCP 개발**
- 로컬 RPC 함수 테스트
- PostgreSQL 함수 직접 실행
- 실시간 로그 모니터링

---

## 📝 배운 점 및 개선 사항

### **학습한 기술**
1. **Solidity 스마트 컨트랙트 개발**
2. **IPFS 분산 스토리지**
3. **Toss Payments API 통합**
4. **PostgreSQL RPC 함수**
5. **WebSocket 실시간 통신**
6. **Supabase MCP 활용**

### **향후 개선 가능 영역**
- [ ] NFT 마켓 현황 (Floor Price, Volume)
- [ ] Social Login (Google OAuth)
- [ ] NFT 에디터 (Canvas 기반)
- [ ] 경매 시스템 (English Auction)
- [ ] 다중 체인 지원 (Polygon, BSC)

---

## 📞 연락처 및 레포지토리

**GitHub**: [Repository URL]
**프로젝트 기간**: 2024년 10월 - 현재
**프레임워크**: React, Vite, Hardhat
**배포**: Vercel
**네트워크**: Ethereum Sepolia Testnet

---

## 🎯 포트폴리오 하이라이트

1. **Full-Stack Web3 개발**: 프론트엔드부터 블록체인까지 전체 파이프라인 구현
2. **실전 결제 시스템**: Toss Payments 통합으로 실제 상용 가능한 수준
3. **Blockchain Integration**: Sepolia Testnet에 배포된 실제 스마트 컨트랙트
4. **Modern Tech Stack**: 최신 React 19, Wagmi v2, Supabase MCP 사용
5. **Production Ready**: 보안, 에러 처리, 성능 최적화 완료

---

**© 2024 Key Mint. All rights reserved.**

