import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ProblemMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-vault prose prose-invert max-w-none text-sm leading-7">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
