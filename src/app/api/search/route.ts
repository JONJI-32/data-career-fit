import { NextRequest, NextResponse } from "next/server";
import { profileSchema } from "@/lib/schemas/profile";
import { getSupabaseClient } from "@/lib/supabase";
import { scoreJob } from "@/lib/matching/score";
import { JobPosting } from "@/lib/types";
import crypto from "crypto";

const MAX_RESULTS = 20;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { profile: rawProfile, sessionToken } = body;

    if (!rawProfile) {
      return NextResponse.json(
        { error: "profile 데이터가 필요합니다." },
        { status: 400 }
      );
    }

    const profile = profileSchema.parse(rawProfile);

    const supabase = getSupabaseClient();

    // 활성 공고 전체 조회
    const { data: jobs, error: dbError } = await supabase
      .from("job_postings")
      .select("*")
      .eq("is_active", true);

    if (dbError) {
      console.error("DB 조회 오류:", dbError);
      return NextResponse.json(
        { error: "채용 공고를 조회할 수 없습니다." },
        { status: 500 }
      );
    }

    if (!jobs || jobs.length === 0) {
      return NextResponse.json({ results: [], sessionId: null });
    }

    // 스코어링 + 필터 + 정렬
    const scored = (jobs as JobPosting[])
      .map((job) => {
        const { score, matchedKeywords } = scoreJob(profile, job);
        return { job, score, matchedKeywords };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_RESULTS);

    // 세션 저장 (sessionToken 있을 때)
    let sessionId: string | null = null;

    if (sessionToken) {
      const token = sessionToken || crypto.randomUUID();

      const { data: session, error: sessionError } = await supabase
        .from("search_sessions")
        .insert({
          session_token: token,
          extracted_keywords: [
            ...profile.skills,
            ...profile.domain_keywords,
          ],
        })
        .select("id")
        .single();

      if (!sessionError && session) {
        sessionId = session.id;

        // 검색 결과 저장
        const resultRows = scored.map((r, i) => ({
          session_id: sessionId,
          job_posting_id: r.job.id,
          similarity_score: r.score,
          matched_keywords: r.matchedKeywords,
          rank: i + 1,
        }));

        if (resultRows.length > 0) {
          await supabase.from("search_results").insert(resultRows);
        }
      }
    }

    return NextResponse.json({
      results: scored.map((r) => ({
        job: r.job,
        score: r.score,
        matchedKeywords: r.matchedKeywords,
      })),
      sessionId,
    });
  } catch (error) {
    console.error("매칭 검색 오류:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "요청 데이터를 파싱할 수 없습니다." },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : "알 수 없는 오류";
    return NextResponse.json(
      { error: `매칭 검색 중 오류가 발생했습니다: ${message}` },
      { status: 500 }
    );
  }
}
