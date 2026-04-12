"use client";

import { ExternalLink, MapPin, Building2, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { MatchResult } from "@/lib/types";

const CATEGORY_LABELS: Record<string, string> = {
  data_analyst: "데이터 분석가",
  data_scientist: "데이터 사이언티스트",
  data_engineer: "데이터 엔지니어",
  ml_engineer: "ML 엔지니어",
  frontend_developer: "프론트엔드",
  backend_developer: "백엔드",
  other: "기타",
};

export default function JobCard({
  result,
  rank,
}: {
  result: MatchResult;
  rank: number;
}) {
  const { job, score, matchedKeywords } = result;
  const scorePercent = Math.round(score * 100);

  return (
    <Card className="rounded-2xl hover:shadow-md transition-all duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-primary bg-primary/10 rounded-md px-2 py-0.5">
                #{rank}
              </span>
              <Badge variant="outline" className="text-xs rounded-md">
                {CATEGORY_LABELS[job.category] || job.category}
              </Badge>
            </div>
            <CardTitle className="text-base leading-snug line-clamp-2 group-hover:text-primary transition-colors">
              {job.source_url ? (
                <a
                  href={job.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-1.5"
                >
                  {job.title}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ) : (
                job.title
              )}
            </CardTitle>
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold text-primary">{scorePercent}</p>
            <p className="text-xs text-muted-foreground">점</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Meta Info */}
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" />
            {job.company_name}
          </span>
          {job.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {job.location}
            </span>
          )}
          {job.experience_text && (
            <span className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              {job.experience_text}
            </span>
          )}
        </div>

        {/* Score Bar */}
        <Progress value={scorePercent} className="h-1.5 rounded-full" />

        {/* Matched Keywords */}
        {matchedKeywords.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {matchedKeywords.map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="text-xs rounded-md px-2 py-0.5 bg-primary/10 text-primary border-0"
              >
                {kw}
              </Badge>
            ))}
          </div>
        )}

        {/* Tech Stack */}
        {job.tech_stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {job.tech_stack.map((t) => (
              <Badge
                key={t}
                variant="outline"
                className="text-xs rounded-md px-2 py-0.5"
              >
                {t}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
