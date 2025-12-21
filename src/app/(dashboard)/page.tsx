'use client';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ChatPanel } from './_components/chat-panel';
import { ResizableLayout } from '@/components/layout/ResizableLayout';
import { ClientOnly } from '@/components/client-only';
import { GripVertical } from 'lucide-react';

export default function DashboardPage() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-zinc-950">
            <ClientOnly>
                <PanelGroup direction="vertical" className="h-full">
                    {/* Top Panel - File Tree, Editor, Preview */}
                    <Panel defaultSize={75} minSize={50}>
                        <ResizableLayout />
                    </Panel>

                    <PanelResizeHandle className="h-1 bg-zinc-800 hover:bg-indigo-500 transition-colors relative group">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-4 flex items-center justify-center">
                            <GripVertical size={16} className="text-zinc-600 group-hover:text-indigo-400 rotate-90" />
                        </div>
                    </PanelResizeHandle>

                    {/* Bottom Panel - Chat */}
                    <Panel defaultSize={25} minSize={20} maxSize={40}>
                        <ChatPanel />
                    </Panel>
                </PanelGroup>
            </ClientOnly>
        </div>
    );
}
