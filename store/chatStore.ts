import { create } from "zustand";
import type { Message, Session } from "@/types/chat";

// ==================== Helpers ====================
const STORAGE_KEY = "aichat-sessions";

function loadSessions(): Session[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSessions(sessions: Session[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    console.warn("Failed to persist sessions");
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

export function estimateTokens(text: string): number {
  // Rough estimate: ~4 chars per token for English, ~1.5 for Chinese
  const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const otherChars = text.length - chineseChars;
  return Math.ceil(chineseChars / 1.5 + otherChars / 4);
}

// ==================== Store ====================

interface ChatStore {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  abortController: AbortController | null;

  // Session actions
  createSession: () => string;
  switchSession: (id: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, title: string) => void;

  // Message actions
  sendMessage: (content: string) => Promise<void>;
  stopGeneration: () => void;
  editMessage: (messageId: string, newContent: string) => void;
  regenerateResponse: () => Promise<void>;
  clearMessages: (sessionId: string) => void;

  // Computed
  getActiveSession: () => Session | null;
  addStreamingContent: (content: string) => void;
  finalizeStreaming: () => void;
  setAbortController: (controller: AbortController | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>((set, get) => ({
  sessions: loadSessions(),
  activeSessionId: null,
  isLoading: false,
  abortController: null,

  // ============ Session actions ============

  createSession: () => {
    const session: Session = {
      id: generateId(),
      title: "新对话",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((state) => {
      const sessions = [session, ...state.sessions];
      saveSessions(sessions);
      return { sessions, activeSessionId: session.id };
    });
    return session.id;
  },

  switchSession: (id) => {
    set({ activeSessionId: id });
  },

  deleteSession: (id) => {
    set((state) => {
      const sessions = state.sessions.filter((s) => s.id !== id);
      const activeSessionId =
        state.activeSessionId === id
          ? sessions.length > 0
            ? sessions[0].id
            : null
          : state.activeSessionId;
      saveSessions(sessions);
      return { sessions, activeSessionId };
    });
  },

  renameSession: (id, title) => {
    set((state) => {
      const sessions = state.sessions.map((s) =>
        s.id === id ? { ...s, title, updatedAt: Date.now() } : s,
      );
      saveSessions(sessions);
      return { sessions };
    });
  },

  // ============ Message actions ============

  sendMessage: async (content) => {
    const state = get();

    // Ensure active session
    let sessionId = state.activeSessionId;
    if (!sessionId) {
      sessionId = get().createSession();
    }

    // Add user message
    const userMsg: Message = {
      id: generateId(),
      role: "user",
      content,
      timestamp: Date.now(),
      tokenCount: estimateTokens(content),
    };

    // Auto-title from first user message
    set((s) => {
      const sessions = s.sessions.map((session) => {
        if (session.id !== sessionId) return session;
        const newTitle =
          session.messages.length === 0 && session.title === "新对话"
            ? content.length > 30
              ? content.substring(0, 30) + "..."
              : content
            : session.title;
        return {
          ...session,
          title: newTitle,
          messages: [...session.messages, userMsg],
          updatedAt: Date.now(),
        };
      });
      saveSessions(sessions);
      return { sessions, isLoading: true };
    });

    // We'll delegate actual API call to the component
    // The component will use the stream helper
  },

  stopGeneration: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
    }
    set({ isLoading: false, abortController: null });
  },

  editMessage: (messageId, newContent) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== state.activeSessionId) return session;
        const msgIndex = session.messages.findIndex(
          (m) => m.id === messageId,
        );
        if (msgIndex === -1) return session;

        // Replace the message and truncate any later messages
        const messages = session.messages.slice(0, msgIndex + 1);
        messages[msgIndex] = {
          ...messages[msgIndex],
          content: newContent,
          tokenCount: estimateTokens(newContent),
        };

        return { ...session, messages, updatedAt: Date.now() };
      });
      saveSessions(sessions);
      return { sessions };
    });
  },

  regenerateResponse: async () => {
    const state = get();
    if (!state.activeSessionId) return;

    set((s) => {
      const sessions = s.sessions.map((session) => {
        if (session.id !== s.activeSessionId) return session;
        if (session.messages.length === 0) return session;

        // Remove last assistant message if it exists
        const lastMsg = session.messages[session.messages.length - 1];
        if (lastMsg.role === "assistant") {
          return {
            ...session,
            messages: session.messages.slice(0, -1),
            updatedAt: Date.now(),
          };
        }
        return session;
      });
      saveSessions(sessions);
      return { sessions, isLoading: true };
    });
  },

  clearMessages: (sessionId) => {
    set((state) => {
      const sessions = state.sessions.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [], title: "新对话", updatedAt: Date.now() }
          : s,
      );
      saveSessions(sessions);
      return { sessions };
    });
  },

  // ============ Streaming ============

  getActiveSession: () => {
    const { sessions, activeSessionId } = get();
    return sessions.find((s) => s.id === activeSessionId) || null;
  },

  addStreamingContent: (content) => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== state.activeSessionId) return session;
        const messages = [...session.messages];
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          messages[messages.length - 1] = {
            ...lastMsg,
            content: lastMsg.content + content,
          };
        } else {
          messages.push({
            id: generateId(),
            role: "assistant",
            content,
            timestamp: Date.now(),
          });
        }
        return { ...session, messages, updatedAt: Date.now() };
      });
      saveSessions(sessions);
      return { sessions };
    });
  },

  finalizeStreaming: () => {
    set((state) => {
      const sessions = state.sessions.map((session) => {
        if (session.id !== state.activeSessionId) return session;
        const messages = [...session.messages];
        const lastMsg = messages[messages.length - 1];
        if (lastMsg && lastMsg.role === "assistant") {
          messages[messages.length - 1] = {
            ...lastMsg,
            timestamp: Date.now(),
            tokenCount: estimateTokens(lastMsg.content),
          };
        }
        return { ...session, messages, updatedAt: Date.now() };
      });
      saveSessions(sessions);
      return { sessions, isLoading: false };
    });
  },

  setAbortController: (controller) => {
    set({ abortController: controller });
  },

  setIsLoading: (loading) => {
    set({ isLoading: loading });
  },
}));
