'use client';

import {
    ResizableHandle,
    ResizablePanel,
    ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ChatPanel } from './_components/chat-panel';
import { SandboxPanel } from './_components/sandbox-panel';
import { ClientOnly } from '@/components/client-only';

export default function DashboardPage() {
    return (
        <div className="h-screen w-screen overflow-hidden bg-zinc-950">
            <ClientOnly>
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    {/* Left Panel - Chat */}
                    <ResizablePanel
                        defaultSize={30}
                        minSize={25}
                        maxSize={45}
                        className="border-r border-zinc-800"
                    >
                        <ChatPanel />
                    </ResizablePanel>

                    <ResizableHandle className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors" />

                    {/* Right Panel - Sandpack Editor & Preview */}
                    <ResizablePanel defaultSize={70} minSize={50}>
                        <SandboxPanel />
                    </ResizablePanel>
                </ResizablePanelGroup>
            </ClientOnly>
        </div>
    );
}
