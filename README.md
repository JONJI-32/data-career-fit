# 🎯 Data Career Fit

**데이터 기반의 스마트한 채용 공고 매칭 솔루션**

Data Career Fit은 구직자의 이력서를 분석하여 가장 적합한 채용 공고를 추천하는 지능형 매칭 플랫폼입니다. 본 프로젝트는 최신 AI 기술과 정교한 가중치 기반 알고리즘을 결합하여, 기업과 인재 간의 최적의 연결을 지원하며 고도화된 채용 생태계를 구축하는 것을 목표로 합니다.

## 🚀 배포 URL (Deployment URL)

[Service URL Placeholder]
https://your-service-link.vercel.app

---

## ✨ 핵심 기능 (Core Features)

- **📄 AI 이력서 파싱 (Resume Parsing)**
  사용자가 PDF 이력서를 업로드하면, 즉시 구조화된 프로필 데이터(기술 스택, 핵심 키워드, 경험 등)로 정밀하게 파싱합니다.
  
- **🧠 고도화된 매칭 엔진 (Advanced Matching Engine)**
  **"기술스택(50%), 키워드(30%), 카테고리(20%) 가중치 기반 매칭"**과 **"Gemini 기반 시맨틱 분석"**을 결합하여, 단순 키워드 대조를 넘어선 문맥과 역량 중심의 정확한 매칭을 제공합니다. 이는 본 플랫폼의 핵심 기술적 강점입니다.
  
- **🛠 인터랙티브 프로필 편집 (Interactive Profile Editing)**
  AI가 분석한 결과를 바탕으로 사용자가 직접 스킬 및 키워드를 수정할 수 있어 데이터의 신뢰성과 투명성을 보장합니다.

- **📊 직관적인 채용 공고 리스트 (Job Matching Results)**
  매칭된 채용 공고를 점수와 함께 제공하며, 어떤 기술 스택과 키워드가 일치했는지 카드 형태로 명확하게 시각화하여 보여줍니다.

---

## 🛠 기술 스택 (Technology Stack)

| 구분 (Category) | 기술 (Technology) | 설명 (Description) |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, TypeScript | SSR 지원 및 안정적인 타입 시스템 기반의 프론트엔드 구축 |
| **Styling/UI** | Tailwind CSS v4, shadcn/ui | 모던하고 일관된 UI 컴포넌트 시스템, 반응형 디자인 |
| **Backend/DB** | Supabase | PostgreSQL 기반의 데이터베이스 저장소, 검색 데이터 관리 |
| **AI/ML** | Gemini 2.5 Flash | 이력서 구조화 문서 변환 및 시맨틱 텍스트 분석 (Semantic Analysis) |
| **Deployment** | Vercel | 글로벌 엣지 네트워크 기반의 무단절 배포 |

---

## 🏗 시스템 아키텍처 (System Architecture)

본 시스템은 대량의 채용 데이터와 사용자 프로필을 효율적으로 처리하기 위해 다음과 같은 데이터 흐름 (Data Flow)을 가집니다.

1. **데이터 수집 (Data Ingestion):** 채용 플랫폼 파이프라인을 통해 채용 공고 데이터를 수집하고 Supabase 스키마에 적재합니다.
2. **이력서 처리 (Document Processing):** 업로드된 사용자 이력서(PDF)는 Gemini API를 통해 다중 retry 로직을 거쳐 정형 데이터(JSON) 프로필로 안전하게 추출됩니다.
3. **프로필 정제 (Profile Refinement):** AI가 추출한 역량 데이터를 사용자가 최종 확인하고 수정(Human-in-the-loop)합니다.
4. **매칭 알고리즘 (Matching Computation):** 
   - 매칭 엔진이 확정된 사용자 프로필과 DB의 채용 공고를 실시간으로 비교 분석합니다.
   - **가중치 분석:** `Tech Stack (50%) + Keywords (30%) + Category (20%)` 로직을 통해 스코어링을 수행합니다.
5. **결과 제공 (Result Delivery):** 상위 최적 매칭 공고 결과를 반환하고 시각 데이터로 렌더링합니다. 모든 탐색 세션은 지속적인 매칭 품질 개선을 위해 저장됩니다.

---

## 🗺 향후 로드맵 (Future Roadmap)

- **Phase 2:** 다중 필터 및 정렬 기능 고도화 (경력 기간, 지역별 필터링 기능 연동)
- **Phase 3:** 데이터 파이프라인 확장 (크롤링 프로세스 자동화 및 다중 채용 오픈 API 연동)
- **Phase 4:** AI 메타 매칭 엔진 도입 (Explainable AI를 활용한 매칭 사유 구체적 설명, 심도 있는 시맨틱 매칭 체계 구축)
- **Phase 5:** 구직자 대시보드 (지원 히스토리 추적, 공고 북마크 및 채용 분석 지표 제공)

---

## 🛡 데이터 윤리 및 개인정보 보호 (Data Ethics & Privacy)

**본 채용 매칭 플랫폼은 수집된 채용 공고 데이터를 사용자 매칭 알고리즘 목적으로만 제한적으로 활용하며, 사용자의 이력서 및 개인정보 보호를 최우선으로 하여 운영됩니다.**
