import { AppSpec } from '@/lib/types/app';

/**
 * API response types
 */
export interface GenerateAppResponse {
    projectId: string;
    files: Record<string, string>;
}

export interface AppSpecResponse {
    spec: AppSpec;
}

export interface ApiErrorResponse {
    error: string;
    details?: string[];
}

/**
 * Generate an app from a natural language prompt
 * Returns the generated files that can be loaded into Sandpack
 */
export async function generateApp(prompt: string): Promise<GenerateAppResponse> {
    const response = await fetch('/api/generate-app', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to generate app');
    }

    return response.json();
}

/**
 * Generate an AppSpec from a prompt (without generating code)
 * Useful for previewing what will be built
 */
export async function generateAppSpec(prompt: string): Promise<AppSpec> {
    const response = await fetch('/api/app-spec', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to generate app spec');
    }

    const data: AppSpecResponse = await response.json();
    return data.spec;
}

/**
 * Generate an app from an existing AppSpec
 * Useful when user has reviewed and approved the spec
 */
export async function generateAppFromSpec(spec: AppSpec): Promise<GenerateAppResponse> {
    const response = await fetch('/api/generate-app', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ spec }),
    });

    if (!response.ok) {
        const errorData: ApiErrorResponse = await response.json();
        throw new Error(errorData.error || 'Failed to generate app');
    }

    return response.json();
}
