import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini";

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

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
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            {
              text: `이 PDF 문서의 내용을 마크다운 형식으로 변환해주세요.
- 원문의 내용을 최대한 그대로 유지
- 제목, 소제목은 # 헤더로
- 표는 마크다운 테이블로
- 불릿 포인트는 - 로
- 이미지/그래프는 [그림: 설명] 형태로 표시
- 페이지 번호는 제외`,
            },
          ],
        },
      ],
    });

    const text = response.text?.trim();
    if (!text) {
      return NextResponse.json(
        { error: "PDF에서 텍스트를 추출할 수 없습니다." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text, pageCount: null });
  } catch (error) {
    console.error("PDF 파싱 오류:", error);
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류";
    const isRateLimit = message.includes("429") || message.includes("quota");
    return NextResponse.json(
      {
        error: isRateLimit
          ? "API 요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요."
          : "PDF 파싱 중 오류가 발생했습니다.",
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
