import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";
import { profileSchema, geminiProfileSchema } from "@/lib/schemas/profile";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 4000, 8000]; // ms

const SYSTEM_INSTRUCTION = `당신은 전문 채용 담당자이자 기술 면접관입니다.
이력서/포트폴리오를 분석하여 구직자의 프로필을 구조화된 JSON으로 추출합니다.

규칙:
- 기술 스택은 공식 명칭으로 표준화하세요 (예: JS → JavaScript, ts → TypeScript, tf → TensorFlow)
- project_highlights는 대표 프로젝트 1~3개를 한줄로 요약하세요 (예: '교육 데이터 기반 평생학습 참여 예측 모델 구축')
- job_categories는 다음 중에서 선택: data_analyst, data_scientist, data_engineer, ml_engineer, frontend_developer, backend_developer, other
- domain_keywords는 한국어/영어 혼합 가능
- summary는 한국어로 2~3문장`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "PDF 파일을 업로드해주세요." },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "PDF 형식의 파일만 지원합니다." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "파일 크기는 4MB 이하여야 합니다." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const ai = getGeminiClient();
    const geminiRequest = {
      model: GEMINI_MODEL,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json" as const,
        responseSchema: geminiProfileSchema,
      },
      contents: [
        {
          role: "user" as const,
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            {
              text: "이 이력서/포트폴리오를 분석하여 구직 프로필을 추출해주세요.",
            },
          ],
        },
      ],
    };

    let lastError: unknown = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await ai.models.generateContent(geminiRequest);
        const rawText = response.text?.trim();
        if (!rawText) {
          return NextResponse.json(
            { error: "프로필을 추출할 수 없습니다." },
            { status: 422 }
          );
        }
        const parsed = JSON.parse(rawText);
        const result = profileSchema.parse(parsed);
        return NextResponse.json(result);
      } catch (err) {
        lastError = err;
        const msg = err instanceof Error ? err.message : "";
        const isRetryable =
          msg.includes("503") ||
          msg.includes("overloaded") ||
          msg.includes("429") ||
          msg.includes("quota");
        if (!isRetryable || attempt === MAX_RETRIES) break;
        console.log(`Gemini 재시도 ${attempt + 1}/${MAX_RETRIES} (${RETRY_DELAYS[attempt]}ms 대기)`);
        await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
      }
    }

    throw lastError;
  } catch (error) {
    console.error("프로필 분석 오류:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "AI 응답을 파싱할 수 없습니다." },
        { status: 422 }
      );
    }

    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    const isRateLimit = message.includes("429") || message.includes("quota");
    const isOverload = message.includes("503") || message.includes("overloaded");

    if (isRateLimit) {
      return NextResponse.json(
        { error: "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요." },
        { status: 429 }
      );
    }

    if (isOverload) {
      return NextResponse.json(
        { error: "AI 서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `프로필 분석 중 오류가 발생했습니다: ${message}` },
      { status: 500 }
    );
  }
}
