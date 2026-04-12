import { z } from "zod";
import { Type } from "@google/genai";

// Zod 스키마 — 런타임 검증용
export const profileSchema = z.object({
  skills: z.array(z.string()),
  job_categories: z.array(z.string()),
  domain_keywords: z.array(z.string()),
  project_highlights: z.array(z.string()),
  summary: z.string(),
});

export type ProfileResult = z.infer<typeof profileSchema>;

// Gemini responseSchema — Structured Output용
export const geminiProfileSchema = {
  type: Type.OBJECT,
  properties: {
    skills: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "기술 스택 (공식 명칭, 예: React, Python, PostgreSQL)",
    },
    job_categories: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "추천 직무 카테고리. 선택지: data_analyst, data_scientist, data_engineer, ml_engineer, frontend_developer, backend_developer, other",
    },
    domain_keywords: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "주요 업무 도메인 키워드 (예: 핀테크, 머신러닝, 추천시스템)",
    },
    project_highlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "대표 프로젝트 1~3개 한줄 요약 (예: '교육 데이터 기반 평생학습 참여 예측 모델 구축')",
    },
    summary: {
      type: Type.STRING,
      description: "2~3문장의 핵심 경력 요약 (한국어)",
    },
  },
  required: ["skills", "job_categories", "domain_keywords", "project_highlights", "summary"],
};
