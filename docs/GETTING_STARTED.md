# Key Mint 시작 가이드 🚀

블록체인 기반 NFT 마켓플레이스 프로젝트에 오신 것을 환영합니다!

## 📋 목차

1. [프로젝트 개요](#프로젝트-개요)
2. [빠른 시작](#빠른-시작)
3. [상세 설정](#상세-설정)
4. [개발 가이드](#개발-가이드)
5. [배포 가이드](#배포-가이드)

## 프로젝트 개요

### 주요 기능
- ✅ **회원가입/로그인**: 구글 소셜 로그인 + 지갑 연결
- ✅ **NFT 발행**: IPFS에 이미지 업로드 후 블록체인에 민팅
- ✅ **NFT 거래**: 마켓플레이스에서 NFT 판매/구매
- ✅ **블록체인 저장**: 사용자 정보를 블록체인에 안전하게 저장 (해시값)

### 기술 스택
- **Frontend**: React 18 + Vite + React Router v6
- **Styling**: styled-components (색상: #00539C, #EEA47F)
- **Web3**: wagmi + viem + RainbowKit
- **Backend**: Vercel Serverless Functions
- **Blockchain**: Solidity 0.8.20 + Hardhat + OpenZeppelin
- **Storage**: IPFS (web3.storage 또는 Pinata)

## 빠른 시작

### 1. 프로젝트 설치

```bash
cd key-mint
npm install
```

### 2. 환경 변수 설정

```bash
# 예시 파일 복사
cp .env.local.example .env.local

# .env.local 파일 편집
# 최소한 다음 변수는 설정해야 합니다:
# - VITE_WALLETCONNECT_PROJECT_ID (필수)
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:3000으로 접속하세요!

## 상세 설정

### 필수 설정

#### 1. WalletConnect Project ID 발급

1. https://cloud.walletconnect.com 접속
2. 계정 생성 및 로그인
3. "Create New Project" 클릭
4. 프로젝트 이름 입력 (예: Key Mint)
5. Project ID 복사
6. `.env.local`에 추가:
   ```bash
   VITE_WALLETCONNECT_PROJECT_ID=your_project_id_here
   ```

### 선택 설정

#### 2. 스마트 컨트랙트 배포 (테스트용)

스마트 컨트랙트를 실제로 사용하려면 배포가 필요합니다:

```bash
# 컴파일
npx hardhat compile

# Sepolia 테스트넷에 배포
npx hardhat run scripts/deploy.js --network sepolia

# 배포된 주소를 .env.local에 추가
VITE_USER_REGISTRY_ADDRESS=0x...
VITE_VAULT_NFT_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
```

자세한 내용은 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

#### 3. IPFS 설정 (NFT 이미지 저장)

**옵션 A: web3.storage**
1. https://web3.storage 접속
2. 계정 생성
3. API 토큰 발급
4. `.env.local`에 추가:
   ```bash
   WEB3_STORAGE_TOKEN=your_token_here
   ```

**옵션 B: Pinata**
1. https://pinata.cloud 접속
2. 계정 생성
3. API 키 발급
4. `.env.local`에 추가:
   ```bash
   PINATA_API_KEY=your_api_key
   PINATA_SECRET_KEY=your_secret_key
   ```

#### 4. Google OAuth 설정 (선택사항)

1. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
2. `.env.local`에 추가:
   ```bash
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google
   ```

## 개발 가이드

### 프로젝트 구조

```
key-mint/
├── src/
│   ├── Route/          # 페이지 (Login, Signup, Home, Detail, Create, Checkout)
│   ├── components/     # 재사용 컴포넌트 (Layout, Header, NFTCard, Modal, BadgeNFT)
│   ├── hooks/          # 커스텀 훅 (useUserRegistry, useNFT, useMarket)
│   ├── lib/            # 유틸리티 (wagmi, contracts, ipfs, format)
│   └── styles/         # 스타일 (theme, GlobalStyle)
├── api/                # Vercel Serverless API
├── contracts/          # Solidity 스마트 컨트랙트
└── scripts/            # 배포 스크립트
```

### 주요 페이지

1. **로그인** (`/login`): 일반 로그인 + 구글 소셜 로그인
2. **회원가입** (`/signup`): 지갑 연결 후 블록체인에 사용자 등록
3. **홈** (`/`): 등록된 NFT 목록 표시
4. **상세** (`/item/:id`): NFT 상세 정보 및 구매 버튼
5. **등록** (`/create`): NFT 발행 및 마켓플레이스 등록
6. **결제** (`/checkout/:listingId`): NFT 구매 및 결제 처리

### 개발 시 주의사항

1. **지갑 연결 필수**: 대부분의 기능은 지갑 연결이 필요합니다
2. **테스트넷 사용**: 개발 시 Sepolia 테스트넷을 사용하세요
3. **가스비 준비**: 테스트넷 ETH가 필요합니다 (https://sepoliafaucet.com)
4. **환경 변수 확인**: 기능 사용 전 필요한 환경 변수가 설정되었는지 확인

### 유용한 명령어

```bash
# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview

# 컨트랙트 컴파일
npx hardhat compile

# 로컬 블록체인 실행
npx hardhat node

# 테스트
npx hardhat test
```

## 배포 가이드

### Vercel 배포

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

자세한 배포 가이드는 다음 문서를 참조하세요:
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 상세 배포 가이드
- [VERCEL_MCP_GUIDE.md](./VERCEL_MCP_GUIDE.md) - Vercel MCP 연동 가이드

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: #00539C (블루) - 메인 액션, 버튼
- **Secondary**: #EEA47F (오렌지) - 강조, 하이라이트
- **Background**: #0a0a0a (다크 블랙) - 배경
- **Text**: #ffffff (화이트) - 텍스트
- **Gray**: #a0a0a0 - 서브 텍스트, 구분선

### 컴포넌트 스타일
모든 컴포넌트는 styled-components를 사용하며, theme.js에 정의된 디자인 토큰을 활용합니다.

## 🔐 보안

### 프라이버시 보호
- 사용자명은 keccak256 해시로 변환하여 블록체인에 저장
- 이메일 등 민감한 정보는 백엔드 DB에만 저장
- 개인키는 절대 코드에 포함하지 않음

### 스마트 컨트랙트 보안
- OpenZeppelin 라이브러리 사용
- ReentrancyGuard로 재진입 공격 방지
- CEI 패턴 (Checks-Effects-Interactions) 적용

## 🐛 문제 해결

### 자주 발생하는 문제

**1. 지갑 연결 안됨**
- WalletConnect Project ID가 설정되어 있는지 확인
- 브라우저에 지갑 확장 프로그램이 설치되어 있는지 확인

**2. 트랜잭션 실패**
- 지갑에 충분한 ETH가 있는지 확인
- 네트워크가 Sepolia로 설정되어 있는지 확인
- 가스 한도가 충분한지 확인

**3. 빌드 오류**
- `node_modules` 삭제 후 `npm install` 재실행
- Node.js 버전 확인 (16.x 이상 권장)

**4. 환경 변수 인식 안됨**
- `.env.local` 파일이 프로젝트 루트에 있는지 확인
- 환경 변수 이름이 `VITE_` 접두사로 시작하는지 확인
- 개발 서버 재시작

## 📚 추가 리소스

### 문서
- [README.md](./README.md) - 프로젝트 개요
- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - 프로젝트 구조
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - 배포 가이드
- [VERCEL_MCP_GUIDE.md](./VERCEL_MCP_GUIDE.md) - Vercel MCP 가이드

### 외부 문서
- [Vite 문서](https://vitejs.dev/)
- [React Router 문서](https://reactrouter.com/)
- [wagmi 문서](https://wagmi.sh/)
- [Hardhat 문서](https://hardhat.org/)
- [OpenZeppelin 문서](https://docs.openzeppelin.com/)

## 💪 다음 단계

1. ✅ 프로젝트 설치 완료
2. ✅ WalletConnect 설정
3. ⏳ 스마트 컨트랙트 배포
4. ⏳ IPFS 설정
5. ⏳ Vercel 배포
6. ⏳ 실제 NFT 등록 및 테스트

## 🤝 기여하기

프로젝트에 기여하고 싶으시다면:
1. Fork 후 Pull Request 제출
2. 이슈 등록
3. 피드백 제공

## 📞 지원

문제가 발생하면:
1. [문제 해결](#-문제-해결) ���션 확인
2. GitHub Issues에 질문 등록
3. 문서를 다시 확인

---

**즐거운 개발 되세요!** 🎉

Key Mint 팀