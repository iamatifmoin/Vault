export type Platform = "leetcode" | "codeforces" | "codechef";
export type Difficulty = "easy" | "medium" | "hard";
export type Language = "cpp" | "python" | "java";
export type ApproachType = "Brute Force" | "Optimized" | "Optimal";

export type Sheet =
  | "neetcode-150"
  | "neetcode-roadmap"
  | "blind-75"
  | "strivers-sde"
  | "strivers-a2z"
  | "strivers-cp";

export interface TopicTag {
  name: string;
  slug: string;
}

export interface FetchedProblem {
  number: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  topics: TopicTag[];
  content: string;
  boilerplate: {
    cpp: string;
    python: string;
    java: string;
  };
}

export interface AIAnalysis {
  classification: ApproachType;
  time_complexity: string;
  space_complexity: string;
  what_you_did_well: string[];
  bottlenecks: string[];
  bugs: string[];
  hints: {
    level_1: string;
    level_2: string;
    level_3: string;
    level_4: string;
    level_5: string;
  };
  pattern: {
    name: string;
    when_to_use: string;
    related_problems: string[];
  };
}

export interface Attempt {
  number: number;
  date: string;
  language: Language;
  code: string;
  approach: ApproachType;
  time_complexity: string;
  space_complexity: string;
  analysis: AIAnalysis | null;
}

export interface Problem {
  id: string;
  number: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  sheets: Sheet[];
  attempts: Attempt[];
  file_path: string;
  date_created: string;
}

export interface ProblemIndex {
  id: string;
  number: string;
  title: string;
  platform: Platform;
  difficulty: Difficulty;
  topics: string[];
  sheets: Sheet[];
  attempt_count: number;
  latest_approach: ApproachType | null;
  latest_date: string;
  latest_language: Language;
  file_path: string;
}

export interface RepoStats {
  totalFiles: number;
  firstSolveDate: string | null;
  latestSolveDate: string | null;
}

export interface SaveProblemPayload {
  mode?: "save-attempt";
  platform: Platform;
  problem: FetchedProblem;
  sheets: Sheet[];
  language: Language;
  code: string;
  analysis: AIAnalysis | null;
}

export interface UpdateAnalysisPayload {
  mode: "update-analysis";
  id: string;
  attemptNumber: number;
  analysis: AIAnalysis;
}

// ─── Interview Readiness Score ────────────────────────────────────────────────
export interface IRSBreakdown {
  topicCoverageBreadth: number;    // 0–25: how many of 15 core DSA topics touched
  difficultyDistribution: number;  // 0–20: ratio of Medium+Hard vs Easy
  approachQuality: number;         // 0–25: % Optimal × 25
  recencyScore: number;            // 0–15: activity in last 30 days
  volumeScore: number;             // 0–15: problems solved vs tier benchmark
}

export interface IRSData {
  score: number;                   // 0–100
  breakdown: IRSBreakdown;
  lastComputed: string;            // ISO date
  trend: number;                   // delta vs last week (can be negative)
}

// ─── Topic Mastery ────────────────────────────────────────────────────────────
export interface TopicMastery {
  topic: string;
  totalSolved: number;
  optimalCount: number;
  masteryScore: number;            // 0–100
}

// ─── Company Tracker ──────────────────────────────────────────────────────────
export type CompanyTier = "FAANG" | "Indian Unicorn" | "Service";

export interface CompanyTopicPattern {
  topic: string;
  weight: number;                  // 1–5, how important this topic is for this company
}

export interface Company {
  id: string;
  name: string;
  tier: CompanyTier;
  topics: CompanyTopicPattern[];
  totalKnownProblems: number;
}

export interface CompanyReadiness {
  companyId: string;
  readinessPercent: number;
  topicReadiness: { topic: string; solved: number; total: number }[];
  weakestTopics: string[];
}

// ─── Revision Queue ───────────────────────────────────────────────────────────
export interface RevisionItem {
  problemNumber: number;
  title: string;
  platform: string;
  difficulty: string;
  latestApproach: string;
  lastSolvedDate: string;
  priorityScore: number;           // higher = more urgent
  revisionReason: string;          // human-readable, e.g. "Brute Force 18 days ago"
  filePath: string;
}

// ─── Study Plan ───────────────────────────────────────────────────────────────
export type CompanyTierTarget = "FAANG" | "Indian Unicorn" | "Service";

export interface StudyPlanWeek {
  weekNumber: number;
  startDate: string;
  endDate: string;
  focusTopics: string[];
  targetProblems: number;
  completedProblems: number;
  notes: string;
}

export interface StudyPlan {
  id: string;
  targetTier: CompanyTierTarget;
  targetCompanies: string[];
  dailyHours: number;
  placementDate: string;
  sheetFollowed: string;
  weeks: StudyPlanWeek[];
  createdAt: string;
  lastUpdated: string;
}

// ─── Onboarding ───────────────────────────────────────────────────────────────
export interface OnboardingData {
  completed: boolean;
  sheet: string;
  placementDate: string;
  targetCompanies: string[];
  dailyHours: number;
}

// ─── Shareable Cards ──────────────────────────────────────────────────────────
export type CardType = "year-review" | "readiness" | "milestone";

export interface ShareableCardData {
  type: CardType;
  username: string;
  avatarUrl: string;
  irsScore?: number;
  totalSolved?: number;
  strongestTopic?: string;
  streak?: number;
  milestoneCount?: number;
  radarSnapshot?: TopicMastery[];
  generatedAt: string;
}

// ─── Mock Interview ───────────────────────────────────────────────────────────
export interface MockInterviewSession {
  problem: {
    number: number;
    title: string;
    difficulty: string;
    topics: string[];
    platform: string;
    filePath: string;
  };
  timeLimitSeconds: number;
  startedAt: string;
  submittedAt?: string;
  elapsedSeconds?: number;
  solution?: string;
  analysis?: string;
}

// ─── Weekly Digest ────────────────────────────────────────────────────────────
export interface WeeklyDigest {
  weekStart: string;
  weekEnd: string;
  problemsSolved: number;
  strongTopics: string[];
  neglectedTopics: string[];
  irsChange: number;
  onTrack: boolean;
  message: string;
}
