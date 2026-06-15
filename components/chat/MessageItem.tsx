"use client";

import type { Message } from "@/types/chat";
import MarkdownRenderer from "./MarkdownRenderer";
import { estimateTokens } from "@/store/chatStore";
import { useCallback, useState, memo } from "react";

interface MessageItemProps {
  message: Message;
  onEdit?: (messageId: string, newContent: string) => void;
  onRegenerate?: () => void;
  isStreaming?: boolean;
}

export default memo(function MessageItem({
  message,
  onEdit,
  onRegenerate,
  isStreaming = false,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(message.content).catch(() => {});
  }, [message.content]);

  const handleEdit = useCallback(() => {
    setIsEditing(true);
    setEditContent(message.content);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    if (editContent.trim() && editContent !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  }, [editContent, message.content, message.id, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditContent(message.content);
  }, [message.content]);

  const tokenCount = message.tokenCount || estimateTokens(message.content);

  return (
    <div
      className={`group flex gap-3 sm:gap-4 px-4 py-4 animate-slide-up ${
        isUser ? "flex-row-reverse" : ""
      }`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white ${
          isUser
            ? "bg-gradient-to-br from-teal-400 to-cyan-500"
            : "bg-gradient-to-br from-indigo-500 to-purple-600"
        }`}
      >
        {isUser ? "U" : "AI"}
      </div>

      {/* Content */}
      <div className={`flex-1 min-w-0 ${isUser ? "flex flex-col items-end" : ""}`}>
        {/* Role label */}
        <div
          className={`text-xs font-semibold mb-1 ${
            isUser ? "text-right text-gray-500 dark:text-gray-400" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {isUser ? "User" : "AI Assistant"}
        </div>

        {/* Message bubble */}
        {isUser ? (
          <div className="inline-block max-w-[85%] sm:max-w-[75%]">
            {isEditing ? (
              <div className="w-full">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-3 rounded-2xl rounded-tr-md bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-sm text-gray-900 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={3}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSaveEdit();
                    }
                    if (e.key === "Escape") handleCancelEdit();
                  }}
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1 text-xs rounded-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1 text-xs rounded-lg bg-indigo-500 text-white hover:bg-indigo-600"
                  >
                    保存并重新发送
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-2xl rounded-tr-md bg-indigo-50 dark:bg-indigo-900/20 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
                {message.content}
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-full">
            <div className="text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
              <MarkdownRenderer content={message.content} />
            </div>

            {/* Cursor effect while streaming */}
            {isStreaming && (
              <span className="inline-block w-0.5 h-4 ml-0.5 bg-indigo-500 animate-blink align-text-bottom" />
            )}
          </div>
        )}

        {/* Actions — show on hover */}
        <div
          className={`flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity ${
            isUser ? "flex-row-reverse" : ""
          }`}
        >
          {/* Copy */}
          <button
            onClick={handleCopy}
            className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
            title="复制"
          >
            <CopyIcon />
          </button>

          {/* Edit (user messages only) */}
          {isUser && onEdit && (
            <button
              onClick={handleEdit}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
              title="编辑"
            >
              <EditIcon />
            </button>
          )}

          {/* Regenerate (AI messages only) */}
          {!isUser && onRegenerate && !isStreaming && (
            <button
              onClick={onRegenerate}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xs transition-colors"
              title="重新生成"
            >
              <RefreshIcon />
            </button>
          )}

          {/* Token estimate */}
          <span className="text-[10px] text-gray-400 dark:text-gray-600">
            ~{tokenCount} tokens
          </span>
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  // Only re-render if content, streaming state, or editing state changed
  return (
    prev.message.id === next.message.id &&
    prev.message.content === next.message.content &&
    prev.isStreaming === next.isStreaming
  );
});

// ==================== Icon Components ====================

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
    </svg>
  );
}
