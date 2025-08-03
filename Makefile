# 카카오톡 운세 챗봇 Makefile
# 사용법: make [명령어]

.PHONY: help dev dev-docker build deploy clean install setup

# 기본 명령어 (도움말 표시)
help:
	@echo "=== 🔮 카카오톡 운세 챗봇 명령어 ==="
	@echo ""
	@echo "📦 설정 명령어:"
	@echo "  make install      - 패키지 설치"
	@echo "  make setup        - 초기 설정 (패키지 설치 + 환경 변수)"
	@echo ""
	@echo "🚀 개발 명령어:"
	@echo "  make dev          - 로컬 개발 서버 실행 (포트 3131)"
	@echo "  make dev-docker   - Docker 개발 환경 실행"
	@echo ""
	@echo "🏗️ 빌드 명령어:"
	@echo "  make build        - Next.js 빌드"
	@echo "  make build-docker - Docker 이미지 빌드"
	@echo ""
	@echo "📤 배포 명령어:"
	@echo "  make deploy       - Vercel 프로덕션 배포"
	@echo "  make preview      - Vercel 프리뷰 배포"
	@echo ""
	@echo "🧹 정리 명령어:"
	@echo "  make clean        - 빌드 파일 정리"
	@echo "  make clean-docker - Docker 정리"

# 패키지 설치
install:
	@echo "📦 패키지 설치 중..."
	npm install

# 초기 설정
setup: install
	@echo "🔧 초기 설정 중..."
	@if [ ! -f .env.local ]; then \
		cp .env.docker .env.local; \
		echo "✅ .env.local 파일이 생성되었습니다. API 키를 입력해주세요."; \
	else \
		echo "⚠️  .env.local 파일이 이미 존재합니다."; \
	fi
	@echo "📋 다음 단계:"
	@echo "1. .env.local 파일에 실제 API 키 입력"
	@echo "2. Supabase 프로젝트 생성 및 스키마 실행"
	@echo "3. make dev 또는 make dev-docker로 개발 시작"

# 로컬 개발 서버 (포트 3131)
dev:
	@echo "🚀 개발 서버 시작 (http://localhost:3131)..."
	npm run dev

# Docker 개발 환경
dev-docker:
	@echo "🐳 Docker 개발 환경 시작 (http://localhost:3131)..."
	docker-compose up

# Docker 개발 환경 (재빌드)
dev-docker-rebuild:
	@echo "🐳 Docker 이미지 재빌드 및 실행..."
	docker-compose up --build

# Next.js 빌드
build:
	@echo "🏗️ Next.js 애플리케이션 빌드 중..."
	npm run build

# Docker 이미지 빌드
build-docker:
	@echo "🐳 Docker 이미지 빌드 중..."
	docker build -t luck-chatbot .

# Docker 실행 (빌드된 이미지)
run-docker:
	@echo "🐳 Docker 컨테이너 실행 (http://localhost:3131)..."
	docker run -p 3131:3000 --env-file .env.docker luck-chatbot

# Vercel 프로덕션 배포
deploy:
	@echo "📤 Vercel 프로덕션 배포 중..."
	@echo "⚠️  환경 변수가 Vercel에 설정되어 있는지 확인하세요!"
	vercel --prod

# Vercel 프리뷰 배포
preview:
	@echo "👀 Vercel 프리뷰 배포 중..."
	vercel

# Vercel 환경 변수 설정
vercel-env:
	@echo "🔐 Vercel 환경 변수 설정..."
	@echo "다음 명령어를 실행하여 환경 변수를 추가하세요:"
	@echo ""
	@echo "vercel env add OPENAI_API_KEY production"
	@echo "vercel env add SUPABASE_URL production"
	@echo "vercel env add SUPABASE_ANON_KEY production"
	@echo "vercel env add SUPABASE_SERVICE_ROLE_KEY production"

# 로그 확인
logs:
	@echo "📋 Vercel 로그 확인..."
	vercel logs

# Docker 로그
logs-docker:
	@echo "📋 Docker 로그 확인..."
	docker-compose logs -f

# 상태 확인
status:
	@echo "📊 프로젝트 상태 확인..."
	@echo ""
	@echo "Node.js 버전:"
	@node --version
	@echo ""
	@echo "npm 버전:"
	@npm --version
	@echo ""
	@echo "Docker 버전:"
	@docker --version 2>/dev/null || echo "Docker가 설치되어 있지 않습니다."
	@echo ""
	@echo "Vercel CLI:"
	@vercel --version 2>/dev/null || echo "Vercel CLI가 설치되어 있지 않습니다."

# 빌드 파일 정리
clean:
	@echo "🧹 빌드 파일 정리 중..."
	rm -rf .next
	rm -rf out
	rm -rf node_modules/.cache

# Docker 정리
clean-docker:
	@echo "🧹 Docker 컨테이너 및 이미지 정리 중..."
	docker-compose down
	docker rmi luck-chatbot 2>/dev/null || true

# 전체 정리
clean-all: clean clean-docker
	@echo "🧹 전체 정리 완료!"

# 테스트 (API 엔드포인트)
test-api:
	@echo "🧪 API 엔드포인트 테스트..."
	@curl -X POST http://localhost:3131/api/kakao/webhook \
		-H "Content-Type: application/json" \
		-d '{"userRequest":{"utterance":"안녕","user":{"id":"test_user"}}}' \
		| python -m json.tool

# Supabase 스키마 적용
db-migrate:
	@echo "🗄️ Supabase 스키마 적용..."
	@echo "Supabase SQL Editor에서 supabase/schema.sql 파일 내용을 실행하세요."
	@echo "또는 Supabase CLI를 사용하세요: supabase db push"

# 프로젝트 정보
info:
	@echo "=== 🔮 카카오톡 운세 챗봇 정보 ==="
	@echo ""
	@echo "프로젝트: luck-chatbot"
	@echo "버전: 0.1.0"
	@echo "포트: 3131"
	@echo "프레임워크: Next.js 14"
	@echo "AI 모델: OpenAI GPT-4o-mini"
	@echo ""
	@echo "주요 기능:"
	@echo "  - 생년월일 기반 운세 제공"
	@echo "  - 일일/월간/연간/평생 운세"
	@echo "  - 대화 기록 저장"
	@echo "  - 운세 캐싱"