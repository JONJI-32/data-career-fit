# Handoff

## What changed
- 프로젝트 셋업 (Next.js 15 + TypeScript + Tailwind + shadcn/ui)
- Supabase 스키마 (job_postings, search_sessions, search_results)
- 원티드 크롤링 100개 (카테고리 필터 없이 편향 없는 수집)
- PDF 파싱 API (Gemini gemini-2.5-flash로 PDF→마크다운)
- 프로필 분석 API (Structured Output 방식, project_highlights 포함)
  - 503/429 자동 재시도 (최대 3회, exponential backoff 2s/4s/8s)
- Gemini 공통 모듈 (src/lib/gemini.ts)
- Supabase 클라이언트 모듈 (src/lib/supabase.ts)
- 매칭 엔진 (Step 5)
  - `src/lib/matching/score.ts` — 가중 스코어링 (tech_stack 0.5 + keywords 0.3 + category 0.2)
  - `src/app/api/search/route.ts` — 매칭 API (profile → job_postings 매칭, 상위 20개 반환, 세션 저장)
- UI 구현 (Step 6)
  - `src/app/page.tsx` — 3단계 플로우 메인 페이지 (업로드 → 프로필 확인 → 매칭 결과)
  - `src/components/PdfUpload.tsx` — PDF 드래그 앤 드롭 업로드 + 분석 트리거
  - `src/components/ProfileEditor.tsx` — AI 분석 결과 표시 + 스킬/키워드/카테고리 편집
  - `src/components/JobCard.tsx` — 매칭 결과 카드 (점수, 매칭 키워드, tech_stack 표시)
  - `src/components/JobList.tsx` — 매칭 결과 리스트
  - 디자인: Tailwind CSS v4, shadcn/ui, Pretendard 폰트, 카드 기반 레이아웃, sticky 헤더, step indicator
- GitHub + Vercel 배포 (Step 7)
  - GitHub: https://github.com/JONJI-32/data-career-fit
  - Vercel: https://data-career-fit.vercel.app
  - 환경변수: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY

## 2026-05-28 추가 작업

### PDF 파싱 LLM 의존 제거 (unpdf 전환)
- Gemini API 한도/토큰 비용 절감을 위해 PDF 텍스트 추출을 LLM에서 로컬 라이브러리로 이관
- `unpdf` 패키지 추가 (npm install unpdf)
- `src/app/api/parse-pdf/route.ts` — Gemini 호출 완전 제거, `unpdf.extractText()`로 교체 (LLM 호출 0회)
- `src/app/api/analyze/route.ts` — `unpdf`로 텍스트 추출 후 Gemini에 텍스트만 전송 (PDF base64 inlineData 제거)
- 효과: 사용자 1명 분석당 Gemini 호출 2회→1회, 토큰 사용량 대폭 감소
- 새 GEMINI_API_KEY로 교체 후 동작 확인 (`sample pdf.pdf` → 200 OK)

### 채용공고 누적 추가
- `scripts/crawl-wanted.js` 수정 — "기존 데이터 삭제 후 교체" 방식을 "신규만 누적 추가"로 변경
- 기존 `source_url` 목록을 미리 조회 → Set으로 중복 필터링 → 신규만 insert
- 실행 결과: 기존 100건 + 신규 100건 = DB 총 **200건** (중복 0건)
- 카테고리 분포 (신규 100건): data_analyst 13, ml_engineer 13, data_engineer 2, other 72

### 매칭 결과 저장 시스템 (2026-05-29)
- 기존: `search_sessions`/`search_results` 테이블이 있지만 클라이언트가 sessionToken을 보내지 않아 저장이 실제로는 일어나지 않던 상태
- 마이그레이션: `supabase/migrations/20260529000000_add_profile_to_sessions.sql`
  - `search_sessions`에 `profile JSONB` 컬럼 추가
  - `npx supabase db push`로 원격 DB 반영 완료
- `src/app/api/search/route.ts` — 세션 insert 시 `profile` 전체를 JSON으로 저장 (skills, categories, keywords, project_highlights, summary)
- `src/app/page.tsx` — 클라이언트 토큰 관리
  - `handleAnalyzed`에서 `crypto.randomUUID()`로 sessionToken 생성
  - 검색 성공 후 localStorage(`dcf_session_tokens`)에 토큰 누적 저장 (최대 20개)
  - 업로드 화면에 SearchHistory 컴포넌트 표시
- `src/components/SearchHistory.tsx` (신규)
  - `getSupabaseClient()`로 클라이언트에서 직접 Supabase 쿼리 (RLS 공개 읽기 허용)
  - `search_sessions` → `search_results` → `job_postings` JOIN으로 히스토리 + 상위 매칭 표시
  - 카드 클릭 시 저장된 프로필+결과 복원해 results 단계로 이동 (`onRestore` 콜백)
