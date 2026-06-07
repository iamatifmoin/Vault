export interface CapturedProblem {
  platform: "leetcode" | "codeforces" | "codechef" | "gfg";
  number: number;
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
