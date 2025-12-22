'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, Monitor } from 'lucide-react';
import { useState, useEffect } from 'react';

interface PreviewPanelProps {
    files: Record<string, string>;
}

export function PreviewPanel({ files }: PreviewPanelProps) {
    const [isLoading, setIsLoading] = useState(true);

    // Convert files to Sandpack format
    const sandpackFiles: Record<string, string> = {};

    for (const [path, content] of Object.entries(files)) {
        let targetPath = path;
        if (path === 'App.tsx' || path === '/App.tsx') {
            targetPath = '/App.tsx';
        } else if (!path.startsWith('/')) {
            targetPath = '/' + path;
        }
        sandpackFiles[targetPath] = content;
    }

    // Ensure we have files
    const hasFiles = Object.keys(sandpackFiles).length > 0;

    // Add default App.tsx if missing
    if (hasFiles && !sandpackFiles['/App.tsx']) {
        const componentFiles = Object.keys(sandpackFiles).filter(f => f.endsWith('.tsx'));
        if (componentFiles.length > 0) {
            const content = sandpackFiles[componentFiles[0]];
            if (content.includes('export default')) {
                sandpackFiles['/App.tsx'] = content;
            }
        }
    }

    // Add styles if missing
    if (hasFiles && !sandpackFiles['/styles.css']) {
        sandpackFiles['/styles.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`;
    }

    // Empty state
    if (!hasFiles) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-black text-white p-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="w-20 h-20 mx-auto mb-6 border border-white/20 rounded-2xl flex items-center justify-center"
                    >
                        <Monitor className="w-10 h-10 text-white/40" />
                    </motion.div>
                    <motion.h3
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-2xl font-semibold mb-3"
                    >
                        Your app will appear here
                    </motion.h3>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white/50 text-sm"
                    >
                        Select an app type from the left panel to get started
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-black flex flex-col">
            {/* Preview Header */}
            <div className="h-10 border-b border-white/10 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
                    </div>
                    <span className="text-white/40 text-xs ml-2">Preview</span>
                </div>
                <div className="flex items-center gap-1 text-white/30 text-xs">
                    <Sparkles size={12} />
                    <span>Live</span>
                </div>
            </div>

            {/* Sandpack Preview - Hidden Editor */}
            <div className="flex-1 overflow-hidden">
                <Sandpack
                    template="react-ts"
                    theme={{
                        colors: {
                            surface1: '#000000',
                            surface2: '#111111',
                            surface3: '#222222',
                            clickable: '#ffffff',
                            base: '#ffffff',
                            disabled: '#4D4D4D',
                            hover: '#ffffff',
                            accent: '#ffffff',
                            error: '#ff453a',
                            errorSurface: '#3d1418',
                        },
                        syntax: {
                            plain: '#ffffff',
                            comment: { color: '#6c6c6c', fontStyle: 'italic' },
                            keyword: '#ff7b72',
                            tag: '#7ee787',
                            punctuation: '#8b949e',
                            definition: '#d2a8ff',
                            property: '#79c0ff',
                            static: '#79c0ff',
                            string: '#a5d6ff',
                        },
                        font: {
                            body: 'system-ui, -apple-system, sans-serif',
                            mono: 'JetBrains Mono, Menlo, monospace',
                            size: '13px',
                            lineHeight: '1.5',
                        },
                    }}
                    files={sandpackFiles}
                    options={{
                        showNavigator: false,
                        showTabs: false,
                        showLineNumbers: false,
                        showInlineErrors: false,
                        wrapContent: false,
                        editorHeight: 0,
                        editorWidthPercentage: 0,
                        autorun: true,
                        autoReload: true,
                        recompileMode: 'delayed',
                        recompileDelay: 300,
                    }}
                    customSetup={{
                        dependencies: {
                            'lucide-react': '^0.460.0',
                            'framer-motion': '^11.11.17',
                            'zustand': '^4.5.0',
                            'clsx': '^2.1.0',
                        },
                    }}
                />
            </div>
        </div>
    );
}
