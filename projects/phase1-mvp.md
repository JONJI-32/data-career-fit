# Phase 1 - MVP

## Tech Stack
| 레이어 | 선택 |
|--------|------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Font | Pretendard |
| DB | Supabase (PostgreSQL) |
| PDF 파싱 | Gemini API (gemini-2.5-flash) |
| 키워드 추출 | Gemini API (gemini-2.5-flash) |
| 매칭 | 키워드 오버랩 + 가중 점수 |
| 배포 | Vercel |

## 진행 상태

### Step 1: 프로젝트 셋업 ✅
### Step 2: Supabase 스키마 ✅
### Step 2.5: 원티드 크롤링 100개 ✅
### Step 3: PDF 파싱 API (Gemini) ✅

### Step 4: 프로필 분석 API 🔄
- 기존 Step 4(키워드 추출) + Step 5(프롬프트 생성)를 Gemini로 통합
- `src/app/api/analyze/route.ts` — 마크다운 → 구조화된 프로필 추출
- 응답 형식:
  ```json
  {
    "skills": ["Python", "SQL", "pandas", ...],
    "experience_years": 2,
    "job_categories": ["data_analyst", "data_scientist"],
    "domain_keywords": ["머신러닝", "데이터 분석", ...],
    "summary": "..."
  }
  ```

### Step 5: 매칭 엔진 ⏳
- `src/lib/matching/score.ts` — 키워드 오버랩 매칭
- `src/app/api/search/route.ts` — 매칭 실행 + 결과 저장
- 점수: 기술스택(0.5) + 키워드(0.3) + 카테고리(0.2)

### Step 6: UI 구현 ⏳
- 메인 페이지: 3단계 플로우 (업로드 → 편집 → 결과)
- 컴포넌트: PdfUpload, PromptEditor, JobCard, JobList, KeywordMatch

### Step 7: 배포 ⏳
- GitHub 레포 + Vercel 연결

## 이후 Phases
- Phase 2: 필터링 & 정렬
- Phase 3: 데이터 파이프라인 고도화
- Phase 4: AI 고도화 (매칭 이유 설명, 시맨틱 매칭)
- Phase 5: 북마크, 히스토리, 비교, 대시보드
