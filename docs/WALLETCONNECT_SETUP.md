# WalletConnect 설정 가이드

WalletConnect를 사용하여 지갑 연결 기능을 활성화하는 방법을 안내합니다.

## 🚀 WalletConnect Project ID 발급받기

### 1. WalletConnect Cloud 접속
1. https://cloud.walletconnect.com 접속
2. 계정 생성 또는 로그인

### 2. 새 프로젝트 생성
1. "Create New Project" 버튼 클릭
2. 프로젝트 정보 입력:
   - **Project Name**: Key Mint
   - **Description**: NFT Marketplace with Web3 Integration
   - **Homepage URL**: http://localhost:3000 (개발용)
   - **App Icon**: 프로젝트 아이콘 (선택사항)

### 3. Project ID 복사
1. 프로젝트 생성 완료 후 **Project ID** 복사
2. 형식: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 4. 환경 변수 설정
`.env.local` 파일에서 다음 값 수정:

```bash
# 기존 (잘못된 값)
VITE_WALLETCONNECT_PROJECT_ID=demo_project_id_for_development

# 수정 (실제 Project ID)
VITE_WALLETCONNECT_PROJECT_ID=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 5. 개발 서버 재시작
```bash
npm run dev
```

## 🔧 문제 해결

### 일반적인 오류들

#### 1. "403 Forbidden" 오류
- **원인**: 잘못된 Project ID
- **해결**: 올바른 Project ID로 교체

#### 2. "400 Bad Request" 오류
- **원인**: Project ID 형식이 잘못됨
- **해결**: 32자리 영숫자 Project ID 확인

#### 3. 지갑 연결 안됨
- **원인**: 브라우저에 지갑 확장 프로그램이 없음
- **해결**: MetaMask, Coinbase Wallet 등 설치

### 개발 환경 설정

개발 중에는 다음을 확인하세요:

1. **네트워크 설정**: Sepolia 테스트넷 사용
2. **테스트 ETH**: https://sepoliafaucet.com에서 받기
3. **지갑 연결**: 브라우저 확장 프로그램 활성화

## 📱 지원되는 지갑

- MetaMask
- Coinbase Wallet
- WalletConnect
- Rainbow
- Trust Wallet
- 기타 WalletConnect 호환 지갑

## 🚀 프로덕션 배포

프로덕션 배포 시:

1. **도메인 업데이트**: WalletConnect Cloud에서 실제 도메인으로 변경
2. **HTTPS 필수**: 프로덕션에서는 HTTPS만 지원
3. **보안 설정**: 적절한 CORS 및 보안 정책 설정

## 📚 추가 자료

- [WalletConnect 공식 문서](https://docs.walletconnect.com/)
- [RainbowKit 문서](https://www.rainbowkit.com/)
- [wagmi 문서](https://wagmi.sh/)

---

**💡 팁**: 개발 중에는 데모 Project ID로도 기본 기능을 테스트할 수 있지만, 실제 지갑 연결을 위해서는 유효한 Project ID가 필요합니다.
