import { GeneratedProject, ValidationResult } from '@/lib/types/app';

// Dangerous patterns to block
const DANGEROUS_IMPORTS = [
    'child_process',
    'fs',
    'path',
    'os',
    'net',
    'dgram',
    'cluster',
    'worker_threads',
    'vm',
    'v8',
    'process',
];

const DANGEROUS_PATTERNS = [
    /\beval\s*\(/g,
    /\bFunction\s*\(/g,
    /\bnew\s+Function\s*\(/g,
    /\bexec\s*\(/g,
    /\bspawn\s*\(/g,
    /\b__dirname\b/g,
    /\b__filename\b/g,
    /\brequire\s*\(\s*['"`][^'"]+['"`]\s*\)/g,
];

const INFINITE_LOOP_PATTERNS = [
    /while\s*\(\s*true\s*\)\s*\{(?![^}]*break)/g,
    /for\s*\(\s*;\s*;\s*\)\s*\{(?![^}]*break)/g,
];

// Whitelisted dependencies
const ALLOWED_DEPENDENCIES = [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    '@supabase/ssr',
    'lucide-react',
    'framer-motion',
    'three',
    '@react-three/fiber',
    '@react-three/drei',
    'tailwindcss',
    'zod',
    'zustand',
];

// Limits
const MAX_FILE_COUNT = 100;
const MAX_FILE_SIZE = 100 * 1024; // 100KB per file
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB total

/**
 * Validate a generated project for safety and sanity
 */
export function validateGeneratedProject(project: GeneratedProject): ValidationResult {
    const errors: string[] = [];
    const files = project.files;
    const filePaths = Object.keys(files);

    // Check file count
    if (filePaths.length > MAX_FILE_COUNT) {
        errors.push(`Too many files: ${filePaths.length} (max: ${MAX_FILE_COUNT})`);
    }

    // Check total size
    let totalSize = 0;
    for (const [path, content] of Object.entries(files)) {
        const size = Buffer.byteLength(content, 'utf-8');
        totalSize += size;

        // Check individual file size
        if (size > MAX_FILE_SIZE) {
            errors.push(`File too large: ${path} (${Math.round(size / 1024)}KB, max: ${MAX_FILE_SIZE / 1024}KB)`);
        }
    }

    if (totalSize > MAX_TOTAL_SIZE) {
        errors.push(`Total project size too large: ${Math.round(totalSize / (1024 * 1024))}MB (max: ${MAX_TOTAL_SIZE / (1024 * 1024)}MB)`);
    }

    // Check each file for dangerous patterns
    for (const [path, content] of Object.entries(files)) {
        // Check for dangerous imports
        for (const dangerousImport of DANGEROUS_IMPORTS) {
            const importPattern = new RegExp(`['"\`]${dangerousImport}['"\`]`, 'g');
            if (importPattern.test(content)) {
                errors.push(`Dangerous import found in ${path}: ${dangerousImport}`);
            }
        }

        // Check for dangerous patterns
        for (const pattern of DANGEROUS_PATTERNS) {
            if (pattern.test(content)) {
                errors.push(`Dangerous code pattern found in ${path}: ${pattern.source}`);
            }
            // Reset regex lastIndex
            pattern.lastIndex = 0;
        }

        // Check for infinite loops
        for (const pattern of INFINITE_LOOP_PATTERNS) {
            if (pattern.test(content)) {
                errors.push(`Potential infinite loop found in ${path}`);
            }
            pattern.lastIndex = 0;
        }

        // Validate file paths
        if (path.includes('..') || path.startsWith('/')) {
            errors.push(`Invalid file path: ${path}`);
        }
    }

    // Check that essential files exist (React SPA or Next.js)
    const hasPage = filePaths.some(p =>
        p.includes('page.tsx') ||
        p.includes('page.jsx') ||
        p.includes('App.tsx') ||
        p.includes('App.jsx')
    );

    if (!hasPage) {
        errors.push('Missing main component file (app/page.tsx or App.tsx)');
    }

    return {
        ok: errors.length === 0,
        errors,
    };
}

/**
 * Sanitize file content (basic cleanup)
 */
export function sanitizeFileContent(content: string): string {
    // Remove any null bytes
    let sanitized = content.replace(/\0/g, '');

    // Normalize line endings
    sanitized = sanitized.replace(/\r\n/g, '\n');

    return sanitized;
}
