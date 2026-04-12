"use client";

import { ArrowLeft, ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/JobCard";
import type { MatchResult } from "@/lib/types";

interface JobListProps {
  results: MatchResult[];
  onBack: () => void;
}

export default function JobList({ results, onBack }: JobListProps) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">매칭 결과</h2>
          <p className="text-sm text-muted-foreground mt-1">
            <ListFilter className="w-4 h-4 inline mr-1" />
            총 {results.length}개의 공고가 매칭되었습니다
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="rounded-xl">
          <ArrowLeft className="w-4 h-4 mr-2" />
          프로필 수정
        </Button>
      </div>

      {/* Results */}
      {results.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-lg font-medium text-muted-foreground">
            매칭되는 공고가 없습니다
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            프로필을 수정하거나 스킬을 추가해보세요.
          </p>
          <Button onClick={onBack} className="mt-6 rounded-xl">
            프로필 수정하기
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {results.map((r, i) => (
            <JobCard key={r.job.id} result={r} rank={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
