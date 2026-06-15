// ==================== Core Chat Types ====================

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
  tokenCount?: number; // estimated tokens
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  promptTemplate?: string;
}

// ==================== API Types ====================

export interface ChatRequest {
  messages: Pick<Message, "role" | "content">[];
  model?: string;
  stream?: boolean;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: { role?: string; content?: string };
    finish_reason: string | null;
  }[];
}

// ==================== Store Types ====================

export interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  streamingContent: string;
  abortController: AbortController | null;
}

export interface ThemeState {
  isDark: boolean;
  toggleTheme: () => void;
}

// ==================== Prompt Templates ====================

export interface PromptTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
}
