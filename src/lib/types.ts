// Type definitions for the AI App Builder

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
}

export interface FileNode {
    path: string;
    type: 'file' | 'directory';
    children?: FileNode[];
}

export interface SandpackFile {
    code: string;
    active?: boolean;
    hidden?: boolean;
    readOnly?: boolean;
}

export type SandpackFiles = Record<string, SandpackFile | string>;
