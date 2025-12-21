import { getAIClient } from './provider';
import { AppSpec } from '@/lib/types/app';

interface CodeGenerationResult {
    files: Record<string, string>;
    spec: AppSpec;
}

export async function generateCodeFromSpec(spec: AppSpec): Promise<CodeGenerationResult | null> {
    try {
        const client = getAIClient();
        if (!client) {
            throw new Error('AI client not configured. Please set API keys.');
        }

        const systemPrompt = `You are an expert React developer. Generate a complete, working React application.

CRITICAL RULES:
1. Generate ONLY browser-safe code (no Node.js APIs)
2. Use React 18+ with TypeScript
3. Use Tailwind CSS for styling
4. Main component MUST be in App.tsx
5. All code must work in StackBlitz

OUTPUT FORMAT - Return ONLY valid JSON:
{
  "files": {
    "App.tsx": "export default function App() { return <div>Hello</div>; }",
    "styles.css": "body { margin: 0; }"
  }
}`;

        const userPrompt = `Create a React app: ${spec.name}

Description: ${spec.description || 'A modern web application'}

Make it beautiful with Tailwind CSS. Include all necessary code.`;

        console.log('🤖 Calling AI to generate code...');

        const response = await client.chat.completions.create({
            model: client.defaultModel || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            console.error('❌ No response from AI');
            throw new Error('No response from AI');
        }

        console.log('📝 AI response received, parsing...');

        // Try to extract JSON from response
        let files: Record<string, string> = {};

        // Method 1: Try to find JSON block
        const jsonMatch = content.match(/\{[\s\S]*"files"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                if (parsed.files) {
                    files = parsed.files;
                    console.log('✅ Parsed JSON successfully');
                }
            } catch (e) {
                console.warn('⚠️ JSON parse failed, trying fallback...');
            }
        }

        // Method 2: If no files yet, create a simple default app
        if (Object.keys(files).length === 0) {
            console.log('📦 Creating fallback app...');
            files = {
                'App.tsx': `export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          ${spec.name}
        </h1>
        <p className="text-gray-600 mb-6">
          ${spec.description || 'Welcome to your new app!'}
        </p>
        <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors">
          Get Started
        </button>
      </div>
    </div>
  );
}`,
                'styles.css': `@import url('https://cdn.jsdelivr.net/npm/tailwindcss@3.4.0/dist/tailwind.min.css');

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`
            };
        }

        // Ensure App.tsx exists
        if (!files['App.tsx'] && !files['/App.tsx']) {
            throw new Error('Generated code missing App.tsx');
        }

        console.log(`✅ Generated ${Object.keys(files).length} files`);

        return {
            files,
            spec
        };

    } catch (error) {
        console.error('💥 Code generation error:', error);
        return null;
    }
}
