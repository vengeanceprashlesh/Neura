import { NextRequest, NextResponse } from 'next/server';
import { generateAppSpec, generateCode } from '@/lib/ai/provider';
import { validateGeneratedProject, sanitizeFileContent } from '@/lib/code/validate';
import {
    getFrontendTemplatesForSpec,
    getBackendTemplatesForSpec,
    formatTemplatesForPrompt,
    getFallbackTemplates
} from '@/lib/templates/rag-service';
import { getServerSupabase } from '@/lib/supabase/client';
import {
    AppSpec,
    AppSpecSchema,
    GenerateAppResponse,
    ApiError
} from '@/lib/types/app';

export const maxDuration = 120;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { prompt, spec: providedSpec } = body;

        // Step 1: Get or generate AppSpec
        let spec: AppSpec;

        if (providedSpec) {
            // Validate provided spec
            const parsed = AppSpecSchema.safeParse(providedSpec);
            if (!parsed.success) {
                return NextResponse.json<ApiError>(
                    { error: 'Invalid app specification', details: parsed.error.issues.map(e => e.message) },
                    { status: 400 }
                );
            }
            spec = parsed.data;
        } else if (prompt) {
            // Generate spec from prompt
            if (typeof prompt !== 'string' || prompt.length < 10) {
                return NextResponse.json<ApiError>(
                    { error: 'Prompt must be at least 10 characters' },
                    { status: 400 }
                );
            }
            spec = await generateAppSpec(prompt);
        } else {
            return NextResponse.json<ApiError>(
                { error: 'Either prompt or spec is required' },
                { status: 400 }
            );
        }

        // Step 2: Retrieve templates via RAG
        let frontendTemplates: string;
        let backendTemplates: string;

        try {
            const [frontendSnippets, backendSnippets] = await Promise.all([
                getFrontendTemplatesForSpec(spec),
                getBackendTemplatesForSpec(spec),
            ]);

            frontendTemplates = formatTemplatesForPrompt(frontendSnippets);
            backendTemplates = formatTemplatesForPrompt(backendSnippets);
        } catch (ragError) {
            console.warn('RAG service unavailable, using fallback templates:', ragError);
            const fallback = getFallbackTemplates();
            frontendTemplates = formatTemplatesForPrompt(fallback.frontend);
            backendTemplates = formatTemplatesForPrompt(fallback.backend);
        }

        // Step 3: Generate code
        const project = await generateCode(spec, frontendTemplates, backendTemplates);

        // Step 4: Validate generated code
        const validation = validateGeneratedProject(project);

        if (!validation.ok) {
            return NextResponse.json<ApiError>(
                { error: 'Generated code failed validation', details: validation.errors },
                { status: 422 }
            );
        }

        // Step 5: Sanitize and store project
        const sanitizedFiles: Record<string, string> = {};
        for (const [path, content] of Object.entries(project.files)) {
            sanitizedFiles[path] = sanitizeFileContent(content);
        }

        // Try to store in database if configured
        const supabase = getServerSupabase();

        if (!supabase) {
            // Return files without storing when DB is not configured
            return NextResponse.json<GenerateAppResponse>({
                projectId: 'local-' + Date.now(),
                files: sanitizedFiles,
            });
        }

        // Create project record
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert({
                owner_id: 'anonymous', // TODO: Get from auth
                name: spec.name,
                spec: spec,
            })
            .select('id')
            .single();

        if (projectError) {
            console.error('Failed to create project:', projectError);
            // Return files anyway so user can use them
            return NextResponse.json<GenerateAppResponse>({
                projectId: 'local',
                files: sanitizedFiles,
            });
        }

        // Store project files
        const fileRecords = Object.entries(sanitizedFiles).map(([path, content]) => ({
            project_id: projectData.id,
            path,
            content,
        }));

        const { error: filesError } = await supabase
            .from('project_files')
            .insert(fileRecords);

        if (filesError) {
            console.error('Failed to store project files:', filesError);
        }

        return NextResponse.json<GenerateAppResponse>({
            projectId: projectData.id,
            files: sanitizedFiles,
        });

    } catch (error) {
        console.error('Generate app error:', error);

        return NextResponse.json<ApiError>(
            { error: 'Failed to generate application' },
            { status: 500 }
        );
    }
}
