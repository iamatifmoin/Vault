import { type ApproachType, type Difficulty, type Language, type Platform } from "@/types";

export const REPO_NAME = "Data Structures & Algorithms";

export const PLATFORM_LABELS: Record<Platform, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  codechef: "CodeChef",
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

export const DIFFICULTY_BADGE_TONES: Record<Difficulty, string> = {
  easy: "border-zinc-700 text-zinc-200",
  medium: "border-blue-500/40 text-blue-300",
  hard: "border-red-500/40 text-red-300",
};

export const LANGUAGE_LABELS: Record<Language, string> = {
  cpp: "C++",
  python: "Python",
  java: "Java",
};

export const APPROACH_BADGE_TONES: Record<
  ApproachType,
  { className: string; label: string }
> = {
  "Brute Force": {
    className: "border-zinc-700 bg-zinc-900 text-zinc-300",
    label: "Brute Force",
  },
  Optimized: {
    className: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
    label: "Optimized",
  },
  Optimal: {
    className: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
    label: "Optimal",
  },
};

export const LEETCODE_BOILERPLATE = {
  cpp: `class Solution {\npublic:\n    vector<int> solve(vector<int>& nums) {\n        // Your solution here\n        return {};\n    }\n};`,
  python: `class Solution:\n    def solve(self, nums):\n        # Your solution here\n        pass`,
  java: `class Solution {\n    public int[] solve(int[] nums) {\n        // Your solution here\n        return new int[]{};\n    }\n}`,
};

export const CP_BOILERPLATE = {
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(nullptr);\n\n    // Your solution here\n\n    return 0;\n}`,
  python: `import sys\ninput = sys.stdin.readline\n\ndef solve():\n    # Your solution here\n    pass\n\nif __name__ == "__main__":\n    solve()`,
  java: `import java.io.*;\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) throws Exception {\n        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));\n        // Your solution here\n    }\n}`,
};

export const MANUAL_PROBLEM_NOTICE =
  "Problem content couldn't be fetched automatically. Paste the problem statement manually.";

export const PREMIUM_PROBLEM_NOTICE =
  "Couldn't fetch this problem. It may be a premium problem. Paste the problem statement manually.";

export const ANALYSIS_SYSTEM_PROMPT = `You are an expert DSA coach analyzing a student's solution.
Be specific, reference actual lines and variable names from their code.
Never give away the full optimal solution - guide toward it instead.
Return ONLY valid JSON with no markdown fences, no preamble.`;
