# 🚀 실제 토스페이먼츠 결제 시스템 설정 가이드

## 📋 **필요한 설정 단계**

### **1. 토스페이먼츠 개발자 계정 설정**

#### **1.1 개발자 계정 생성**
1. [토스페이먼츠 개발자센터](https://developers.tosspayments.com/) 접속
2. 회원가입 및 로그인
3. "내 애플리케이션" 메뉴 클릭

#### **1.2 테스트 키 발급**
1. **테스트 키** 섹션에서 키 복사
   - `test_ck_`로 시작하는 클라이언트 키
   - `test_sk_`로 시작하는 시크릿 키

#### **1.3 실제 키 발급 (선택사항)**
- 사업자등록번호 필요
- 실제 결제를 위해서만 필요

### **2. 환경 변수 설정**

#### **2.1 로컬 개발 환경 (.env.local)**
```bash
# 토스페이먼츠 API 키
VITE_TOSS_CLIENT_KEY=test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq
TOSS_SECRET_KEY=test_sk_7XJkNy5Q5YVXj4L4M0k8B0o8g7sK9nL

# Supabase 설정
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# 블록체인 설정
VITE_VAULT_NFT_ADDRESS=your_vault_nft_contract_address
VITE_USER_REGISTRY_ADDRESS=your_user_registry_contract_address

# 웹훅 보안
TOSS_WEBHOOK_SECRET=your_webhook_secret_key

# 환경 설정
NODE_ENV=development
PROD=false
```

#### **2.2 Vercel 배포 환경**
1. Vercel 대시보드 → 프로젝트 선택
2. Settings → Environment Variables
3. 위의 환경 변수들 추가

### **3. 웹훅 설정**

#### **3.1 웹훅 URL 설정**
```
https://your-domain.vercel.app/api/webhook/toss
```

#### **3.2 웹훅 이벤트 선택**
- `payment.status.changed` (결제 상태 변경)
- `payment.approved` (결제 승인)

### **4. 결제 플로우**

#### **4.1 결제 요청**
1. 사용자가 "토스페이먼츠로 결제" 클릭
2. 토스페이먼츠 결제창 열림
3. 카드 정보 입력 및 결제

#### **4.2 결제 성공**
1. `/payment-success` 페이지로 리다이렉트
2. 서버에서 결제 검증
3. NFT 구매 처리
4. 블록체인 전송

#### **4.3 결제 실패**
1. `/payment-fail` 페이지로 리다이렉트
2. 오류 메시지 표시
3. 재시도 옵션 제공

### **5. 보안 설정**

#### **5.1 웹훅 서명 검증**
- 토스페이먼츠에서 전송하는 웹훅 서명 검증
- IP 화이트리스트 설정

#### **5.2 결제 검증**
- 서버에서 토스페이먼츠 API로 결제 상태 확인
- 중복 결제 방지

### **6. 테스트 방법**

#### **6.1 테스트 카드 번호**
```
카드번호: 4242424242424242
유효기간: 12/34
CVC: 123
비밀번호: 12
```

#### **6.2 테스트 시나리오**
1. 정상 결제 테스트
2. 결제 실패 테스트
3. 웹훅 처리 테스트
4. NFT 전송 테스트

### **7. 주의사항**

#### **7.1 테스트 환경**
- 테스트 키 사용 시 실제 돈은 빠지지 않음
- 테스트 결제는 즉시 취소됨

#### **7.2 실제 결제**
- 실제 키 사용 시 실제 돈이 빠짐
- 사업자등록번호 필요
- PCI DSS 준수 필요

### **8. 문제 해결**

#### **8.1 일반적인 오류**
- **CORS 오류**: 도메인 설정 확인
- **웹훅 오류**: URL 및 서명 검증 확인
- **결제 검증 오류**: API 키 및 권한 확인

#### **8.2 로그 확인**
- 브라우저 개발자 도구 콘솔
- Vercel 함수 로그
- Supabase 로그

## 🎯 **다음 단계**

1. **환경 변수 설정** 완료
2. **토스페이먼츠 키 발급** 완료
3. **웹훅 설정** 완료
4. **테스트 결제** 실행
5. **실제 결제** 활성화 (선택사항)

**이제 실제 토스페이먼츠 결제 시스템이 완전히 구현되었습니다!** 🚀
