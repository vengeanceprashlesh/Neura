import { GeneratedProject } from '@/lib/types/app';

/**
 * Post-process generated code to fix common Sandpack issues
 */
export function fixGeneratedCode(project: GeneratedProject): GeneratedProject {
    const files = { ...project.files };

    // Fix 1: Rename .ts files containing JSX to .tsx
    const filesToRename: Array<{ oldPath: string; newPath: string }> = [];

    for (const [path, content] of Object.entries(files)) {
        if (path.endsWith('.ts') && !path.endsWith('.d.ts')) {
            // Check if file contains JSX
            const hasJSX = /<[A-Z][a-zA-Z0-9]*[\s/>]/.test(content) || // Component tags
                /<[a-z]+[\s/>]/.test(content) ||              // HTML tags
                /className=/.test(content) ||                 // className prop
                /return\s*\([\s\n]*</.test(content);          // return (<

            if (hasJSX) {
                const newPath = path.replace(/\.ts$/, '.tsx');
                filesToRename.push({ oldPath: path, newPath });
            }
        }
    }

    // Apply renames
    for (const { oldPath, newPath } of filesToRename) {
        files[newPath] = files[oldPath];
        delete files[oldPath];
        console.log(`Renamed ${oldPath} to ${newPath} (contains JSX)`);
    }

    // Fix 2: Update imports to use .tsx extensions
    for (const [path, content] of Object.entries(files)) {
        let updatedContent = content;

        for (const { oldPath, newPath } of filesToRename) {
            const oldImport = oldPath.replace(/^(app\/|components\/|lib\/|entities\/|utils\/)/, './').replace(/\.ts$/, '');
            const newImport = newPath.replace(/^(app\/|components\/|lib\/|entities\/|utils\/)/, './').replace(/\.tsx$/, '');

            // The imports should remain without extensions, but we need to ensure consistency
            updatedContent = updatedContent.replace(
                new RegExp(`from ['"]${oldImport}['"]`, 'g'),
                `from '${newImport}'`
            );
        }

        files[path] = updatedContent;
    }

    // Fix 3: Ensure app/page.tsx exists and is correctly exported
    if (files['app/page.tsx']) {
        files['app/page.tsx'] = files['app/page.tsx']
            .replace(/export default function \w+/, 'export default function App')
            .replace(/^export function App/m, 'export default function App');
    }

    return {
        ...project,
        files
    };
}
