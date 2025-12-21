'use client';

import { useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useAppStore } from '@/lib/store/use-app-store';

interface KeyboardShortcutsProps {
    onCommandPalette: () => void;
}

export function KeyboardShortcuts({ onCommandPalette }: KeyboardShortcutsProps) {
    const { createFile, selectedFile, currentProjectId } = useAppStore();

    // Cmd+K - Command Palette
    useHotkeys('mod+k', (e) => {
        e.preventDefault();
        onCommandPalette();
    });

    // Cmd+N - New File
    useHotkeys('mod+n', (e) => {
        e.preventDefault();
        const fileName = prompt('File name:');
        if (fileName) {
            createFile(`/${fileName}`, '// New file\n');
        }
    });

    // Cmd+S - Save (already auto-saves, but show feedback)
    useHotkeys('mod+s', (e) => {
        e.preventDefault();
        // Show save notification
        console.log('Saved!');
    });

    // Cmd+B - Toggle Sidebar
    useHotkeys('mod+b', (e) => {
        e.preventDefault();
        // Toggle sidebar visibility
        console.log('Toggle sidebar');
    });

    // Cmd+Enter - Generate App
    useHotkeys('mod+enter', (e) => {
        e.preventDefault();
        // Trigger app generation
        console.log('Generate app');
    });

    // Cmd+P - Quick Open (future feature)
    useHotkeys('mod+p', (e) => {
        e.preventDefault();
        console.log('Quick open');
    });

    return null; // This component doesn't render anything
}
