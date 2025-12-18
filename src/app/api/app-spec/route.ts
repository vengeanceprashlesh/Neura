import { NextRequest, NextResponse } from 'next/server';
import { generateAppSpec } from '@/lib/ai/provider';
import { AppSpecResponse, ApiError } from '@/lib/types/app';

export const maxDuration = 60;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt } = body;

        if (!prompt || typeof prompt !== 'string') {
            return NextResponse.json<ApiError>(
                { error: 'Missing or invalid prompt' },
                { status: 400 }
            );
        }

        if (prompt.length < 10) {
            return NextResponse.json<ApiError>(
                { error: 'Prompt too short. Please provide more detail about your app idea.' },
                { status: 400 }
            );
        }

        if (prompt.length > 5000) {
            return NextResponse.json<ApiError>(
                { error: 'Prompt too long. Please keep it under 5000 characters.' },
                { status: 400 }
            );
        }

        const spec = await generateAppSpec(prompt);

        return NextResponse.json<AppSpecResponse>({ spec });
    } catch (error) {
        console.error('App spec generation error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error';

        if (error instanceof SyntaxError) {
            return NextResponse.json<ApiError>(
                { error: 'Failed to parse LLM response as JSON', details: [errorMessage] },
                { status: 500 }
            );
        }

        return NextResponse.json<ApiError>(
            { error: 'Failed to generate app specification', details: [errorMessage] },
            { status: 500 }
        );
    }
}
