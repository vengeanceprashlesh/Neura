'use client';

import { StackBlitzPreview } from '@/components/stackblitz/StackBlitzPreview';
import { useAppStore } from '@/lib/store/use-app-store';

export function SandboxPanel() {
    const { currentCode } = useAppStore();

    // Convert Sandpack file format to simple Record<string, string>
    const files: Record<string, string> = {};
    for (const [path, file] of Object.entries(currentCode)) {
        files[path] = typeof file === 'string' ? file : file.code;
    }

    return (
        <div className="h-full flex flex-col bg-zinc-950">
            <div className="flex-1 overflow-hidden">
                <StackBlitzPreview files={files} />
            </div>
        </div>
    );
}
