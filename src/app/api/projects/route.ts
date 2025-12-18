import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { Project, ApiError, AppSpecSchema } from '@/lib/types/app';

// GET /api/projects - List all projects
export async function GET() {
    try {
        if (!isSupabaseConfigured) {
            return NextResponse.json<ApiError>(
                { error: 'Database not configured. Set Supabase environment variables.' },
                { status: 503 }
            );
        }

        const supabase = getServerSupabase()!;

        // TODO: Filter by authenticated user
        const { data, error } = await supabase
            .from('projects')
            .select('id, owner_id, name, spec, created_at')
            .order('created_at', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Failed to fetch projects:', error);
            return NextResponse.json<ApiError>(
                { error: 'Failed to fetch projects' },
                { status: 500 }
            );
        }

        return NextResponse.json({ projects: data as Project[] });
    } catch (error) {
        console.error('Projects list error:', error);
        return NextResponse.json<ApiError>(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, spec, files } = body;

        // Validate inputs
        if (!name || typeof name !== 'string') {
            return NextResponse.json<ApiError>(
                { error: 'Project name is required' },
                { status: 400 }
            );
        }

        if (!spec) {
            return NextResponse.json<ApiError>(
                { error: 'App spec is required' },
                { status: 400 }
            );
        }

        // Validate spec structure
        const parsedSpec = AppSpecSchema.safeParse(spec);
        if (!parsedSpec.success) {
            return NextResponse.json<ApiError>(
                { error: 'Invalid app specification', details: parsedSpec.error.issues.map(e => e.message) },
                { status: 400 }
            );
        }

        if (!isSupabaseConfigured) {
            // Return a mock response when database is not configured
            return NextResponse.json({
                project: {
                    id: 'local-' + Date.now(),
                    owner_id: 'anonymous',
                    name,
                    spec: parsedSpec.data,
                    created_at: new Date().toISOString(),
                } as Project
            }, { status: 201 });
        }

        const supabase = getServerSupabase()!;

        // Create project
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .insert({
                owner_id: 'anonymous', // TODO: Get from auth
                name,
                spec: parsedSpec.data,
            })
            .select('id, owner_id, name, spec, created_at')
            .single();

        if (projectError) {
            console.error('Failed to create project:', projectError);
            return NextResponse.json<ApiError>(
                { error: 'Failed to create project' },
                { status: 500 }
            );
        }

        // If files provided, store them
        if (files && typeof files === 'object') {
            const fileRecords = Object.entries(files).map(([path, content]) => ({
                project_id: projectData.id,
                path,
                content: content as string,
            }));

            const { error: filesError } = await supabase
                .from('project_files')
                .insert(fileRecords);

            if (filesError) {
                console.error('Failed to store project files:', filesError);
                // Don't fail the request, project was created
            }
        }

        return NextResponse.json({ project: projectData as Project }, { status: 201 });
    } catch (error) {
        console.error('Project creation error:', error);
        return NextResponse.json<ApiError>(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
