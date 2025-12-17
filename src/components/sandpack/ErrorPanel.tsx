'use client';

import { useSandpackConsole, useSandpack } from '@codesandbox/sandpack-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle, Terminal, XCircle, AlertTriangle } from 'lucide-react';

export function ErrorPanel() {
    const { logs, reset } = useSandpackConsole({ resetOnPreviewRestart: true });
    const { sandpack } = useSandpack();
    const { error } = sandpack;

    const hasError = !!error;
    const hasLogs = logs.length > 0;

    if (!hasError && !hasLogs) {
        return (
            <div className="h-24 bg-zinc-900 border-t border-zinc-800 flex items-center justify-center text-zinc-500 text-sm">
                <Terminal size={16} className="mr-2" />
                Console output will appear here
            </div>
        );
    }

    return (
        <div className="h-32 bg-zinc-900 border-t border-zinc-800 flex flex-col">
            <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-800 bg-zinc-950">
                <div className="flex items-center gap-2 text-xs">
                    {hasError ? (
                        <>
                            <XCircle size={14} className="text-red-500" />
                            <span className="text-red-400 font-medium">Error</span>
                        </>
                    ) : (
                        <>
                            <Terminal size={14} className="text-zinc-400" />
                            <span className="text-zinc-400 font-medium">Console</span>
                        </>
                    )}
                </div>
                <button
                    onClick={reset}
                    className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    Clear
                </button>
            </div>

            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1 font-mono text-xs">
                    {hasError && (
                        <div className="flex items-start gap-2 text-red-400 bg-red-500/10 p-2 rounded">
                            <AlertCircle size={14} className="mt-0.5 shrink-0" />
                            <pre className="whitespace-pre-wrap break-all">{error.message}</pre>
                        </div>
                    )}

                    {logs.map((log, index) => (
                        <div
                            key={index}
                            className={`flex items-start gap-2 p-1 rounded ${log.method === 'error'
                                    ? 'text-red-400 bg-red-500/10'
                                    : log.method === 'warn'
                                        ? 'text-yellow-400 bg-yellow-500/10'
                                        : 'text-zinc-300'
                                }`}
                        >
                            {log.method === 'error' && <XCircle size={12} className="mt-0.5 shrink-0" />}
                            {log.method === 'warn' && <AlertTriangle size={12} className="mt-0.5 shrink-0" />}
                            <span className="break-all">
                                {log.data?.map((item, i) => (
                                    <span key={i}>
                                        {typeof item === 'object' ? JSON.stringify(item) : String(item)}
                                        {i < log.data!.length - 1 ? ' ' : ''}
                                    </span>
                                ))}
                            </span>
                        </div>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
