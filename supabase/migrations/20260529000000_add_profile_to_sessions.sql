-- search_sessions에 분석된 프로필 전체를 JSON으로 저장
-- (기존 extracted_keywords는 후방호환을 위해 유지)
ALTER TABLE search_sessions ADD COLUMN IF NOT EXISTS profile JSONB;
