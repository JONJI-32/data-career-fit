-- ============================================
-- data-career-fit: 초기 스키마
-- Supabase SQL Editor에서 실행
-- ============================================

-- 유사도 검색을 위한 확장
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================
-- 1. 채용 공고 테이블
-- ============================================
CREATE TABLE job_postings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    company_type TEXT,                          -- '대기업', '스타트업', '중견기업', '외국계'
    location TEXT,                              -- '서울 강남구'
    salary_min INTEGER,                         -- 만원 단위
    salary_max INTEGER,
    salary_text TEXT,                           -- 원본 텍스트 '4000~6000만원'
    job_type TEXT,                              -- '정규직', '계약직', '인턴'
    experience_min INTEGER,                     -- 년수
    experience_max INTEGER,
    experience_text TEXT,                       -- '경력 3~5년' 또는 '신입'
    description TEXT NOT NULL,                  -- 전체 직무 설명
    requirements TEXT[] DEFAULT '{}',           -- 자격 요건
    preferred TEXT[] DEFAULT '{}',              -- 우대 사항
    tech_stack TEXT[] DEFAULT '{}',             -- 기술 스택 ['Python', 'SQL', ...]
    category TEXT NOT NULL,                     -- 'data_scientist', 'data_analyst', 'data_engineer', 'ml_engineer'
    source_site TEXT NOT NULL,                  -- 'wanted', 'jasoseol', 'saramin', ...
    source_url TEXT,                            -- 원본 공고 URL
    deadline DATE,                              -- 마감일 (NULL = 상시채용)
    posted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 인덱스
CREATE INDEX idx_job_postings_description_trgm
    ON job_postings USING gin (description gin_trgm_ops);
CREATE INDEX idx_job_postings_tech_stack
    ON job_postings USING gin (tech_stack);
CREATE INDEX idx_job_postings_category
    ON job_postings (category);
CREATE INDEX idx_job_postings_source_site
    ON job_postings (source_site);
CREATE INDEX idx_job_postings_is_active
    ON job_postings (is_active);

-- ============================================
-- 2. 검색 세션 테이블 (회원가입 없이 세션 기반)
-- ============================================
CREATE TABLE search_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_token TEXT NOT NULL UNIQUE,
    pdf_text TEXT,
    generated_prompt TEXT,
    final_prompt TEXT,
    extracted_keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. 검색 결과 테이블
-- ============================================
CREATE TABLE search_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID REFERENCES search_sessions(id) ON DELETE CASCADE,
    job_posting_id UUID REFERENCES job_postings(id) ON DELETE CASCADE,
    similarity_score FLOAT NOT NULL,
    matched_keywords TEXT[] DEFAULT '{}',
    rank INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_results_session
    ON search_results (session_id);

-- ============================================
-- 4. RLS (Row Level Security) - 공개 읽기 허용
-- ============================================
ALTER TABLE job_postings ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE search_results ENABLE ROW LEVEL SECURITY;

-- 공고는 누구나 읽기 가능
CREATE POLICY "job_postings_read" ON job_postings
    FOR SELECT USING (true);

-- 세션은 누구나 생성/읽기 가능
CREATE POLICY "search_sessions_insert" ON search_sessions
    FOR INSERT WITH CHECK (true);
CREATE POLICY "search_sessions_read" ON search_sessions
    FOR SELECT USING (true);
CREATE POLICY "search_sessions_update" ON search_sessions
    FOR UPDATE USING (true);

-- 결과는 누구나 생성/읽기 가능
CREATE POLICY "search_results_insert" ON search_results
    FOR INSERT WITH CHECK (true);
CREATE POLICY "search_results_read" ON search_results
    FOR SELECT USING (true);
