'use client';

import { Editor } from '@monaco-editor/react';
import { useAppStore } from '@/lib/store/use-app-store';
import { useEffect, useState } from 'react';

export function CodeEditor() {
    const { selectedFile, currentCode, updateCode } = useAppStore();
    const [localContent, setLocalContent] = useState('');

    // Load file content when selection changes
    useEffect(() => {
        if (selectedFile && currentCode[selectedFile]) {
            const file = currentCode[selectedFile];
            const content = typeof file === 'string' ? file : file.code;
            setLocalContent(content);
        } else {
            setLocalContent('');
        }
    }, [selectedFile, currentCode]);

    // Auto-save after 1 second of no typing
    useEffect(() => {
        if (!selectedFile) return;

        const timer = setTimeout(() => {
            if (localContent !== undefined) {
                updateCode(selectedFile, localContent);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [localContent, selectedFile, updateCode]);

    const handleChange = (value: string | undefined) => {
        if (value !== undefined) {
            setLocalContent(value);
        }
    };

    // Determine language from file extension
    const getLanguage = (filename: string) => {
        if (filename.endsWith('.tsx') || filename.endsWith('.ts')) return 'typescript';
        if (filename.endsWith('.jsx') || filename.endsWith('.js')) return 'javascript';
        if (filename.endsWith('.css')) return 'css';
        if (filename.endsWith('.json')) return 'json';
        if (filename.endsWith('.html')) return 'html';
        if (filename.endsWith('.md')) return 'markdown';
        return 'plaintext';
    };

    if (!selectedFile) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-950 text-zinc-500">
                <div className="text-center">
                    <p className="text-lg mb-2">No file selected</p>
                    <p className="text-sm">Select a file from the tree or create a new one</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-zinc-950">
            <Editor
                height="100%"
                language={getLanguage(selectedFile)}
                value={localContent}
                onChange={handleChange}
                theme="vs-dark"
                options={{
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineNumbers: 'on',
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    tabSize: 2,
                    wordWrap: 'on',
                    padding: { top: 16, bottom: 16 },
                    suggestOnTriggerCharacters: true,
                    quickSuggestions: true,
                    formatOnPaste: true,
                    formatOnType: true,
                }}
            />
        </div>
    );
}
