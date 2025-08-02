# 사주·운세 카카오톡 챗봇

## 프로젝트 개요

생년월일 및 생시 정보를 입력하면 오늘의 운세, 평생 사주 분석, 1년 운세 등을 제공하는 카카오톡 기반 챗봇 애플리케이션입니다. 사용자는 별도 로그인 없이 UUID를 통해 식별되며, 대화 이력을 참고해 자연스러운 문맥을 유지합니다.

## 주요 기능

- **입력 형식 검증**: `YYYY-MM-DD`(생년월일) 및 `HH:mm`(생시) 형식 검사 후, 잘못된 형식일 경우 재요청
- **현재 시각 크롤링**: WorldTimeAPI를 활용해 서울 기준 정확한 시각 조회
- **AI 응답 생성**: OpenAI ChatGPT API를 호출해 사주 및 운세 분석
- **대화 로그 관리**: 사용자별 대화 기록 저장·조회로 컨텍스트 유지
- **무로그인 환경**: 카카오톡 `user_key`를 UUID로 활용한 사용자 식별

## 시스템 아키텍처

1. **카카오톡 사용자**가 메시지 전송
2. **Kakao Chat API**가 Webhook 호출
3. **Vercel Serverless Functions**에서 API 처리
   - 입력 형식 검증 및 시간 크롤링
   - 대화 기록 조회·저장(Supabase 또는 Firebase)
   - OpenAI ChatGPT API 호출
4. **응답**을 카카오톡으로 반환

## 기술 스택

- 프론트엔드: Next.js (Vercel)
- 백엔드: Vercel Serverless Functions (API Routes)
- 데이터베이스: Supabase(PostgreSQL) 또는 Firebase
- 챗봇 플랫폼: Kakao i Open Builder
- AI: OpenAI ChatGPT API
- 시간 API: WorldTimeAPI (Asia/Seoul)

## 환경 변수 설정

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
KAKAO_API_KEY=
```

## 설치 및 배포

1. 레포지토리를 클론
2. Vercel에 프로젝트 연결
3. 환경 변수 설정
4. 테이블 마이그레이션 수행(Supabase)
5. 카카오톡 챗봇 Webhook URL 등록
6. 배포 완료 후 동작 확인

## 사용 방법

1. 카카오톡 채널에서 챗봇 시작
2. `생년월일: YYYY-MM-DD`, `생시: HH:mm` 형식으로 입력
3. 챗봇이 운세 결과를 응답

## 문의

- 개발자: Jihun Kong
- 이메일: [purusil55@gmail.com](mailto\:purusil55@gmail.com)
