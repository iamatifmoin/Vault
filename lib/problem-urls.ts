import { REPO_NAME } from "@/lib/constants";
import { slugifyTitle } from "@/lib/markdown";
import type { Platform } from "@/types";

export function buildPlatformProblemUrl(
  platform: Platform,
  number: string,
  title: string,
): string {
  const titleSlug = slugifyTitle(title);

  if (platform === "leetcode") {
    return `https://leetcode.com/problems/${titleSlug}/`;
  }

  if (platform === "codeforces") {
    const match = number.match(/^(\d+)([A-Za-z]\d*)$/);
    if (match) {
      return `https://codeforces.com/problemset/problem/${match[1]}/${match[2]}`;
    }
    return "https://codeforces.com/problemset";
  }

  if (platform === "gfg") {
    return `https://www.geeksforgeeks.org/problems/${titleSlug}/`;
  }

  return `https://www.codechef.com/problems/${number.toUpperCase()}`;
}

export function buildGitHubFileUrl(username: string, filePath: string) {
  const encodedPath = filePath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `https://github.com/${username}/${REPO_NAME}/blob/main/${encodedPath}`;
}
