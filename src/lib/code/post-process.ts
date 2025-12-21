```typescript
import { GeneratedProject } from '@/lib/types/app';

/**
 * Post-process generated code to fix common Sandpack issues
 * SIMPLIFIED: Just ensure single-file apps
 */
export function fixGeneratedCode(project: GeneratedProject): GeneratedProject {
    const files = { ...project.files };
    
    // If there's a components file, remove it and warn (AI should generate single-file)
    // This prevents import/export errors entirely
    if (files['app/components.tsx']) {
        console.warn('Removing components.tsx - AI should generate single-file apps');
        delete files['app/components.tsx'];
    }
    
    // Also remove any imports of that file from main
    if (files['app/page.tsx']) {
        files['app/page.tsx'] = files['app/page.tsx']
            .split('\n')
            .filter(line => 
                !line.includes("from './components'") && 
                !line.includes('from "./components"') &&
                !line.includes('import {') || line.includes('from')
            )
            .join('\n');
            
        // Ensure correct export
        files['app/page.tsx'] = files['app/page.tsx']
            .replace('export default function Page', 'export default function App')
            .replace(/^export function App/m, 'export default function App');
    }
    
    return {
        ...project,
        files
    };
}
```
