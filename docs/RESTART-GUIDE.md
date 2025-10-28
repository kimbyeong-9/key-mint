# 🔥 완전 초기화 후 재시작 가이드

**작성일**: 2025-10-21
**목적**: 회원가입/로그인 기능을 처음부터 다시 시작

---

## ✅ 생성된 새 파일

1. **src/lib/supabase-simple.js** - 간단한 Supabase Auth (MCP 제거)
2. **src/Pages/Signup-simple.jsx** - 간단한 회원가입 페이지
3. **src/Pages/Login-simple.jsx** - 간단한 로그인 페이지

---

## 🚀 테스트 방법

### 1단계: 모든 dev 서버 종료

터미널에서 실행:
```bash
killall -9 node
```

### 2단계: Dev 서버 시작

새 터미널에서 실행:
```bash
cd /Users/byeong9/Desktop/key-mint
npm run dev
```

### 3단계: 라우터 임시 수정

`src/App.jsx` 또는 라우터 파일을 열어서 다음 라우트를 **임시로** 추가:

```javascript
import SignupSimple from './Pages/Signup-simple';
import LoginSimple from './Pages/Login-simple';

// 라우터에 추가
<Route path="/signup-test" element={<SignupSimple />} />
<Route path="/login-test" element={<LoginSimple />} />
```

### 4단계: 테스트

1. **회원가입 테스트**: http://localhost:3001/signup-test
   - 사용자명: testuser
   - 이메일: test@example.com
   - 비밀번호: test1234

2. **로그인 테스트**: http://localhost:3001/login-test
   - 위에서 가입한 이메일/비밀번호로 로그인

---

## ✅ 정상 작동 확인되면

**기존 파일을 새 파일로 교체:**

```bash
# 백업은 이미 되어 있음 (.backup-날짜 파일들)
mv src/lib/supabase-simple.js src/lib/supabase.js
mv src/Pages/Signup-simple.jsx src/Pages/Signup.jsx
mv src/Pages/Login-simple.jsx src/Pages/Login.jsx
```

---

## 🔧 디버깅

### 문제: 401 Unauthorized 오류

**해결책**:
1. 브라우저 콘솔에서 확인:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

2. 둘 다 undefined이면 → .env.local 파일 확인
3. Dev 서버 재시작

### 문제: 여전히 작동 안 함

**완전 초기화**:
```bash
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

---

## 📌 주요 차이점

### 기존 코드 (복잡)
- ❌ SupabaseMCP 사용 (브라우저에서 작동 안 함)
- ❌ SQL Injection 취약점
- ❌ 중복 확인, 블록체인 등 복잡한 기능
- ❌ 300+ 줄 코드

### 새 코드 (간단)
- ✅ Supabase Client만 사용 (브라우저 작동)
- ✅ 안전한 Parameterized Query
- ✅ 회원가입/로그인만 구현
- ✅ 100줄 이하 코드
- ✅ 확실하게 작동

---

## 🎯 다음 단계

**회원가입/로그인 정상 작동 확인 후:**

1. 중복 확인 기능 추가
2. 블록체인 연동
3. 디자인 개선

**한 번에 하나씩, 확실하게!**

---

## 💡 핵심 교훈

- **간단한 것부터 시작**
- **작동 확인 후 기능 추가**
- **복잡한 코드는 나중에**

