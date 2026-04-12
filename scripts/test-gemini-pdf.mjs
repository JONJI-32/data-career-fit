import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// .env.local 읽기
const envPath = path.join(__dirname, "..", ".env.local");
const envContent = fs.readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

async function main() {
  const pdfPath = path.join(__dirname, "..", "제7회 교육공공데이터 분석 활용대회_DIVE.pdf");
  const pdfBuffer = fs.readFileSync(pdfPath);
  const base64 = pdfBuffer.toString("base64");

  console.log("PDF size:", pdfBuffer.length, "bytes");
  console.log("Gemini API 호출 중...\n");

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
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

  const text = response.text;
  console.log("응답 길이:", text.length, "자");
  console.log("--- 첫 800자 미리보기 ---");
  console.log(text.substring(0, 800));
  console.log("\n--- 키워드 포함 확인 ---");
  ["머신러닝", "XGBoost", "SHAP", "Python", "pandas", "데이터 분석"].forEach((k) => {
    console.log("  " + k + ":", text.includes(k) ? "O" : "X");
  });

  // 결과 저장
  const outPath = path.join(__dirname, "..", "src", "data", "test-output.md");
  fs.writeFileSync(outPath, text, "utf-8");
  console.log("\n마크다운 저장:", outPath);
}

main().catch((err) => console.error("Error:", err.message));
