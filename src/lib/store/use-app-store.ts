import { create } from 'zustand';
import { Message, FileNode, SandpackFiles } from '@/lib/types';
import { DEFAULT_FILES } from '@/lib/sandpack-files';

interface AppState {
    // Current code state
    currentCode: SandpackFiles;

    // Chat history for AI conversations (legacy - useChat manages its own state)
    chatHistory: Message[];

    // Virtual file structure
    fileStructure: FileNode[];

    // Last assistant message (synced from useChat for code generation)
    lastAssistantMessage: string | null;

    // App generation state
    isGenerating: boolean;
    generationError: string | null;
    currentProjectId: string | null;

    // Actions
    updateCode: (filename: string, code: string) => void;
    setAllCode: (files: SandpackFiles) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    clearChatHistory: () => void;
    updateFileStructure: (files: FileNode[]) => void;
    setLastAssistantMessage: (content: string) => void;
    setIsGenerating: (value: boolean) => void;
    setGenerationError: (error: string | null) => void;
    setCurrentProjectId: (id: string | null) => void;
    loadGeneratedFiles: (files: Record<string, string>) => void;
    resetToDefault: () => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    currentCode: DEFAULT_FILES,
    chatHistory: [],
    fileStructure: [
        { path: '/App.tsx', type: 'file' },
        { path: '/styles.css', type: 'file' },
    ],
    lastAssistantMessage: null,
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

    setLastAssistantMessage: (content) =>
        set({ lastAssistantMessage: content }),

    setIsGenerating: (value) =>
        set({ isGenerating: value }),

    setGenerationError: (error) =>
        set({ generationError: error }),

    setCurrentProjectId: (id) =>
        set({ currentProjectId: id }),

    // Load generated files into Sandpack format
    // The AI generates Next.js App Router files, we transform them for React SPA preview
    loadGeneratedFiles: (files) =>
        set(() => {
            const sandpackFiles: SandpackFiles = {};

            for (const [path, content] of Object.entries(files)) {
                let normalizedPath = path.startsWith('/') ? path : `/${path}`;

                // Transform Next.js paths to React SPA paths for Sandpack preview
                if (normalizedPath === '/app/page.tsx' || normalizedPath === '/page.tsx') {
                    normalizedPath = '/App.tsx';
                } else if (normalizedPath === '/app/layout.tsx' || normalizedPath === '/layout.tsx') {
                    // Include layout as a separate file
                    normalizedPath = '/Layout.tsx';
                } else if (normalizedPath === '/app/globals.css' || normalizedPath === '/globals.css') {
                    normalizedPath = '/styles.css';
                } else if (normalizedPath.startsWith('/app/')) {
                    // Transform other app directory files
                    normalizedPath = normalizedPath.replace('/app/', '/');
                }

                sandpackFiles[normalizedPath] = {
                    code: content,
                    active: normalizedPath === '/App.tsx',
                };
            }

            // Ensure we have at least App.tsx
            if (!sandpackFiles['/App.tsx']) {
                // Find any page file and use it as App.tsx
                const pageFile = Object.entries(files).find(([path]) =>
                    path.includes('page.tsx') || path.includes('Page.tsx')
                );
                if (pageFile) {
                    sandpackFiles['/App.tsx'] = {
                        code: pageFile[1],
                        active: true,
                    };
                }
            }

            // Add default styles if missing
            if (!sandpackFiles['/styles.css']) {
                sandpackFiles['/styles.css'] = {
                    code: `body { margin: 0; font-family: system-ui, sans-serif; }`,
                };
            }

            // Update file structure
            const fileStructure: FileNode[] = Object.keys(sandpackFiles).map((path) => ({
                path,
                type: 'file' as const,
            }));

            return {
                currentCode: sandpackFiles,
                fileStructure,
                generationError: null,
            };
        }),

    // Reset to default files
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
}));