- 효과: 내부 분석용 데이터 축적 + 사용자 재확인 UX (로그인 없이 같은 브라우저에서 과거 결과 조회)

## What passed
- npx next build ✓ (전체 라우트 포함, unpdf 전환 후 + 매칭 결과 저장 추가 후 둘 다)
- dev server 렌더링 확인 ✓
- /api/analyze 런타임 테스트 ✓ (sample pdf.pdf → 200 OK, unpdf+Gemini 텍스트 처리)
- /api/search 런타임 테스트 ✓ (20개 결과, 점수 0.3~0.4, 세션 저장 확인)
- 크롤링 누적 모드 ✓ (200건, 중복 0)
- Supabase 마이그레이션 push ✓
- Vercel 프로덕션 빌드 + 배포 ✓ (이전 시점)

## What failed
- 없음

## Phase 1 MVP 완료 상태
| Step | 항목 | 상태 |
|------|------|------|
| 1 | 프로젝트 셋업 | ✅ |
| 2 | Supabase 스키마 | ✅ |
| 2.5 | 원티드 크롤링 100개 | ✅ |
| 3 | PDF 파싱 API | ✅ |
| 4 | 프로필 분석 API | ✅ |
| 5 | 매칭 엔진 | ✅ |
| 6 | UI 구현 | ✅ |
| 7 | GitHub + Vercel 배포 | ✅ |
| +α | PDF 파싱 unpdf 전환 | ✅ |
| +α | 채용공고 누적 추가 모드 | ✅ |
| +α | 매칭 결과 저장 시스템 + 히스토리 UI | ✅ |

## Next step
- Vercel 환경변수 `GEMINI_API_KEY`를 새 키로 업데이트 (프로덕션 반영 위해)
- 프로덕션에 매칭 결과 저장 시스템 배포 (`git push` → Vercel 자동 배포)
- Phase 2: 필터링 & 정렬 (경력, 지역, 카테고리 필터)
- Phase 3: 데이터 파이프라인 고도화 (크롤링 자동화, 다중 소스)
- Phase 4: AI 고도화 (매칭 이유 설명, 시맨틱 매칭)
- Phase 5: 북마크, 비교, 대시보드 (히스토리는 일부 구현됨)

## 환경 설정
- `.env.local`: Supabase URL/Key, GEMINI_API_KEY 설정 완료 (2026-05-28 새 키로 교체)
- Supabase CLI 연결됨 (npx supabase linked, `db push` 동작 확인)
- Vercel CLI 연결됨 (vercel link)
- Dev server: npx next dev -p 3099
- 작업 디렉토리: c:\Users\JONJI\cli\data-career-fit

## 주요 파일
- `CLAUDE.md` — Project Contract (에이전트 진입점)
- `src/app/page.tsx` — 메인 페이지 (3단계 플로우 + sessionToken/localStorage 관리)
- `src/components/PdfUpload.tsx` — PDF 업로드 컴포넌트
- `src/components/ProfileEditor.tsx` — 프로필 편집 컴포넌트
- `src/components/JobCard.tsx` — 매칭 결과 카드 컴포넌트
- `src/components/JobList.tsx` — 매칭 결과 리스트 컴포넌트
- `src/components/SearchHistory.tsx` — 과거 분석 기록 카드 (Supabase 직접 쿼리)
- `src/app/api/parse-pdf/route.ts` — PDF→텍스트 API (unpdf, LLM 미사용)
- `src/app/api/analyze/route.ts` — 프로필 분석 API (unpdf로 텍스트 추출 → Gemini Structured Output)
- `src/app/api/search/route.ts` — 매칭 검색 API (profile 전체를 search_sessions에 저장)
- `src/lib/schemas/profile.ts` — Zod 스키마 + Gemini responseSchema
- `src/lib/gemini.ts` — Gemini 클라이언트 공통 모듈
- `src/lib/supabase.ts` — Supabase 클라이언트 공통 모듈
- `src/lib/matching/score.ts` — 매칭 스코어링 함수
- `src/lib/types.ts` — AnalyzeResult, MatchResult 등 타입 정의
- `supabase/migrations/20260409000000_initial_schema.sql` — 초기 스키마
- `supabase/migrations/20260529000000_add_profile_to_sessions.sql` — search_sessions.profile JSONB 추가
- `scripts/crawl-wanted.js` — 원티드 크롤링 (누적 추가 모드)
- `context/matching-engine-research.md` — 매칭 엔진 리서치 정리
