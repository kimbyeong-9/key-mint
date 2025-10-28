# 블록체인 사용자 데이터 저장 가이드

## 📖 개요

이 프로젝트는 **사용자 데이터를 블록체인에 안전하게 저장**하는 시스템을 구현합니다.

### 핵심 개념

```
사용자 회원가입 → 데이터 암호화 → 블록체인 저장 → 영구 보존
```

## 🔐 데이터 저장 방식

### 기본 UserRegistry (현재) ㅋㅋ

**저장되는 데이터:**
- ✅ 사용자명 해시 (keccak256)
- ✅ 등록 시간
- ✅ 지갑 주소

**장점:**
- 간단하고 안전
- 프라이버시 보호

**단점:**
- 제한적인 데이터만 저장
- 해시만으로는 원본 데이터 복구 불가

---

### 향상된 UserRegistryEnhanced (새로운 버전)

**저장되는 데이터:**
- ✅ 사용자명 해시 (검증용)
- ✅ **암호화된 이메일**
- ✅ **암호화된 추가 데이터** (JSON 형태)
- ✅ **IPFS 프로필 이미지 해시**
- ✅ 등록/업데이트 시간
- ✅ 인증 상태
- ✅ 지갑 주소

**장점:**
- 더 많은 데이터 저장 가능
- 암호화로 프라이버시 보호
- 본인만 복호화 가능
- IPFS와 통합 (이미지 등)

**단점:**
- 가스비가 더 높음
- 클라이언트에서 암호화/복호화 필요

---

## 🔒 보안 메커니즘

### 1. 클라이언트 사이드 암호화

사용자 데이터는 **블록체인에 저장되기 전에 브라우저에서 암호화**됩니다:

```javascript
사용자 입력 → 브라우저에서 암호화 → 블록체인 저장
```

**사용 기술:**
- Web Crypto API
- AES-GCM 256bit 암호화
- 사용자 지갑 서명으로 키 생성

### 2. 데이터 흐름

```
┌─────────────┐
│ 1. 사용자 입력  │
│ - 이메일      │
│ - 사용자명    │
│ - 추가 정보   │
└──────┬──────┘
       ↓
┌─────────────┐
│ 2. 암호화     │
│ (브라우저)    │
│ - AES-GCM   │
│ - 지갑 서명키 │
└──────┬──────┘
       ↓
┌─────────────┐
│ 3. 블록체인   │
│   저장       │
│ - Ethereum  │
│ - Immutable │
└──────┬──────┘
       ↓
┌─────────────┐
│ 4. 영구 보존  │
│ - 위변조 불가 │
│ - 투명성     │
└─────────────┘
```

---

## 💡 암호화 방식

### 대칭키 암호화 (AES-GCM)

```javascript
// 암호화 키 생성
const encryptionKey = await generateKeyFromSignature(
  walletSignature
);

// 데이터 암호화
const encryptedData = await encryptData(
  userData,
  encryptionKey
);

// 블록체인 저장
await userRegistry.register(
  usernameHash,
  encryptedEmail,
  encryptedData,
  ipfsHash
);
```

### 복호화 (본인만 가능)

```javascript
// 지갑 서명으로 키 복원
const decryptionKey = await generateKeyFromSignature(
  walletSignature
);

// 데이터 복호화
const userData = await decryptData(
  encryptedData,
  decryptionKey
);
```

---

## 🎯 사용 시나리오

### 시나리오 1: 회원가입

1. 사용자가 폼 작성 (이메일, 사용자명 등)
2. 브라우저에서 데이터 암호화
3. 스마트 컨트랙트 호출
4. 블록체인에 암호화된 데이터 저장
5. 트랜잭션 해시 반환

### 시나리오 2: 프로필 조회

1. 사용자 지갑 연결
2. 블록체인에서 암호화된 데이터 가져오기
3. 지갑 서명으로 키 생성
4. 데이터 복호화
5. 프로필 표시

