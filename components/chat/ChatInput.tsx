"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (content: string) => void;
  onStop: () => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading,
  disabled = false,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 160) + "px";
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue("");
  }, [value, isLoading, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  const hasText = value.trim().length > 0;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto">
        <div
          className={`
            flex items-end gap-2 rounded-2xl border px-4 py-2
            transition-all duration-200
            ${
              disabled
                ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20"
            }
          `}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="输入消息，Enter 发送，Shift+Enter 换行..."
            rows={1}
            disabled={disabled || isLoading}
            className="flex-1 resize-none bg-transparent outline-none text-sm py-2 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 disabled:opacity-50"
          />

          {/* Send / Stop button */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="停止生成"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                <rect x="1" y="1" width="12" height="12" rx="2" />
              </svg>
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!hasText || disabled}
              className={`
                flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl transition-all
                ${
                  hasText && !disabled
                    ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-sm hover:shadow-md"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                }
              `}
              title="发送"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
          )}
        </div>

        <p className="text-center text-[11px] text-gray-400 dark:text-gray-600 mt-2">
          AI Chat Pro 可能产生不准确的信息，请注意甄别
        </p>
      </div>
    </div>
  );
}
