'use client';

import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatPanel } from './_components/chat-panel';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/ui/CommandPalette';
import { KeyboardShortcuts } from '@/components/ui/KeyboardShortcuts';
import { SandpackPreview } from '@/components/sandpack/SandpackPreview';
import { ClientOnly } from '@/components/client-only';
import { GripVertical } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';

export default function DashboardPage() {
    const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const { currentCode } = useAppStore();

    // Convert files for preview
    const files: Record<string, string> = {};
    for (const [path, file] of Object.entries(currentCode)) {
        files[path] = typeof file === 'string' ? file : file.code;
    }

    return (
        <div className="h-screen w-screen overflow-hidden bg-zinc-950 flex flex-col">
            <ClientOnly>
                {/* Header */}
                <Header onCommandPalette={() => setCommandPaletteOpen(true)} />

                {/* Command Palette */}
                <CommandPalette
                    open={commandPaletteOpen}
                    onOpenChange={setCommandPaletteOpen}
                />

                {/* Keyboard Shortcuts */}
                <KeyboardShortcuts
                    onCommandPalette={() => setCommandPaletteOpen(true)}
                />

                {/* Main Content - 2 Panels */}
                <div className="flex-1 overflow-hidden">
                    <PanelGroup direction="horizontal" className="h-full">
                        {/* Left Panel - Chat */}
                        <Panel defaultSize={35} minSize={25} maxSize={50}>
                            <ChatPanel />
                        </Panel>

                        <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors relative group">
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
                                <GripVertical size={16} className="text-zinc-600 group-hover:text-indigo-400" />
                            </div>
                        </PanelResizeHandle>

                        {/* Right Panel - Preview */}
                        <Panel defaultSize={65} minSize={50}>
                            <SandpackPreview files={files} />
                        </Panel>
                    </PanelGroup>
                </div>
            </ClientOnly>
        </div>
    );
}
