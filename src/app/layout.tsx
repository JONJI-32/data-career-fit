import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Data Career Fit - 데이터 직군 맞춤 채용 추천",
  description: "포트폴리오 기반 데이터 직군 채용 공고 추천 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col font-[Pretendard]">{children}</body>
    </html>
  );
}
