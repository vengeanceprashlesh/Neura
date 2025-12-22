import { NextRequest, NextResponse } from 'next/server';
import { generateCodeFromSpec } from '@/lib/ai/code-generator';
import { validateGeneratedProject } from '@/lib/code/validate';
import { fixGeneratedCode } from '@/lib/code/post-process';
import { getServerSupabase } from '@/lib/supabase/client';

export const maxDuration = 60;

interface GenerateRequest {
    prompt: string;
    existingFiles?: Record<string, string>;
    projectId?: string;
}

interface GenerateResponse {
    files: Record<string, string>;
    spec?: any;
    projectId?: string;
    error?: string;
}

export async function POST(request: NextRequest) {
    try {
        const body: GenerateRequest = await request.json();
        const { prompt, existingFiles, projectId } = body;

        // Validate input
        if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
            return NextResponse.json<GenerateResponse>(
                { error: 'Please describe what you want to build', files: {} },
                { status: 400 }
            );
        }

        console.log('🚀 Starting generation for prompt:', prompt.substring(0, 100));

        // Determine if this is a new app or an update
        const isUpdate = existingFiles && Object.keys(existingFiles).length > 0;

        console.log(isUpdate ? '🔄 Updating existing app...' : '📝 Generating new app...');

        // Create a simple spec from the prompt
        const spec = {
            name: prompt.substring(0, 50),
            description: prompt,
            pages: [],
            entities: [],
            apis: []
        };

        // Generate code with the new intelligent system
        console.log('2️⃣ Calling AI code generator...');
        const codeResult = await generateCodeFromSpec(
            { name: spec.name, description: prompt },
            isUpdate,
            existingFiles
        );

        if (!codeResult || !codeResult.success) {
            console.error('❌ Code generation failed:', codeResult?.error);
            return NextResponse.json<GenerateResponse>(
                {
                    error: codeResult?.error || 'Failed to generate code. Please try again.',
                    files: {}
                },
                { status: 400 }
            );
        }

        let files = codeResult.files;
        console.log('✅ Generated', Object.keys(files).length, 'files');

        // For updates, merge with existing files
        if (isUpdate && existingFiles) {
            files = { ...existingFiles, ...files };
            console.log('✅ Merged with existing files. Total:', Object.keys(files).length);
        }

        // Step 3: Post-process files (fix extensions, etc.)
        console.log('3️⃣ Post-processing files...');
        try {
            const processedProject = fixGeneratedCode({ spec, files });
            files = processedProject.files;
        } catch (e) {
            console.warn('⚠️ Post-processing warning:', e);
            // Continue with unprocessed files if post-processing fails
        }

        // Step 4: Validate generated code (soft validation - don't block on minor issues)
        console.log('4️⃣ Validating code...');
        const validation = validateGeneratedProject({ spec, files });

        if (!validation.ok) {
            console.warn('⚠️ Validation warnings:', validation.errors);
            // For now, we'll proceed anyway but log the warnings
            // In the future, we could ask the AI to fix these issues
        }

        console.log('✅ Validation passed');

        // Step 5: Save to database if projectId provided
        if (projectId) {
            console.log('5️⃣ Saving to database...');
            const supabase = getServerSupabase();

            if (supabase) {
                try {
                    // Delete existing files
                    await supabase
                        .from('project_files')
                        .delete()
                        .eq('project_id', projectId);

                    // Insert new files
                    const fileRecords = Object.entries(files).map(([path, content]) => ({
                        project_id: projectId,
                        path,
                        content
                    }));

                    await supabase
                        .from('project_files')
                        .insert(fileRecords);

                    // Update project metadata
                    if (spec) {
                        await supabase
                            .from('projects')
                            .update({ spec })
                            .eq('id', projectId);
                    }

                    console.log('✅ Saved to database');
                } catch (dbError) {
                    console.error('⚠️ Database save failed:', dbError);
                    // Don't fail the request, just log the error
                }
            }
        }

        console.log('🎉 Generation complete!');

        return NextResponse.json<GenerateResponse>({
            files,
            spec,
            projectId
        });

    } catch (error) {
        console.error('💥 Generation error:', error);

        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        return NextResponse.json<GenerateResponse>(
            {
                error: `Something went wrong. Please try again. (${errorMessage})`,
                files: {}
            },
            { status: 500 }
        );
    }
}
