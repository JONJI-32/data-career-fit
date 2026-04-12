# Project Contract

@context/about-me.md
@context/project-brief.md
@rules/working-rules.md

## Commands
- install: npm install
- dev: npx next dev -p 3099
- build: npx next build
- lint: npx next lint
- test:gemini: node scripts/test-gemini-pdf.mjs
- test:api: node scripts/test-pdf-api.js
- crawl: node scripts/crawl-wanted.js

## Boundaries
- api: src/app/api/ — Next.js API routes (parse-pdf, analyze, search)
- domain: src/lib/ — 비즈니스 로직 (matching, gemini, supabase, types)
- ui: src/components/ — React 컴포넌트 (shadcn/ui 기반)
- scripts: scripts/ — 크롤링, 테스트 스크립트

## Safety
- never edit: .env.local, node_modules/, supabase/config.toml
- always run: npx next build (코드 변경 후)
- ask before: Supabase 마이그레이션, 패키지 추가/삭제, scripts/ 실행

## Verification
- build: npx next build
- api: node scripts/test-pdf-api.js (dev server 필요)
- gemini: node scripts/test-gemini-pdf.mjs
