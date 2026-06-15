# AIChat Pro 🚀

> 一个具备生产级体验的 AI 对话前端 Demo，展示对**流式渲染、状态管理、AI 交互细节**的理解。

## ✨ 亮点

- **流式打字机**：基于 `fetch` + `ReadableStream` 实现逐 token 渲染，支持 `AbortController` 中断
- **优雅的状态管理**：Zustand 驱动多会话 + 消息历史，支持编辑/重新生成
- **企业级工程化**：Next.js 14 App Router + TypeScript + Tailwind CSS
- **后端代理转发**：Next.js Route Handler 代理 API 请求，避免 CORS 和 API Key 暴露
- **AI 交互细节**：Token 用量估算、Prompt 模板预设（6种角色）、对话导出
- **主题系统**：亮色/暗色主题切换，偏好持久化（LocalStorage + 防闪烁）
- **Markdown 渲染**：react-markdown + remark-gfm + rehype-highlight + 代码块复制
- **数据持久化**：Dexie.js IndexedDB + LocalStorage 降级方案

## 🛠️ 技术栈

| 类别     | 技术                                           |
| -------- | ---------------------------------------------- |
| 框架     | Next.js 14 (App Router)                        |
| 语言     | TypeScript                                     |
| 样式     | Tailwind CSS                                   |
| 状态管理 | Zustand                                        |
| Markdown | react-markdown + remark-gfm + rehype-highlight |
| 持久化   | Dexie.js (IndexedDB) + LocalStorage            |
| 部署     | Vercel (零配置)                                |

## 🚀 快速启动

```bash
# 1. 克隆项目
git clone https://github.com/yourname/ai-chat-pro
cd ai-chat-pro

# 2. 配置环境变量（可选 — 不配置则使用内置 Demo 模式）
cp .env.example .env.local
# 编辑 .env.local，填入你的 API Key

# 3. 安装依赖 & 启动
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可体验。

> 💡 **不需配置 API Key 也能完整体验！** 内置了智能 Demo 模式，流式输出、Markdown 渲染、代码高亮等所有功能都正常工作。

## 📁 项目结构

```
ai-chat-pro/
├── app/
│   ├── layout.tsx              # 全局布局 + ThemeProvider + 防闪烁
│   ├── page.tsx                # 主页面入口
│   ├── globals.css             # 全局样式 + 主题变量
│   └── api/chat/route.ts       # 后端代理转发 (Edge Runtime)
├── components/
│   ├── chat/
│   │   ├── ChatWindow.tsx      # 对话主容器
│   │   ├── ChatInput.tsx       # 输入框 (Enter发送/Shift+Enter换行)
│   │   ├── MessageList.tsx     # 消息列表 + 自动滚动
│   │   ├── MessageItem.tsx     # 单条消息 (编辑/复制/重新生成)
│   │   └── MarkdownRenderer.tsx # Markdown 渲染 (代码高亮+复制)
│   └── sidebar/
│       └── Sidebar.tsx         # 侧边栏 (会话管理/主题/模板/导出)
├── store/
│   ├── chatStore.ts            # Zustand - 会话 & 消息状态
│   └── themeStore.ts           # Zustand - 主题状态
├── lib/
│   ├── stream.ts               # ReadableStream 流式请求封装
│   ├── storage.ts              # IndexedDB + LocalStorage 持久化
│   └── prompts.ts              # Prompt 模板预设 (6种角色)
└── types/
    └── chat.ts                 # TypeScript 类型定义
```

## 🎯 亮点

1. **"选择了 ReadableStream 而非 EventSource"** — 因为可以更好地处理 `AbortController` 中断和错误恢复
2. **"用 Zustand 代替 Redux"** — 项目状态结构清晰，不需要中间件，Zustand 的 API 更简洁
3. **"输入框的处理细节"** — Enter 发送 / Shift+Enter 换行 / loading 态禁用 / 自动调整高度
4. **"Token 估算的设计"** — 虽然前端算不准，但让用户感知到成本——这是产品思维
5. **"后端代理放在 Route Handler"** — 避免 CORS 和 API Key 暴露，Edge Runtime 保障流式性能

## 📸 功能截图

- 💬 多轮对话 + 流式输出
- 🌓 亮色/暗色主题切换
- 📝 Markdown 渲染 + 代码语法高亮
- 🔄 消息编辑/重新生成
- 📤 对话导出 (Markdown)
- 🎭 6 种 Prompt 角色模板
- 📊 Token 用量估算

## 📝 License

MIT
