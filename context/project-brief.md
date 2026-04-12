# Project Brief
## Goal
데이터 활용 직군 구직자가 포트폴리오 PDF를 업로드하면 스킬셋에 맞는 채용 공고를 추천하는 웹앱
## Audience
데이터 분석가, 데이터 사이언티스트, 데이터 엔지니어, ML 엔지니어 구직자
## Success Criteria
PDF 업로드 → 프로필 분석 → 공고 매칭 → 결과 리스트 전체 플로우 동작
## Inputs
사용자 포트폴리오 PDF, 원티드 채용공고 데이터 (Supabase)
## Constraints
Vercel 배포, Supabase DB, 회원가입 없음, Gemini API (gemini-2.5-flash)
## Must include
매칭 키워드 시각화, 공고 원문 링크, 사용자 프로필 편집 기능
## Must avoid
과도한 API 호출, 하드코딩 키워드 사전, 불필요한 외부 의존성
