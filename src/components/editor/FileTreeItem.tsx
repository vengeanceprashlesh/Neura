'use client';

import { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Plus, Trash2, Edit2 } from 'lucide-react';
import { useAppStore } from '@/lib/store/use-app-store';

interface FileTreeItemProps {
    path: string;
    name: string;
    type: 'file' | 'folder';
    level: number;
    isExpanded?: boolean;
    onToggle?: () => void;
    onSelect?: () => void;
    isSelected?: boolean;
}

export function FileTreeItem({
    path,
    name,
    type,
    level,
    isExpanded = false,
    onToggle,
    onSelect,
    isSelected = false
}: FileTreeItemProps) {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState(name);
    const { renameFile, deleteFile } = useAppStore();

    const handleRename = () => {
        if (newName && newName !== name) {
            const newPath = path.replace(name, newName);
            renameFile(path, newPath);
        }
        setIsRenaming(false);
    };

    const handleDelete = () => {
        if (confirm(`Delete ${name}?`)) {
            deleteFile(path);
        }
    };

    const getFileIcon = () => {
        if (type === 'folder') {
            return isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />;
        }

        // File type icons
        if (name.endsWith('.tsx') || name.endsWith('.ts')) {
            return <File size={16} className="text-blue-400" />;
        }
        if (name.endsWith('.css')) {
            return <File size={16} className="text-purple-400" />;
        }
        if (name.endsWith('.json')) {
            return <File size={16} className="text-yellow-400" />;
        }
        return <File size={16} className="text-zinc-400" />;
    };

    return (
        <div
            className={`
                flex items-center gap-1 px-2 py-1 cursor-pointer
                hover:bg-zinc-800/50 rounded
                ${isSelected ? 'bg-zinc-800' : ''}
            `}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={onSelect}
        >
            {type === 'folder' && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle?.();
                    }}
                    className="p-0.5 hover:bg-zinc-700 rounded"
                >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
            )}

            {getFileIcon()}

            {isRenaming ? (
                <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename();
                        if (e.key === 'Escape') setIsRenaming(false);
                    }}
                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-1 text-sm"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                />
            ) : (
                <span className="flex-1 text-sm text-zinc-300 truncate">{name}</span>
            )}

            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsRenaming(true);
                    }}
                    className="p-1 hover:bg-zinc-700 rounded"
                    title="Rename"
                >
                    <Edit2 size={12} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete();
                    }}
                    className="p-1 hover:bg-zinc-700 rounded text-red-400"
                    title="Delete"
                >
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
}
