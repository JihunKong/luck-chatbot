# 🔮 카카오톡 사주·운세 챗봇

생년월일과 생시 정보로 사주팔자를 분석하고 운세를 제공하는 카카오톡 챗봇입니다.
OpenAI GPT-4o-mini 모델을 사용하여 개인 맞춤형 운세를 제공합니다.

## 📱 주요 기능

- ✨ **오늘의 운세**: 일일 운세 제공
- 📅 **월간 운세**: 이번 달 전체 운세
- 🎊 **연간 운세**: 올해 운세 분석
- 🌟 **평생 사주**: 타고난 사주와 인생 조언
- 💾 **대화 기록 저장**: 사용자별 운세 이력 관리
- ⚡ **빠른 응답**: 캐싱을 통한 빠른 응답 속도

## 🚀 시작하기 (초보자 가이드)

### 📋 사전 준비사항

1. **Node.js 설치** (v18 이상)
   - [Node.js 공식 사이트](https://nodejs.org/)에서 다운로드
   - 설치 확인: `node --version`

2. **계정 생성 필요**
   - [OpenAI](https://platform.openai.com/signup) - API 키 발급용
   - [Supabase](https://supabase.com) - 데이터베이스용
   - [Vercel](https://vercel.com) - 배포용
   - [카카오 개발자](https://developers.kakao.com) - 챗봇 등록용

### 🛠️ Step 1: 프로젝트 설치

```bash
# 1. 저장소 클론 (또는 다운로드)
git clone https://github.com/your-username/luck-chatbot.git
cd luck-chatbot

# 2. 패키지 설치
npm install
```

### 🔑 Step 2: API 키 설정

1. `.env.local` 파일 열기
2. 각 서비스에서 발급받은 키 입력:

```env
# OpenAI API 키 (필수)
# https://platform.openai.com/api-keys 에서 발급
OPENAI_API_KEY=sk-실제키입력

# Supabase 설정 (필수)
# Supabase 프로젝트 > Settings > API
SUPABASE_URL=https://프로젝트명.supabase.co
SUPABASE_ANON_KEY=여기에anon키입력
SUPABASE_SERVICE_ROLE_KEY=여기에service키입력

# 카카오 API 키 (선택)
KAKAO_API_KEY=카카오키입력
```

### 💾 Step 3: 데이터베이스 설정

1. [Supabase](https://app.supabase.com) 로그인
2. 새 프로젝트 생성
3. SQL Editor 열기
4. `supabase/schema.sql` 파일의 내용 복사
5. SQL Editor에 붙여넣고 실행

### 🖥️ Step 4: 로컬 테스트

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 확인

### 🌐 Step 5: Vercel 배포

#### 방법 1: Vercel CLI 사용
```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel

# 프로덕션 배포
vercel --prod
```

#### 방법 2: GitHub 연동
1. GitHub에 코드 푸시
2. [Vercel 대시보드](https://vercel.com/dashboard)에서 Import
3. 환경 변수 설정
4. Deploy 클릭

### 💬 Step 6: 카카오톡 연동

#### 6.1 카카오 i 오픈빌더 설정

1. [카카오 i 오픈빌더](https://i.kakao.com) 접속
2. 새 봇 만들기
3. **스킬 서버 설정**:
   - URL: `https://your-app.vercel.app/api/kakao/webhook`
   - 메소드: POST

#### 6.2 시나리오 블록 생성

1. **시나리오** > **블록 추가**
2. **스킬 응답** 선택
3. 생성한 스킬 서버 연결

#### 6.3 발화 패턴 등록

다음 발화 패턴 추가:
- "안녕"
- "시작"
- "도움말"
- "#생년월일"
- "운세"
- "사주"

#### 6.4 배포 및 테스트

1. **배포** 탭에서 배포
2. **테스트** 탭에서 테스트
3. 카카오톡에서 채널 추가 후 사용

## 📖 사용 방법

### 카카오톡에서 사용하기

1. 채널 추가
2. 대화 시작
3. 생년월일 입력

**입력 예시:**
```
1990-01-01 14:30
1990년 1월 1일 오후 2시 30분
19900101
```

**명령어:**
- `오늘의 운세` - 일일 운세
- `이번 달 운세` - 월간 운세
- `올해 운세` - 연간 운세
- `평생 사주` - 인생 전반 분석
- `도움말` - 사용법 안내

## 🧪 API 테스트 (Postman/Insomnia)

### 엔드포인트
```
POST https://your-app.vercel.app/api/kakao/webhook
```

### 요청 본문 예시
```json
{
  "userRequest": {
    "timezone": "Asia/Seoul",
    "utterance": "1990-01-01 14:30",
    "lang": "ko",
    "user": {
      "id": "test_user_123",
      "type": "accountId"
    }
  }
}
```

## 📁 프로젝트 구조

```
luck-chatbot/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── kakao/
│   │   │       └── webhook/
│   │   │           └── route.ts      # 메인 웹훅 핸들러
│   │   ├── globals.css              # 전역 스타일
│   │   ├── layout.tsx               # 레이아웃
│   │   └── page.tsx                 # 홈페이지
│   ├── lib/
│   │   ├── openai.ts                # OpenAI 클라이언트
│   │   ├── supabase.ts              # Supabase 클라이언트
│   │   ├── fortune.ts               # 운세 로직
│   │   └── time.ts                  # 시간 유틸리티
│   └── types/
│       └── kakao.ts                 # 카카오 타입 정의
├── supabase/
│   └── schema.sql                   # DB 스키마
├── .env.local                       # 환경 변수 (Git 제외)
├── package.json                     # 프로젝트 설정
└── README.md                        # 이 파일
```

## 🐛 문제 해결

### 자주 발생하는 문제들

#### 1. "OPENAI_API_KEY is not defined" 에러
- `.env.local` 파일에 API 키가 정확히 입력되었는지 확인
- 서버 재시작: `npm run dev`

#### 2. Supabase 연결 실패
- Supabase URL과 키가 올바른지 확인
- 데이터베이스 스키마가 실행되었는지 확인

#### 3. 카카오톡 응답 없음
- 웹훅 URL이 정확한지 확인
- Vercel 배포가 완료되었는지 확인
- 카카오 i 오픈빌더에서 배포했는지 확인

#### 4. 5초 타임아웃 에러
- OpenAI API 응답이 느린 경우
- 캐싱 기능이 정상 작동하는지 확인

## 💰 비용 관리

### 예상 비용 (월 기준)
- **OpenAI GPT-4o-mini**: 
  - 입력: $0.15 / 1M 토큰
  - 출력: $0.60 / 1M 토큰
  - 예상: 1000명 사용 시 약 $5-10

- **Supabase**: 
  - Free tier: 500MB 무료
  - 대부분의 경우 무료로 충분

- **Vercel**:
  - Hobby plan: 무료
  - 100GB 대역폭 포함

### 비용 절감 팁
1. 운세 캐싱 활용 (24시간)
2. Rate limiting 구현
3. 사용량 모니터링

## 🔒 보안 주의사항

1. **절대 하지 말아야 할 것들**:
   - API 키를 코드에 직접 입력 ❌
   - `.env.local` 파일을 Git에 커밋 ❌
   - 민감한 정보 로깅 ❌

2. **반드시 해야 할 것들**:
   - 환경 변수 사용 ✅
   - HTTPS 사용 ✅
   - Rate limiting 구현 ✅

## 📈 모니터링

### Vercel Analytics
- 대시보드에서 실시간 모니터링
- 에러 로그 확인
- 사용량 통계

### Supabase Dashboard
- 데이터베이스 사용량
- API 호출 횟수
- 실시간 데이터 확인

## 🤝 기여하기

1. Fork 하기
2. Feature 브랜치 생성 (`git checkout -b feature/AmazingFeature`)
3. 커밋 (`git commit -m 'Add some AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Pull Request 생성

## 📄 라이선스

MIT License - 자유롭게 사용하세요!

## 💬 문의 및 지원

- 이슈: [GitHub Issues](https://github.com/your-username/luck-chatbot/issues)
- 이메일: purusil55@gmail.com
- 카카오톡 채널: @luck_chatbot (예시)

## 🙏 감사의 말

- OpenAI - GPT-4o-mini 모델 제공
- Supabase - 데이터베이스 서비스
- Vercel - 호스팅 서비스
- 카카오 - 챗봇 플랫폼

---

**Made with ❤️ by Jihun Kong**

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!