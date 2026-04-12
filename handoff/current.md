# Handoff

## What changed
- 프로젝트 셋업 (Next.js 15 + TypeScript + Tailwind + shadcn/ui)
- Supabase 스키마 (job_postings, search_sessions, search_results)
- 원티드 크롤링 100개 (카테고리 필터 없이 편향 없는 수집)
- PDF 파싱 API (Gemini gemini-2.5-flash로 PDF→마크다운)
- 프로필 분석 API (Structured Output 방식, project_highlights 포함)
- Gemini 공통 모듈 (src/lib/gemini.ts)
- Supabase 클라이언트 모듈 (src/lib/supabase.ts)
- 매칭 엔진 (Step 5)
  - `src/lib/matching/score.ts` — 가중 스코어링 (tech_stack 0.5 + keywords 0.3 + category 0.2)
  - `src/app/api/search/route.ts` — 매칭 API (profile → job_postings 매칭, 상위 20개 반환, 세션 저장)
- **UI 구현 (Step 6)**
  - `src/app/page.tsx` — 3단계 플로우 메인 페이지 (업로드 → 프로필 확인 → 매칭 결과)
  - `src/components/PdfUpload.tsx` — PDF 드래그 앤 드롭 업로드 + 분석 트리거
  - `src/components/ProfileEditor.tsx` — AI 분석 결과 표시 + 스킬/키워드/카테고리 편집
  - `src/components/JobCard.tsx` — 매칭 결과 카드 (점수, 매칭 키워드, tech_stack 표시)
  - `src/components/JobList.tsx` — 매칭 결과 리스트
  - `src/components/ui/progress.tsx` — shadcn progress 컴포넌트 추가
  - 디자인: Pretendard 폰트, 카드 기반 레이아웃, sticky 헤더, step indicator

## What passed
- npx next build (UI 컴포넌트 포함) ✓
- dev server 렌더링 확인 ✓
- /api/search 런타임 테스트 ✓
- /api/analyze 런타임 테스트 ✓

## What failed
- 없음

## Next step
- Step 7: GitHub + Vercel 배포
- (선택) 전체 플로우 E2E 테스트 (PDF 업로드 → 분석 → 매칭 → 결과 확인)

## 환경 설정
- `.env.local`: Supabase URL/Key, GEMINI_API_KEY 설정 완료
- Supabase CLI 연결됨 (npx supabase linked)
- Dev server: npx next dev -p 3099
- 작업 디렉토리: c:\Users\JONJI\cli\data-career-fit

## 주요 파일
- `CLAUDE.md` — Project Contract (에이전트 진입점)
- `src/app/page.tsx` — 메인 페이지 (3단계 플로우)
- `src/components/PdfUpload.tsx` — PDF 업로드 컴포넌트
- `src/components/ProfileEditor.tsx` — 프로필 편집 컴포넌트
- `src/components/JobCard.tsx` — 매칭 결과 카드 컴포넌트
- `src/components/JobList.tsx` — 매칭 결과 리스트 컴포넌트
- `src/app/api/parse-pdf/route.ts` — PDF→마크다운 API
- `src/app/api/analyze/route.ts` — 프로필 분석 API (Structured Output)
- `src/app/api/search/route.ts` — 매칭 검색 API
- `src/lib/schemas/profile.ts` — Zod 스키마 + Gemini responseSchema
- `src/lib/gemini.ts` — Gemini 클라이언트 공통 모듈
- `src/lib/supabase.ts` — Supabase 클라이언트 공통 모듈
- `src/lib/matching/score.ts` — 매칭 스코어링 함수
- `src/lib/types.ts` — AnalyzeResult, MatchResult 등 타입 정의
- `context/matching-engine-research.md` — 매칭 엔진 리서치 정리
