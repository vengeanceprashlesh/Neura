import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FilePatch, PatchResponse } from '@/lib/types/patch';

export const maxDuration = 60;

// Provider configuration
function getProviderConfig() {
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        return {
            provider: 'groq' as const,
            apiKey: groqKey,
            baseURL: 'https://api.groq.com/openai/v1',
            model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
        };
    }

    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
        return {
            provider: 'openrouter' as const,
            apiKey: openrouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
            model: process.env.LLM_MODEL || 'anthropic/claude-3.5-sonnet',
            headers: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'Neura AI App Builder',
            },
        };
    }

    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
        return {
            provider: 'openai' as const,
            apiKey: openaiKey,
            model: process.env.LLM_MODEL || 'gpt-4o',
        };
    }

    return null;
}

const SYSTEM_PROMPT = `You are an AI coding assistant working inside a browser-based code editor powered by Sandpack.
The project is a React app with files like App.tsx, styles.css, and components/....

You must respond ONLY with valid JSON of this exact form:
{
  "patches": [
    {
      "path": "App.tsx",
      "kind": "create",
      "previousContent": null,
      "nextContent": "import React from 'react';\\n\\nexport default function App() {\\n  return <div>Hello</div>;\\n}"
    }
  ]
}

Each FilePatch has:
- path: string (file path like "App.tsx" or "components/Counter.tsx")
- kind: "create" | "update" | "delete"
- previousContent: the previous contents (or null for new files)
- nextContent: the new file content (or null for deletes)

CRITICAL RULES:

1. FIRST PROMPT (no existing files):
   - Create a COMPLETE working app with multiple "create" patches
   - MUST include: App.tsx (with "export default function App()")
   - Include styles.css with Tailwind-compatible CSS
   - Create components in separate files if needed
   - Make it fully functional and beautiful

2. LATER PROMPTS (files exist):
   - Return ONLY patches for files that need to change
   - Use "update" for existing files, "create" for new ones, "delete" to remove
   - Keep changes minimal and targeted

3. CODE REQUIREMENTS:
   - All files must be valid TypeScript/TSX
   - Use only browser-safe dependencies: react, lucide-react, framer-motion, three, @react-three/fiber, @react-three/drei
   - NO Node.js APIs (fs, child_process, etc.)
   - Use Tailwind CSS classes for styling
   - Main component MUST be: export default function App()

4. OUTPUT FORMAT:
   - ONLY output the JSON object, nothing else
   - No markdown, no code blocks, no explanations
   - Ensure all JSON is properly escaped

EXAMPLE for "create a counter":
{
  "patches": [
    {
      "path": "App.tsx",
      "kind": "create",
      "previousContent": null,
      "nextContent": "'use client';\\n\\nimport { useState } from 'react';\\nimport { Plus, Minus } from 'lucide-react';\\n\\nexport default function App() {\\n  const [count, setCount] = useState(0);\\n\\n  return (\\n    <div className=\\"min-h-screen bg-zinc-950 flex items-center justify-center\\">\\n      <div className=\\"text-center\\">\\n        <h1 className=\\"text-6xl font-bold text-white mb-8\\">{count}</h1>\\n        <div className=\\"flex gap-4\\">\\n          <button onClick={() => setCount(count - 1)} className=\\"px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-2\\">\\n            <Minus size={20} />\\n            Decrement\\n          </button>\\n          <button onClick={() => setCount(count + 1)} className=\\"px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center gap-2\\">\\n            <Plus size={20} />\\n            Increment\\n          </button>\\n        </div>\\n      </div>\\n    </div>\\n  );\\n}"
    },
    {
      "path": "styles.css",
      "kind": "create",
      "previousContent": null,
      "nextContent": "body {\\n  margin: 0;\\n  font-family: system-ui, -apple-system, sans-serif;\\n}"
    }
  ]
}`;

export async function POST(request: NextRequest) {
    try {
        const config = getProviderConfig();
        if (!config) {
            return NextResponse.json(
                { error: 'No AI provider configured' },
                { status: 500 }
            );
        }

        const body = await request.json();
        const { prompt, files = {}, activeFile } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            defaultHeaders: config.headers,
        });

        const fileCount = Object.keys(files).length;
        const isInitialCreation = fileCount === 0;

        let userPrompt: string;

        if (isInitialCreation) {
            userPrompt = `Create a complete app for: ${prompt}

This is the FIRST prompt, so create a fully working app from scratch with multiple files.
Include App.tsx, styles.css, and any components needed.
Make it beautiful with Tailwind CSS and modern design.`;
        } else {
            // Summarize existing files for context
            const filesSummary = Object.entries(files)
                .slice(0, 5) // Limit to 5 files to save tokens
                .map(([path, content]) => {
                    const preview = typeof content === 'string'
                        ? content.substring(0, 200)
                        : '';
                    return `${path}: ${preview}...`;
                })
                .join('\n\n');

            userPrompt = `Update the existing app: ${prompt}

Current files (${fileCount} total):
${filesSummary}

Active file: ${activeFile || 'none'}

Return ONLY the patches needed to implement this change.`;
        }

        console.log(`[apply-prompt] ${isInitialCreation ? 'Creating' : 'Updating'} app for: ${prompt}`);

        const response = await client.chat.completions.create({
            model: config.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: userPrompt },
            ],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 4000,
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from LLM');
        }

        const parsed = JSON.parse(content);

        // Validate response structure
        if (!parsed.patches || !Array.isArray(parsed.patches)) {
            throw new Error('Invalid response: missing patches array');
        }

        // Validate each patch
        const validPatches: FilePatch[] = [];
        for (const patch of parsed.patches) {
            if (!patch.path || !patch.kind) {
                console.warn('Skipping invalid patch:', patch);
                continue;
            }

            // Security: reject paths with ..
            if (patch.path.includes('..')) {
                console.warn('Rejecting patch with .. in path:', patch.path);
                continue;
            }

            // Ensure proper content for create/update
            if ((patch.kind === 'create' || patch.kind === 'update') && !patch.nextContent) {
                console.warn('Skipping create/update patch without nextContent:', patch.path);
                continue;
            }

            validPatches.push(patch);
        }

        if (validPatches.length === 0) {
            throw new Error('No valid patches generated');
        }

        console.log(`[apply-prompt] Generated ${validPatches.length} patches`);

        const patchResponse: PatchResponse = {
            patches: validPatches,
        };

        return NextResponse.json(patchResponse);

    } catch (error) {
        console.error('Apply prompt error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to apply prompt' },
            { status: 500 }
        );
    }
}
