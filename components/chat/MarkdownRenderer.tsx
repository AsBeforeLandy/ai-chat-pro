import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { useCallback, useRef, memo } from "react";

interface MarkdownRendererProps {
  content: string;
}

function CodeBlock({ language, children }: { language?: string; children: React.ReactNode }) {
  const canUseDOM = typeof window !== "undefined";

  // Helper function to recursively extract plain text from ReactNode tree
  const getRawText = (node: React.ReactNode): string => {
    if (!node) return "";
    if (typeof node === "string" || typeof node === "number") {
      return String(node);
    }
    if (Array.isArray(node)) {
      return node.map(getRawText).join("");
    }
    if (typeof node === "object" && "props" in node && node.props) {
      return getRawText(node.props.children);
    }
    return "";
  };

  const copyCode = useCallback(() => {
    if (!canUseDOM) return;
    const rawText = getRawText(children).replace(/\n$/, "");
    navigator.clipboard.writeText(rawText).then(() => {
      // Visual feedback can be added if needed
    });
  }, [children, canUseDOM]);

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
          <code className={`hljs language-${language || "text"}`}>{children}</code>
        </pre>
      </div>
    </div>
  );
}

const MarkdownRenderer = memo(function MarkdownRenderer({ content }: MarkdownRendererProps) {
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
              <CodeBlock language={match ? match[1] : undefined}>
                {children}
              </CodeBlock>
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
});

export default MarkdownRenderer;
