'use client';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { ProjectList } from '@/components/project/ProjectList';
import { FileTree } from '@/components/editor/FileTree';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { EditorTabs } from '@/components/editor/EditorTabs';
import { SandpackPreview } from '@/components/sandpack/SandpackPreview';
import { useAppStore } from '@/lib/store/use-app-store';
import { GripVertical } from 'lucide-react';

export function ResizableLayout() {
    const { currentCode } = useAppStore();

    // Convert Sandpack file format to simple Record<string, string>
    const files: Record<string, string> = {};
    for (const [path, file] of Object.entries(currentCode)) {
        files[path] = typeof file === 'string' ? file : file.code;
    }

    return (
        <PanelGroup direction="horizontal" className="h-full">
            {/* Project List Panel */}
            <Panel defaultSize={15} minSize={12} maxSize={25}>
                <ProjectList />
            </Panel>

            <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors relative group">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
                    <GripVertical size={16} className="text-zinc-600 group-hover:text-indigo-400" />
                </div>
            </PanelResizeHandle>

            {/* File Tree Panel */}
            <Panel defaultSize={15} minSize={12} maxSize={25}>
                <FileTree />
            </Panel>

            <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors relative group">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
                    <GripVertical size={16} className="text-zinc-600 group-hover:text-indigo-400" />
                </div>
            </PanelResizeHandle>

            {/* Code Editor Panel */}
            <Panel defaultSize={35} minSize={25}>
                <div className="h-full flex flex-col bg-zinc-950">
                    <EditorTabs />
                    <div className="flex-1 overflow-hidden">
                        <CodeEditor />
                    </div>
                </div>
            </Panel>

            <PanelResizeHandle className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors relative group">
                <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-4 flex items-center justify-center">
                    <GripVertical size={16} className="text-zinc-600 group-hover:text-indigo-400" />
                </div>
            </PanelResizeHandle>

            {/* Preview Panel */}
            <Panel defaultSize={35} minSize={25}>
                <SandpackPreview files={files} />
            </Panel>
        </PanelGroup>
    );
}
