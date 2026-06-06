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
