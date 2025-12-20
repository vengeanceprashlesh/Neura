import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isAIConfigured, getProviderInfo } from '@/lib/ai/provider';

interface HealthStatus {
    status: 'healthy' | 'degraded' | 'unhealthy';
    timestamp: string;
    services: {
        ai: {
            configured: boolean;
            provider?: string;
            model?: string;
        };
        database: {
            configured: boolean;
        };
    };
    environment: {
        nodeEnv: string;
        hasGroqKey: boolean;
        hasOpenRouterKey: boolean;
        hasOpenAIKey: boolean;
        hasSupabaseUrl: boolean;
        hasSupabaseAnonKey: boolean;
        hasSupabaseServiceKey: boolean;
    };
}

export async function GET() {
    const aiConfigured = isAIConfigured();
    const dbConfigured = isSupabaseConfigured;

    let providerInfo = { chatProvider: 'none', chatModel: 'none', embeddingsConfigured: false };
    try {
        const info = getProviderInfo();
        providerInfo = {
            chatProvider: info.provider,
            chatModel: info.model,
            embeddingsConfigured: true
        };
    } catch {
        // Provider not configured
    }

    const health: HealthStatus = {
        status: aiConfigured ? (dbConfigured ? 'healthy' : 'degraded') : 'unhealthy',
        timestamp: new Date().toISOString(),
        services: {
            ai: {
                configured: aiConfigured,
                provider: providerInfo.chatProvider,
                model: providerInfo.chatModel,
            },
            database: {
                configured: dbConfigured,
            },
        },
        environment: {
            nodeEnv: process.env.NODE_ENV || 'development',
            hasGroqKey: Boolean(process.env.GROQ_API_KEY),
            hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY),
            hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
            hasSupabaseUrl: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
            hasSupabaseAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
            hasSupabaseServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
        },
    };

    const statusCode = health.status === 'unhealthy' ? 503 : 200;

    return NextResponse.json(health, { status: statusCode });
}
