import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Lazy-initialized clients
let publicClient: SupabaseClient | null = null;
let serverClient: SupabaseClient | null = null;

// Public client for client-side operations
export function getSupabase(): SupabaseClient | null {
    if (!isSupabaseConfigured) {
        console.warn('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        return null;
    }

    if (!publicClient) {
        publicClient = createClient(supabaseUrl, supabaseAnonKey);
    }
    return publicClient;
}

// Server client with service role for backend operations
export function getServerSupabase(): SupabaseClient | null {
    if (!isSupabaseConfigured) {
        console.warn('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
        return null;
    }

    if (!serverClient) {
        const key = supabaseServiceKey || supabaseAnonKey;
        serverClient = createClient(supabaseUrl, key);
    }
    return serverClient;
}

// Helper for vector search
export async function vectorSearch<T>(
    tableName: string,
    queryEmbedding: number[],
    matchCount: number = 5,
    matchThreshold: number = 0.7
): Promise<T[]> {
    const supabase = getServerSupabase();
    if (!supabase) {
        return [];
    }

    const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_count: matchCount,
        match_threshold: matchThreshold,
        table_name: tableName,
    });

    if (error) {
        console.error(`Vector search error for ${tableName}:`, error);
        return [];
    }

    return data as T[];
}
