'use client';

import { useState, useEffect } from 'react';
import { ChatPanel } from './_components/chat-panel';
import { PreviewPanel } from './_components/preview-panel';
import { useAppStore } from '@/lib/store/use-app-store';

export default function DashboardPage() {
    const { currentCode } = useAppStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => { setMounted(true); }, []);

    // Prepare files for preview
    const files: Record<string, string> = {};
    for (const [path, file] of Object.entries(currentCode)) {
        files[path] = typeof file === 'string' ? file : file.code;
    }

    if (!mounted) return null;

    return (
        <div className="flex h-screen w-screen overflow-hidden bg-black text-white">
            {/* Left Sidebar: Conversation */}
            <aside className="w-[400px] flex-shrink-0 flex flex-col border-r border-[#1F1F1F]">
                <ChatPanel />
            </aside>

            {/* Right Area: Canvas */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A] relative">
                <PreviewPanel files={files} />
            </main>
        </div>
    );
}
