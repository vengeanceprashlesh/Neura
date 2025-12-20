import { AppSpec, TemplateSnippet } from '@/lib/types/app';
import { getServerSupabase } from '@/lib/supabase/client';
import { generateEmbedding } from '@/lib/ai/provider';

/**
 * Get relevant frontend templates for an AppSpec
 */
export async function getFrontendTemplatesForSpec(spec: AppSpec): Promise<TemplateSnippet[]> {
    const supabase = getServerSupabase();
    if (!supabase) {
        console.log('Supabase not configured, using fallback frontend templates');
        return getFallbackTemplates().frontend;
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

    // If no templates found from DB, use fallbacks
    if (templates.length === 0) {
        return getFallbackTemplates().frontend;
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
        console.log('Supabase not configured, using fallback backend templates');
        return getFallbackTemplates().backend;
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

    // If no templates found from DB, use fallbacks
    if (templates.length === 0) {
        return getFallbackTemplates().backend;
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
 * Get comprehensive fallback templates when database is unavailable
 */
export function getFallbackTemplates(): { frontend: TemplateSnippet[]; backend: TemplateSnippet[] } {
    return {
        frontend: [
            {
                id: 'fallback-layout',
                name: 'Next.js App Router Layout',
                description: 'A root layout with Tailwind CSS and dark mode support',
                kind: 'layout',
                code: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Built with Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <nav className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                App Name
              </h1>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}`,
            },
            {
                id: 'fallback-page',
                name: 'Next.js Page Component',
                description: 'A page with hero section and content area',
                kind: 'page',
                code: `'use client';

import { useState } from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Page() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full text-indigo-400 text-sm mb-6">
          <Sparkles size={16} />
          <span>Welcome to Our App</span>
        </div>
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
          Build Something Amazing
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
          Get started by exploring our features and capabilities.
        </p>
        <button className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-white font-medium transition-colors">
          Get Started
          <ArrowRight size={18} />
        </button>
      </section>

      {/* Content Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
            <h3 className="text-lg font-semibold mb-2">Feature {i}</h3>
            <p className="text-zinc-400">Description of feature {i} goes here.</p>
          </div>
        ))}
      </section>
    </div>
  );
}`,
            },
            {
                id: 'fallback-form',
                name: 'Form Component',
                description: 'A reusable form component with validation',
                kind: 'component',
                code: `'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  message: string;
}

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="p-8 bg-green-500/10 rounded-2xl border border-green-500/20 text-center">
        <h3 className="text-xl font-semibold text-green-400 mb-2">Thank you!</h3>
        <p className="text-zinc-400">We'll get back to you soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Your name"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
          placeholder="Your message"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl text-white font-medium transition-colors"
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {loading ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}`,
            },
            {
                id: 'fallback-card-list',
                name: 'Card List Component',
                description: 'A responsive card grid for displaying items',
                kind: 'component',
                code: `'use client';

interface Item {
  id: string;
  title: string;
  description: string;
  image?: string;
}

interface CardListProps {
  items: Item[];
  onItemClick?: (item: Item) => void;
}

export function CardList({ items, onItemClick }: CardListProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onItemClick?.(item)}
          className="group p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
        >
          {item.image && (
            <div className="aspect-video bg-zinc-800 rounded-xl mb-4 overflow-hidden">
              <img 
                src={item.image} 
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
            {item.title}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-2">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}`,
            },
        ],
        backend: [
            {
                id: 'fallback-crud-route',
                name: 'CRUD API Route',
                description: 'A complete CRUD API route handler with Supabase',
                kind: 'route',
                code: `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - List all items
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  const { data, error, count } = await supabase
    .from('items')
    .select('*', { count: 'exact' })
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, limit, offset });
}

// POST - Create new item
export async function POST(request: NextRequest) {
  const body = await request.json();

  const { data, error } = await supabase
    .from('items')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}`,
            },
            {
                id: 'fallback-item-route',
                name: 'Single Item Route',
                description: 'Route handler for single item operations with dynamic ID',
                kind: 'route',
                code: `import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type RouteParams = { params: Promise<{ id: string }> };

// GET - Get single item
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { data, error } = await supabase
    .from('items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Item not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

// PATCH - Update item
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const body = await request.json();

  const { data, error } = await supabase
    .from('items')
    .update(body)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// DELETE - Delete item
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}`,
            },
            {
                id: 'fallback-supabase-client',
                name: 'Supabase Client Utils',
                description: 'Supabase client setup for server and client components',
                kind: 'schema',
                code: `import { createClient } from '@supabase/supabase-js';

// For server components and API routes
export function getServerSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// For client components
export function getClientSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Database types (generate with Supabase CLI)
export interface Database {
  public: {
    Tables: {
      items: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          description: string | null;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          description?: string | null;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          description?: string | null;
          user_id?: string;
        };
      };
    };
  };
}`,
            },
        ],
    };
}
