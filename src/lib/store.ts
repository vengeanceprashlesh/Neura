import { create } from 'zustand';
import { Message, FileNode, SandpackFiles } from './types';
import { DEFAULT_FILES } from './sandpack-files';

interface AppState {
    // Current code state
    currentCode: SandpackFiles;

    // Chat history for AI conversations
    chatHistory: Message[];

    // Virtual file structure
    fileStructure: FileNode[];

    // Actions
    updateCode: (filename: string, code: string) => void;
    setAllCode: (files: SandpackFiles) => void;
    addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
    clearChatHistory: () => void;
    updateFileStructure: (files: FileNode[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
    // Initial state
    currentCode: DEFAULT_FILES,
    chatHistory: [],
    fileStructure: [
        { path: '/App.tsx', type: 'file' },
        { path: '/Scene.tsx', type: 'file' },
    ],

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
}));
