# 배포 가이드

## 📋 사전 준비사항

### 1. 지갑 설정
- MetaMask 또는 다른 이더리움 지갑 설치
- Sepolia 테스트넷 ETH 획득 (https://sepoliafaucet.com)

### 2. API 키 발급

#### WalletConnect Project ID
1. https://cloud.walletconnect.com 접속
2. 프로젝트 생성
3. Project ID 복사

#### Etherscan API Key (선택사항)
1. https://etherscan.io/apis 접속
2. 계정 생성 및 API 키 발급

#### IPFS 서비스 (선택사항)
**web3.storage**
1. https://web3.storage 접속
2. 계정 생성 및 API 토큰 발급

**또는 Pinata**
1. https://pinata.cloud 접속
2. 계정 생성 및 API 키 발급

## 🔧 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 입력합니다:

```bash
# 필수: WalletConnect
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id

# 필수: 배포할 지갑의 개인키 (절대 공개하지 마세요!)
PRIVATE_KEY=your_wallet_private_key

# 선택: RPC URL (기본값 사용 가능)
VITE_SEPOLIA_RPC_URL=https://rpc.sepolia.org
SEPOLIA_RPC_URL=https://rpc.sepolia.org

# 선택: Etherscan API (컨트랙트 검증용)
ETHERSCAN_API_KEY=your_etherscan_api_key

# 선택: IPFS (web3.storage 또는 Pinata 중 선택)
WEB3_STORAGE_TOKEN=your_web3_storage_token
# 또는
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

# 선택: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.vercel.app/api/auth/google
```

## 🚀 스마트 컨트랙트 배포

### 1. 컨트랙트 컴파일

```bash
npx hardhat compile
```

### 2. Sepolia 테스트넷에 배포

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

배포가 완료되면 컨트랙트 주소가 출력됩니다. 이 주소들을 `.env.local`에 추가하세요:

```bash
VITE_USER_REGISTRY_ADDRESS=0x...
VITE_VAULT_NFT_ADDRESS=0x...
VITE_MARKETPLACE_ADDRESS=0x...
```

### 3. Etherscan에서 컨트랙트 검증 (선택사항)

```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## 🌐 프론트엔드 배포 (Vercel)

### 1. Vercel CLI 설치

```bash
npm i -g vercel
```

### 2. Vercel에 로그인

```bash
vercel login
```

### 3. 프로젝트 배포

```bash
# 개발 환경 배포
vercel

# 프로덕션 배포
vercel --prod
```

### 4. Vercel 환경 변수 설정

Vercel 대시보드에서 환경 변수를 설정합니다:

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 필요한 환경 변수 추가

**프로덕션 환경에 필요한 변수:**
- `VITE_WALLETCONNECT_PROJECT_ID`
- `VITE_USER_REGISTRY_ADDRESS`
- `VITE_VAULT_NFT_ADDRESS`
- `VITE_MARKETPLACE_ADDRESS`
- `WEB3_STORAGE_TOKEN` 또는 `PINATA_API_KEY`, `PINATA_SECRET_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` (선택)

## 🔄 업데이트 배포

코드 변경 후 다시 배포하려면:

```bash
# Git push (GitHub 연동된 경우 자동 배포)
git add .
git commit -m "Update"
git push

# 또는 수동 배포
vercel --prod
```

## ✅ 배포 확인

### 1. 프론트엔드 확인
- Vercel에서 제공한 URL로 접속
- 지갑 연결 테스트
- NFT 등록 및 거래 테스트

### 2. 스마트 컨트랙트 확인
- Sepolia Etherscan에서 컨트랙트 확인
- 트랜잭션 내역 확인

## 🐛 트러블슈팅

### 배포 실패 시

**문제: 가스 부족**
```
Error: insufficient funds for gas
```
**해결**: Sepolia 테스트넷 ETH를 더 받으세요 (https://sepoliafaucet.com)

**문제: nonce 오류**
```
Error: nonce has already been used
```
**해결**: 지갑을 리셋하거나 다른 계정을 사용하세요

**문제: RPC 연결 실패**
```
Error: could not detect network
```
**해결**: `SEPOLIA_RPC_URL`을 다른 RPC 엔드포인트로 변경하세요
- https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY (Alchemy)
- https://sepolia.infura.io/v3/YOUR_API_KEY (Infura)

### Vercel 배포 실패 시

**문제: 빌드 실패**
```
Error: Build failed
```
**해결**:
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. 모든 의존성이 package.json에 포함되어 있는지 확인

**문제: 환경 변수 인식 안됨**
**해결**: Vercel 대시보드에서 환경 변수를 다시 확인하고 재배포

## 📚 추가 리소스

- [Hardhat 문서](https://hardhat.org/docs)
- [Vercel 문서](https://vercel.com/docs)
- [WalletConnect 문서](https://docs.walletconnect.com/)
- [OpenZeppelin 문서](https://docs.openzeppelin.com/)
- [web3.storage 문서](https://web3.storage/docs/)

## 💡 팁

1. **개발 환경**: 로컬 Hardhat 네트워크를 사용하여 빠르게 테스트
   ```bash
   npx hardhat node
   npx hardhat run scripts/deploy.js --network localhost
   ```

2. **가스 비용 절약**: 트랜잭션을 보내기 전에 가스 견적 확인
   ```javascript
   const gasEstimate = await contract.estimateGas.functionName();
   ```

3. **보안**: 개인키는 절대 공개 저장소에 커밋하지 마세요!
   - `.gitignore`에 `.env.local` 포함 확인
   - GitHub에 업로드하기 전에 재확인

4. **모니터링**: Etherscan에서 컨트랙트 이벤트 모니터링

## 🎯 메인넷 배포

**주의**: 메인넷 배포는 실제 ETH를 사용합니다!

1. hardhat.config.js에 mainnet 설정 추가
2. 충분한 ETH 확보 (가스비 + 배포 비용)
3. 보안 감사 완료 확인
4. 배포 명령어 실행:
   ```bash
   npx hardhat run scripts/deploy.js --network mainnet
   ```

---

배포 중 문제가 발생하면 GitHub Issues에 질문을 남겨주세요!
