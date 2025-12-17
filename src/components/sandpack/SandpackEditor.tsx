'use client';

import {
    SandpackProvider,
    SandpackLayout,
    SandpackCodeEditor,
    SandpackPreview,
} from '@codesandbox/sandpack-react';
import { useAppStore } from '@/lib/store/use-app-store';
import { SANDPACK_DEPENDENCIES } from '@/lib/sandpack-files';
import { ErrorPanel } from './ErrorPanel';

export function SandpackEditor() {
    const { currentCode } = useAppStore();

    // Convert SandpackFiles to the format Sandpack expects
    const files = Object.entries(currentCode).reduce((acc, [path, file]) => {
        if (typeof file === 'string') {
            acc[path] = { code: file };
        } else {
            acc[path] = file;
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
