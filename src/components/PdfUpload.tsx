"use client";

import { useCallback, useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PdfUploadProps {
  onAnalyzed: (profile: {
    skills: string[];
    job_categories: string[];
    domain_keywords: string[];
    project_highlights: string[];
    summary: string;
  }) => void;
}

export default function PdfUpload({ onAnalyzed }: PdfUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((f: File) => {
    if (f.type !== "application/pdf") {
      setError("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    if (f.size > 4 * 1024 * 1024) {
      setError("파일 크기는 4MB 이하여야 합니다.");
      return;
    }
    setFile(f);
    setError(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "분석에 실패했습니다.");
      }

      const profile = await res.json();
      onAnalyzed(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12
          flex flex-col items-center gap-4 transition-all duration-200 cursor-pointer
          ${
            dragOver
              ? "border-primary bg-primary/5 scale-[1.02]"
              : file
                ? "border-primary/40 bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/40 hover:bg-muted/50"
          }
        `}
        onClick={() => {
          if (!file) document.getElementById("pdf-input")?.click();
        }}
      >
        <input
          id="pdf-input"
          type="file"
          accept="application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
          }}
        />

        {file ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">{file.name}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setError(null);
              }}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">
                포트폴리오 PDF를 올려주세요
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                드래그 앤 드롭 또는 클릭하여 선택 (최대 4MB)
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-destructive text-center">{error}</p>
      )}

      {file && (
        <Button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full mt-6 h-12 text-base rounded-xl"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              AI가 분석 중입니다...
            </>
          ) : (
            "프로필 분석하기"
          )}
        </Button>
      )}
    </div>
  );
}
