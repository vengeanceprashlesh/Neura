# Neura - AI App Builder

A full-stack AI-powered platform that transforms natural language prompts into complete Next.js applications. Built with Next.js 15, Sandpack, Supabase, and multiple LLM providers.

## 🚀 Features

- **AI-Powered Code Generation** - Describe your app idea, get a complete Next.js project
- **Live Code Editor** - Edit React/TypeScript code with syntax highlighting and error detection
- **Sandboxed Preview** - Execute user-generated code safely in an isolated iframe
- **Template RAG System** - Retrieves relevant code templates using vector search
- **Multi-Provider LLM Support** - Groq, OpenRouter, or OpenAI
- **Project Management** - Save, load, and export projects
- **ZIP Export** - Download complete project as a deployable ZIP file

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Code Sandbox**: @codesandbox/sandpack-react
- **State Management**: Zustand
- **Database**: Supabase (Postgres + Vector)
- **LLM Providers**: Groq, OpenRouter, OpenAI

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── app-spec/        # Generate app specification from prompt
│   │   ├── generate-app/    # Generate complete app with code
│   │   ├── chat/            # Chat assistant endpoint
│   │   └── projects/        # Project CRUD + ZIP export
│   ├── (dashboard)/         # Main dashboard layout
│   └── globals.css          # Global styles
├── components/
│   ├── sandpack/            # Sandpack editor components
│   └── ui/                  # shadcn/ui components
└── lib/
    ├── ai/
    │   └── provider.ts      # Multi-provider LLM abstraction
    ├── code/
    │   └── validate.ts      # Code validation & safety checks
    ├── templates/
    │   └── rag-service.ts   # Template retrieval (RAG)
    ├── supabase/
    │   └── client.ts        # Supabase clients
    ├── types/
    │   └── app.ts           # Type definitions & Zod schemas
    └── api.ts               # Frontend API functions
```

## 🏃 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and configure:

```bash
# LLM Provider (choose one - Groq is recommended for speed)
GROQ_API_KEY=your_groq_api_key
LLM_MODEL=llama-3.3-70b-versatile

# Alternative: OpenRouter (access to multiple models)
# OPENROUTER_API_KEY=your_openrouter_api_key
# LLM_MODEL=anthropic/claude-3.5-sonnet

# Alternative: OpenAI Direct
# OPENAI_API_KEY=your_openai_api_key
# LLM_MODEL=gpt-4o

# Optional: Supabase (for project storage & RAG)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🔌 LLM Provider Priority

The system checks for API keys in this order:

1. **Groq** (`GROQ_API_KEY`) - Fastest inference, recommended
2. **OpenRouter** (`OPENROUTER_API_KEY`) - Access to 100+ models
3. **OpenAI** (`OPENAI_API_KEY`) - Direct OpenAI access

### Supported Groq Models
- `llama-3.3-70b-versatile` (default)
- `llama-3.1-8b-instant` (faster)
- `mixtral-8x7b-32768`

### Supported OpenRouter Models
- `anthropic/claude-3.5-sonnet`
- `openai/gpt-4o`
- `google/gemini-pro-1.5`
- [See all models](https://openrouter.ai/models)

## 📡 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/app-spec` | POST | Generate AppSpec from prompt |
| `/api/generate-app` | POST | Generate complete project |
| `/api/chat` | POST | Chat with AI assistant |
| `/api/projects` | GET, POST | List/create projects |
| `/api/projects/[id]` | GET, PATCH, DELETE | Manage single project |
| `/api/projects/[id]/zip` | GET | Download project as ZIP |

## 📦 Pre-installed Sandbox Packages

The Sandpack editor comes with these packages pre-installed:
- `lucide-react` - Icon library
- `framer-motion` - Animation library
- `three` - 3D graphics library
- `@supabase/supabase-js` - Database client

## 🗄️ Database Schema (Supabase)

If using Supabase for project storage:

```sql
-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id TEXT NOT NULL,
  name TEXT NOT NULL,
  spec JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Project files table
CREATE TABLE project_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL
);

-- Optional: Template tables for RAG
CREATE TABLE frontend_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  kind TEXT NOT NULL,
  embedding VECTOR(1536)
);

CREATE TABLE backend_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  code TEXT NOT NULL,
  kind TEXT NOT NULL,
  embedding VECTOR(1536)
);
```

## 📄 License

MIT
