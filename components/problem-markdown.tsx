import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

export function ProblemMarkdown({ content }: { content: string }) {
  return (
    <div className="prose-vault prose prose-invert max-w-none text-sm leading-7">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          pre: ({ children }) => (
            <pre
              className="overflow-x-auto rounded-lg bg-zinc-950 p-4 text-sm
                         [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-sm
                         whitespace-pre"
            >
              {children}
            </pre>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="rounded bg-zinc-800 px-1.5 py-0.5 text-sm font-mono text-zinc-200"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <code className={cn(className, "font-mono text-sm")} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
