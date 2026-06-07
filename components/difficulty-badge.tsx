import { cn } from "@/lib/utils";

type Difficulty = "Easy" | "Medium" | "Hard";

const STYLES: Record<Difficulty, string> = {
  "Easy":   "text-emerald-400",
  "Medium": "text-blue-400",
  "Hard":   "text-red-400",
};

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return (
    <span className={cn("text-xs font-medium", STYLES[difficulty])}>
      {difficulty}
    </span>
  );
}
