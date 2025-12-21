import { NextRequest, NextResponse } from 'next/server';
import { generateAppSpec } from '@/lib/ai/spec-generator';
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
                { error: 'Please provide a valid prompt', files: {} },
                { status: 400 }
            );
        }

        console.log('🚀 Starting generation for prompt:', prompt.substring(0, 100));

        // Determine if this is a new app or an update
        const isNewApp = !existingFiles || Object.keys(existingFiles).length === 0;

        let files: Record<string, string> = {};
        let spec: any = null;

        if (isNewApp) {
            // NEW APP FLOW - Skip spec generation, go directly to code
            console.log('📝 Generating new app directly from prompt...');

            // Create a simple spec from the prompt
            spec = {
                name: prompt.substring(0, 50),
                description: prompt,
                features: [],
                pages: [],
                components: []
            };

            console.log('2️⃣ Generating code...');
            const codeResult = await generateCodeFromSpec(spec);

            if (!codeResult || !codeResult.files) {
                console.error('❌ Code generation failed');
                throw new Error('Failed to generate code');
            }

            files = codeResult.files;
            console.log('✅ Generated', Object.keys(files).length, 'files');

        } else {
            // UPDATE APP FLOW
            console.log('🔄 Updating existing app...');

            // For now, use simple prompt-based update
            // TODO: Implement patch-based updates
            const updatePrompt = `Update this React app based on the following request: "${prompt}"\n\nCurrent files:\n${JSON.stringify(existingFiles, null, 2)}`;

            // Generate updated code
            const codeResult = await generateCodeFromSpec({
                name: 'Updated App',
                description: prompt,
                features: [prompt],
                pages: [],
                components: []
            });

            if (!codeResult || !codeResult.files) {
                throw new Error('Failed to update code');
            }

            files = codeResult.files;
            console.log('✅ Updated', Object.keys(files).length, 'files');
        }

        // Step 3: Post-process files (fix extensions, etc.)
        console.log('3️⃣ Post-processing files...');
        const processedProject = fixGeneratedCode({ spec, files });
        files = processedProject.files;

        // Step 4: Validate generated code
        console.log('4️⃣ Validating code...');
        const validation = validateGeneratedProject({ spec, files });

        if (!validation.ok) {
            console.error('❌ Validation failed:', validation.errors);
            return NextResponse.json<GenerateResponse>(
                {
                    error: `Code validation failed: ${validation.errors.join(', ')}`,
                    files: {}
                },
                { status: 400 }
            );
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
                error: `Generation failed: ${errorMessage}`,
                files: {}
            },
            { status: 500 }
        );
    }
}