### 시나리오 3: 다른 사용자 프로필 보기

1. 블록체인에서 공개 정보만 조회
   - 사용자명 해시
   - 등록 시간
   - IPFS 프로필 이미지
   - 인증 상태
2. 암호화된 데이터는 **복호화 불가** (본인만 가능)

---

## 📊 데이터 저장 구조

### UserProfile 구조체

```solidity
struct UserProfile {
    bytes32 usernameHash;      // 해시 (공개)
    bytes encryptedEmail;      // 암호화 (비공개)
    bytes encryptedData;       // 암호화 (비공개)
    string ipfsHash;           // IPFS 해시 (공개)
    uint256 createdAt;         // 시간 (공개)
    uint256 updatedAt;         // 시간 (공개)
    bool exists;               // 상태 (공개)
    bool isVerified;           // 인증 (공개)
}
```

### 저장 비용 (가스비)

| 작업 | 예상 가스 | ETH (100 gwei) |
|------|----------|----------------|
| 기본 등록 | ~100,000 | ~0.01 ETH |
| 향상된 등록 | ~200,000 | ~0.02 ETH |
| 프로필 업데이트 | ~80,000 | ~0.008 ETH |

---

## 🔧 구현 방법

### 1. 컨트랙트 배포

```bash
# 컴파일
npx hardhat compile

# Sepolia 테스트넷에 배포
npx hardhat run scripts/deploy.js --network sepolia

# 배포된 주소를 .env.local에 추가
VITE_USER_REGISTRY_ADDRESS=0x...
```

### 2. 프론트엔드 통합

```javascript
import { useRegisterEnhanced } from './hooks/useUserRegistry';

function Signup() {
  const { registerEnhanced } = useRegisterEnhanced();

  const handleSubmit = async (formData) => {
    // 1. 데이터 암호화
    const encrypted = await encryptUserData(formData);

    // 2. 블록체인 저장
    await registerEnhanced(
      encrypted.usernameHash,
      encrypted.email,
      encrypted.data,
      ipfsHash
    );
  };
}
```

---

## ⚠️ 주의사항

### 1. 프라이버시

- ✅ 민감한 데이터는 반드시 암호화
- ✅ 암호화 키는 사용자 지갑에서 생성
- ❌ 평문으로 저장 금지

### 2. 가스비

- 데이터가 많을수록 가스비 증가
- 큰 데이터는 IPFS에 저장하고 해시만 블록체인에 저장 권장

### 3. 불변성

- 블록체인에 저장된 데이터는 **삭제 불가**
- 업데이트만 가능
- 잘못된 데이터 저장 시 수정 어려움

### 4. 키 관리

- 암호화 키 분실 시 복호화 불가
- 지갑 개인키 관리 중요

---

## 🚀 다음 단계

### Phase 1: 기본 암호화 구현
- [x] UserRegistryEnhanced 컨트랙트 작성
- [ ] 암호화 유틸리티 함수 작성
- [ ] 회원가입 페이지 업데이트
- [ ] 테스트

### Phase 2: IPFS 통합
- [ ] IPFS 이미지 업로드
- [ ] 프로필 이미지 표시
- [ ] 메타데이터 저장

### Phase 3: 고급 기능
- [ ] 사용자 인증 시스템
- [ ] 복구 메커니즘
- [ ] 데이터 백업

---

## 📚 참고 자료

- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Ethereum Data Storage](https://ethereum.org/en/developers/docs/storage/)
- [IPFS Documentation](https://docs.ipfs.tech/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

## ✅ 체크리스트

현재 프로젝트 상태:

- [x] 기본 UserRegistry 구현
- [x] UserRegistryEnhanced 작성
- [ ] 암호화 유틸리티 구현
- [ ] 프론트엔드 통합
- [ ] 테스트 작성
- [ ] 배포

---

**마지막 업데이트**: 2025-10-19
**버전**: 2.0
**작성자**: Claude AI Assistant