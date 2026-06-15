"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/types/chat";
import MessageItem from "./MessageItem";

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onRegenerate: () => void;
}

export default function MessageList({
  messages,
  isLoading,
  onEditMessage,
  onRegenerate,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mb-6 shadow-lg shadow-indigo-500/25">
          ✨
        </div>
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
          有什么我可以帮你的？
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          我是一个智能 AI 助手，支持流式输出、Markdown 渲染和代码高亮。开始对话吧。
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto divide-y divide-gray-100 dark:divide-gray-800">
        {messages.map((msg, index) => (
          <MessageItem
            key={msg.id}
            message={msg}
            onEdit={onEditMessage}
            onRegenerate={onRegenerate}
            isStreaming={isLoading && index === messages.length - 1 && msg.role === "assistant"}
          />
        ))}
      </div>

      {/* Typing indicator */}
      {isLoading && messages[messages.length - 1]?.role === "user" && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex gap-1.5 items-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse-dot"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
