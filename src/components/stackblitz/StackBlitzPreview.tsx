'use client';

import { useEffect, useRef, useState } from 'react';
import sdk from '@stackblitz/sdk';
import type { Project } from '@stackblitz/sdk';

interface StackBlitzPreviewProps {
    files: Record<string, string>;
    onReady?: () => void;
}

export function StackBlitzPreview({ files, onReady }: StackBlitzPreviewProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const vmRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const fileCount = Object.keys(files).length;
        if (fileCount === 0) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // Create StackBlitz project
        const createProject = async () => {
            try {
                // Prepare package.json
                const packageJson = {
                    name: 'neura-generated-app',
                    version: '0.0.0',
                    private: true,
                    type: 'module',
                    scripts: {
                        dev: 'vite',
                        build: 'vite build',
                        preview: 'vite preview'
                    },
                    dependencies: {
                        'react': '^18.2.0',
                        'react-dom': '^18.2.0',
                        'lucide-react': '^0.460.0',
                        'framer-motion': '^11.11.17',
                        'three': '^0.170.0',
                        '@react-three/fiber': '^8.17.10',
                        '@react-three/drei': '^9.117.3'
                    },
                    devDependencies: {
                        '@types/react': '^18.2.0',
                        '@types/react-dom': '^18.2.0',
                        '@vitejs/plugin-react': '^4.2.0',
                        'typescript': '^5.3.0',
                        'vite': '^5.0.0'
                    }
                };

                // Prepare project files
                const projectFiles: Record<string, string> = {
                    'package.json': JSON.stringify(packageJson, null, 2),
                    'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  }
});`,
                    'tsconfig.json': JSON.stringify({
                        compilerOptions: {
                            target: 'ES2020',
                            useDefineForClassFields: true,
                            lib: ['ES2020', 'DOM', 'DOM.Iterable'],
                            module: 'ESNext',
                            skipLibCheck: true,
                            moduleResolution: 'bundler',
                            allowImportingTsExtensions: true,
                            resolveJsonModule: true,
                            isolatedModules: true,
                            noEmit: true,
                            jsx: 'react-jsx',
                            strict: true,
                            noUnusedLocals: true,
                            noUnusedParameters: true,
                            noFallthroughCasesInSwitch: true,
                            paths: {
                                '@/*': ['./src/*']
                            }
                        },
                        include: ['src']
                    }, null, 2),
                    'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Neura App</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/index.tsx"></script>
  </body>
</html>`,
                    'src/index.tsx': `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
                    'src/styles.css': `body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
                };

                // Add user files (map paths to src/)
                for (const [path, content] of Object.entries(files)) {
                    let targetPath = path;

                    // Normalize paths to src/
                    if (path === 'App.tsx' || path === '/App.tsx') {
                        targetPath = 'src/App.tsx';
                    } else if (path.startsWith('/src/')) {
                        targetPath = path.substring(1);
                    } else if (path.startsWith('src/')) {
                        targetPath = path;
                    } else if (path.startsWith('/')) {
                        targetPath = 'src' + path;
                    } else {
                        targetPath = 'src/' + path;
                    }

                    // Override defaults if user provided them
                    if (targetPath === 'src/styles.css' && content.trim()) {
                        projectFiles[targetPath] = content;
                    } else if (targetPath !== 'src/index.tsx') {
                        projectFiles[targetPath] = content;
                    }
                }

                const project: Project = {
                    title: 'Neura Generated App',
                    description: 'Created with Neura AI App Builder',
                    template: 'node',
                    files: projectFiles
                };

                // Embed the project
                const vm = await sdk.embedProject(
                    containerRef.current!,
                    project,
                    {
                        openFile: 'src/App.tsx',
                        view: 'preview',
                        theme: 'dark',
                        height: '100%',
                        hideNavigation: false,
                        forceEmbedLayout: true
                    }
                );

                vmRef.current = vm;
                setIsLoading(false);
                onReady?.();

            } catch (err) {
                console.error('StackBlitz error:', err);
                setError(err instanceof Error ? err.message : 'Failed to create preview');
                setIsLoading(false);
            }
        };

        createProject();

        // Cleanup
        return () => {
            vmRef.current = null;
        };
    }, [files, onReady]);

    if (error) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-950 text-white p-8">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-semibold mb-2">Preview Error</h3>
                    <p className="text-zinc-400 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    if (Object.keys(files).length === 0) {
        return (
            <div className="h-full flex items-center justify-center bg-zinc-950 text-white p-8">
                <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">🚀</div>
                    <h3 className="text-2xl font-bold mb-2">Ready to Build</h3>
                    <p className="text-zinc-400">
                        Describe your app idea in the chat and click "Generate App" to see it come to life!
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-full w-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-white z-10">
                    <div className="text-center">
                        <div className="animate-spin text-4xl mb-4">⚡</div>
                        <p className="text-zinc-400">Loading preview...</p>
                    </div>
                </div>
            )}
            <div ref={containerRef} className="h-full w-full" />
        </div>
    );
}
