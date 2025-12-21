'use client';

import { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useAppStore } from '@/lib/store/use-app-store';
import {
    FileText,
    FolderPlus,
    Trash2,
    Play,
    Settings,
    Keyboard,
    Save,
    Download
} from 'lucide-react';

interface CommandPaletteProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
    const { createFile, currentProjectId } = useAppStore();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onOpenChange(!open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, [open, onOpenChange]);

    const handleCommand = (command: string) => {
        switch (command) {
            case 'new-file':
                const fileName = prompt('File name:');
                if (fileName) {
                    createFile(`/${fileName}`, '// New file\n');
                }
                break;
            case 'save':
                // Trigger save
                console.log('Save triggered');
                break;
            case 'generate':
                // Trigger generation
                console.log('Generate triggered');
                break;
        }
        onOpenChange(false);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-start justify-center pt-[20vh]">
            <Command
                className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl overflow-hidden"
                onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                        onOpenChange(false);
                    }
                }}
            >
                <div className="flex items-center border-b border-zinc-800 px-4">
                    <Keyboard size={18} className="text-zinc-500 mr-2" />
                    <Command.Input
                        value={search}
                        onValueChange={setSearch}
                        placeholder="Type a command or search..."
                        className="w-full bg-transparent py-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none"
                    />
                </div>

                <Command.List className="max-h-96 overflow-y-auto p-2">
                    <Command.Empty className="py-6 text-center text-sm text-zinc-500">
                        No results found.
                    </Command.Empty>

                    <Command.Group heading="File" className="text-xs text-zinc-500 px-2 py-1.5">
                        <Command.Item
                            onSelect={() => handleCommand('new-file')}
                            className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-zinc-800 text-zinc-300"
                        >
                            <FileText size={16} />
                            <span>New File</span>
                            <span className="ml-auto text-xs text-zinc-500">Cmd+N</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => handleCommand('save')}
                            className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-zinc-800 text-zinc-300"
                        >
                            <Save size={16} />
                            <span>Save Project</span>
                            <span className="ml-auto text-xs text-zinc-500">Cmd+S</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => handleCommand('download')}
                            className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-zinc-800 text-zinc-300"
                        >
                            <Download size={16} />
                            <span>Export as ZIP</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Separator className="h-px bg-zinc-800 my-2" />

                    <Command.Group heading="Actions" className="text-xs text-zinc-500 px-2 py-1.5">
                        <Command.Item
                            onSelect={() => handleCommand('generate')}
                            className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-zinc-800 text-zinc-300"
                        >
                            <Play size={16} />
                            <span>Generate App</span>
                            <span className="ml-auto text-xs text-zinc-500">Cmd+Enter</span>
                        </Command.Item>
                    </Command.Group>

                    <Command.Separator className="h-px bg-zinc-800 my-2" />

                    <Command.Group heading="Settings" className="text-xs text-zinc-500 px-2 py-1.5">
                        <Command.Item
                            onSelect={() => handleCommand('settings')}
                            className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-zinc-800 text-zinc-300"
                        >
                            <Settings size={16} />
                            <span>Settings</span>
                        </Command.Item>

                        <Command.Item
                            onSelect={() => handleCommand('shortcuts')}
                            className="flex items-center gap-3 px-3 py-2 rounded cursor-pointer hover:bg-zinc-800 text-zinc-300"
                        >
                            <Keyboard size={16} />
                            <span>Keyboard Shortcuts</span>
                            <span className="ml-auto text-xs text-zinc-500">?</span>
                        </Command.Item>
                    </Command.Group>
                </Command.List>

                <div className="border-t border-zinc-800 px-4 py-2 text-xs text-zinc-500 flex items-center justify-between">
                    <span>Press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">Esc</kbd> to close</span>
                    <span>Navigate with <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑</kbd> <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↓</kbd></span>
                </div>
            </Command>
        </div>
    );
}
