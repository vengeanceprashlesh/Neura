'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowUp, Sparkles, Terminal } from 'lucide-react';

const SUGGESTIONS = [
    { label: "Build a Portfolio", prompt: "Create a minimal portfolio website with a hero section, projects grid, and contact form." },
    { label: "Todo Application", prompt: "Build a task management app with categories, filtering, and local storage persistence." },
    { label: "Admin Dashboard", prompt: "Create a dark-mode admin dashboard with a sidebar, stat cards, and a data table." },
];

export function ChatPanel() {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'no-api-key'>('idle');

    const {
        loadGeneratedFiles,
        isGenerating,
        setIsGenerating,
        currentCode
    } = useAppStore();

    const handleGenerate = async (prompt: string) => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setStatus('generating');

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', text: prompt }]);

        try {
            // Prepare context
            const filesMap: Record<string, string> = {};
            for (const [path, file] of Object.entries(currentCode)) {
                filesMap[path] = typeof file === 'string' ? file : file.code;
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    existingFiles: Object.keys(filesMap).length > 0 ? filesMap : undefined,
                }),
            });

            const data = await response.json();

            // Handle API Key Errors
            if (data.error && (data.error.includes('API') || data.error.includes('key') || data.error.includes('client'))) {
                setStatus('no-api-key');
                setMessages(prev => [...prev, { role: 'assistant', text: 'Please configure your API key in .env to enable AI generation.' }]);
                return;
            }

            if (!response.ok || data.error) {
                setStatus('no-api-key');
                setMessages(prev => [...prev, { role: 'assistant', text: data.error || 'Generaton failed.' }]);
                return;
            }

            if (data.files && Object.keys(data.files).length > 0) {
                loadGeneratedFiles(data.files);
                setStatus('success');

                const msg = data.isDemo
                    ? 'Loaded demo template. Add your API Key to generate custom apps.'
                    : `Generated ${Object.keys(data.files).length} files.`;

                setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
            }

        } catch (error) {
            setStatus('no-api-key');
            setMessages(prev => [...prev, { role: 'assistant', text: 'Connection failed. Please check your setup.' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            handleGenerate(inputValue.trim());
            setInputValue('');
        }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-full bg-black">

            {/* Header / Brand */}
            <div className="px-6 py-5 border-b border-[#1F1F1F] flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                        <Terminal size={12} className="text-black" />
                    </div>
                    <span className="font-semibold text-sm tracking-tight">Neura</span>
                </div>
                {status === 'no-api-key' && (
                    <span className="text-[10px] font-medium text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                        Demo Mode
                    </span>
                )}
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {!hasMessages ? (
                    <div className="h-full flex flex-col justify-center animate-fade-in">
                        <div className="mb-6">
                            <h2 className="text-xl font-medium mb-2 tracking-tight">What shall we build?</h2>
                            <p className="text-[#888] text-sm leading-relaxed">
                                Describe your app in plain English, or pick a starter template below.
                            </p>
                        </div>

                        <div className="grid gap-2">
                            {SUGGESTIONS.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleGenerate(s.prompt)}
                                    disabled={isGenerating}
                                    className="text-left group p-3 rounded-lg border border-[#1F1F1F] hover:border-[#333] hover:bg-[#111] transition-all duration-200"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-[#CCC] group-hover:text-white transition-colors">
                                            {s.label}
                                        </span>
                                        <ArrowUp className="opacity-0 group-hover:opacity-100 rotate-45 text-[#666] transition-opacity" size={14} />
                                    </div>
                                    <p className="text-xs text-[#555] line-clamp-1">{s.prompt}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <span className="text-[10px] uppercase tracking-wider text-[#444] font-medium mb-1">
                                    {m.role === 'user' ? 'You' : 'Neura'}
                                </span>
                                <div className={`
                                    max-w-[90%] text-sm leading-relaxed rounded-lg px-4 py-3
                                    ${m.role === 'user'
                                        ? 'bg-white text-black font-medium'
                                        : 'bg-[#111] text-[#CCC] border border-[#1F1F1F]'
                                    }
                                `}>
                                    {m.text}
                                </div>
                            </motion.div>
                        ))}

                        {isGenerating && (
                            <div className="flex items-start gap-2 pt-2">
                                <div className="w-4 h-4 mt-0.5">
                                    <Loader2 className="animate-spin text-[#666]" size={16} />
                                </div>
                                <span className="text-sm text-[#666] animate-pulse">Thinking...</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-[#1F1F1F] bg-black">
                <form onSubmit={handleSubmit} className="relative group">
                    <input
                        className="
                            w-full bg-[#111] text-white text-sm rounded-lg pl-4 pr-12 py-3.5
                            border border-[#1F1F1F]
                            focus:outline-none focus:border-[#333] focus:ring-1 focus:ring-[#333]
                            placeholder-[#444] transition-all
                        "
                        placeholder="Ask Neura to build something..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        disabled={isGenerating}
                    />
                    <button
                        type="submit"
                        disabled={!inputValue.trim() || isGenerating}
                        className="
                            absolute right-2 top-1/2 -translate-y-1/2
                            p-1.5 rounded-md
                            bg-white text-black
                            disabled:opacity-0 disabled:pointer-events-none
                            hover:opacity-90 transition-all duration-200
                        "
                    >
                        <ArrowUp size={16} strokeWidth={2.5} />
                    </button>

                    {/* Corner accents for aesthetic */}
                    <div className="absolute -bottom-px -left-px w-2 h-2 border-l border-b border-[#333] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="absolute -top-px -right-px w-2 h-2 border-r border-t border-[#333] opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </form>
                <div className="text-center mt-3">
                    <p className="text-[10px] text-[#333]">Type a prompt to generate a full React application.</p>
                </div>
            </div>
        </div>
    );
}
