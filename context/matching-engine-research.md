# 매칭 엔진 구현 리서치 정리

## 프로필 → 공고 매칭에 사용되는 데이터 필드

### 프로필 (AnalyzeResult — `src/lib/types.ts`)
| 필드 | 타입 | 매칭 역할 | 예시 |
|------|------|-----------|------|
| skills | string[] | tech_stack 교집합 (가중치 0.5) | Python, SQL, TensorFlow |
| job_categories | string[] | category 일치 여부 (가중치 0.2) | data_analyst, ml_engineer |
| domain_keywords | string[] | description 텍스트 포함 여부 (가중치 0.3) | 머신러닝, 추천시스템, 핀테크 |
| project_highlights | string[] | MVP에서는 매칭 미사용 (UI 표시용) | — |
| summary | string | MVP에서는 매칭 미사용 (UI 표시용) | — |

### 채용 공고 (job_postings 테이블)
| 필드 | 매칭 대상 | 비고 |
|------|-----------|------|
| tech_stack[] | profile.skills와 교집합 | GIN 인덱스 있음 |
| description | profile.domain_keywords 포함 검사 | pg_trgm 인덱스 있음, requirements+preferred+main_tasks 합본 |
| requirements[] | keyword 검사 대상 (description에 이미 포함됨) | 크롤러가 description에 합쳐서 저장 |
| preferred[] | keyword 검사 대상 (description에 이미 포함됨) | 크롤러가 description에 합쳐서 저장 |
| category | profile.job_categories와 일치 여부 | data_scientist, data_analyst, data_engineer, ml_engineer, other |

## 크롤링 데이터 특성 (scripts/crawl-wanted.js 기반)

### tech_stack 추출 방식
- 1차: 원티드 API의 `skill_tags` 배열
- 2차: description/requirements/preferred에서 42개 하드코딩 키워드 매칭
  - Python, SQL, R, Spark, Hadoop, TensorFlow, PyTorch, scikit-learn, pandas, numpy, AWS, GCP, Azure, Docker, Kubernetes, Airflow, Kafka, Tableau, Power BI, Excel, Git, Java, Scala, Go, C++, JavaScript, TypeScript, React, Node.js, Django, Flask, FastAPI, Spring, PostgreSQL, MySQL, MongoDB, Redis, Elasticsearch, BigQuery, Snowflake, dbt, Looker
- 결과: 소문자로 정규화 후 중복 제거

### category 추론 방식
- position + description 텍스트에서 정규식 매칭:
  - `data scientist` → data_scientist
  - `data analyst` / `데이터 분석` → data_analyst
  - `data engineer` / `데이터 엔지니어` → data_engineer
  - `ml engineer` / `machine learning` / `머신러닝` → ml_engineer
  - 그 외 → other

### 현재 데이터 분포 (100개)
- ml_engineer: 43
- other: 44
- data_analyst: 13
- data_scientist / data_engineer: 0 (카테고리 필터 없이 수집하여 편향)

### description 구성
크롤러가 다음을 줄바꿈으로 합산:
```
[소개]\n{intro}\n\n[주요업무]\n{main_tasks}\n\n[자격요건]\n{requirements}\n\n[우대사항]\n{preferred_points}\n\n[혜택 및 복지]\n{benefits}
```
→ keyword 검사 시 description만 검색해도 requirements/preferred 내용 포함됨

## DB 인덱스 및 쿼리 참고
- `idx_job_postings_tech_stack` (GIN) — `tech_stack @> ARRAY[...]` 쿼리 가능
- `idx_job_postings_description_trgm` (GIN, pg_trgm) — `description % '검색어'` 유사도 검색 가능
- `idx_job_postings_category` (B-tree) — category 필터링
- `idx_job_postings_is_active` (B-tree) — 활성 공고 필터

## 기존 인프라 현황
- Supabase 클라이언트: `@supabase/supabase-js` 설치됨, 모듈(`src/lib/supabase.ts`)은 미생성
- Gemini 클라이언트: `src/lib/gemini.ts` — 싱글턴 패턴 참고용
- 환경변수: `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정됨

## 스코어링 공식 (phase1-mvp.md 정의)
```
총점 = tech_score × 0.5 + keyword_score × 0.3 + category_score × 0.2

tech_score    = |profile.skills ∩ job.tech_stack| / max(|profile.skills|, 1)
keyword_score = |{k ∈ domain_keywords : k ⊂ job.description}| / max(|domain_keywords|, 1)
category_score = job.category ∈ profile.job_categories ? 1.0 : 0.0
```
- 모든 문자열 비교: case-insensitive (toLowerCase)
- matchedKeywords = 매칭된 skills + 매칭된 domain_keywords 합산

## RLS 정책
- job_postings: 누구나 SELECT 가능
- search_sessions: 누구나 INSERT/SELECT/UPDATE 가능
- search_results: 누구나 INSERT/SELECT 가능
→ anon key로 클라이언트 사이드/서버 사이드 모두 접근 가능
