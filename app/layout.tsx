import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIChat Pro — 企业级 AI 对话前端",
  description:
    "一个具备生产级体验的 AI 对话界面，展示流式渲染、状态管理、AI 交互设计能力",
  keywords: ["AI Chat", "Next.js", "Streaming", "Zustand", "TypeScript"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* Prevent FOUC for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('aichat-theme');
                  var isDark = stored !== null
                    ? stored === 'dark'
                    : window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
