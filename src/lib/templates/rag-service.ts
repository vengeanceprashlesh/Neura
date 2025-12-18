import { AppSpec, TemplateSnippet, FrontendTemplate, BackendTemplate } from '@/lib/types/app';
import { getServerSupabase } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/ai/provider';

/**
 * Get relevant frontend templates for an AppSpec
 */
export async function getFrontendTemplatesForSpec(spec: AppSpec): Promise<TemplateSnippet[]> {
    const supabase = getServerSupabase();
    if (!supabase) {
        return []; // Return empty when DB not configured
    }

    const templates: TemplateSnippet[] = [];
    const seenIds = new Set<string>();

    // Build query strings from spec
    const queries: string[] = [];

    // Add queries from pages
    for (const page of spec.pages) {
        queries.push(`${page.purpose} ${page.components.join(' ')}`);
    }

    // Add general queries from entities
    for (const entity of spec.entities) {
        queries.push(`${entity.name} form component list view`);
    }

    // Search for each query
    for (const query of queries.slice(0, 5)) { // Limit to 5 queries
        try {
            const embedding = await generateEmbedding(query);

            const { data, error } = await supabase.rpc('match_frontend_templates', {
                query_embedding: embedding,
                match_count: 3,
                match_threshold: 0.5,
            });

            if (error) {
                console.error('Frontend template search error:', error);
                continue;
            }

            for (const item of data || []) {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    templates.push({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        code: item.code,
                        kind: item.kind,
                    });
                }
            }
        } catch (err) {
            console.error('Error in frontend template search:', err);
        }
    }

    // Return top 5 unique templates
    return templates.slice(0, 5);
}

/**
 * Get relevant backend templates for an AppSpec
 */
export async function getBackendTemplatesForSpec(spec: AppSpec): Promise<TemplateSnippet[]> {
    const supabase = getServerSupabase();
    if (!supabase) {
        return []; // Return empty when DB not configured
    }

    const templates: TemplateSnippet[] = [];
    const seenIds = new Set<string>();

    // Build query strings from spec
    const queries: string[] = [];

    // Add queries from APIs
    for (const api of spec.apis) {
        queries.push(`${api.method} ${api.purpose} ${api.entity || ''} API route handler`);
    }

    // Add queries from entities (for schema templates)
    for (const entity of spec.entities) {
        const fieldTypes = entity.fields.map(f => f.type).join(' ');
        queries.push(`${entity.name} database schema ${fieldTypes}`);
    }

    // Search for each query
    for (const query of queries.slice(0, 5)) { // Limit to 5 queries
        try {
            const embedding = await generateEmbedding(query);

            const { data, error } = await supabase.rpc('match_backend_templates', {
                query_embedding: embedding,
                match_count: 3,
                match_threshold: 0.5,
            });

            if (error) {
                console.error('Backend template search error:', error);
                continue;
            }

            for (const item of data || []) {
                if (!seenIds.has(item.id)) {
                    seenIds.add(item.id);
                    templates.push({
                        id: item.id,
                        name: item.name,
                        description: item.description,
                        code: item.code,
                        kind: item.kind,
                    });
                }
            }
        } catch (err) {
            console.error('Error in backend template search:', err);
        }
    }

    // Return top 5 unique templates
    return templates.slice(0, 5);
}

/**
 * Format templates for LLM context
 */
export function formatTemplatesForPrompt(templates: TemplateSnippet[]): string {
    if (templates.length === 0) {
        return 'No templates available. Generate code from scratch using best practices.';
    }

    return templates.map((t, i) => `
### Template ${i + 1}: ${t.name} (${t.kind})
${t.description}

\`\`\`tsx
${t.code}
\`\`\`
`).join('\n');
}

/**
 * Get fallback templates when database is unavailable
 */
export function getFallbackTemplates(): { frontend: TemplateSnippet[]; backend: TemplateSnippet[] } {
    return {
        frontend: [
            {
                id: 'fallback-layout',
                name: 'Basic Layout',
                description: 'A basic Next.js layout with navigation',
                kind: 'layout',
                code: `export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <nav className="border-b p-4">
          <div className="container mx-auto">
            <h1 className="text-xl font-bold">App Name</h1>
          </div>
        </nav>
        <main className="container mx-auto p-4">{children}</main>
      </body>
    </html>
  );
}`,
            },
            {
                id: 'fallback-page',
                name: 'Basic Page',
                description: 'A basic Next.js page component',
                kind: 'page',
                code: `export default function Page() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Welcome</h1>
      <p className="text-muted-foreground">Get started by editing this page.</p>
    </div>
  );
}`,
            },
        ],
        backend: [
            {
                id: 'fallback-route',
                name: 'CRUD API Route',
                description: 'A basic CRUD API route handler',
                kind: 'route',
                code: `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data, error } = await supabase.from('items').select('*');
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabase.from('items').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}`,
            },
        ],
    };
}
