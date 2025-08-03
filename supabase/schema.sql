-- Supabase에서 실행할 데이터베이스 스키마
-- 1. Supabase 대시보드에 로그인
-- 2. SQL Editor로 이동
-- 3. 아래 SQL 코드를 복사하여 실행

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kakao_user_key TEXT UNIQUE NOT NULL,
  birth_date DATE,
  birth_time TIME,
  zodiac_animal TEXT,
  zodiac_sign TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- 대화 기록 테이블
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  fortune_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW())
);

-- 운세 캐시 테이블
CREATE TABLE IF NOT EXISTS fortune_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  fortune_type TEXT NOT NULL,
  content TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  UNIQUE(user_id, fortune_type)
);

-- 사용 통계 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  tokens_used INTEGER DEFAULT 0,
  api_calls INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('Asia/Seoul', NOW()),
  UNIQUE(user_id, date)
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_users_kakao_key ON users(kakao_user_key);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fortune_cache_user_type ON fortune_cache(user_id, fortune_type);
CREATE INDEX IF NOT EXISTS idx_fortune_cache_expires ON fortune_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON usage_stats(user_id, date);

-- Row Level Security (RLS) 정책 설정
-- 보안을 위해 RLS를 활성화하고 서비스 역할 키로만 접근 가능하도록 설정

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE fortune_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- 서비스 역할에게 모든 권한 부여
CREATE POLICY "Service role can do everything" ON users
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON conversations
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON fortune_cache
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything" ON usage_stats
  FOR ALL USING (auth.role() = 'service_role');

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('Asia/Seoul', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- users 테이블에 트리거 적용
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 뷰 생성: 사용자별 최근 운세 조회 (선택사항)
CREATE OR REPLACE VIEW recent_fortunes AS
SELECT 
  u.id AS user_id,
  u.kakao_user_key,
  u.birth_date,
  u.birth_time,
  fc.fortune_type,
  fc.content,
  fc.expires_at,
  fc.created_at
FROM users u
LEFT JOIN fortune_cache fc ON u.id = fc.user_id
WHERE fc.expires_at > NOW()
ORDER BY fc.created_at DESC;

-- 통계 함수: 일일 사용자 수 (선택사항)
CREATE OR REPLACE FUNCTION get_daily_active_users(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(DISTINCT user_id)
    FROM conversations
    WHERE DATE(created_at) = target_date
  );
END;
$$ LANGUAGE plpgsql;

-- 통계 함수: 인기 운세 타입 (선택사항)
CREATE OR REPLACE FUNCTION get_popular_fortune_types(days INTEGER DEFAULT 7)
RETURNS TABLE(fortune_type TEXT, request_count BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.fortune_type,
    COUNT(*) as request_count
  FROM conversations c
  WHERE c.created_at >= NOW() - INTERVAL '1 day' * days
    AND c.fortune_type IS NOT NULL
  GROUP BY c.fortune_type
  ORDER BY request_count DESC;
END;
$$ LANGUAGE plpgsql;

-- 샘플 데이터 (테스트용 - 선택사항)
-- INSERT INTO users (kakao_user_key, birth_date, birth_time)
-- VALUES 
--   ('test_user_1', '1990-01-01', '14:30:00'),
--   ('test_user_2', '1985-05-15', '09:00:00'),
--   ('test_user_3', '2000-12-25', NULL);

-- 스키마 생성 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ 데이터베이스 스키마가 성공적으로 생성되었습니다!';
  RAISE NOTICE '📋 생성된 테이블: users, conversations, fortune_cache, usage_stats';
  RAISE NOTICE '🔒 Row Level Security가 활성화되었습니다.';
  RAISE NOTICE '📊 통계 함수가 생성되었습니다.';
END $$;