import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // 从环境变量中读取（优先读取不带前缀的，支持带 NEXT_PUBLIC_ 前缀的作为备用）
    const apiKey = process.env.API_KEY || process.env.NEXT_PUBLIC_API_KEY;
    const apiBaseUrl = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.openai.com/v1";
    const apiModel = process.env.API_MODEL || process.env.NEXT_PUBLIC_API_MODEL || "gpt-4o";

    if (!apiKey) {
      console.error("Chat API Route: API Key is not configured in environment variables.");
      return NextResponse.json(
        { error: "API Key is not configured on the server." },
        { status: 500 }
      );
    }

    // 在服务端直接请求大模型接口，不受浏览器 CORS 限制
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: apiModel,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Downstream API Error:", response.status, errorText);
      return NextResponse.json(
        { error: `Downstream API error: ${errorText}` },
        { status: response.status }
      );
    }

    // 直接透传流式 Response Body 给前端，保持原生的 Event Stream 效果
    return new NextResponse(response.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no", // 禁用 Nginx 等代理缓存，确保实时流式输出
      },
    });
  } catch (error) {
    console.error("Error in chat proxy route:", error);
    return NextResponse.json(
      { error: "Internal Server Error in chat proxy API." },
      { status: 500 }
    );
  }
}
