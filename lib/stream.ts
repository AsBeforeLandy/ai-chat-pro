/**
 * Stream-based chat request handler.
 *
 * Two modes:
 *   1. Demo mode (no API key) — client-side simulated SSE stream
 *   2. Real API (with API key) — direct fetch to AI provider
 *
 * Both modes produce the same callback interface (onChunk / onDone / onError),
 * so the UI layer is completely decoupled from the data source.
 */

import type { Message } from "@/types/chat";
import { generateDemoResponse } from "./demo-responses";

export interface StreamCallbacks {
  onChunk: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
}

// Check at module level — configured via env at build time
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.openai.com/v1";
const API_MODEL = process.env.NEXT_PUBLIC_API_MODEL || "gpt-4o";

/**
 * Main entry point — auto-selects demo or real mode.
 */
export async function streamChat(
  messages: Pick<Message, "role" | "content">[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
) {
  if (!API_KEY) {
    return simulateDemoStream(messages, callbacks, signal);
  }
  return realApiStream(messages, callbacks, signal);
}

// ==================== Demo Mode (Client-side simulation) ====================

/**
 * Simulate an SSE stream entirely on the client.
 * Uses setTimeout-based character-by-character output.
 * Respects AbortController for stop/regenerate.
 */
async function simulateDemoStream(
  messages: Pick<Message, "role" | "content">[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
) {
  const userMessage =
    messages.filter((m) => m.role === "user").pop()?.content || "";
  const fullText = generateDemoResponse(userMessage);

  const chars = [...fullText];
  const chunkSize = 3;

  // Batch: accumulate ~5 chunks (~15 chars) before flushing to UI,
  // cutting store updates from ~170 to ~34 for a 500-char response
  let buffer = "";
  const FLUSH_INTERVAL = 5;

  try {
    for (let i = 0; i < chars.length; i += chunkSize) {
      if (signal?.aborted) {
        if (buffer) callbacks.onChunk(buffer);
        callbacks.onDone();
        return;
      }

      buffer += chars.slice(i, i + chunkSize).join("");
      await delay(20 + Math.random() * 15);

      // Flush every N chunks
      if ((i / chunkSize) % FLUSH_INTERVAL === 0 || i + chunkSize >= chars.length) {
        callbacks.onChunk(buffer);
        buffer = "";
      }
    }

    callbacks.onDone();
  } catch (error) {
    if (signal?.aborted) {
      callbacks.onDone();
    } else {
      callbacks.onError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

// ==================== Real API Mode ====================

/**
 * Connect to a real AI API provider.
 * Reads the response body as an SSE stream and parses it token-by-token.
 *
 * IMPORTANT: When deployed statically (GitHub Pages), this mode requires
 * the API provider to have CORS headers allowing your origin, OR you need
 * a separate backend proxy. For development on Vercel with a server, you'd
 * use a Route Handler to proxy this call.
 */
async function realApiStream(
  messages: Pick<Message, "role" | "content">[],
  callbacks: StreamCallbacks,
  signal?: AbortSignal,
) {
  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: API_MODEL,
        messages,
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HTTP ${response.status}: ${text}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          callbacks.onDone();
          return;
        }

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) callbacks.onChunk(content);
        } catch {
          // Skip malformed chunks
        }
      }
    }

    callbacks.onDone();
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      callbacks.onDone();
    } else {
      callbacks.onError(
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }
}

// ==================== Utility ====================

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
