# 🚀 배포 가이드 - 카카오톡 운세 챗봇

## 📋 필요한 정보 체크리스트

### ✅ 필수 API 키 및 서비스

1. **OpenAI API Key** (필요)
   - [OpenAI Platform](https://platform.openai.com/api-keys)에서 발급
   - GPT-4o-mini 모델 사용

2. **Supabase 계정** (필요)
   - 프로젝트 URL
   - Anon Key
   - Service Role Key
   - [Supabase 가입](https://supabase.com)

3. **Vercel 계정** (필요)
   - [Vercel 가입](https://vercel.com)
   - GitHub 연동 권장

4. **카카오 개발자 계정** (필요)
   - [카카오 개발자](https://developers.kakao.com)
   - 카카오 i 오픈빌더 접근

---

## 🐳 Docker 환경 실행 (포트 3131)

### 방법 1: Makefile 사용 (권장)

```bash
# 초기 설정
make setup

# Docker 개발 환경 실행
make dev-docker

# 또는 로컬 개발 (Docker 없이)
make dev
```

### 방법 2: Docker Compose 직접 실행

```bash
# 환경 변수 설정
cp .env.docker .env.local
# .env.local 파일 편집하여 실제 키 입력

# Docker 컨테이너 실행 (포트 3131)
docker-compose up

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f
```

### 방법 3: Docker 직접 실행

```bash
# 이미지 빌드
docker build -t luck-chatbot .

# 컨테이너 실행 (포트 3131)
docker run -p 3131:3000 --env-file .env.docker luck-chatbot
```

### 접속 확인
- 브라우저: http://localhost:3131
- API 테스트: http://localhost:3131/api/kakao/webhook

---

## ⚡ Vercel CLI 배포

### 1. Vercel CLI 설치 및 로그인

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login
```

### 2. 프로젝트 초기화

```bash
# 프로젝트 디렉토리에서 실행
vercel

# 질문에 대한 답변:
# ? Set up and deploy "luck-chatbot"? [Y/n] Y
# ? Which scope do you want to deploy to? (개인 계정 선택)
# ? Link to existing project? [y/N] N
# ? What's your project's name? luck-chatbot
# ? In which directory is your code located? ./
```

### 3. 환경 변수 설정

#### 방법 1: Vercel 대시보드에서 설정
1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. Settings → Environment Variables
4. 다음 변수 추가:
   - `OPENAI_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

#### 방법 2: CLI로 설정

```bash
# 환경 변수 추가 (각각 실행)
vercel env add OPENAI_API_KEY production
# 값 입력: (OpenAI 대시보드에서 발급받은 API 키)

vercel env add SUPABASE_URL production
# 값 입력: https://your-project.supabase.co

vercel env add SUPABASE_ANON_KEY production
# 값 입력: (Supabase 대시보드에서 복사)

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# 값 입력: (Supabase 대시보드에서 복사)
```

### 4. 배포

```bash
# 프리뷰 배포 (테스트용)
vercel

# 프로덕션 배포
vercel --prod

# 또는 Makefile 사용
make deploy
```

### 5. 배포 확인

배포 완료 후 제공되는 URL:
- 프로덕션: `https://luck-chatbot.vercel.app`
- 프리뷰: `https://luck-chatbot-xxxxx.vercel.app`

---

## 🗄️ Supabase 설정

### 1. 프로젝트 생성

1. [Supabase](https://app.supabase.com) 로그인
2. "New Project" 클릭
3. 프로젝트 정보 입력:
   - Name: `luck-chatbot`
   - Database Password: (안전한 비밀번호)
   - Region: `Northeast Asia (Seoul)`

### 2. 데이터베이스 스키마 적용

1. SQL Editor 열기
2. `supabase/schema.sql` 파일 내용 복사
3. 실행 (Run 버튼)

### 3. API 키 확인

Settings → API 에서:
- `URL`: Project URL
- `anon` `public`: Anon Key
- `service_role` `secret`: Service Role Key

---

## 💬 카카오톡 연동

### 1. 카카오 i 오픈빌더 설정

1. [카카오 i 오픈빌더](https://i.kakao.com) 접속
2. 봇 만들기
3. 스킬 서버 설정:
   - URL: `https://luck-chatbot.vercel.app/api/kakao/webhook`
   - 메소드: POST

### 2. 시나리오 설정

1. 시나리오 → 블록 추가
2. 스킬 응답 선택
3. 스킬 서버 연결

### 3. 발화 패턴

다음 패턴 추가:
- "안녕"
- "시작"
- "#생년월일"
- "운세"
- "도움말"

### 4. 배포 및 테스트

1. 배포 탭에서 배포
2. 테스트 탭에서 테스트
3. 실제 카카오톡에서 확인

---

## 🧪 테스트

### API 엔드포인트 테스트

```bash
# 로컬 테스트 (Docker)
curl -X POST http://localhost:3131/api/kakao/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userRequest": {
      "utterance": "1990-01-01 14:30",
      "user": {
        "id": "test_user"
      }
    }
  }'

# 프로덕션 테스트
curl -X POST https://luck-chatbot.vercel.app/api/kakao/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "userRequest": {
      "utterance": "안녕",
      "user": {
        "id": "test_user"
      }
    }
  }'
```

---

## 📊 모니터링

### Vercel 대시보드
- Functions 탭: API 호출 로그
- Analytics 탭: 사용량 통계
- Logs 탭: 실시간 로그

### Supabase 대시보드
- Table Editor: 데이터 확인
- API Logs: API 호출 기록
- Database: 쿼리 실행

---

## 🚨 문제 해결

### Docker 관련

#### 포트 3131이 이미 사용 중
```bash
# 사용 중인 포트 확인
lsof -i :3131

# 프로세스 종료
kill -9 [PID]
```

#### Docker 이미지 재빌드
```bash
docker-compose down
docker-compose up --build
```

### Vercel 관련

#### 환경 변수가 적용되지 않음
```bash
# 환경 변수 다시 가져오기
vercel env pull

# 재배포
vercel --prod --force
```

#### 빌드 실패
```bash
# 로컬에서 빌드 테스트
npm run build

# 캐시 삭제 후 재배포
vercel --prod --force
```

### Supabase 관련

#### 연결 실패
- Project URL이 올바른지 확인
- API 키가 올바른지 확인
- RLS 정책 확인

---

## 🎯 체크리스트

### Docker 실행
- [ ] `.env.docker` 파일에 API 키 입력
- [ ] `docker-compose up` 실행
- [ ] http://localhost:3131 접속 확인

### Vercel 배포
- [ ] Vercel CLI 설치 (`npm i -g vercel`)
- [ ] `vercel login` 실행
- [ ] 환경 변수 설정
- [ ] `vercel --prod` 배포
- [ ] 배포 URL 확인

### 카카오톡 연동
- [ ] 카카오 i 오픈빌더에 스킬 서버 등록
- [ ] 시나리오 블록 생성
- [ ] 발화 패턴 등록
- [ ] 배포 및 테스트

---

## 📞 지원

문제가 발생하면:
1. [GitHub Issues](https://github.com/your-username/luck-chatbot/issues)
2. 이메일: purusil55@gmail.com

---

**Happy Deployment! 🚀**