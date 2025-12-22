import OpenAI from 'openai';
import { AppSpec, AppSpecSchema, GeneratedProject, GeneratedProjectSchema } from '@/lib/types/app';

// ============================================
// Provider Configuration
// ============================================

type LLMProvider = 'openai' | 'openrouter' | 'groq';

interface ProviderConfig {
    apiKey: string;
    baseURL?: string;
    defaultModel: string;
    embeddingModel?: string;
    headers?: Record<string, string>;
    supportsEmbeddings: boolean;
}

function getProviderConfig(): { provider: LLMProvider; config: ProviderConfig } {
    // Debug: Log available keys (without revealing values)
    console.log('Provider config - Available keys:', {
        GROQ: !!process.env.GROQ_API_KEY,
        OPENROUTER: !!process.env.OPENROUTER_API_KEY,
        OPENAI: !!process.env.OPENAI_API_KEY,
    });

    // Check for Groq first (priority)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        return {
            provider: 'groq',
            config: {
                apiKey: groqKey,
                baseURL: 'https://api.groq.com/openai/v1',
                defaultModel: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
                supportsEmbeddings: false, // Groq doesn't support embeddings
            },
        };
    }

    // Check for OpenRouter
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
        return {
            provider: 'openrouter',
            config: {
                apiKey: openrouterKey,
                baseURL: 'https://openrouter.ai/api/v1',
                defaultModel: process.env.LLM_MODEL || 'anthropic/claude-3.5-sonnet',
                embeddingModel: process.env.EMBEDDING_MODEL || 'openai/text-embedding-3-small',
                headers: {
                    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                    'X-Title': 'Neura AI App Builder',
                },
                supportsEmbeddings: true,
            },
        };
    }

    // Fall back to OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
        return {
            provider: 'openai',
            config: {
                apiKey: openaiKey,
                defaultModel: process.env.LLM_MODEL || 'gpt-4o',
                embeddingModel: 'text-embedding-3-small',
                supportsEmbeddings: true,
            },
        };
    }

    throw new Error('No API key configured. Set GROQ_API_KEY, OPENROUTER_API_KEY, or OPENAI_API_KEY.');
}

// ============================================
// Client Management
// ============================================

let llmClient: OpenAI | null = null;
let currentProvider: LLMProvider | null = null;

function getLLMClient(): { client: OpenAI; provider: LLMProvider; config: ProviderConfig } {
    const { provider, config } = getProviderConfig();

    // Recreate client if provider changed
    if (!llmClient || currentProvider !== provider) {
        llmClient = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            defaultHeaders: config.headers,
        });
        currentProvider = provider;
    }

    return { client: llmClient, provider, config };
}

// ============================================
// Public API
// ============================================

/**
 * Check if AI provider is configured
 */
export function isAIConfigured(): boolean {
    return Boolean(process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY);
}

/**
 * Get current provider info
 */
export function getProviderInfo(): { provider: LLMProvider; model: string } {
    try {
        const { provider, config } = getProviderConfig();
        return { provider, model: config.defaultModel };
    } catch {
        return { provider: 'openai', model: 'unknown' };
    }
}

/**
 * Get detailed configuration status for UI
 * This helps the frontend show appropriate messaging and settings
 */
export function getConfigurationStatus(): {
    hasAnyKey: boolean;
    providers: {
        groq: boolean;
        openrouter: boolean;
        openai: boolean;
    };
    activeProvider: LLMProvider | null;
    activeModel: string | null;
    isDemoMode: boolean;
} {
    const providers = {
        groq: !!process.env.GROQ_API_KEY,
        openrouter: !!process.env.OPENROUTER_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
    };

    const hasAnyKey = providers.groq || providers.openrouter || providers.openai;

    if (!hasAnyKey) {
        return {
            hasAnyKey: false,
            providers,
            activeProvider: null,
            activeModel: null,
            isDemoMode: true,
        };
    }

    try {
        const { provider, model } = getProviderInfo();
        return {
            hasAnyKey: true,
            providers,
            activeProvider: provider,
            activeModel: model,
            isDemoMode: false,
        };
    } catch {
        return {
            hasAnyKey: false,
            providers,
            activeProvider: null,
            activeModel: null,
            isDemoMode: true,
        };
    }
}

/**
 * Generate an AppSpec from a natural language prompt
 */
