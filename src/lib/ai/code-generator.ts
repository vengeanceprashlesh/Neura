import { getAIClient } from './provider';
import { REACT_APP_SYSTEM_PROMPT, UPDATE_APP_SYSTEM_PROMPT, enhancePrompt } from './prompts';
import { getDemoApp, shouldUseDemoMode } from './demo-apps';

interface CodeGenerationResult {
  files: Record<string, string>;
  success: boolean;
  error?: string;
  isDemo?: boolean;
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
 * Falls back to demo mode if no API key is configured.
 */
export async function generateCodeFromSpec(
  spec: { name: string; description: string },
  isUpdate: boolean = false,
  existingFiles?: Record<string, string>
): Promise<CodeGenerationResult> {

  // Check if we should use demo mode
  if (shouldUseDemoMode()) {
    console.log('🎭 No API key configured, using demo mode...');
    const demoApp = getDemoApp(spec.description);

    if (demoApp) {
      return {
        files: demoApp.files,
        success: true,
        isDemo: true
      };
    }
  }

  try {
    const client = getAIClient();
    if (!client) {
      // Fallback to demo mode
      console.log('🎭 AI client not available, using demo mode...');
      const demoApp = getDemoApp(spec.description);

      if (demoApp) {
        return {
          files: demoApp.files,
          success: true,
          isDemo: true
        };
      }

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

      // Fallback to demo
      const demoApp = getDemoApp(spec.description);
      if (demoApp) {
        console.log('🎭 Falling back to demo mode...');
        return {
          files: demoApp.files,
          success: true,
          isDemo: true
        };
      }

      return {
        files: {},
        success: false,
        error: 'No response from AI. Please try again.'
      };
    }

    console.log('📝 AI response received, extracting files...');

    // Extract files from markdown code blocks
    const files = extractFilesFromMarkdown(content);

    if (Object.keys(files).length === 0) {
      console.error('❌ No files extracted from response');

      // Try JSON fallback
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
        // JSON parse failed
      }

      // Final fallback to demo
      const demoApp = getDemoApp(spec.description);
      if (demoApp) {
        console.log('🎭 Falling back to demo mode after parse failure...');
        return {
          files: demoApp.files,
          success: true,
          isDemo: true
        };
      }

      return {
        files: {},
        success: false,
        error: 'Failed to extract code from AI response. Please try again.'
      };
    }

    console.log(`✅ Extracted ${Object.keys(files).length} files:`, Object.keys(files));

    // Validate that we have an entry point
    const hasEntryPoint = files['App.tsx'] || files['/App.tsx'] ||
      files['app/page.tsx'] || files['/app/page.tsx'];

    if (!hasEntryPoint && !isUpdate) {
      // Create a default App.tsx
      const componentFiles = Object.keys(files).filter(f => f.endsWith('.tsx') && f !== 'App.tsx');

      if (componentFiles.length > 0) {
        const mainFile = componentFiles[0];
        const componentName = mainFile.replace(/\.tsx$/, '').replace(/^.*\//, '');

        files['App.tsx'] = `import { ${componentName} } from './${mainFile.replace('.tsx', '')}';

export default function App() {
  return <${componentName} />;
}`;
      } else {
        files['App.tsx'] = `export default function App() {
  return (
    <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-4xl font-bold mb-4">App Generated</h1>
        <p className="text-zinc-400">Your app is ready!</p>
      </div>
    </div>
  );
}`;
      }
    }

    // Add default styles if missing
    if (!files['styles.css'] && !files['/styles.css']) {
      files['styles.css'] = `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
}`;
    }

    return {
      files,
      success: true
    };

  } catch (error) {
    console.error('💥 Code generation error:', error);

    // Fallback to demo on any error
    const demoApp = getDemoApp(spec.description);
    if (demoApp) {
      console.log('🎭 Falling back to demo mode after error...');
      return {
        files: demoApp.files,
        success: true,
        isDemo: true
      };
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return {
      files: {},
      success: false,
      error: `Generation failed: ${errorMessage}`
    };
  }
}
