import { create } from 'zustand';
import { Message, FileNode, SandpackFiles } from '@/lib/types';

// Default files for new projects
const DEFAULT_FILES: SandpackFiles = {
    '/App.tsx': {
        code: `export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-4">
          Welcome to Neura
        </h1>
        <p className="text-zinc-400 text-lg">
          Describe your app idea in the chat to get started!
        </p>
      </div>
    </div>
  );
}`,
        active: true,
    },
    '/styles.css': {
        code: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`,
    },
};

interface AppState {
    // Current code state
    currentCode: SandpackFiles;

    // Chat history for AI conversations (legacy - useChat manages its own state)
    chatHistory: Message[];

    // Virtual file structure
    fileStructure: FileNode[];

    lastAssistantMessage: Message | null;
    selectedFile: string | null;

    isGenerating: boolean;
    generationError: string | null;
    currentProjectId: string | null;

    // Actions
    updateCode: (filename: string, code: string) => void;
    setAllCode: (files: SandpackFiles) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    clearChatHistory: () => void;
    updateFileStructure: (files: FileNode[]) => void;
    setLastAssistantMessage: (content: Message | null) => void;
    setIsGenerating: (value: boolean) => void;
    setGenerationError: (error: string | null) => void;
    setCurrentProjectId: (id: string | null) => void;
    loadGeneratedFiles: (files: Record<string, string>) => void;
    resetToDefault: () => void;

    // File operations
    setSelectedFile: (path: string | null) => void;
    createFile: (path: string, content: string) => void;
    renameFile: (oldPath: string, newPath: string) => void;
    deleteFile: (path: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    currentCode: DEFAULT_FILES,
    chatHistory: [],
    fileStructure: [
        { path: '/src/App.tsx', type: 'file' },
        { path: '/src/styles.css', type: 'file' },
    ],
    lastAssistantMessage: null,
    selectedFile: null,
    isGenerating: false,
    generationError: null,
    currentProjectId: null,

    // Actions
    updateCode: (filename, code) =>
        set((state) => ({
            currentCode: {
                ...state.currentCode,
                [filename]: { code, active: filename === '/App.tsx' },
            },
        })),

    setAllCode: (files) =>
        set({ currentCode: files }),

    addMessage: (message) =>
        set((state) => ({
            chatHistory: [
                ...state.chatHistory,
                {
                    ...message,
                    id: crypto.randomUUID(),
                    timestamp: new Date(),
                },
            ],
        })),

    clearChatHistory: () =>
        set({ chatHistory: [] }),

    updateFileStructure: (files) =>
        set({ fileStructure: files }),

    setLastAssistantMessage: (content: Message | null) =>
        set({ lastAssistantMessage: content }),

    setIsGenerating: (value) =>
        set({ isGenerating: value }),

    setGenerationError: (error) =>
        set({ generationError: error }),

    setCurrentProjectId: (id) =>
        set({ currentProjectId: id }),

    // Load generated files into Sandpack format
    // The AI generates Next.js App Router files, we transform them for React SPA preview
    loadGeneratedFiles: (files: Record<string, string>) => {
        const sandpackFiles: SandpackFiles = {};
        const fileStructure: FileNode[] = [];

        for (const [path, content] of Object.entries(files)) {
            // Normalize path
            let normalizedPath = path.startsWith('/') ? path : `/${path}`;

            sandpackFiles[normalizedPath] = {
                code: content,
                active: normalizedPath === '/App.tsx' || normalizedPath === '/src/App.tsx',
            };

            fileStructure.push({
                path: normalizedPath,
                type: 'file',
            });
        }

        set({
            currentCode: sandpackFiles,
            fileStructure,
            lastAssistantMessage: null,
        });
    },

    resetToDefault: () =>
        set({
            currentCode: DEFAULT_FILES,
            fileStructure: [
                { path: '/App.tsx', type: 'file' },
                { path: '/styles.css', type: 'file' },
            ],
            currentProjectId: null,
            generationError: null,
        }),

    // File operations
    setSelectedFile: (path) => set({ selectedFile: path }),

    createFile: (path, content) =>
        set((state) => ({
            currentCode: {
                ...state.currentCode,
                [path]: { code: content, active: false },
            },
            fileStructure: [
                ...state.fileStructure,
                { path, type: 'file' },
            ],
            selectedFile: path,
        })),

    renameFile: (oldPath, newPath) =>
        set((state) => {
            const { [oldPath]: file, ...rest } = state.currentCode;
            return {
                currentCode: {
                    ...rest,
                    [newPath]: file,
                },
                fileStructure: state.fileStructure.map((f) =>
                    f.path === oldPath ? { ...f, path: newPath } : f
                ),
                selectedFile: state.selectedFile === oldPath ? newPath : state.selectedFile,
            };
        }),

    deleteFile: (path) =>
        set((state) => {
            const { [path]: _, ...rest } = state.currentCode;
            return {
                currentCode: rest,
                fileStructure: state.fileStructure.filter((f) => f.path !== path),
                selectedFile: state.selectedFile === path ? null : state.selectedFile,
            };
        }),
}));
