'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import { Maximize2, RefreshCw, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

interface PreviewPanelProps {
    files: Record<string, string>;
}

export function PreviewPanel({ files }: PreviewPanelProps) {
    const [key, setKey] = useState(0);

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

    const handleRefresh = () => {
        setKey(prev => prev + 1);
    };

    if (!hasFiles) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#13111f] select-none relative overflow-hidden">
                {/* Animated background orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" />
                    <div className="absolute bottom-1/3 right-1/3 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative z-10 text-center px-8 max-w-2xl mx-auto flex flex-col items-center"
                >
                    {/* Colorful Icon */}
                    <motion.div
                        className="mb-8 inline-flex p-6 rounded-3xl bg-gradient-to-br from-purple-500/30 via-cyan-500/30 to-pink-500/30 border border-purple-500/30 shadow-2xl shadow-purple-500/30 backdrop-blur-sm"
                        animate={{
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.05, 1]
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <Sparkles size={56} className="text-purple-400" />
                    </motion.div>

                    {/* Main Heading - CENTERED */}
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent leading-tight text-center">
                        Welcome to Neura
                    </h1>

                    <p className="text-lg text-purple-300/70 leading-relaxed mb-8 text-center max-w-lg">
                        Describe your app idea in the chat to get started!
                    </p>

                    {/* Feature Pills */}
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-purple-500/10 border border-purple-500/30">
                            <Zap size={14} className="text-purple-400" />
                            <span className="text-xs font-medium text-purple-300">Instant Preview</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-cyan-500/10 border border-cyan-500/30">
                            <Sparkles size={14} className="text-cyan-400" />
                            <span className="text-xs font-medium text-cyan-300">AI-Powered</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/20 to-pink-500/10 border border-pink-500/30">
                            <RefreshCw size={14} className="text-pink-400" />
                            <span className="text-xs font-medium text-pink-300">Live Updates</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0a14] to-[#0f0f1e]">
            {/* Minimal Browser-like Toolbar */}
            <div className="h-12 border-b border-purple-500/20 flex items-center justify-between px-4 bg-gradient-to-r from-black/40 to-black/20 backdrop-blur-sm">

                {/* Traffic Lights */}
                <div className="flex items-center gap-2">
                    <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity group">
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-500 border border-red-600/50 shadow-lg shadow-red-500/30 group-hover:shadow-red-500/50 transition-all" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 border border-amber-600/50 shadow-lg shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all" />
                        <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 border border-emerald-600/50 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all" />
                    </div>
                </div>

                {/* Centered Status Indicator - NO URL TEXT */}
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-cyan-400 animate-pulse shadow-lg shadow-purple-500/50" />
                        <span className="text-xs font-medium text-purple-300/80">Live Preview</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded-lg text-purple-400/60 hover:text-purple-400 hover:bg-white/5 transition-all"
                        title="Refresh preview"
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button className="p-1.5 rounded-lg text-purple-400/60 hover:text-purple-400 hover:bg-white/5 transition-all">
                        <Maximize2 size={14} />
                    </button>
                </div>
            </div>

            {/* Preview Content */}
            <div className="flex-1 relative bg-white border-l border-purple-500/10">
                <Sandpack
                    key={key}
                    template="react-ts"
                    theme={{
                        colors: {
                            surface1: '#ffffff',
                            surface2: '#ffffff',
                            surface3: '#ffffff',
                            clickable: '#000000',
                            base: '#000000',
                            disabled: '#4D4D4D',
                            hover: '#000000',
                            accent: '#8b5cf6',
                        },
                        syntax: {
                            plain: '#000000',
                            comment: { color: '#999', fontStyle: 'italic' },
                            keyword: '#8b5cf6',
                            tag: '#06b6d4',
                            punctuation: '#333',
                            definition: '#333',
                            property: '#333',
                            static: '#333',
                            string: '#f59e0b',
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
                        wrapContent: true,
                        editorHeight: '100%',
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
