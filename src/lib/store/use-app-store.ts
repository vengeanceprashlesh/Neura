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
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    currentCode: DEFAULT_FILES,
    chatHistory: [],
    fileStructure: [
        { path: '/App.tsx', type: 'file' },
        { path: '/Scene.tsx', type: 'file' },
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
    loadGeneratedFiles: (files) =>
        set((state) => {
            // Convert API response format to SandpackFiles format
            const sandpackFiles: SandpackFiles = {};

            for (const [path, content] of Object.entries(files)) {
                // Ensure path starts with /
                const normalizedPath = path.startsWith('/') ? path : `/${path}`;
                sandpackFiles[normalizedPath] = {
                    code: content,
                    active: normalizedPath === '/App.tsx' || normalizedPath === '/app/page.tsx',
                };
            }

            // Update file structure based on generated files
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
}));