export async function generateAppSpec(prompt: string): Promise<AppSpec> {
    const { client, config } = getLLMClient();

    const systemPrompt = `You are an expert software architect. Given a user's app idea, produce a detailed JSON specification.

Output ONLY valid JSON matching this TypeScript type:
{
  name: string;           // App name
  description?: string;   // Brief description
  pages: Array<{
    path: string;         // Route path, e.g., "/", "/products/[id]"
    purpose: string;      // What this page does
    components: string[]; // Component names used
  }>;
  entities: Array<{
    name: string;         // Entity name, e.g., "Product"
    fields: Array<{ name: string; type: string }>; // Fields
  }>;
  apis: Array<{
    path: string;         // API route, e.g., "/api/products"
    method: "GET" | "POST" | "PATCH" | "DELETE";
    purpose: string;
    entity?: string;      // Related entity
  }>;
}

Be comprehensive but practical. Include all necessary pages, entities, and APIs for a working app.`;

    const response = await client.chat.completions.create({
        model: config.defaultModel,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create an app specification for: ${prompt}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    const validated = AppSpecSchema.parse(parsed);
    return validated;
}

/**
 * Generate code files from AppSpec and templates
 */
export async function generateCode(
    spec: AppSpec,
    frontendTemplates: string,
    backendTemplates: string
): Promise<GeneratedProject> {
    const { client, config } = getLLMClient();

    const systemPrompt = `You are an expert React and Next.js developer creating code for a full application.

Given an AppSpec JSON defining the app structure, generate a complete file tree.

TECHNICAL RULES:
1. Use Next.js App Router structure in the 'app/' directory.
2. Main UI component MUST be in 'app/page.tsx' and MUST have: export default function App()
3. Use Lucide React for icons.
4. Use Framer Motion for animations.
5. Use React Three Fiber and Drei for 3D elements if requested.
6. Use Supabase (@supabase/supabase-js) for data fetching if needed.
7. Use Tailwind CSS for styling (className).
8. If you use multiple files, YOU MUST DEFINE AND EXPORT EVERY COMPONENT YOU USE.
9. DO NOT reference components that you haven't written in the 'files' object.
10. For modularity, use 'components/' directory for shared components.

Output ONLY valid JSON:
{
  "spec": <the input AppSpec>,
  "files": {
    "app/page.tsx": "import { Hero } from '@/components/Hero';\nexport default function App() { ... }",
    "components/Hero.tsx": "export function Hero() { ... }",
    "app/globals.css": "@tailwind base; @tailwind components; @tailwind utilities;"
  }
}`;


    const userPrompt = `
## App Specification
\`\`\`json
${JSON.stringify(spec, null, 2)}
\`\`\`

## Frontend Templates
${frontendTemplates}

## Backend Templates
${backendTemplates}

Generate the complete project files.`;

    const response = await client.chat.completions.create({
        model: config.defaultModel,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.5,
        max_tokens: 8000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error('No response from LLM');
    }

    const parsed = JSON.parse(content);
    const validated = GeneratedProjectSchema.parse(parsed);
    return validated;
}

/**
 * Generate embeddings for text (for RAG)
 * Note: Groq doesn't support embeddings, so we use fallback
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    const { client, provider, config } = getLLMClient();

    // If provider doesn't support embeddings, use fallback
    if (!config.supportsEmbeddings) {
        console.log(`Provider ${provider} doesn't support embeddings, using fallback`);
        return generateFallbackEmbedding(text);
    }

    try {
        const response = await client.embeddings.create({
            model: config.embeddingModel!,
            input: text,
        });

        return response.data[0].embedding;
    } catch (error) {
        console.warn('Embedding generation failed, using fallback:', error);
        return generateFallbackEmbedding(text);
    }
}

/**
 * Fallback embedding generation using simple text hashing
 * This is used when the provider doesn't support embeddings (e.g., Groq)
 */
function generateFallbackEmbedding(text: string, dimensions: number = 1536): number[] {
    const embedding = new Array(dimensions).fill(0);
    const normalizedText = text.toLowerCase().trim();

    // Simple character-based hash distribution
    for (let i = 0; i < normalizedText.length; i++) {
        const charCode = normalizedText.charCodeAt(i);
        const position = (charCode * (i + 1)) % dimensions;
        embedding[position] += 1 / (i + 1);
    }

    // Normalize the embedding
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
        for (let i = 0; i < dimensions; i++) {
            embedding[i] /= magnitude;
        }
    }

    return embedding;
}

// Export helper for code generation
export function getAIClient() {
    const { client, config } = getLLMClient();
    return {
        ...client,
        defaultModel: config.defaultModel
    };
}
