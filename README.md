# Neura - AI App Builder

A sandboxed runtime for building React apps with AI-powered code generation. Built with Next.js 15, Sandpack, and Zustand.

## 🚀 Features

- **Live Code Editor** - Edit React/TypeScript code with syntax highlighting and error detection
- **Sandboxed Preview** - Execute user-generated code safely in an isolated iframe
- **Pre-installed Packages** - Out-of-the-box support for lucide-react, framer-motion, and three.js
- **Error Handling** - Graceful error display without crashing the editor
- **Resizable Panels** - IDE-style layout with adjustable panel sizes
- **Global State** - Zustand-powered state management ready for AI integration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Code Sandbox**: @codesandbox/sandpack-react
- **State Management**: Zustand

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with dark mode
│   ├── page.tsx             # Main dashboard page
│   └── globals.css          # Global styles + Sandpack CSS
├── components/
│   ├── panels/
│   │   ├── LeftPanel.tsx    # Chat/Controls placeholder
│   │   └── RightPanel.tsx   # Sandpack container
│   ├── sandpack/
│   │   ├── SandpackEditor.tsx  # Main Sandpack wrapper
│   │   └── ErrorPanel.tsx   # Console/error display
│   └── ui/                  # shadcn/ui components
└── lib/
    ├── store.ts             # Zustand store
    ├── types.ts             # TypeScript interfaces
    └── sandpack-files.ts    # Default code templates
```

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📦 Pre-installed Sandbox Packages

The Sandpack editor comes with these packages pre-installed:
- `lucide-react` - Icon library
- `framer-motion` - Animation library
- `three` - 3D graphics library

## 🎯 Roadmap

- [ ] AI chat integration for code generation
- [ ] Multi-file project support
- [ ] File tree browser
- [ ] Export/share projects
- [ ] Custom package installation

## 📄 License

MIT
