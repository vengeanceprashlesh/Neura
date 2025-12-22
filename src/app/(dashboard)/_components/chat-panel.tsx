'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store/use-app-store';
import { PROMPT_SUGGESTIONS } from '@/lib/ai/prompts';
import {
    Send,
    Sparkles,
    Loader2,
    Bot,
    User,
    Wand2,
    AlertCircle,
    Lightbulb,
    RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function ChatPanel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');
    const {
        setLastAssistantMessage,
        loadGeneratedFiles,
        isGenerating,
        setIsGenerating,
        generationError,
        setGenerationError,
        setCurrentProjectId,
        currentCode
    } = useAppStore();

    const { messages, sendMessage, status } = useChat({
        transport: new DefaultChatTransport({
            api: '/api/chat',
        }),
    });

    const isLoading = status !== 'ready';

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        sendMessage({ text: inputValue.trim() });
        setInputValue('');
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (inputValue.trim() && !isLoading) {
                handleSubmit(e);
            }
        }
    };

    // Helper to get text content from message parts
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

    // Get the user's app description from messages
    const getAppDescription = () => {
        const userMessages = messages.filter(m => m.role === 'user');
        return userMessages.map(m => getMessageText(m)).join('\n\n');
    };

    // Handle suggestion click
    const handleSuggestionClick = (prompt: string) => {
        setInputValue(prompt);
        // Auto-send the message
        sendMessage({ text: prompt });
    };

    // Handle app generation
    const handleGenerateApp = async () => {
        const description = getAppDescription();
        if (!description.trim()) {
            setGenerationError('Please describe your app idea first');
            return;
        }

        setIsGenerating(true);
        setGenerationError(null);

        try {
            // Get current files from store
            const filesMap: Record<string, string> = {};
            for (const [path, file] of Object.entries(currentCode)) {
                filesMap[path] = typeof file === 'string' ? file : file.code;
            }

            // Call generate endpoint with existing files as context
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt: description,
                    existingFiles: Object.keys(filesMap).length > 0 ? filesMap : undefined,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate app');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            if (!data.files || Object.keys(data.files).length === 0) {
                throw new Error('No files generated. Please try a different description.');
            }

            // Load generated files into store
            loadGeneratedFiles(data.files);

            // Add success message
            sendMessage({
                text: `✨ App generated! Created ${Object.keys(data.files).length} files. Check the preview!`,
            });

        } catch (error) {
            console.error('Generation error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            setGenerationError(errorMessage);

            sendMessage({
                text: `❌ Generation failed: ${errorMessage}`,
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // Show generate button if there are user messages
    const showGenerateButton = messages.some(m => m.role === 'user');
    const showSuggestions = messages.length === 0;

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                        <Sparkles size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-semibold text-white">Neura</h1>
                        <p className="text-xs text-zinc-500">AI App Builder</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
                {showSuggestions ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 mb-4"
                        >
                            <Bot size={32} className="text-indigo-400" />
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-lg font-medium text-white mb-2"
                        >
                            What do you want to build?
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-sm text-zinc-500 max-w-[280px] mb-6"
                        >
                            Describe your app idea or try one of these suggestions:
                        </motion.p>

                        {/* Suggestions Grid */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 gap-2 w-full max-w-[320px]"
                        >
                            {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                                <motion.button
                                    key={suggestion.title}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.05 }}
                                    onClick={() => handleSuggestionClick(suggestion.prompt)}
                                    className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/50 rounded-xl text-left transition-all duration-200 group"
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Lightbulb size={14} className="text-indigo-400 group-hover:text-indigo-300" />
                                        <span className="text-sm font-medium text-white">{suggestion.title}</span>
                                    </div>
                                    <p className="text-xs text-zinc-500">{suggestion.description}</p>
                                </motion.button>
                            ))}
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
                                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    {message.role === 'assistant' && (
                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                            <Bot size={16} className="text-white" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl text-sm ${message.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                            : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                                            }`}
                                    >
                                        <p className="whitespace-pre-wrap">{getMessageText(message)}</p>
                                    </div>
                                    {message.role === 'user' && (
                                        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                                            <User size={16} className="text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Loading indicator */}
                        {status === 'streaming' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-3 justify-start"
                            >
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div className="bg-zinc-800 text-zinc-200 p-3 rounded-2xl rounded-bl-md">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                            </motion.div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Generate Button */}
            {showGenerateButton && (
                <div className="px-4 pb-2">
                    {/* Error Display */}
                    <AnimatePresence>
                        {generationError && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center gap-2 text-red-400 text-sm mb-2 p-3 bg-red-950/50 rounded-lg border border-red-900"
                            >
                                <AlertCircle size={14} />
                                <span className="flex-1">{generationError}</span>
                                <button
                                    onClick={() => setGenerationError(null)}
                                    className="text-red-300 hover:text-red-200"
                                >
                                    <RefreshCw size={14} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerateApp}
                        disabled={isGenerating || isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium h-12 text-base"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={18} className="animate-spin mr-2" />
                                Creating your app...
                            </>
                        ) : (
                            <>
                                <Wand2 size={18} className="mr-2" />
                                Generate App
                            </>
                        )}
                    </Button>
                </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-800">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe what you want to build..."
                        disabled={isLoading || isGenerating}
                        className="min-h-[60px] max-h-[120px] resize-none bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                        rows={2}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || isGenerating || !inputValue.trim()}
                        className="h-[60px] w-[60px] bg-indigo-600 hover:bg-indigo-700 shrink-0"
                    >
                        {status === 'streaming' ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <Send size={20} />
                        )}
                    </Button>
                </form>
                <p className="text-[10px] text-zinc-600 text-center mt-2">
                    Press Enter to send • Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
