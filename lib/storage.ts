import type { Session } from "@/types/chat";
import Dexie, { type Table } from "dexie";

// Dexie IndexedDB wrapper for professional-grade persistence
// Falls back to localStorage if IndexedDB is unavailable

class ChatDatabase extends Dexie {
  sessions!: Table<Session, string>;

  constructor() {
    super("AIChatPro");
    this.version(1).stores({
      sessions: "id, updatedAt",
    });
  }
}

const db = typeof window !== "undefined" ? new ChatDatabase() : null;

// ==================== Session Persistence ====================

export async function persistSessions(sessions: Session[]): Promise<void> {
  if (!db) {
    // Fallback to localStorage
    try {
      localStorage.setItem("aichat-sessions", JSON.stringify(sessions));
    } catch {
      // Storage full
    }
    return;
  }
  try {
    await db.transaction("rw", db.sessions, async () => {
      await db.sessions.clear();
      await db.sessions.bulkPut(sessions);
    });
  } catch {
    // IndexedDB error — fallback
    try {
      localStorage.setItem("aichat-sessions", JSON.stringify(sessions));
    } catch {
      // ignore
    }
  }
}

export async function loadSessions(): Promise<Session[]> {
  if (!db) {
    return loadFromLocalStorage();
  }
  try {
    const sessions = await db.sessions.orderBy("updatedAt").reverse().toArray();
    return sessions;
  } catch {
    return loadFromLocalStorage();
  }
}

function loadFromLocalStorage(): Session[] {
  try {
    const raw = localStorage.getItem("aichat-sessions");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ==================== Export ====================

export function exportSessionAsMarkdown(session: Session): string {
  const lines: string[] = [
    `# ${session.title}`,
    `> 创建于 ${new Date(session.createdAt).toLocaleString("zh-CN")}`,
    `> 模型: ${session.model || "默认"}`,
    "",
    "---",
    "",
  ];

  for (const msg of session.messages) {
    const role = msg.role === "user" ? "🧑 用户" : "🤖 AI";
    lines.push(`### ${role}`);
    lines.push("");
    lines.push(msg.content);
    lines.push("");
  }

  return lines.join("\n");
}

export function exportSessionAsJSON(session: Session): string {
  return JSON.stringify(session, null, 2);
}

export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
