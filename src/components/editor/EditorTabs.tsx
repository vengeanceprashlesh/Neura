'use client';

import { X } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';

export function EditorTabs() {
    const { currentCode, selectedFile, setSelectedFile } = useAppStore();

    // Get list of open files (for now, show all files)
    const openFiles = Object.keys(currentCode);

    if (openFiles.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-1 bg-zinc-900 border-b border-zinc-800 overflow-x-auto">
            {openFiles.map((path) => {
                const fileName = path.split('/').pop() || path;
                const isActive = selectedFile === path;

                return (
                    <button
                        key={path}
                        onClick={() => setSelectedFile(path)}
                        className={`
                            flex items-center gap-2 px-4 py-2 text-sm border-r border-zinc-800
                            transition-colors whitespace-nowrap
                            ${isActive
                                ? 'bg-zinc-950 text-white'
                                : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
                            }
                        `}
                    >
                        <span>{fileName}</span>
                        {/* Close button - for future implementation */}
                        {/* <X 
                            size={14} 
                            className="opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                                // Handle close
                            }}
                        /> */}
                    </button>
                );
            })}
        </div>
    );
}
