export interface JobPosting {
  id: string;
  title: string;
  company_name: string;
  company_type: string | null;
  location: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_text: string | null;
  job_type: string | null;
  experience_min: number | null;
  experience_max: number | null;
  experience_text: string | null;
  description: string;
  requirements: string[];
  preferred: string[];
  tech_stack: string[];
  category: string;
  source_site: string;
  source_url: string;
  deadline: string | null;
  posted_at: string | null;
  is_active: boolean;
  created_at: string;
}

export interface SearchSession {
  id: string;
  session_token: string;
  pdf_text: string | null;
  generated_prompt: string | null;
  final_prompt: string | null;
  extracted_keywords: string[];
  created_at: string;
}

export interface SearchResult {
  id: string;
  session_id: string;
  job_posting_id: string;
  similarity_score: number;
  matched_keywords: string[];
  rank: number;
  created_at: string;
  job_posting?: JobPosting;
}

export interface PdfParseResult {
  text: string;
  pageCount: number;
}

export interface AnalyzeResult {
  skills: string[];
  job_categories: string[];
  domain_keywords: string[];
  project_highlights: string[];
  summary: string;
}

export interface MatchResult {
  job: JobPosting;
  score: number;
  matchedKeywords: string[];
}
