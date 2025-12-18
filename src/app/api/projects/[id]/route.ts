import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ProjectWithFiles, ApiError, AppSpecSchema } from '@/lib/types/app';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id] - Get project details with files
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!isSupabaseConfigured) {
            return NextResponse.json<ApiError>(
                { error: 'Database not configured' },
                { status: 503 }
            );
        }

        const supabase = getServerSupabase()!;

        // Fetch project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('id, owner_id, name, spec, created_at')
            .eq('id', id)
            .single();

        if (projectError || !project) {
            return NextResponse.json<ApiError>(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Fetch project files
        const { data: files, error: filesError } = await supabase
            .from('project_files')
            .select('id, project_id, path, content')
            .eq('project_id', id);

        if (filesError) {
            console.error('Failed to fetch project files:', filesError);
        }

        const projectWithFiles: ProjectWithFiles = {
            ...project,
            files: files || [],
        };

        return NextResponse.json({ project: projectWithFiles });
    } catch (error) {
        console.error('Get project error:', error);
        return NextResponse.json<ApiError>(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, spec, files } = body;

        if (!isSupabaseConfigured) {
            return NextResponse.json<ApiError>(
                { error: 'Database not configured' },
                { status: 503 }
            );
        }

        const supabase = getServerSupabase()!;

        // Build update object
        const updates: Record<string, unknown> = {};

        if (name !== undefined) {
            if (typeof name !== 'string' || name.length < 1) {
                return NextResponse.json<ApiError>(
                    { error: 'Invalid project name' },
                    { status: 400 }
                );
            }
            updates.name = name;
        }

        if (spec !== undefined) {
            const parsedSpec = AppSpecSchema.safeParse(spec);
            if (!parsedSpec.success) {
                return NextResponse.json<ApiError>(
                    { error: 'Invalid app specification' },
                    { status: 400 }
                );
            }
            updates.spec = parsedSpec.data;
        }

        // Update project if there are changes
        if (Object.keys(updates).length > 0) {
            const { error: updateError } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id);

            if (updateError) {
                console.error('Failed to update project:', updateError);
                return NextResponse.json<ApiError>(
                    { error: 'Failed to update project' },
                    { status: 500 }
                );
            }
        }

        // Update files if provided
        if (files && typeof files === 'object') {
            // Delete existing files
            await supabase
                .from('project_files')
                .delete()
                .eq('project_id', id);

            // Insert new files
            const fileRecords = Object.entries(files).map(([path, content]) => ({
                project_id: id,
                path,
                content: content as string,
            }));

            const { error: filesError } = await supabase
                .from('project_files')
                .insert(fileRecords);

            if (filesError) {
                console.error('Failed to update project files:', filesError);
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Update project error:', error);
        return NextResponse.json<ApiError>(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        if (!isSupabaseConfigured) {
            return NextResponse.json<ApiError>(
                { error: 'Database not configured' },
                { status: 503 }
            );
        }

        const supabase = getServerSupabase()!;

        // Delete project (files will be cascade deleted)
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Failed to delete project:', error);
            return NextResponse.json<ApiError>(
                { error: 'Failed to delete project' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json<ApiError>(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
