"use client";

import { useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { streamChat } from "@/lib/stream";
import MessageList from "./MessageList";
import ChatInput from "./ChatInput";

interface ChatWindowProps {
  onToggleSidebar: () => void;
}

export default function ChatWindow({ onToggleSidebar }: ChatWindowProps) {
  const {
    activeSessionId,
    isLoading,
    sendMessage,
    stopGeneration,
    editMessage,
    regenerateResponse,
    addStreamingContent,
    finalizeStreaming,
    setAbortController,
    setIsLoading,
    sessions,
  } = useChatStore();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  const handleSend = useCallback(
    async (content: string) => {
      sendMessage(content);

      const controller = new AbortController();
      setAbortController(controller);

      const session = useChatStore.getState().sessions.find(
        (s) => s.id === useChatStore.getState().activeSessionId,
      );
      const apiMessages = (session?.messages || []).map((m) => ({
        role: m.role as "user" | "assistant" | "system",
        content: m.content,
      }));

      try {
        await streamChat(
          apiMessages,
          {
            onChunk: (text) => addStreamingContent(text),
            onDone: () => {
              finalizeStreaming();
              setAbortController(null);
            },
            onError: (error) => {
              console.error("Stream error:", error);
              addStreamingContent(`\n\n> ⚠️ 请求出错：${error.message}`);
              finalizeStreaming();
              setAbortController(null);
            },
          },
          controller.signal,
        );
      } catch (error) {
        if (error instanceof Error && error.name !== "AbortError") {
          addStreamingContent(`\n\n> ⚠️ 发生错误：${error.message}`);
        }
        finalizeStreaming();
        setAbortController(null);
      }
    },
    [sendMessage, setAbortController, addStreamingContent, finalizeStreaming],
  );

  const handleStop = useCallback(() => stopGeneration(), [stopGeneration]);

  const handleEdit = useCallback(
    (messageId: string, newContent: string) => {
      editMessage(messageId, newContent);
      handleSend(newContent);
    },
    [editMessage, handleSend],
  );

  const handleRegenerate = useCallback(async () => {
    regenerateResponse();

    const controller = new AbortController();
    setAbortController(controller);

    const session = useChatStore.getState().sessions.find(
      (s) => s.id === useChatStore.getState().activeSessionId,
    );
    const apiMessages = (session?.messages || []).map((m) => ({
      role: m.role as "user" | "assistant" | "system",
      content: m.content,
    }));

    try {
      await streamChat(
        apiMessages,
        {
          onChunk: (text) => addStreamingContent(text),
          onDone: () => {
            finalizeStreaming();
            setAbortController(null);
          },
          onError: (error) => {
            addStreamingContent(`\n\n> ⚠️ 重新生成出错：${error.message}`);
            finalizeStreaming();
            setAbortController(null);
          },
        },
        controller.signal,
      );
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        addStreamingContent(`\n\n> ⚠️ 发生错误：${error.message}`);
      }
      finalizeStreaming();
      setAbortController(null);
    }
  }, [regenerateResponse, setAbortController, addStreamingContent, finalizeStreaming]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Chat header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl">
        {/* Sidebar toggle — only visible when sidebar is collapsed (desktop) or on mobile */}
        <button
          onClick={onToggleSidebar}
          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          title="展开侧边栏"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {activeSession?.title || "AIChat Pro"}
        </h2>
        {activeSession && (
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
            {activeSession.model || "GPT-5.5"}
          </span>
        )}
      </header>

      {/* Messages */}
      <MessageList
        messages={messages}
        isLoading={isLoading}
        onEditMessage={handleEdit}
        onRegenerate={handleRegenerate}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onStop={handleStop}
        isLoading={isLoading}
      />
    </div>
  );
}
