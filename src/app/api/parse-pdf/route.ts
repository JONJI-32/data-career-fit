import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

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
    const { text } = await extractText(new Uint8Array(arrayBuffer), {
      mergePages: true,
    });

    if (!text?.trim()) {
      return NextResponse.json(
        { error: "PDF에서 텍스트를 추출할 수 없습니다." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text: text.trim(), pageCount: null });
  } catch (error) {
    console.error("PDF 파싱 오류:", error);
    return NextResponse.json(
      { error: "PDF 파싱 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
