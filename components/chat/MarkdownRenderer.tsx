import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useCallback, useRef } from "react";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ language, code }: { language?: string; code: string }) {
  const canUseDOM = typeof window !== "undefined";

  const copyCode = useCallback(() => {
    if (!canUseDOM) return;
    navigator.clipboard.writeText(code).then(() => {
      // Visual feedback is handled by the button state
    });
  }, [code, canUseDOM]);

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-[#1e1e2e]">
      <div className="flex items-center justify-between px-4 py-2 bg-black/30 text-xs text-gray-400">
        <span>{language || "code"}</span>
        <button
          onClick={copyCode}
          className="px-2 py-1 rounded hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          title="复制代码"
        >
          📋 复制
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre className="p-4 m-0 text-sm leading-relaxed">
          <code className={`language-${language || "text"}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Override code rendering for blocks
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match && !String(children).includes("\n");

            if (isInline) {
              return (
                <code
                  className="px-1.5 py-0.5 mx-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-sm font-mono border border-gray-200 dark:border-gray-700"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock
                language={match ? match[1] : undefined}
                code={String(children).replace(/\n$/, "")}
              />
            );
          },
          // Style links
          a({ children, href, ...props }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-2"
                {...props}
              >
                {children}
              </a>
            );
          },
          // Style tables
          table({ children }) {
            return (
              <div className="overflow-x-auto my-3">
                <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-700 text-sm">
                  {children}
                </table>
              </div>
            );
          },
          th({ children }) {
            return (
              <th className="border border-gray-200 dark:border-gray-700 px-3 py-2 bg-gray-50 dark:bg-gray-800 font-semibold text-left">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border border-gray-200 dark:border-gray-700 px-3 py-2">
                {children}
              </td>
            );
          },
          // Style blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="border-l-3 border-indigo-500 pl-4 my-3 text-gray-600 dark:text-gray-400 italic">
                {children}
              </blockquote>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
