'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SandpackEditor } from '@/components/sandpack';
import { useAppStore } from '@/lib/store';
import { Code2, Eye, FolderTree } from 'lucide-react';

export function RightPanel() {
    const { fileStructure } = useAppStore();

    return (
        <div className="h-full flex flex-col bg-zinc-900">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-950">
                <Tabs defaultValue="editor" className="w-full">
                    <TabsList className="bg-zinc-900 border border-zinc-800">
                        <TabsTrigger
                            value="editor"
                            className="gap-1.5 text-xs data-[state=active]:bg-zinc-800"
                        >
                            <Code2 size={14} />
                            Editor
                        </TabsTrigger>
                        <TabsTrigger
                            value="files"
                            className="gap-1.5 text-xs data-[state=active]:bg-zinc-800"
                        >
                            <FolderTree size={14} />
                            Files
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
                <SandpackEditor />
            </div>
        </div>
    );
}
