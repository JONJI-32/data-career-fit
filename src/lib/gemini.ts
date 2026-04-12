import { GoogleGenAI } from "@google/genai";

let _ai: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (_ai) return _ai;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
  }
  _ai = new GoogleGenAI({ apiKey });
  return _ai;
}

export const GEMINI_MODEL = "gemini-2.5-flash";
