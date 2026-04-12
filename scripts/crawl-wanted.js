const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local 읽기
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.+)$/);
  if (match) env[match[1].trim()] = match[2].trim();
});

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
);

const API_BASE = 'https://www.wanted.co.kr/api/v4/jobs';
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Referer': 'https://www.wanted.co.kr/',
  'Accept': 'application/json',
};

const TARGET_COUNT = 100;
const DELAY_MS = 500;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 카테고리 추론: 포지션 텍스트 + 상세 내용 기반
function inferCategory(position, description) {
  const text = `${position} ${description}`.toLowerCase();
  if (text.includes('data scientist') || text.includes('데이터 사이언') || text.includes('데이터사이언'))
    return 'data_scientist';
  if (text.includes('data analyst') || text.includes('데이터 분석') || text.includes('데이터분석'))
    return 'data_analyst';
  if (text.includes('data engineer') || text.includes('데이터 엔지니어') || text.includes('데이터엔지니어'))
    return 'data_engineer';
  if (text.includes('ml ') || text.includes('머신러닝') || text.includes('machine learning'))
    return 'ml_engineer';
  if (text.includes('ai ') || text.includes('인공지능') || text.includes('딥러닝'))
    return 'ml_engineer';
  return 'other';
}

// 카테고리 필터 없이 최신 공고 ID 수집
async function fetchLatestJobIds(targetCount) {
  const ids = [];
  let offset = 0;

  console.log(`최신 공고 ${targetCount}개 수집 중 (카테고리 필터 없음)...`);

  while (ids.length < targetCount) {
    try {
      const res = await axios.get(API_BASE, {
        params: {
          limit: 20,
          offset,
          country: 'kr',
          job_sort: 'job.latest_order',
          years: '-1',
          locations: 'all',
        },
        headers: HEADERS,
        timeout: 10000,
      });

      const jobs = res.data.data || [];
      if (jobs.length === 0) break;

      for (const job of jobs) {
        if (!ids.includes(job.id)) ids.push(job.id);
      }

      process.stdout.write(`  리스트 수집: ${ids.length}/${targetCount}\r`);
      offset += 20;
      await sleep(DELAY_MS);
    } catch (e) {
      console.error(`\n  Error fetching list (offset=${offset}):`, e.message);
      break;
    }
  }

  console.log(`\n  총 ${ids.length}개 ID 수집 완료`);
  return ids.slice(0, targetCount);
}

// 상세 API에서 공고 정보 수집
async function fetchJobDetail(jobId) {
  try {
    const res = await axios.get(`${API_BASE}/${jobId}`, {
      headers: HEADERS,
      timeout: 10000,
    });
    return res.data.job;
  } catch (e) {
    console.error(`  Error fetching detail (id=${jobId}):`, e.message);
    return null;
  }
}

// 기술 스택 추출: skill_tags + 텍스트에서 추가 추출
function extractTechStack(job) {
  const skills = new Set();

  if (job.skill_tags) {
    for (const tag of job.skill_tags) {
      if (tag.title) skills.add(tag.title);
    }
  }

  const allText = [
    job.detail?.requirements || '',
    job.detail?.preferred_points || '',
    job.detail?.main_tasks || '',
  ].join(' ');

  const techKeywords = [
    'Python', 'SQL', 'R', 'Java', 'Scala', 'Go', 'C\\+\\+',
    'Spark', 'Hadoop', 'Airflow', 'Kafka', 'Flink',
    'TensorFlow', 'PyTorch', 'scikit-learn', 'Keras',
    'pandas', 'NumPy', 'Matplotlib',
    'Tableau', 'Power BI', 'Looker',
    'AWS', 'GCP', 'Azure',
    'Docker', 'Kubernetes', 'K8s',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Elasticsearch',
    'Git', 'Linux', 'Jupyter',
    'dbt', 'MLflow', 'Kubeflow', 'MLOps',
    'NLP', 'Computer Vision', 'LLM',
    'Snowflake', 'BigQuery', 'Redshift', 'Databricks',
    'Excel', 'SPSS', 'SAS',
    'FastAPI', 'Flask', 'Django',
    'React', 'Node\\.js', 'TypeScript',
    'Figma', 'Photoshop', 'Illustrator',
    'Slack', 'Jira', 'Confluence', 'Notion',
    'Spring', 'Kotlin', 'Swift',
    'Next\\.js', 'Vue', 'Angular',
  ];

  for (const keyword of techKeywords) {
    const regex = new RegExp(`\\b${keyword}\\b`, 'i');
    if (regex.test(allText)) {
      const normalized = keyword.replace(/\\\+/g, '+').replace(/\\\./g, '.');
      skills.add(normalized);
    }
  }

  return [...skills];
}

