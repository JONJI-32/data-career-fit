---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---
# TypeScript Rules
- avoid unused imports
- keep functions small
- Gemini API 호출은 src/lib/gemini.ts 공통 모듈 사용
- 에러 핸들링: rate limit (429) 별도 처리
