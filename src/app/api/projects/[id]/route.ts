import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase } from '@/lib/supabase/client';

export const maxDuration = 60;

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/projects/[id] - Load project with files
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = getServerSupabase();

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        // Get project
        const { data: project, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

        if (projectError || !project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            );
        }

        // Get files
        const { data: files, error: filesError } = await supabase
            .from('project_files')
            .select('path, content')
            .eq('project_id', id);

        if (filesError) {
            console.error('Failed to fetch files:', filesError);
            return NextResponse.json(
                { error: 'Failed to fetch project files' },
                { status: 500 }
            );
        }

        // Convert files array to object
        const filesMap: Record<string, string> = {};
        if (files) {
            for (const file of files) {
                filesMap[file.path] = file.content;
            }
        }

        return NextResponse.json({
            project: {
                id: project.id,
                name: project.name,
                description: project.description,
                spec: project.spec,
                created_at: project.created_at,
                updated_at: project.updated_at
            },
            files: filesMap
        });

    } catch (error) {
        console.error('Load project error:', error);
        return NextResponse.json(
            { error: 'Failed to load project' },
            { status: 500 }
        );
    }
}

// PATCH /api/projects/[id] - Update project
export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { name, description, files } = body;

        const supabase = getServerSupabase();
        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        // Update project metadata
        const updates: any = {};
        if (name) updates.name = name;
        if (description !== undefined) updates.description = description;

        if (Object.keys(updates).length > 0) {
            const { error: projectError } = await supabase
                .from('projects')
                .update(updates)
                .eq('id', id);

            if (projectError) {
                console.error('Failed to update project:', projectError);
                return NextResponse.json(
                    { error: 'Failed to update project' },
                    { status: 500 }
                );
            }
        }

        // Update files if provided
        if (files && Object.keys(files).length > 0) {
            // Delete existing files
            await supabase
                .from('project_files')
                .delete()
                .eq('project_id', id);

            // Insert new files
            const fileRecords = Object.entries(files).map(([path, content]) => ({
                project_id: id,
                path,
                content: typeof content === 'string' ? content : (content as any).code || ''
            }));

            const { error: filesError } = await supabase
                .from('project_files')
                .insert(fileRecords);

            if (filesError) {
                console.error('Failed to update files:', filesError);
                return NextResponse.json(
                    { error: 'Failed to update files' },
                    { status: 500 }
                );
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Update project error:', error);
        return NextResponse.json(
            { error: 'Failed to update project' },
            { status: 500 }
        );
    }
}

// DELETE /api/projects/[id] - Delete project
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const supabase = getServerSupabase();

        if (!supabase) {
            return NextResponse.json(
                { error: 'Database not configured' },
                { status: 500 }
            );
        }

        // Delete files first (foreign key constraint)
        await supabase
            .from('project_files')
            .delete()
            .eq('project_id', id);

        // Delete project
        const { error } = await supabase
            .from('projects')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Failed to delete project:', error);
            return NextResponse.json(
                { error: 'Failed to delete project' },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Delete project error:', error);
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        );
    }
}
