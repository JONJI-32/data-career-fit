"use client";

import { useEffect, useState } from "react";
import { Clock, ChevronRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSupabaseClient } from "@/lib/supabase";
import type { MatchResult, JobPosting } from "@/lib/types";

interface Profile {
  skills: string[];
  job_categories: string[];
  domain_keywords: string[];
  project_highlights: string[];
  summary: string;
}

interface SessionRow {
  id: string;
  session_token: string;
  profile: Profile | null;
  extracted_keywords: string[];
  created_at: string;
  search_results: {
    rank: number;
    similarity_score: number;
    matched_keywords: string[];
    job_postings: JobPosting | null;
  }[];
}

interface SearchHistoryProps {
  tokens: string[];
  onRestore: (profile: Profile, results: MatchResult[]) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
}

export default function SearchHistory({ tokens, onRestore }: SearchHistoryProps) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tokens.length === 0) {
      setLoading(false);
      return;
    }

    const fetchSessions = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from("search_sessions")
          .select(
            `id, session_token, profile, extracted_keywords, created_at,
             search_results(rank, similarity_score, matched_keywords,
               job_postings(*)
             )`
          )
          .in("session_token", tokens)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("히스토리 조회 오류:", error);
          return;
        }

        const rows = (data as unknown as SessionRow[]) || [];
        rows.forEach((s) => {
          s.search_results.sort((a, b) => a.rank - b.rank);
        });
        setSessions(rows);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [tokens]);

  const handleClick = (session: SessionRow) => {
    if (!session.profile) return;
    const results: MatchResult[] = session.search_results
      .filter((r) => r.job_postings)
      .map((r) => ({
        job: r.job_postings as JobPosting,
        score: r.similarity_score,
        matchedKeywords: r.matched_keywords,
      }));
    onRestore(session.profile, results);
  };

  if (loading) {
    return (
      <div className="w-full max-w-xl mx-auto flex items-center justify-center py-8 text-muted-foreground">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        <span className="text-sm">최근 분석 기록 불러오는 중...</span>
      </div>
    );
  }

  if (sessions.length === 0) return null;

  return (
    <div className="w-full max-w-xl mx-auto space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
        <Clock className="w-4 h-4" />
        최근 분석 기록
      </div>

      <div className="space-y-2">
        {sessions.map((session) => {
          const topResult = session.search_results[0];
          const topJob = topResult?.job_postings;
          const skills = session.profile?.skills ?? [];
          const isClickable = !!session.profile;

          return (
            <Card
              key={session.id}
              onClick={() => isClickable && handleClick(session)}
              className={`rounded-xl transition-all duration-200 ${
                isClickable
                  ? "cursor-pointer hover:border-primary/40 hover:shadow-sm group"
                  : "opacity-60"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatDate(session.created_at)}</span>
                      <span>·</span>
                      <span>{skills.length}개 스킬</span>
                    </div>

                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {skills.slice(0, 5).map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs rounded-md px-2 py-0 bg-primary/10 text-primary border-0"
                          >
                            {s}
                          </Badge>
                        ))}
                        {skills.length > 5 && (
                          <span className="text-xs text-muted-foreground self-center">
                            +{skills.length - 5}
                          </span>
                        )}
                      </div>
                    )}

                    {topJob && topResult && (
                      <p className="text-xs text-muted-foreground truncate">
                        상위 매칭: <span className="text-foreground font-medium">{topJob.title}</span>
                        {" · "}
                        {topJob.company_name}
                        {" ("}
                        {Math.round(topResult.similarity_score * 100)}
                        {"점)"}
                      </p>
                    )}
                  </div>

                  {isClickable && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-1 group-hover:text-primary transition-colors" />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