// 텍스트를 줄 단위로 분리하여 배열로 변환
function textToArray(text) {
  if (!text) return [];
  return text
    .split('\n')
    .map(line => line.replace(/^[•\-\*·]\s*/, '').trim())
    .filter(line => line.length > 0);
}

// 공고 데이터를 DB 형식으로 변환
function transformJob(job) {
  const detail = job.detail || {};
  const position = job.position || '';
  const description = [
    detail.intro || '',
    detail.main_tasks ? `[주요업무]\n${detail.main_tasks}` : '',
    detail.requirements ? `[자격요건]\n${detail.requirements}` : '',
    detail.preferred_points ? `[우대사항]\n${detail.preferred_points}` : '',
    detail.benefits ? `[혜택 및 복지]\n${detail.benefits}` : '',
  ].filter(Boolean).join('\n\n');

  return {
    title: position,
    company_name: job.company?.name || 'Unknown',
    company_type: job.company?.industry_name || null,
    location: job.address
      ? [job.address.country, job.address.location, job.address.district].filter(Boolean).join(' ')
      : null,
    salary_min: job.annual_from || null,
    salary_max: job.annual_to || null,
    salary_text: (job.annual_from || job.annual_to)
      ? `경력 ${job.annual_from || '?'}~${job.annual_to || '?'}년`
      : null,
    job_type: '정규직',
    experience_min: job.annual_from || null,
    experience_max: job.annual_to || null,
    experience_text: (job.annual_from != null)
      ? `경력 ${job.annual_from}~${job.annual_to || ''}년`
      : null,
    description,
    requirements: textToArray(detail.requirements),
    preferred: textToArray(detail.preferred_points),
    tech_stack: extractTechStack(job),
    category: inferCategory(position, description),
    source_site: 'wanted',
    source_url: `https://www.wanted.co.kr/wd/${job.id}`,
    deadline: job.due_time ? new Date(job.due_time).toISOString().split('T')[0] : null,
    posted_at: job.created_at || null,
    is_active: job.status === 'active',
  };
}

async function main() {
  console.log('=== 원티드 최신 채용공고 크롤링 (편향 없음) ===\n');

  // 1. 최신 공고 ID 수집 (카테고리 필터 없음)
  const jobIds = await fetchLatestJobIds(TARGET_COUNT);

  // 2. 각 공고 상세 정보 수집
  console.log(`\n상세 정보 수집 중...`);
  const allJobs = [];
  for (let i = 0; i < jobIds.length; i++) {
    const detail = await fetchJobDetail(jobIds[i]);
    if (detail) {
      allJobs.push(transformJob(detail));
    }
    process.stdout.write(`  상세 수집: ${i + 1}/${jobIds.length}\r`);
    await sleep(DELAY_MS);
  }
  console.log(`\n상세 정보 ${allJobs.length}개 수집 완료`);

  // 3. 통계 출력
  const cats = {};
  allJobs.forEach(j => { cats[j.category] = (cats[j.category] || 0) + 1; });
  console.log('\n카테고리 분포:');
  Object.entries(cats).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
    console.log(`  ${k}: ${v}건`);
  });
  console.log(`기술스택 보유: ${allJobs.filter(j => j.tech_stack.length > 0).length}/${allJobs.length}건`);

  // 4. JSON 백업 저장
  const backupPath = path.join(__dirname, '..', 'src', 'data', 'wanted-jobs.json');
  fs.writeFileSync(backupPath, JSON.stringify(allJobs, null, 2), 'utf-8');
  console.log(`\nJSON 백업 저장: ${backupPath}`);

  // 5. 기존 데이터 삭제 후 새로 삽입 (편향 없는 최신 데이터로 교체)
  console.log('\nSupabase 데이터 교체 중...');
  const { error: deleteError } = await supabase
    .from('job_postings')
    .delete()
    .eq('source_site', 'wanted');
  if (deleteError) {
    console.error('기존 데이터 삭제 오류:', deleteError.message);
  }

  let insertCount = 0;
  let errorCount = 0;
  // 10개씩 배치 삽입
  for (let i = 0; i < allJobs.length; i += 10) {
    const batch = allJobs.slice(i, i + 10);
    const { error } = await supabase.from('job_postings').insert(batch);
    if (error) {
      console.error(`  Batch insert error (${i}~${i + batch.length}):`, error.message);
      errorCount += batch.length;
    } else {
      insertCount += batch.length;
    }
  }

  console.log(`\n=== 완료 ===`);
  console.log(`삽입: ${insertCount}건 / 오류: ${errorCount}건 / 총: ${allJobs.length}건`);
}

main().catch(console.error);
