# Context 7 MCP 설정 가이드

## 📋 Context 7 MCP란?

Context 7은 AI 기반 개발 도구로, MCP (Model Context Protocol)를 통해 최신 버전의 라이브러리와 프레임워크를 자동으로 추적하고 업데이트할 수 있게 해주는 도구입니다.

## 🔍 현재 상태 확인

프로젝트에서 Context 7 MCP는 현재 **설치되어 있지 않습니다**.

```bash
# 확인 결과:
✗ Context 7 CLI 미설치
✗ Context 7 환경 변수 없음
✗ MCP 설정 파일 없음
```

## 📦 Context 7 MCP 설치

### 방법 1: npm을 통한 설치

```bash
# 전역 설치
npm install -g @context7/cli

# 또는 프로젝트 단위 설치
npm install --save-dev @context7/cli
```

### 방법 2: yarn을 통한 설치

```bash
# 전역 설치
yarn global add @context7/cli

# 또는 프로젝트 단위 설치
yarn add -D @context7/cli
```

## ⚙️ Context 7 프로젝트 설정

### 1. Context 7 초기화

```bash
# 프로젝트 루트에서 실행
npx context7 init
```

이 명령어는 `.context7` 폴더와 설정 파일을 생성합니다.

### 2. MCP 설정 파일 생성

`.context7/config.json` 파일을 생성하고 다음 내용을 추가:

```json
{
  "version": "1.0",
  "mcp": {
    "enabled": true,
    "providers": ["npm", "github"],
    "updateCheck": "daily",
    "autoUpdate": false
  },
  "dependencies": {
    "track": [
      "react",
      "react-dom",
      "vite",
      "wagmi",
      "@rainbow-me/rainbowkit",
      "styled-components"
    ]
  },
  "frameworks": {
    "react": {
      "version": "latest",
      "router": "v6"
    },
    "vite": {
      "version": "latest",
      "plugins": ["@vitejs/plugin-react"]
    }
  }
}
```

### 3. 환경 변수 설정

`.env.local`에 Context 7 설정 추가:

```bash
# Context 7 MCP 설정
CONTEXT7_ENABLED=true
CONTEXT7_AUTO_UPDATE=false
CONTEXT7_CHECK_INTERVAL=daily
```

## 🚀 Context 7 사용법

### 의존성 버전 확인

```bash
# 모든 의존성의 최신 버전 확인
npx context7 check

# 특정 패키지 확인
npx context7 check react
```

### 의존성 업데이트

```bash
# 대화형 업데이트
npx context7 update

# 자동 업데이트 (주의!)
npx context7 update --auto

# 특정 패키지만 업데이트
npx context7 update react wagmi
```

### 호환성 검사

```bash
# 패키지 간 호환성 확인
npx context7 compat

# 특정 버전 조합 테스트
npx context7 compat react@18 wagmi@2
```

## 📊 MCP 프로토콜 활용

### 1. 자동 버전 추적

Context 7은 다음을 자동으로 추적합니다:
- npm 패키지 최신 버전
- 보안 취약점
- 호환성 이슈
- Breaking changes

### 2. AI 기반 권장사항

```bash
# AI가 추천하는 업데이트 확인
npx context7 recommend

# 프로젝트 분석 및 최적화 제안
npx context7 analyze
```

### 3. 자동 마이그레이션

```bash
# 주요 버전 업그레이드 시 자동 마이그레이션
npx context7 migrate react@18 react@19
```

## 🔧 프로젝트별 MCP 설정

### React + Vite 프로젝트 (현재 프로젝트)

```json
{
  "mcp": {
    "rules": [
      {
        "package": "react",
        "policy": "minor-updates-only",
        "notify": true
      },
      {
        "package": "vite",
        "policy": "patch-only",
        "autoUpdate": true
      },
      {
        "package": "wagmi",
        "policy": "manual",
        "reason": "Web3 library - needs careful testing"
      }
    ]
  }
}
```

### 정책 옵션
- `major-updates`: 주요 버전 업데이트 포함
- `minor-updates-only`: 마이너 버전까지만
- `patch-only`: 패치 버전만
- `manual`: 수동으로만 업데이트

