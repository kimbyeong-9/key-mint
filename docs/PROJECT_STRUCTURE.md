# Key Mint - 프로젝트 구조

## 전체 구조
```
/ (Vite)
src/
  Pages/                     # ← 페이지 컴포넌트
    Login.jsx
    Signup.jsx
    Home.jsx
    Detail.jsx               # /item/:id
    Create.jsx               # 업로드(모달 트리거 포함)
    Checkout.jsx
  Route/                     # ← 라우팅 설정
    index.jsx                # 라우터 설정 파일
  components/
    Layout.jsx
    Header.jsx
    NFTCard.jsx
    Modal.jsx
    BadgeNFT.jsx             # NFT 인증 마크
  hooks/
    useUserRegistry.js
    useNFT.js
    useMarket.js
  lib/
    wagmi.js                 # chains, config, connectors
    contracts.js             # 주소/ABI export
    ipfs.js                  # web3.storage or Pinata
    format.js
  abi/
    UserRegistry.json
    VaultNFT.json
    Marketplace.json
  styles/
    GlobalStyle.js
    theme.js
  App.jsx
  main.jsx
api/                         # Vercel serverless
  auth/google.js
  user.js
  upload.js                  # (선택) 서버에서 IPFS 업로드
.env.local
```

## 디렉토리 설명

### `/src/Pages/` - 페이지 컴포넌트
- **Login.jsx**: 사용자 로그인 페이지
- **Signup.jsx**: 사용자 회원가입 페이지
- **Home.jsx**: 메인 홈페이지 (NFT 목록 표시)
- **Detail.jsx**: NFT 상세 페이지 (`/item/:id` 경로)
- **Create.jsx**: NFT 업로드 페이지 (모달 트리거 포함)
- **Checkout.jsx**: 결제/구매 페이지

### `/src/Route/` - 라우팅 설정
- **index.jsx**: React Router v6 라우팅 설정 파일

### `/src/components/` - 재사용 가능한 컴포넌트
- **Layout.jsx**: 전체 레이아웃 컴포넌트
- **Header.jsx**: 헤더 네비게이션 컴포넌트
- **NFTCard.jsx**: NFT 카드 표시 컴포넌트
- **Modal.jsx**: 모달 컴포넌트
- **BadgeNFT.jsx**: NFT 인증 마크 컴포넌트

### `/src/hooks/` - 커스텀 훅
- **useUserRegistry.js**: 사용자 등록 관련 훅
- **useNFT.js**: NFT 관련 데이터 및 함수 훅
- **useMarket.js**: 마켓플레이스 관련 훅

### `/src/lib/` - 유틸리티 및 설정
- **wagmi.js**: Web3 연결 설정 (chains, config, connectors)
- **contracts.js**: 스마트 컨트랙트 주소 및 ABI export
- **ipfs.js**: IPFS 업로드 설정 (web3.storage 또는 Pinata)
- **format.js**: 데이터 포맷팅 유틸리티

### `/src/abi/` - 스마트 컨트랙트 ABI
- **UserRegistry.json**: 사용자 등록 컨트랙트 ABI
- **VaultNFT.json**: NFT 컨트랙트 ABI
- **Marketplace.json**: 마켓플레이스 컨트랙트 ABI

### `/src/styles/` - 스타일링
- **GlobalStyle.js**: 전역 스타일 설정
- **theme.js**: 테마 설정 (색상, 폰트 등)

### `/api/` - Vercel Serverless API
- **auth/google.js**: Google OAuth 인증 API
- **user.js**: 사용자 관련 API
- **upload.js**: IPFS 업로드 API (선택사항)

### 기타 파일
- **.env.local**: 환경 변수 설정
- **App.jsx**: 메인 앱 컴포넌트
- **main.jsx**: 앱 진입점

## 기술 스택
- **Frontend**: React + Vite
- **Routing**: React Router v6
- **Web3**: wagmi (Ethereum 연결)
- **IPFS**: web3.storage 또는 Pinata
- **Backend**: Vercel Serverless Functions
- **Styling**: CSS-in-JS 또는 styled-components

## 주요 기능
1. **사용자 인증**: Google OAuth + Web3 지갑 연결
2. **NFT 생성**: IPFS 업로드 + 스마트 컨트랙트 민팅
3. **마켓플레이스**: NFT 구매/판매
4. **사용자 등록**: Web3 지갑 기반 사용자 시스템

## 추가 파일
- **contracts/**: Solidity 스마트 컨트랙트 (UserRegistry, VaultNFT, Marketplace)
- **scripts/**: Hardhat 배포 스크립트
- **hardhat.config.js**: Hardhat 설정
- **vercel.json**: Vercel 배포 설정
- **DEPLOYMENT_GUIDE.md**: 상세 배포 가이드
- **.env.local.example**: 환경 변수 예시

## 개발 시작하기

### 1. 패키지 설치
```bash
npm install
```

### 2. 환경 변수 설정
```bash
cp .env.local.example .env.local
# .env.local 파일을 편집하여 필요한 값 입력
```

### 3. 개발 서버 실행
```bash
npm run dev
```

### 4. 스마트 컨트랙트 배포 (선택)
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

## 프로젝트 상태
✅ 모든 페이지 및 컴포넌트 구현 완료
✅ 스마트 컨트랙트 작성 완료
✅ Vercel Serverless API 구현 완료
✅ 배포 스크립트 및 가이드 작성 완료

## 다음 단계
1. WalletConnect Project ID 발급 및 .env.local에 추가
2. 스마트 컨트랙트를 Sepolia 테스트넷에 배포
3. 배포된 컨트랙트 주소를 .env.local에 추가
4. IPFS 서비스 (web3.storage 또는 Pinata) API 키 발급
5. Vercel에 배포
