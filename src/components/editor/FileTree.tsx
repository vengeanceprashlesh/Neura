'use client';

import { useState } from 'react';
import { Plus, FolderPlus } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';
import { FileTreeItem } from './FileTreeItem';

export function FileTree() {
    const { fileStructure, currentCode, selectedFile, setSelectedFile, createFile } = useAppStore();
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['/']));
    const [isCreating, setIsCreating] = useState(false);
    const [newFileName, setNewFileName] = useState('');
    const [createType, setCreateType] = useState<'file' | 'folder'>('file');

    const toggleFolder = (path: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(path)) {
                next.delete(path);
            } else {
                next.add(path);
            }
            return next;
        });
    };

    const handleCreate = () => {
        if (!newFileName) return;

        const path = `/${newFileName}`;
        if (createType === 'file') {
            createFile(path, '// New file\n');
        } else {
            // For folders, we'll just create a placeholder file inside
            createFile(`${path}/.gitkeep`, '');
        }

        setIsCreating(false);
        setNewFileName('');
    };

    // Build tree structure
    const buildTree = () => {
        const tree: any[] = [];
        const paths = Object.keys(currentCode).sort();

        for (const path of paths) {
            const parts = path.split('/').filter(Boolean);
            const name = parts[parts.length - 1];
            const level = parts.length - 1;

            tree.push({
                path,
                name,
                type: 'file' as const,
                level
            });
        }

        return tree;
    };

    const tree = buildTree();

    return (
        <div className="h-full flex flex-col bg-zinc-950 border-r border-zinc-800">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-300">Files</h3>
                <div className="flex gap-1">
                    <button
                        onClick={() => {
                            setCreateType('file');
                            setIsCreating(true);
                        }}
                        className="p-1.5 hover:bg-zinc-800 rounded"
                        title="New File"
                    >
                        <Plus size={16} />
                    </button>
                    <button
                        onClick={() => {
                            setCreateType('folder');
                            setIsCreating(true);
                        }}
                        className="p-1.5 hover:bg-zinc-800 rounded"
                        title="New Folder"
                    >
                        <FolderPlus size={16} />
                    </button>
                </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-2">
                {isCreating && (
                    <div className="flex items-center gap-2 px-2 py-1 mb-2">
                        <input
                            type="text"
                            value={newFileName}
                            onChange={(e) => setNewFileName(e.target.value)}
                            onBlur={handleCreate}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleCreate();
                                if (e.key === 'Escape') {
                                    setIsCreating(false);
                                    setNewFileName('');
                                }
                            }}
                            placeholder={createType === 'file' ? 'filename.tsx' : 'folder-name'}
                            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
                            autoFocus
                        />
                    </div>
                )}

                {tree.length === 0 ? (
                    <div className="text-center text-zinc-500 text-sm py-8">
                        No files yet. Create one to get started!
                    </div>
                ) : (
                    tree.map((item) => (
                        <FileTreeItem
                            key={item.path}
                            path={item.path}
                            name={item.name}
                            type={item.type}
                            level={item.level}
                            isSelected={selectedFile === item.path}
                            onSelect={() => setSelectedFile(item.path)}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
