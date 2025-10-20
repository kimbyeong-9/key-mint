# Supabase MCP 연결 가이드

## Supabase MCP란?

Model Context Protocol (MCP)를 사용하여 Cursor IDE에서 Supabase 데이터베이스를 직접 관리할 수 있습니다.

## 1단계: Supabase Access Token 생성

1. **https://supabase.com/dashboard** 접속
2. 오른쪽 상단 프로필 클릭
3. **Account Settings** 선택
4. 왼쪽 메뉴에서 **Access Tokens** 클릭
5. **Generate New Token** 버튼 클릭
6. Token 이름: `cursor-mcp` (또는 원하는 이름)
7. **Generate Token** 클릭
8. **토큰 복사** (한 번만 보여집니다!)

예시: `sbp_xxxxxxxxxxxxxxxxxxxxxxxxxx`

## 2단계: key-mint 프로젝트 정보 확인

현재 key-mint 프로젝트 정보:
- **프로젝트 ID (Project Ref)**: `lrlqolmmuxmvuatvbjip`
- **프로젝트명**: `key-mint`

## 3단계: MCP 설정 파일 업데이트

`~/.cursor/mcp.json` 파일에 key-mint 프로젝트 추가:

```json
{
  "mcpServers": {
    "supabase-video_call_app": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=copqtgkymbhdayglatqg"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_d45c530556e9ef8c2f7a2b9e6742069f05fc4e5f"
      }
    },
    "supabase-key-mint": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=lrlqolmmuxmvuatvbjip"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "여기에_생성한_토큰_붙여넣기"
      }
    }
  }
}
```

## 4단계: Cursor 재시작

1. Cursor IDE 완전히 종료
2. Cursor 다시 시작
3. MCP 연결 자동 활성화

## 5단계: MCP 사용

Cursor에서 다음과 같은 작업을 할 수 있습니다:

### 데이터베이스 쿼리:
```
@supabase-key-mint users 테이블의 모든 데이터를 보여줘
```

### 테이블 생성:
```
@supabase-key-mint users 테이블 생성해줘
```

### 스키마 확인:
```
@supabase-key-mint 데이터베이스 스키마를 확인해줘
```

### 데이터 삽입:
```
@supabase-key-mint users 테이블에 테스트 데이터 추가해줘
```

## Supabase Access Token 생성 (자세한 단계)

### 방법 1: Supabase 대시보드

1. https://supabase.com/dashboard 접속
2. 오른쪽 상단 **프로필 아이콘** 클릭
3. **Account Settings** 선택
4. 왼쪽 사이드바에서 **Access Tokens** 클릭
5. **Generate New Token** 버튼
6. 정보 입력:
   - **Name**: `cursor-mcp-key-mint`
   - **Scope**: Full access (기본값)
7. **Generate Token** 클릭
8. 생성된 토큰 **복사** (다시 볼 수 없습니다!)
9. 안전한 곳에 보관

### 방법 2: Supabase CLI (터미널)

```bash
# Supabase CLI 설치 (없는 경우)
npm install -g supabase

# 로그인
supabase login

# Access Token 생성
supabase projects api-keys --project-ref lrlqolmmuxmvuatvbjip
```

## MCP 설정 파일 위치

- **macOS/Linux**: `~/.cursor/mcp.json`
- **Windows**: `C:\Users\YourUsername\.cursor\mcp.json`

## 예시: 완성된 mcp.json

```json
{
  "mcpServers": {
    "supabase-video_call_app": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=copqtgkymbhdayglatqg"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_d45c530556e9ef8c2f7a2b9e6742069f05fc4e5f"
      }
    },
    "supabase-key-mint": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--project-ref=lrlqolmmuxmvuatvbjip"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "sbp_YOUR_NEW_TOKEN_HERE"
      }
    }
  }
}
```

## MCP 명령어 예시

### 1. 테이블 조회
```
@supabase-key-mint SELECT * FROM users LIMIT 10;
```

### 2. 테이블 생성 확인
```
@supabase-key-mint users 테이블이 존재하는지 확인해줘
```

### 3. 스키마 확인
```
@supabase-key-mint users 테이블의 컬럼 정보를 알려줘
```

### 4. 데이터 삽입
```
@supabase-key-mint users 테이블에 테스트 사용자 추가:
- address: 0x1234567890123456789012345678901234567890
- username: test_user
- email: test@example.com
```

### 5. 데이터 업데이트
```
@supabase-key-mint address가 0x1234...인 사용자의 username을 변경해줘
```

### 6. Row Count
```
@supabase-key-mint users 테이블에 몇 명의 사용자가 있는지 알려줘
```

## 트러블슈팅

### 문제 1: MCP 서버가 연결되지 않음

**해결**:
1. Cursor 완전히 종료 후 재시작
2. mcp.json 파일 위치 확인
3. JSON 문법 오류 확인 (쉼표, 중괄호 등)

### 문제 2: Access Token 오류

```
Error: Invalid access token
```

**해결**:
1. Access Token 다시 생성
2. 토큰이 올바르게 복사되었는지 확인
3. 따옴표 안에 토큰이 들어갔는지 확인

### 문제 3: Project Ref 오류

```
Error: Project not found
```

**해결**:
- Project Ref 확인: `lrlqolmmuxmvuatvbjip`
- Supabase 대시보드 > 프로젝트 설정 > General에서 확인

### 문제 4: npx 명령어 오류

**해결**:
1. Node.js 설치 확인: `node --version`
2. npm 업데이트: `npm install -g npm`
3. npx 재설치: `npm install -g npx`

## MCP 작동 확인

Cursor에서 테스트:

1. 새 채팅 시작
2. `@supabase-key-mint` 입력
3. 자동완성에 나타나면 연결 성공!
4. `@supabase-key-mint users 테이블 보여줘` 입력

## 보안 주의사항

⚠️ **Access Token 보안**:
- Access Token은 **절대 공유하지 마세요**
- Git에 커밋하지 마세요
- 유출 시 즉시 Revoke하고 재생성

⚠️ **mcp.json 파일**:
- 로컬 머신에만 저장됨
- 버전 관리(Git)에 포함하지 마세요
- 다른 사람과 공유하지 마세요

## 다음 단계

1. ✅ Supabase Access Token 생성
2. ✅ mcp.json 파일 업데이트
3. ✅ Cursor 재시작
4. ✅ MCP 테스트
5. 🚀 Cursor에서 Supabase 데이터베이스 관리 시작!

## 참고 자료

- [Supabase MCP 공식 문서](https://github.com/supabase/mcp-server-supabase)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Cursor MCP 설정](https://docs.cursor.com/context/model-context-protocol)
