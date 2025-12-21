'use client';

import { useState } from 'react';
import { Zap, Keyboard } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useAppStore } from '@/lib/store/use-app-store';

interface HeaderProps {
    onCommandPalette: () => void;
}

export function Header({ onCommandPalette }: HeaderProps) {
    const { currentProjectId, isSaving } = useAppStore();

    return (
        <header className="h-12 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
                <Zap size={20} className="text-indigo-500" />
                <h1 className="text-lg font-bold text-white">Neura</h1>
                <span className="text-xs text-zinc-500 px-2 py-0.5 bg-zinc-800 rounded">AI App Builder</span>
            </div>

            {/* Center - Project Info */}
            <div className="flex items-center gap-2 text-sm text-zinc-400">
                {currentProjectId && (
                    <>
                        {isSaving && (
                            <span className="text-xs text-indigo-400">Saving...</span>
                        )}
                    </>
                )}
            </div>

            {/* Right - Actions */}
            <div className="flex items-center gap-2">
                <button
                    onClick={onCommandPalette}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors text-sm"
                    title="Command Palette (Cmd+K)"
                >
                    <Keyboard size={14} />
                    <span className="hidden sm:inline">Commands</span>
                    <kbd className="px-1.5 py-0.5 bg-zinc-900 rounded text-xs">⌘K</kbd>
                </button>

                <ThemeToggle />
            </div>
        </header>
    );
}
