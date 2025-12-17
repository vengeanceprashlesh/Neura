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

    // Actions
    updateCode: (filename: string, code: string) => void;
    setAllCode: (files: SandpackFiles) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    clearChatHistory: () => void;
    updateFileStructure: (files: FileNode[]) => void;
    setLastAssistantMessage: (content: string) => void;
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
}));
