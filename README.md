# Key Mint - 블록체인 기반 NFT 마켓플레이스

블록체인 기술과 NFT를 활용한 디지털 아트 거래 플랫폼입니다.

## 🚀 주요 기능

### 사용자 관리
- **회원가입**: 지갑 연결 후 사용자 정보를 블록체인에 저장 (프라이버시 보호를 위해 해시값만 저장)
- **로그인**: 일반 로그인 + 구글 소셜 로그인 지원
- **지갑 연결**: RainbowKit을 통한 다양한 지갑 지원

### NFT 기능
- **NFT 발행**: IPFS에 이미지 업로드 후 ERC-721 NFT 민팅
- **NFT 거래**: 마켓플레이스에서 NFT 판매 및 구매
- **NFT 인증**: 블록체인에 기록된 NFT 인증 배지 표시

### 마켓플레이스
- **홈페이지**: 등록된 NFT 목록 조회
- **상세페이지**: NFT 정보 및 결제 기능
- **결제시스템**: ETH를 이용한 안전한 거래

## 🛠 기술 스택

### Frontend
- **React 18** + **Vite**: 빠른 개발 환경
- **React Router v6**: 페이지 라우팅
- **styled-components**: CSS-in-JS 스타일링
- **wagmi + viem**: 이더리움 상호작용
- **RainbowKit**: 지갑 연결 UI

### Backend
- **Vercel Serverless Functions**: API 엔드포인트
- **IPFS**: 분산 파일 저장 (web3.storage 또는 Pinata)

### Blockchain
- **Solidity 0.8.20**: 스마트 컨트랙트
- **OpenZeppelin**: 안전한 컨트랙트 라이브러리
- **Hardhat**: 컨트랙트 개발 및 배포
- **Ethereum Sepolia**: 테스트넷

## 📁 프로젝트 구조

```
key-mint/
├── src/
│   ├── Route/              # 페이지 컴포넌트
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Home.jsx
│   │   ├── Detail.jsx
│   │   ├── Create.jsx
│   │   └── Checkout.jsx
│   ├── components/         # 재사용 컴포넌트
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── NFTCard.jsx
│   │   ├── Modal.jsx
│   │   └── BadgeNFT.jsx
│   ├── hooks/              # 커스텀 훅
│   │   ├── useUserRegistry.js
│   │   ├── useNFT.js
│   │   └── useMarket.js
│   ├── lib/                # 유틸리티
│   │   ├── wagmi.js
│   │   ├── contracts.js
│   │   ├── ipfs.js
│   │   └── format.js
│   ├── styles/             # 스타일
│   │   ├── GlobalStyle.js
│   │   └── theme.js
│   ├── App.jsx
│   └── main.jsx
├── api/                    # Vercel Serverless API
│   ├── auth/
│   │   └── google.js
│   ├── user.js
│   └── upload.js
├── contracts/              # 스마트 컨트랙트
│   ├── UserRegistry.sol
│   ├── VaultNFT.sol
│   └── Marketplace.sol
├── hardhat.config.js
├── package.json
└── README.md
```

## 🔧 설치 및 실행

### 1. 프로젝트 클론 및 의존성 설치

```bash
cd key-mint
npm install
```

### 2. 환경 변수 설정

`.env.local.example` 파일을 복사하여 `.env.local` 파일을 생성하고 필요한 값을 입력합니다.

```bash
cp .env.local.example .env.local
```

### 3. 스마트 컨트랙트 배포

```bash
# Hardhat 로컬 네트워크 실행 (선택사항)
npx hardhat node

# 컨트랙트 컴파일
npx hardhat compile

# Sepolia 테스트넷에 배포
npx hardhat run scripts/deploy.js --network sepolia

# 배포된 컨트랙트 주소를 .env.local에 업데이트
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000으로 접속합니다.

## 🔐 보안 고려사항

### 프라이버시 보호
- 사용자명은 해시(keccak256)로 변환하여 블록체인에 저장
- 이메일 등 민감한 정보는 백엔드 DB에만 저장

### 가스 최적화
- 필요한 데이터만 온체인에 저장
- 메타데이터는 IPFS에 저장하여 가스 비용 절감

### 재진입 공격 방지
- OpenZeppelin의 ReentrancyGuard 사용
- CEI 패턴 (Checks-Effects-Interactions) 적용

## 📝 스마트 컨트랙트

### UserRegistry
사용자 등록 정보를 블록체인에 저장합니다.

```solidity
function register(bytes32 usernameHash) external
function getProfile(address user) external view returns (bytes32, uint256)
```

### VaultNFT (ERC-721)
NFT 발행 및 관리를 담당합니다.

```solidity
function mint(address to, string memory tokenURI) external returns (uint256)
function approve(address to, uint256 tokenId) external
```

### Marketplace
NFT 판매 및 구매를 처리합니다.

```solidity
function list(address nft, uint256 tokenId, uint256 price) external returns (uint256)
function buy(uint256 listingId) external payable
function cancel(uint256 listingId) external
```

## 🎨 디자인

### 색상 팔레트
- **Primary**: #00539C (블루)
- **Secondary**: #EEA47F (오렌지)
- **Background**: #0a0a0a (다크 블랙)
- **Text**: #ffffff (화이트)
- **Gray**: #a0a0a0

### 테마
다크 모드 기반의 모던한 디자인으로 NFT 마켓플레이스의 특성을 살렸습니다.

## 🚀 배포

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 환경 변수 설정
Vercel 대시보드에서 환경 변수를 설정해야 합니다.

## 📚 추가 개선 사항

### 단기
- [ ] 실제 데이터베이스 연동 (Supabase, PlanetScale 등)
- [ ] IPFS 업로드 기능 완성
- [ ] 토큰 ID 추적 개선 (이벤트 리스닝)
- [ ] 에러 처리 개선

### 중기
- [ ] 로열티 시스템 (EIP-2981)
- [ ] 경매 기능
- [ ] NFT 컬렉션 지원
- [ ] 프로필 페이지

### 장기
- [ ] 메인넷 배포
- [ ] 멀티체인 지원
- [ ] DAO 거버넌스
- [ ] 모바일 앱

## 🤝 기여

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

## 📄 라이선스

MIT License

## 📞 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 등록해주세요.

---

**Key Mint** - 블록체인으로 디지털 아트의 가치를 보존하세요.
