import { getAIClient } from './provider';
import { REACT_APP_SYSTEM_PROMPT, UPDATE_APP_SYSTEM_PROMPT, enhancePrompt } from './prompts';

interface CodeGenerationResult {
  files: Record<string, string>;
  success: boolean;
  error?: string;
}

/**
 * Extract files from markdown code blocks
 * 
 * Parses responses like:
 * ```tsx file="App.tsx"
 * code here
 * ```
 */
function extractFilesFromMarkdown(content: string): Record<string, string> {
  const files: Record<string, string> = {};

  // Match code blocks with file attribute
  // Supports: ```tsx file="App.tsx" or ```tsx file='App.tsx' or ```tsx file=App.tsx
  const codeBlockRegex = /```(\w+)\s+file=["']?([^"'\s\n]+)["']?\s*\n([\s\S]*?)```/g;

  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [, , filename, code] = match;
    // Normalize the filename
    let normalizedPath = filename.trim();
    if (!normalizedPath.startsWith('/')) {
      normalizedPath = normalizedPath;
    }
    files[normalizedPath] = code.trim();
  }

  // Fallback: If no files found with file= attribute, try to find any code blocks
  if (Object.keys(files).length === 0) {
    console.log('⚠️ No file= attributes found, trying fallback extraction...');

    // Try to find any tsx/jsx code block and assume it's App.tsx
    const fallbackRegex = /```(?:tsx|jsx)\s*\n([\s\S]*?)```/g;
    let fallbackMatch;
    let fileIndex = 0;

    while ((fallbackMatch = fallbackRegex.exec(content)) !== null) {
      const code = fallbackMatch[1].trim();
      // First tsx block is App.tsx, subsequent ones are numbered
      if (fileIndex === 0) {
        files['App.tsx'] = code;
      } else {
        files[`Component${fileIndex}.tsx`] = code;
      }
      fileIndex++;
    }

    // Try to find CSS
    const cssRegex = /```css\s*\n([\s\S]*?)```/g;
    let cssMatch;
    while ((cssMatch = cssRegex.exec(content)) !== null) {
      files['styles.css'] = cssMatch[1].trim();
    }
  }

  return files;
}

/**
 * Generate a React app from a user prompt
 * 
 * This is the main entry point for new app generation.
 * It enhances vague prompts and generates beautiful, functional code.
 */
