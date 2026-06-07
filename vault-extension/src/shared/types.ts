export interface CapturedProblem {
  platform: "leetcode" | "codeforces" | "codechef" | "gfg";
  number: number | string;
  title: string;
  titleSlug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topics: string[];
  code: string;
  language: "cpp" | "python" | "java";
  submittedAt: string;
}

export interface ExtensionAuthState {
  githubToken: string | null;
  githubUsername: string | null;
  vaultConnected: boolean;
}

export type ApproachType = "Brute Force" | "Optimized" | "Optimal";

export interface IndexEntry {
  number: number | string;
  title: string;
  titleSlug: string;
  platform: CapturedProblem["platform"];
  difficulty: CapturedProblem["difficulty"];
  topics: string[];
  sheets: [];
  attempts: number;
  latestApproach: ApproachType;
  latestDate: string;
  filePath: string;
  language: CapturedProblem["language"];
  approachVerified?: boolean;
}
