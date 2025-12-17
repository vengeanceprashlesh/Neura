'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAppStore } from '@/lib/store/use-app-store';
import {
    Send,
    Sparkles,
    Loader2,
    Bot,
    User
} from 'lucide-react';

export function ChatPanel() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [inputValue, setInputValue] = useState('');
    const { setLastAssistantMessage } = useAppStore();

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
    const getMessageText = (message: typeof messages[number]) => {
        return message.parts
            .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
            .map(part => part.text)
            .join('');
    };

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
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 mb-4">
                            <Bot size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-medium text-white mb-2">
                            Welcome to Neura
                        </h2>
                        <p className="text-sm text-zinc-500 max-w-[240px]">
                            Start a conversation to build your next app with AI assistance.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {messages.map((message) => (
                            <div
                                key={message.id}
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
                            </div>
                        ))}

                        {/* Loading indicator */}
                        {status === 'streaming' && (
                            <div className="flex gap-3 justify-start">
                                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                    <Bot size={16} className="text-white" />
                                </div>
                                <div className="bg-zinc-800 text-zinc-200 p-3 rounded-2xl rounded-bl-md">
                                    <Loader2 size={16} className="animate-spin" />
                                </div>
                            </div>
                        )}

                        {/* Scroll anchor */}
                        <div ref={scrollRef} />
                    </div>
                )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t border-zinc-800">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Textarea
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe what you want to build..."
                        disabled={isLoading}
                        className="min-h-[60px] max-h-[120px] resize-none bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                        rows={2}
                    />
                    <Button
                        type="submit"
                        size="icon"
                        disabled={isLoading || !inputValue.trim()}
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
                    Press Enter to send, Shift+Enter for new line
                </p>
            </div>
        </div>
    );
}
