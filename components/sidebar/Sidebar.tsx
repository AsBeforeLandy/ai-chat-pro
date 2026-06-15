"use client";

import { useChatStore } from "@/store/chatStore";
import { useThemeStore } from "@/store/themeStore";
import { exportSessionAsMarkdown, downloadFile } from "@/lib/storage";
import { PROMPT_TEMPLATES } from "@/lib/prompts";
import type { PromptTemplate } from "@/types/chat";
import { useCallback, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const {
    sessions,
    activeSessionId,
    createSession,
    switchSession,
    deleteSession,
  } = useChatStore();
  const { isDark, toggleTheme } = useThemeStore();
  const [showTemplates, setShowTemplates] = useState(false);

  const handleNewChat = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleSwitch = useCallback(
    (id: string) => {
      switchSession(id);
    },
    [switchSession],
  );

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (confirm("确定要删除这个对话吗？")) {
        deleteSession(id);
      }
    },
    [deleteSession],
  );

  const handleExport = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      const session = sessions.find((s) => s.id === id);
      if (!session) return;
      const markdown = exportSessionAsMarkdown(session);
      downloadFile(markdown, `${session.title}.md`, "text/markdown");
    },
    [sessions],
  );

  const handleSelectTemplate = useCallback((template: PromptTemplate) => {
    // Create a new session with template
    const newId = createSession();
    setShowTemplates(false);
    onClose();
    // The template will be applied via store
  }, [createSession, onClose]);

  const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 flex flex-col
          bg-gray-50 dark:bg-gray-950
          border-r border-gray-200 dark:border-gray-800
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0 lg:min-w-0 lg:overflow-hidden"}
        `}
      >
        {/* Logo + New Chat */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm">
                ✨
              </div>
              <span className="text-base font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                AIChat Pro
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="收起侧边栏"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium transition-colors shadow-sm"
          >
            <span className="text-base leading-none">+</span>
            新对话
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto p-2">
          {sortedSessions.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-2xl mb-2 opacity-30">💬</div>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                暂无对话记录
              </p>
            </div>
          ) : (
            sortedSessions.map((session) => {
              const lastMsg =
                session.messages.length > 0
                  ? session.messages[session.messages.length - 1]
                  : null;
              const isActive = session.id === activeSessionId;
              const preview = lastMsg
                ? lastMsg.content.length > 40
                  ? lastMsg.content.substring(0, 40) + "..."
                  : lastMsg.content
                : "点击开始对话";

              return (
                <div
                  key={session.id}
                  onClick={() => handleSwitch(session.id)}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-0.5
                    transition-colors
                    ${
                      isActive
                        ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  <div className="flex-shrink-0 w-7 h-7 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs">
                    {isActive ? "💬" : "📝"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">
                      {session.title}
                    </div>
                    <div className="text-[10px] text-gray-400 dark:text-gray-600 truncate mt-0.5">
                      {preview}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleExport(session.id, e)}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      title="导出"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDelete(session.id, e)}
                      className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-gray-400 hover:text-red-500"
                      title="删除"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
          >
            <span className="text-base">{isDark ? "☀️" : "🌙"}</span>
            {isDark ? "浅色模式" : "深色模式"}
          </button>

          {/* Prompt templates */}
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm text-gray-600 dark:text-gray-400"
          >
            <span className="text-base">🎭</span>
            角色模板
          </button>

          {showTemplates && (
            <div className="ml-3 space-y-1 mt-1">
              {PROMPT_TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleSelectTemplate(t)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-left text-xs text-gray-500 dark:text-gray-400"
                >
                  <span>{t.icon}</span>
                  <span>{t.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
