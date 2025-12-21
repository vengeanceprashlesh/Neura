import { getAIClient } from './provider';
import { AppSpec } from '@/lib/types/app';

export async function generateAppSpec(prompt: string): Promise<AppSpec | null> {
    try {
        const client = getAIClient();
        if (!client) {
            throw new Error('AI client not configured. Please set API keys.');
        }

        const systemPrompt = `You are an expert app specification generator.
Given a user's prompt, generate a detailed app specification in JSON format.

Output ONLY valid JSON with this exact structure:
{
  "name": "App Name",
  "description": "Brief description",
  "features": ["feature 1", "feature 2"],
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "description": "Home page description"
    }
  ],
  "components": [
    {
      "name": "ComponentName",
      "description": "What it does",
      "props": ["prop1", "prop2"]
    }
  ],
  "styling": "Tailwind CSS with dark theme",
  "dataFlow": "Client-side state management"
}

Be specific and detailed. Include all necessary pages and components.`;

        const response = await client.chat.completions.create({
            model: client.defaultModel || 'gpt-4o',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 2000
        });

        const content = response.choices[0]?.message?.content;
        if (!content) {
            throw new Error('No response from AI');
        }

        // Parse JSON response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const spec = JSON.parse(jsonMatch[0]);

        // Validate basic structure
        if (!spec.name || !spec.description) {
            throw new Error('Invalid spec structure');
        }

        return spec as AppSpec;

    } catch (error) {
        console.error('Spec generation error:', error);
        return null;
    }
}
