'use client';

import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatPanel } from './_components/chat-panel';
import { PreviewPanel } from './_components/preview-panel';
import { GripVertical, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';

export default function DashboardPage() {
    const { currentCode } = useAppStore();

    // Convert files for preview
    const files: Record<string, string> = {};
    for (const [path, file] of Object.entries(currentCode)) {
        files[path] = typeof file === 'string' ? file : file.code;
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-black flex flex-col">
            {/* Minimal Header */}
            <header className="h-14 border-b border-white/10 flex items-center justify-between px-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <Sparkles size={16} className="text-black" />
                    </div>
                    <span className="text-white font-semibold tracking-tight">Neura</span>
                </div>
                <div className="text-white/40 text-sm">
                    AI App Builder
                </div>
            </header>

            {/* Main Content - 2 Panels: Chat + Preview */}
            <div className="flex-1 overflow-hidden">
                <PanelGroup direction="horizontal" className="h-full">
                    {/* Left Panel - Chat */}
                    <Panel defaultSize={40} minSize={30} maxSize={50}>
                        <ChatPanel />
                    </Panel>

                    {/* Resize Handle */}
                    <PanelResizeHandle className="w-px bg-white/10 hover:bg-white/30 transition-colors relative group">
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <GripVertical size={14} className="text-white/50" />
                        </div>
                    </PanelResizeHandle>

                    {/* Right Panel - Preview Only (No Code) */}
                    <Panel defaultSize={60} minSize={40}>
                        <PreviewPanel files={files} />
                    </Panel>
                </PanelGroup>
            </div>
        </div>
    );
}
