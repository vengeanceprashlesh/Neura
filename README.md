# Neura - AI App Builder

> Build web applications just by describing them. Like Bolt.new and Lovable.

![Neura](https://img.shields.io/badge/Next.js-16-black?style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## ✨ Features

- **Natural Language to App**: Describe what you want, get a working app
- **Live Preview**: See your app render in real-time with Sandpack
- **Beautiful UI**: Modern dark theme with smooth animations
- **Smart Suggestions**: Pre-built templates for common app types
- **Demo Mode**: Works without API key for demonstrations

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key (Optional)

Create a `.env` file:

```env
# Use ONE of these (priority: Groq > OpenRouter > OpenAI)

# Option 1: Groq (Fastest, Free tier available)
GROQ_API_KEY=your_groq_api_key

# Option 2: OpenRouter (Most models)
OPENROUTER_API_KEY=your_openrouter_api_key

# Option 3: OpenAI (Direct)
OPENAI_API_KEY=your_openai_api_key
```

> **Note**: The app works in Demo Mode without an API key, showing pre-built examples.

### 3. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

```
User Input → Prompt Enhancement → AI Generation → Code Extraction → Live Preview
     ↓              ↓                  ↓               ↓              ↓
"todo app"   Adds styling,      Calls LLM API    Parses markdown    Sandpack
             animations,        (Groq/OpenAI)    code blocks        renders it
             features...
```

### Architecture

1. **Frontend** (Next.js 16 + React 19)
   - Chat interface for natural language input
   - Sandpack preview for live rendering
   - Zustand for state management

2. **Backend** (API Routes)
   - `/api/chat` - Conversational AI
   - `/api/generate` - App generation

3. **AI Layer**
   - Smart prompt enhancement
   - Markdown code block extraction
   - Demo mode fallback

## 📁 Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # Main app UI
│   │   ├── _components/
│   │   │   └── chat-panel.tsx
│   │   └── page.tsx
│   └── api/
│       ├── chat/             # Chat endpoint
│       └── generate/         # Code generation
├── components/
│   ├── sandpack/             # Live preview
│   └── ui/                   # UI components
└── lib/
    ├── ai/
    │   ├── prompts.ts        # System prompts
    │   ├── code-generator.ts # Core generation
    │   └── demo-apps.ts      # Pre-built demos
    └── store/                # State management
```

## 🔧 API Keys

| Provider | Get Key From | Cost | Best For |
|----------|-------------|------|----------|
| [Groq](https://console.groq.com) | console.groq.com | Free tier | Fast inference |
| [OpenRouter](https://openrouter.ai) | openrouter.ai | Pay-per-use | Best models |
| [OpenAI](https://platform.openai.com) | platform.openai.com | $20+/mo | Direct access |

## 🎨 Supported App Types

Click any suggestion or type your own:

- ✅ Todo App
- ✅ Portfolio Website
- ✅ Admin Dashboard
- ✅ Weather App
- ✅ Calculator
- ✅ Chat Interface
- ✅ E-commerce Store
- ✅ Blog Page
- ✅ Any custom idea!

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Preview**: Sandpack
- **State**: Zustand
- **AI**: OpenAI API compatible (Groq, OpenRouter, OpenAI)

## 📝 License

MIT

---

Built with ❤️ by Neura