## 🛡️ 보안 및 안전성

### 1. 자동 보안 검사

```bash
# 보안 취약점 스캔
npx context7 security

# CVE 데이터베이스 확인
npx context7 security --cve-check
```

### 2. 백업 및 롤백

Context 7은 자동으로 백업을 생성합니다:

```bash
# 현재 상태 백업
npx context7 backup

# 이전 버전으로 롤백
npx context7 rollback

# 백업 목록 확인
npx context7 backup list
```

## 🎯 우리 프로젝트에 적용

### 1. 빠른 설정

```bash
# 1. Context 7 설치
npm install -g @context7/cli

# 2. 프로젝트 초기화
cd /Users/byeong9/Desktop/key-mint
npx context7 init

# 3. 의존성 분석
npx context7 analyze

# 4. 업데이트 확인
npx context7 check
```

### 2. 권장 설정

프로젝트에 맞는 `.context7/config.json`:

```json
{
  "version": "1.0",
  "project": {
    "name": "key-mint",
    "type": "react-vite",
    "blockchain": true
  },
  "mcp": {
    "enabled": true,
    "updateCheck": "weekly",
    "autoUpdate": false,
    "notifications": true
  },
  "dependencies": {
    "critical": [
      "wagmi",
      "@rainbow-me/rainbowkit",
      "viem"
    ],
    "track": [
      "react",
      "react-dom",
      "vite",
      "styled-components"
    ]
  },
  "security": {
    "autoScan": true,
    "blockMalicious": true,
    "checkDependencies": true
  }
}
```

### 3. CI/CD 통합

GitHub Actions에 Context 7 추가:

```yaml
# .github/workflows/context7-check.yml
name: Context 7 Dependency Check

on:
  schedule:
    - cron: '0 0 * * 1' # 매주 월요일
  workflow_dispatch:

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Context 7
        run: npm install -g @context7/cli
      - name: Check Dependencies
        run: npx context7 check
      - name: Security Scan
        run: npx context7 security
```

## 📝 주의사항

### ⚠️ 중요

1. **자동 업데이트 비활성화**: 블록체인 프로젝트는 자동 업데이트 권장하지 않음
2. **테스트 필수**: 업데이트 후 반드시 전체 테스트 실행
3. **스마트 컨트랙트 주의**: 컨트랙트 관련 라이브러리는 수동 업데이트
4. **호환성 확인**: wagmi, viem 등 Web3 라이브러리는 버전 간 호환성 중요

## 🔗 대안 도구

Context 7 MCP가 아직 베타이거나 사용이 어려운 경우 대안:

### 1. Dependabot (GitHub)
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
```

### 2. Renovate Bot
```json
{
  "extends": ["config:base"],
  "packageRules": [
    {
      "matchPackagePatterns": ["^wagmi", "^viem"],
      "automerge": false
    }
  ]
}
```

### 3. npm-check-updates
```bash
npm install -g npm-check-updates

# 업데이트 가능 항목 확인
ncu

# package.json 업데이트
ncu -u

# 설치
npm install
```

## 📚 추가 리소스

- [Context 7 공식 문서](https://context7.dev)
- [MCP 프로토콜 스펙](https://modelcontextprotocol.io)
- [npm-check-updates](https://github.com/raineorshine/npm-check-updates)
- [Dependabot](https://docs.github.com/en/code-security/dependabot)

## ✅ 체크리스트

현재 프로젝트에 Context 7 MCP를 설정하려면:

- [ ] Context 7 CLI 설치
- [ ] 프로젝트 초기화 (`npx context7 init`)
- [ ] 설정 파일 생성 (`.context7/config.json`)
- [ ] 환경 변수 추가 (`.env.local`)
- [ ] 첫 의존성 검사 실행
- [ ] CI/CD 통합 (선택사항)

---

**참고**: Context 7 MCP는 선택사항입니다. 프로젝트는 이 도구 없이도 정상적으로 작동합니다.
의존성 관리를 자동화��고 싶을 때만 설정하시면 됩니다!