export async function generateCodeFromSpec(
  spec: { name: string; description: string },
  isUpdate: boolean = false,
  existingFiles?: Record<string, string>
): Promise<CodeGenerationResult | null> {
  try {
    const client = getAIClient();
    if (!client) {
      return {
        files: {},
        success: false,
        error: 'AI client not configured. Please set API keys in .env file.'
      };
    }

    // Enhance the user's prompt to make it more detailed
    const enhancedPrompt = isUpdate
      ? spec.description
      : enhancePrompt(spec.description);

    console.log('🧠 Enhanced prompt:', enhancedPrompt.substring(0, 200) + '...');

    // Build the user message
    let userMessage = enhancedPrompt;

    // For updates, include existing files as context
    if (isUpdate && existingFiles && Object.keys(existingFiles).length > 0) {
      userMessage = `## Current Files\n\n`;
      for (const [path, content] of Object.entries(existingFiles)) {
        userMessage += `### ${path}\n\`\`\`tsx\n${content}\n\`\`\`\n\n`;
      }
      userMessage += `## Requested Change\n${spec.description}\n\nReturn ONLY the files that need to change.`;
    }

    console.log('🤖 Calling AI to generate code...');

    const response = await client.chat.completions.create({
      model: client.defaultModel || 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: isUpdate ? UPDATE_APP_SYSTEM_PROMPT : REACT_APP_SYSTEM_PROMPT
        },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 8000  // Increased for larger apps
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      console.error('❌ No response from AI');
      return {
        files: {},
        success: false,
        error: 'No response from AI. Please try again.'
      };
    }

    console.log('📝 AI response received, extracting files...');
    console.log('Response preview:', content.substring(0, 500));

    // Extract files from markdown code blocks
    const files = extractFilesFromMarkdown(content);

    if (Object.keys(files).length === 0) {
      console.error('❌ No files extracted from response');

      // Last resort: try to parse as JSON (old format)
      try {
        const jsonMatch = content.match(/\{[\s\S]*"files"[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (parsed.files && Object.keys(parsed.files).length > 0) {
            console.log('✅ Fallback: Parsed JSON format');
            return {
              files: parsed.files,
              success: true
            };
          }
        }
      } catch (e) {
        // JSON parse failed too
      }

      return {
        files: {},
        success: false,
        error: 'Failed to extract code from AI response. Please try again with a different prompt.'
      };
    }

    console.log(`✅ Extracted ${Object.keys(files).length} files:`, Object.keys(files));

    // Validate that we have an entry point
    const hasEntryPoint = files['App.tsx'] || files['/App.tsx'] ||
      files['app/page.tsx'] || files['/app/page.tsx'];

    if (!hasEntryPoint && !isUpdate) {
      // Create a default App.tsx that imports other components
      const componentFiles = Object.keys(files).filter(f => f.endsWith('.tsx') && f !== 'App.tsx');

      if (componentFiles.length > 0) {
        // Use the first component as the main content
        const mainComponent = componentFiles[0];
        const componentName = mainComponent.replace(/\.tsx$/, '').replace(/^.*\//, '');

        files['App.tsx'] = `import { ${componentName} } from './${mainComponent.replace('.tsx', '')}';

export default function App() {
  return <${componentName} />;
}`;
      } else {
        // No components found, create a placeholder
        files['App.tsx'] = `export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">App Generated</h1>
        <p className="text-zinc-400">Your app is ready. Check the code editor.</p>
      </div>
    </div>
  );
}`;
      }
    }

    return {
      files,
      success: true
    };

  } catch (error) {
    console.error('💥 Code generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      files: {},
      success: false,
      error: `Generation failed: ${errorMessage}`
    };
  }
}

/**
 * Generate code with streaming (for real-time feedback)
 * 
 * This streams the response back in chunks so the user
 * can see progress as code is generated.
 */
export async function* generateCodeStream(
  prompt: string,
  isUpdate: boolean = false,
  existingFiles?: Record<string, string>
): AsyncGenerator<{ type: 'progress' | 'file' | 'done' | 'error'; data: any }> {
  try {
    const client = getAIClient();
    if (!client) {
      yield { type: 'error', data: 'AI client not configured' };
      return;
    }

    const enhancedPrompt = isUpdate ? prompt : enhancePrompt(prompt);

    yield { type: 'progress', data: 'Starting generation...' };

    let userMessage = enhancedPrompt;
    if (isUpdate && existingFiles && Object.keys(existingFiles).length > 0) {
      userMessage = `## Current Files\n\n`;
      for (const [path, content] of Object.entries(existingFiles)) {
        userMessage += `### ${path}\n\`\`\`tsx\n${content}\n\`\`\`\n\n`;
      }
      userMessage += `## Requested Change\n${prompt}`;
    }

    yield { type: 'progress', data: 'Generating code...' };

    const stream = await client.chat.completions.create({
      model: client.defaultModel || 'gpt-4o',
      messages: [
        { role: 'system', content: isUpdate ? UPDATE_APP_SYSTEM_PROMPT : REACT_APP_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      max_tokens: 8000,
      stream: true
    });

    let fullContent = '';

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || '';
      fullContent += delta;

      // Check if we've completed a file
      const currentFiles = extractFilesFromMarkdown(fullContent);
      for (const [path, content] of Object.entries(currentFiles)) {
        yield { type: 'file', data: { path, content } };
      }
    }

    // Final extraction
    const files = extractFilesFromMarkdown(fullContent);
    yield { type: 'done', data: files };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    yield { type: 'error', data: errorMessage };
  }
}
