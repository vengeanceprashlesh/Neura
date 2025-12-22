'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { Maximize2, RefreshCw, Layout } from 'lucide-react';
import { motion } from 'framer-motion';

interface PreviewPanelProps {
    files: Record<string, string>;
}

export function PreviewPanel({ files }: PreviewPanelProps) {
    // Convert files to Sandpack format
    const sandpackFiles: Record<string, string> = {};

    for (const [path, content] of Object.entries(files)) {
        let targetPath = path;
        if (path === 'App.tsx' || path === '/App.tsx') targetPath = '/App.tsx';
        else if (!path.startsWith('/')) targetPath = '/' + path;
        sandpackFiles[targetPath] = content;
    }

    const hasFiles = Object.keys(sandpackFiles).length > 0;
    if (hasFiles && !sandpackFiles['/App.tsx']) {
        const componentFiles = Object.keys(sandpackFiles).filter(f => f.endsWith('.tsx'));
        if (componentFiles.length > 0) sandpackFiles['/App.tsx'] = sandpackFiles[componentFiles[0]];
    }
    if (hasFiles && !sandpackFiles['/styles.css']) {
        sandpackFiles['/styles.css'] = `body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"; }`;
    }

    if (!hasFiles) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#0A0A0A] select-none">
                <div className="w-full max-w-sm text-center opacity-40">
                    <div className="w-24 h-16 border border-[#333] border-dashed rounded-lg mx-auto mb-4 flex items-center justify-center">
                        <Layout size={24} className="text-[#444]" />
                    </div>
                    <p className="text-sm font-medium text-[#666]">Preview Area</p>
                    <p className="text-xs text-[#444] mt-1">Generated applications will render here.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0A0A0A]">
            {/* Browser-like Toolbar */}
            <div className="h-12 border-b border-[#1F1F1F] flex items-center justify-between px-4 bg-[#0A0A0A]">

                {/* Traffic Lights */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
                        <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
                        <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#D89E24]" />
                        <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
                    </div>
                </div>

                {/* URL Bar (Fake) */}
                <div className="flex-1 max-w-md mx-4">
                    <div className="bg-[#111] border border-[#1F1F1F] rounded-md py-1 px-3 flex items-center justify-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[#666] font-mono">localhost:3000</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button className="text-[#444] hover:text-[#CCC] transition-colors">
                        <RefreshCw size={14} />
                    </button>
                    <button className="text-[#444] hover:text-[#CCC] transition-colors">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 relative bg-white">
                <Sandpack
                    template="react-ts"
                    theme={{
                        colors: {
                            surface1: '#ffffff', // White background for the preview wrapper
                            surface2: '#ffffff',
                            surface3: '#ffffff',
                            clickable: '#000000',
                            base: '#000000',
                            disabled: '#4D4D4D',
                            hover: '#000000',
                            accent: '#000000',
                        },
                        syntax: {
                            plain: '#000000',
                            comment: { color: '#999', fontStyle: 'italic' },
                            keyword: '#333',
                            tag: '#333',
                            punctuation: '#333',
                            definition: '#333',
                            property: '#333',
                            static: '#333',
                            string: '#333',
                        },
                        font: {
                            body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
                            mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                            size: '13px',
                            lineHeight: '1.5',
                        },
                    }}
                    files={sandpackFiles}
                    options={{
                        showNavigator: false,
                        showTabs: false,
                        showLineNumbers: false,
                        showInlineErrors: true,
                        wrapContent: true, // Important for responsive preview
                        editorHeight: '100%', // Ensure it takes full height
                        editorWidthPercentage: 0,
                        autorun: true,
                        autoReload: true,
                        recompileMode: 'delayed',
                        recompileDelay: 300,
                    }}
                    customSetup={{
                        dependencies: {
                            'lucide-react': 'latest',
                            'framer-motion': 'latest',
                            'clsx': 'latest',
                            'tailwind-merge': 'latest',
                            'date-fns': 'latest'
                        }
                    }}
                />
            </div>
        </div>
    );
}
