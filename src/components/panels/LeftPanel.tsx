'use client';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAppStore } from '@/lib/store';
import {
    MessageSquare,
    Send,
    Sparkles,
    Code2,
    Bot
} from 'lucide-react';

export function LeftPanel() {
    const { chatHistory } = useAppStore();

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

            {/* Chat Messages Area */}
            <ScrollArea className="flex-1 p-4">
                {chatHistory.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6">
                        <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 mb-4">
                            <Bot size={32} className="text-indigo-400" />
                        </div>
                        <h2 className="text-lg font-medium text-white mb-2">
                            Welcome to Neura
                        </h2>
                        <p className="text-sm text-zinc-500 max-w-[240px]">
                            This chat panel will connect to an AI assistant.
                            For now, edit code in the right panel.
                        </p>
                        <div className="mt-6 space-y-2 w-full max-w-[240px]">
                            <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-left">
                                <Code2 size={16} className="text-indigo-400 shrink-0" />
                                <span className="text-xs text-zinc-400">Edit React code live</span>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 text-left">
                                <MessageSquare size={16} className="text-indigo-400 shrink-0" />
                                <span className="text-xs text-zinc-400">AI chat coming soon</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {chatHistory.map((message) => (
                            <div
                                key={message.id}
                                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                    }`}
                            >
                                <div
                                    className={`max-w-[85%] p-3 rounded-2xl text-sm ${message.role === 'user'
                                            ? 'bg-indigo-600 text-white rounded-br-md'
                                            : 'bg-zinc-800 text-zinc-200 rounded-bl-md'
                                        }`}
                                >
                                    {message.content}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </ScrollArea>

            <Separator className="bg-zinc-800" />

            {/* Input Area */}
            <div className="p-4">
                <div className="flex items-center gap-2 p-2 bg-zinc-900 rounded-xl border border-zinc-800">
                    <input
                        type="text"
                        placeholder="Message AI assistant..."
                        disabled
                        className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-400 placeholder:text-zinc-600 px-2 disabled:cursor-not-allowed"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        disabled
                        className="h-8 w-8 text-zinc-600"
                    >
                        <Send size={16} />
                    </Button>
                </div>
                <p className="text-[10px] text-zinc-600 text-center mt-2">
                    AI integration coming in next milestone
                </p>
            </div>
        </div>
    );
}
