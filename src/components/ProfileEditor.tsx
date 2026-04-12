"use client";

import { useState } from "react";
import { X, Plus, Loader2, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface Profile {
  skills: string[];
  job_categories: string[];
  domain_keywords: string[];
  project_highlights: string[];
  summary: string;
}

interface ProfileEditorProps {
  profile: Profile;
  onSearch: (profile: Profile) => void;
  onBack: () => void;
  loading: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  data_analyst: "데이터 분석가",
  data_scientist: "데이터 사이언티스트",
  data_engineer: "데이터 엔지니어",
  ml_engineer: "ML 엔지니어",
  frontend_developer: "프론트엔드 개발자",
  backend_developer: "백엔드 개발자",
  other: "기타",
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

function TagEditor({
  label,
  tags,
  onChange,
  placeholder,
}: {
  label: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
      setInput("");
    }
  };

  return (
    <div>
      <p className="text-sm font-medium text-foreground mb-2">{label}</p>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="pl-3 pr-1.5 py-1.5 text-sm gap-1.5 rounded-lg"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder={placeholder}
          className="h-9 rounded-lg"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={addTag}
          disabled={!input.trim()}
          className="h-9 rounded-lg"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function ProfileEditor({
  profile: initialProfile,
  onSearch,
  onBack,
  loading,
}: ProfileEditorProps) {
  const [profile, setProfile] = useState<Profile>(initialProfile);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Summary Card */}
      <Card className="rounded-2xl border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">AI 분석 결과</CardTitle>
          </div>
          <CardDescription className="text-base leading-relaxed">
            {profile.summary}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Project Highlights */}
      {profile.project_highlights.length > 0 && (
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">대표 프로젝트</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="space-y-2">
              {profile.project_highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-muted-foreground"
                >
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold shrink-0">
                    {i + 1}
                  </span>
                  {h}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Editable Fields */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">프로필 편집</CardTitle>
          <CardDescription>
            스킬, 키워드를 추가/삭제하여 매칭 정확도를 높일 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-0">
          {/* Job Categories */}
          <div>
            <p className="text-sm font-medium text-foreground mb-2">
              희망 직무
            </p>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map((cat) => {
                const active = profile.job_categories.includes(cat);
                return (
                  <Badge
                    key={cat}
                    variant={active ? "default" : "outline"}
                    className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm transition-all ${
                      active
                        ? ""
                        : "text-muted-foreground hover:text-foreground hover:border-foreground/30"
                    }`}
                    onClick={() => {
                      setProfile((p) => ({
                        ...p,
                        job_categories: active
                          ? p.job_categories.filter((c) => c !== cat)
                          : [...p.job_categories, cat],
                      }));
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Skills */}
          <TagEditor
            label="기술 스택"
            tags={profile.skills}
            onChange={(skills) => setProfile((p) => ({ ...p, skills }))}
            placeholder="예: Python, React, SQL"
          />

          {/* Domain Keywords */}
          <TagEditor
            label="도메인 키워드"
            tags={profile.domain_keywords}
            onChange={(domain_keywords) =>
              setProfile((p) => ({ ...p, domain_keywords }))
            }
            placeholder="예: 머신러닝, 핀테크, 추천시스템"
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="h-12 rounded-xl px-6"
        >
          다시 업로드
        </Button>
        <Button
          onClick={() => onSearch(profile)}
          disabled={loading || profile.skills.length === 0}
          className="flex-1 h-12 text-base rounded-xl"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              매칭 중...
            </>
          ) : (
            <>
              <Search className="w-5 h-5 mr-2" />
              채용 공고 매칭하기
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
