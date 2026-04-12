import { AnalyzeResult, JobPosting } from "@/lib/types";

export interface MatchScore {
  score: number;
  matchedKeywords: string[];
}

const WEIGHT_TECH = 0.5;
const WEIGHT_KEYWORD = 0.3;
const WEIGHT_CATEGORY = 0.2;

export function scoreJob(profile: AnalyzeResult, job: JobPosting): MatchScore {
  const matchedKeywords: string[] = [];

  // 1. tech_stack score (0.5)
  const profileSkills = profile.skills.map((s) => s.toLowerCase());
  const jobTech = job.tech_stack.map((t) => t.toLowerCase());
  const matchedTech = profileSkills.filter((s) => jobTech.includes(s));
  matchedTech.forEach((t) => {
    const original = profile.skills.find((s) => s.toLowerCase() === t);
    if (original) matchedKeywords.push(original);
  });
  const techScore = matchedTech.length / Math.max(profileSkills.length, 1);

  // 2. keyword score (0.3)
  const jobText = job.description.toLowerCase();
  const matchedDomain: string[] = [];
  for (const kw of profile.domain_keywords) {
    if (jobText.includes(kw.toLowerCase())) {
      matchedDomain.push(kw);
    }
  }
  matchedKeywords.push(...matchedDomain);
  const keywordScore =
    matchedDomain.length / Math.max(profile.domain_keywords.length, 1);

  // 3. category score (0.2)
  const categoryScore = profile.job_categories
    .map((c) => c.toLowerCase())
    .includes(job.category.toLowerCase())
    ? 1.0
    : 0.0;

  const score =
    techScore * WEIGHT_TECH +
    keywordScore * WEIGHT_KEYWORD +
    categoryScore * WEIGHT_CATEGORY;

  return {
    score: Math.round(score * 1000) / 1000,
    matchedKeywords,
  };
}
