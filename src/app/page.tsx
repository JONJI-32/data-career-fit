"use client";

import { useEffect, useState } from "react";
import { FileSearch, UserRoundSearch, BriefcaseBusiness } from "lucide-react";
import PdfUpload from "@/components/PdfUpload";
import ProfileEditor from "@/components/ProfileEditor";
import JobList from "@/components/JobList";
import SearchHistory from "@/components/SearchHistory";
import type { MatchResult } from "@/lib/types";

interface Profile {
  skills: string[];
  job_categories: string[];
  domain_keywords: string[];
  project_highlights: string[];
  summary: string;
}

type Step = "upload" | "edit" | "results";

const STEPS: { key: Step; label: string; icon: React.ReactNode }[] = [
  {
    key: "upload",
    label: "업로드",
    icon: <FileSearch className="w-4 h-4" />,
  },
  {
    key: "edit",
    label: "프로필 확인",
    icon: <UserRoundSearch className="w-4 h-4" />,
  },
  {
    key: "results",
    label: "매칭 결과",
    icon: <BriefcaseBusiness className="w-4 h-4" />,
  },
];

const STORAGE_KEY = "dcf_session_tokens";
const MAX_HISTORY = 20;

export default function Home() {
  const [step, setStep] = useState<Step>("upload");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [results, setResults] = useState<MatchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [historyTokens, setHistoryTokens] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setHistoryTokens(JSON.parse(raw));
    } catch {
      // localStorage 파싱 실패 시 무시
    }
  }, []);

  const handleAnalyzed = (p: Profile) => {
    setSessionToken(crypto.randomUUID());
    setProfile(p);
    setStep("edit");
  };

  const handleSearch = async (p: Profile) => {
    setSearching(true);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: p, sessionToken }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "매칭에 실패했습니다.");
      }
      const data = await res.json();
      setResults(data.results);
      setStep("results");

      if (sessionToken) {
        const updated = [sessionToken, ...historyTokens.filter((t) => t !== sessionToken)].slice(
          0,
          MAX_HISTORY
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setHistoryTokens(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  const handleRestore = (restoredProfile: Profile, restoredResults: MatchResult[]) => {
    setProfile(restoredProfile);
    setResults(restoredResults);
    setStep("results");
  };

  const stepIndex = STEPS.findIndex((s) => s.key === step);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Data Career Fit
            </h1>
            <p className="text-xs text-muted-foreground">
              포트폴리오 기반 맞춤 채용 추천
            </p>
          </div>

          {/* Step Indicator */}
          <div className="hidden sm:flex items-center gap-1">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex items-center">
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    i === stepIndex
                      ? "bg-primary text-primary-foreground"
                      : i < stepIndex
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s.icon}
                  {s.label}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px mx-1 ${
                      i < stepIndex ? "bg-primary/40" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {step === "upload" && (
          <div className="space-y-8">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                나에게 맞는 채용 공고를 찾아보세요
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                포트폴리오 PDF를 업로드하면 AI가 스킬을 분석하고 적합한 채용
                공고를 추천합니다.
              </p>
            </div>
            <PdfUpload onAnalyzed={handleAnalyzed} />
            {historyTokens.length > 0 && (
              <SearchHistory tokens={historyTokens} onRestore={handleRestore} />
            )}
          </div>
        )}

        {step === "edit" && profile && (
          <ProfileEditor
            profile={profile}
            onSearch={handleSearch}
            onBack={() => {
              setProfile(null);
              setStep("upload");
            }}
            loading={searching}
          />
        )}

        {step === "results" && (
          <JobList
            results={results}
            onBack={() => setStep("edit")}
          />
        )}
      </main>
    </div>
  );
}
