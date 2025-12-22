'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import {
    Send,
    Loader2,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    AlertCircle,
    Layout,
    ListTodo,
    Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Minimal suggestions
const SUGGESTIONS = [
    { icon: ListTodo, title: "Todo App", prompt: "Create a todo app" },
    { icon: Briefcase, title: "Portfolio", prompt: "Create a portfolio website" },
    { icon: Layout, title: "Dashboard", prompt: "Create an admin dashboard" },
];

export function ChatPanel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');
    const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'success' | 'error'>('idle');
    const {
        loadGeneratedFiles,
        isGenerating,
        setIsGenerating,
        generationError,
        setGenerationError,
        currentCode
    } = useAppStore();

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

    const isLoading = status !== 'ready';

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;
        sendMessage({ text: inputValue.trim() });
        setInputValue('');
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim() && !isLoading) {
                handleSubmit(e);
            }
        }
    };

    const getMessageText = (message: any) => {
        if (message.content) return message.content;
        if (message.parts && Array.isArray(message.parts)) {
            return message.parts
                .filter((part: any) => part.type === 'text')
                .map((part: any) => part.text)
                .join('');
        }
        return '';
    };

    const getAppDescription = () => {
        const userMessages = messages.filter(m => m.role === 'user');
        return userMessages.map(m => getMessageText(m)).join('\n\n');
    };

    // Handle suggestion click
    const handleSuggestionClick = async (prompt: string) => {
        sendMessage({ text: prompt });
        setTimeout(() => handleGenerateWithPrompt(prompt), 300);
    };

    // Generate app
    const handleGenerateWithPrompt = async (prompt: string) => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setGenerationError(null);
        setGenerationStatus('generating');

        try {
            const filesMap: Record<string, string> = {};
            for (const [path, file] of Object.entries(currentCode)) {
                filesMap[path] = typeof file === 'string' ? file : file.code;
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: prompt,
                    existingFiles: Object.keys(filesMap).length > 0 ? filesMap : undefined,
                }),
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                throw new Error(data.error || 'Generation failed');
            }

            if (!data.files || Object.keys(data.files).length === 0) {
                throw new Error('No files generated');
            }

            loadGeneratedFiles(data.files);
            setGenerationStatus('success');

            const statusMsg = data.isDemo
                ? '✨ Demo app loaded! Add an API key for custom generation.'
                : `✨ Created ${Object.keys(data.files).length} files`;

            sendMessage({ text: statusMsg });

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setGenerationError(errorMessage);
            setGenerationStatus('error');
            sendMessage({ text: `Error: ${errorMessage}` });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleGenerateApp = () => {
        const description = getAppDescription();
        if (!description.trim()) {
            setGenerationError('Please describe your app first');
            return;
        }
        handleGenerateWithPrompt(description);
    };

    const showGenerateButton = messages.some(m => m.role === 'user') && !isGenerating;
    const showSuggestions = messages.length === 0;

    return (
        <div className="h-full flex flex-col bg-black">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6">
                {showSuggestions ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center max-w-sm"
                        >
                            <div className="w-12 h-12 mx-auto mb-6 border border-white/20 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-6 h-6 text-white/60" />
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">
                                What would you like to build?
                            </h2>
                            <p className="text-white/40 text-sm mb-8">
                                Choose a template or describe your own app
                            </p>

                            {/* Suggestions */}
                            <div className="space-y-2">
                                {SUGGESTIONS.map((item, i) => (
                                    <motion.button
                                        key={item.title}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        onClick={() => handleSuggestionClick(item.prompt)}
                                        disabled={isGenerating}
                                        className="w-full flex items-center gap-3 p-3 border border-white/10 hover:border-white/30 rounded-xl transition-all group disabled:opacity-50"
                                    >
                                        <div className="w-8 h-8 border border-white/20 rounded-lg flex items-center justify-center group-hover:border-white/40 transition-colors">
                                            <item.icon size={16} className="text-white/60" />
                                        </div>
                                        <span className="text-white/80 text-sm flex-1 text-left">
                                            {item.title}
                                        </span>
                                        <ArrowRight size={14} className="text-white/30 group-hover:text-white/60 transition-colors" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <AnimatePresence>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${message.role === 'user'
                                                ? 'bg-white text-black rounded-br-md'
                                                : 'bg-white/5 text-white/80 rounded-bl-md border border-white/10'
                                            }`}
                                    >
                                        {getMessageText(message)}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Loading */}
                        {(status === 'streaming' || isGenerating) && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex justify-start"
                            >
                                <div className="px-4 py-3 bg-white/5 border border-white/10 rounded-2xl rounded-bl-md flex items-center gap-2">
                                    <Loader2 size={14} className="animate-spin text-white/60" />
                                    <span className="text-white/60 text-sm">
                                        {isGenerating ? 'Creating...' : 'Thinking...'}
                                    </span>
                                </div>
                            </motion.div>
                        )}

                        <div ref={scrollRef} />
                    </div>
                )}
            </div>

            {/* Generate Button */}
            {showGenerateButton && (
                <div className="px-6 pb-4">
                    {generationStatus === 'success' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-white/60 text-xs mb-3 px-3 py-2 bg-white/5 rounded-lg"
                        >
                            <CheckCircle2 size={12} />
                            <span>App generated! Check the preview →</span>
                        </motion.div>
                    )}

                    {generationError && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 text-red-400 text-xs mb-3 px-3 py-2 bg-red-500/10 rounded-lg"
                        >
                            <AlertCircle size={12} />
                            <span>{generationError}</span>
                        </motion.div>
                    )}

                    <button
                        onClick={handleGenerateApp}
                        disabled={isGenerating}
                        className="w-full h-11 bg-white text-black font-medium rounded-xl hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        <Sparkles size={16} />
                        Generate App
                    </button>
                </div>
            )}

            {/* Generating State */}
            {isGenerating && (
                <div className="px-6 pb-4">
                    <div className="w-full h-11 border border-white/20 rounded-xl flex items-center justify-center gap-2">
                        <Loader2 size={16} className="animate-spin text-white/60" />
                        <span className="text-white/60 text-sm">Creating your app...</span>
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe what you want to build..."
                        disabled={isLoading || isGenerating}
                        rows={1}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 resize-none text-sm"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || isGenerating || !inputValue.trim()}
                        className="w-11 h-11 bg-white text-black rounded-xl hover:bg-white/90 transition-colors disabled:opacity-30 disabled:hover:bg-white flex items-center justify-center"
                    >
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </div>
    );
}
