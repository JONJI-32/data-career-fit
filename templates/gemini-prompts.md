# Gemini 프롬프트 템플릿

## 1. PDF → 마크다운 변환 (parse-pdf)
사용처: `src/app/api/parse-pdf/route.ts`

```
이 PDF 문서의 내용을 마크다운 형식으로 변환해주세요.
- 원문의 내용을 최대한 그대로 유지
- 제목, 소제목은 # 헤더로
- 표는 마크다운 테이블로
- 불릿 포인트는 - 로
- 이미지/그래프는 [그림: 설명] 형태로 표시
- 페이지 번호는 제외
```

## 2. 프로필 분석 (analyze)
사용처: `src/app/api/analyze/route.ts`

```
다음은 구직자의 포트폴리오/이력서 내용입니다. 이 텍스트를 분석하여 구직 프로필을 JSON 형식으로 추출해주세요.

## 추출 규칙
1. skills: 기술 스택과 도구를 영문 원어 그대로 추출
2. experience_years: 경력 연수를 숫자로 추출. 명시되지 않으면 null
3. job_categories: 적합한 직무 카테고리 배열 (data_analyst, data_scientist, data_engineer, ml_engineer, other)
4. domain_keywords: 도메인/방법론 키워드 (한국어/영어 혼합 가능)
5. summary: 구직자의 강점과 특성을 1~2문장으로 요약 (한국어)

## 응답 형식 (JSON만 출력)
{
  "skills": [...],
  "experience_years": 2,
  "job_categories": [...],
  "domain_keywords": [...],
  "summary": "..."
}
```
