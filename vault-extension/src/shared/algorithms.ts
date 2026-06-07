/**
 * classifyApproach
 * Lightweight heuristic approach classifier — free, instant, ~70% accurate.
 * Used for initial save. AI analysis will override this when user runs analyze.
 */
export function classifyApproach(
  code: string,
  language: "cpp" | "python" | "java",
): "Optimal" | "Optimized" | "Brute Force" {
  if (!code || code.trim().length === 0) return "Brute Force";

  const c = code.toLowerCase();

  const hasHashMap = /unordered_map|unordered_set|hashmap|hashset|dict\[|\.get\(|new map\(\)|new set\(/.test(c);
  const hasBinarySearch = /binary.?search|lo\s*[+\-]\s*hi|mid\s*=|left.*right.*mid|bsearch/.test(c);
  const hasTwoPointer = /left\s*=\s*0.*right\s*=|lo\s*=\s*0.*hi\s*=|two.?pointer/.test(c);
  const hasSlidingWindow = /sliding.?window|window.?size|shrink.*expand/.test(c);
  const hasMemo = /memo\[|dp\[|cache\[|\@lru_cache|functools\.cache|unordered_map.*dp/.test(c);
  const hasMonotonic = /monotonic|deque|deck\b/.test(c);
  const hasPrefixSum = /prefix|cumsum|prefix_sum|running.?sum/.test(c);
  const hasBitManip = /\bxor\b|n\s*&\s*\(n-1\)|__builtin_popcount|bit_count\(\)/.test(c);
  const hasMapWrite = /\w+\[[^\]]+\]\s*(\+\+|\+=)/.test(c);

  const optimalCount = [
    hasHashMap, hasBinarySearch, hasTwoPointer, hasSlidingWindow,
    hasMemo, hasMonotonic, hasPrefixSum, hasBitManip, hasMapWrite
  ].filter(Boolean).length;

  const hasNestedLoops = /for\s*\(.*\)\s*\{[^}]*for\s*\(|for\s+\w+\s+in\s+.*:\s*\n\s*for\s+|for\s*\([^)]*\)\s*for\s*\(/.test(c);
  const hasPureRecursion = /return.*\w+\(.*\w+\s*-\s*1|return.*\w+\(.*n\s*-\s*1/.test(c) && !hasMemo;
  const hasBruteSort = /\.sort\(\)|sort\(begin|std::sort/.test(c) && !hasBinarySearch;

  if (optimalCount >= 2) return "Optimal";
  if (optimalCount === 1) return "Optimized";
  if (hasNestedLoops || hasPureRecursion) return "Brute Force";
  if (hasBruteSort) return "Optimized";
  return "Optimized";
}
