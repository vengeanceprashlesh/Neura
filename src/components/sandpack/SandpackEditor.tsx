'use client';

import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
    SandpackFileExplorer,
} from '@codesandbox/sandpack-react';
import { useAppStore } from '@/lib/store/use-app-store';
import { SANDPACK_DEPENDENCIES } from '@/lib/sandpack-files';
import { ErrorPanel } from './ErrorPanel';

export function SandpackEditor() {
    const { currentCode } = useAppStore();

    // Convert SandpackFiles to the format Sandpack expects
    // Also transform Next.js paths to React SPA paths for preview
    const files = Object.entries(currentCode).reduce((acc, [path, file]) => {
        let transformedPath = path;

        // Transform Next.js App Router paths to React SPA paths for Sandpack
        if (path === '/app/page.tsx') {
            transformedPath = '/App.tsx';
        } else if (path === '/app/layout.tsx') {
            // Skip layout for React SPA
            return acc;
        } else if (path === '/app/globals.css') {
            transformedPath = '/styles.css';
        } else if (path.startsWith('/app/')) {
            // Transform other app directory files
            transformedPath = path.replace('/app/', '/');
        }

        if (typeof file === 'string') {
            acc[transformedPath] = { code: file };
        } else {
            acc[transformedPath] = {
                ...file,
                active: transformedPath === '/App.tsx' ? true : file.active
            };
        }
        return acc;
    }, {} as Record<string, { code: string; active?: boolean; hidden?: boolean; readOnly?: boolean }>);

    return (
        <div className="h-full flex flex-col">
            <SandpackProvider
                template="react-ts"
                files={files}
                customSetup={{
                    dependencies: SANDPACK_DEPENDENCIES,
                }}
                theme="dark"
                options={{
                    externalResources: [],
                    recompileMode: 'delayed',
                    recompileDelay: 500,
                }}
            >
                <SandpackLayout className="flex-1 !rounded-none !border-0">
                    <SandpackFileExplorer
                        className="min-w-[180px]"
                        autoHiddenFiles
                    />
                    <SandpackCodeEditor
                        showTabs
                        showLineNumbers
                        showInlineErrors
                        wrapContent
                        closableTabs
                        className="min-h-[300px]"
                        style={{ flex: 1 }}
                    />
                    <div className="flex flex-col" style={{ flex: 1 }}>
                        <SandpackPreview
                            showOpenInCodeSandbox={false}
                            showRefreshButton
                            className="flex-1"
                            style={{ minHeight: '300px' }}
                        />
                        <ErrorPanel />
                    </div>
                </SandpackLayout>
            </SandpackProvider>
        </div>
    );
}
