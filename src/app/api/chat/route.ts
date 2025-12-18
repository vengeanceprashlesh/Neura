import { NextRequest } from 'next/server';
import OpenAI from 'openai';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

// Provider configuration - matches lib/ai/provider.ts
function getProviderConfig() {
    // Check for Groq first (priority for fast inference)
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
        return {
            provider: 'groq' as const,
            apiKey: groqKey,
            baseURL: 'https://api.groq.com/openai/v1',
            model: process.env.LLM_MODEL || 'llama-3.3-70b-versatile',
            headers: undefined,
        };
    }

    // Check for OpenRouter
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
        return {
            provider: 'openrouter' as const,
            apiKey: openrouterKey,
            baseURL: 'https://openrouter.ai/api/v1',
            model: process.env.LLM_MODEL || 'anthropic/claude-3.5-sonnet',
            headers: {
                'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
                'X-Title': 'Neura AI App Builder',
            },
        };
    }

    // Fall back to OpenAI
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
        return {
            provider: 'openai' as const,
            apiKey: openaiKey,
            baseURL: undefined,
            model: process.env.LLM_MODEL || 'gpt-4o',
            headers: undefined,
        };
    }

    return null;
}

// System prompt for the AI assistant
const SYSTEM_PROMPT = `You are Neura, an AI assistant that helps users build web applications.

Your capabilities:
- Help users design and plan their application ideas
- Answer questions about web development, React, Next.js, and related technologies
- Provide guidance on best practices and architecture decisions
- When users are ready to generate code, encourage them to click the "Generate App" button

Be helpful, concise, and friendly. When discussing app ideas, ask clarifying questions to understand:
- What type of app they want to build
- Key features and functionality
- Any specific requirements or preferences

Keep responses focused and practical.`;

export async function POST(req: NextRequest) {
    try {
        const config = getProviderConfig();

        if (!config) {
            // Return a helpful message if no API key is configured
            const encoder = new TextEncoder();
            const noKeyMessage = "I'm not fully configured yet. Please set up your API key in the .env file to enable AI responses.\n\nSupported providers (priority order):\n1. GROQ_API_KEY (fastest)\n2. OPENROUTER_API_KEY (most models)\n3. OPENAI_API_KEY (direct OpenAI)";

            const stream = new ReadableStream({
                async start(controller) {
                    const data = JSON.stringify({ type: 'text', text: noKeyMessage });
                    controller.enqueue(encoder.encode(`0:${data}\n`));
                    controller.enqueue(encoder.encode(`d:{"finishReason":"stop"}\n`));
                    controller.close();
                },
            });

            return new Response(stream, {
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'X-Vercel-AI-Data-Stream': 'v1',
                },
            });
        }

        console.log(`Chat API using provider: ${config.provider}, model: ${config.model}`);

        const { messages } = await req.json();

        // Create OpenAI client (works with Groq, OpenRouter, and OpenAI)
        const client = new OpenAI({
            apiKey: config.apiKey,
            baseURL: config.baseURL,
            defaultHeaders: config.headers,
        });

        // Convert UI messages to OpenAI format
        const openaiMessages: OpenAI.ChatCompletionMessageParam[] = [
            { role: 'system', content: SYSTEM_PROMPT },
        ];

        for (const message of messages) {
            const textContent = message.parts
                ?.filter((part: { type: string }) => part.type === 'text')
                .map((part: { text: string }) => part.text)
                .join('') || message.content || '';

            if (message.role === 'user' || message.role === 'assistant') {
                openaiMessages.push({
                    role: message.role,
                    content: textContent,
                });
            }
        }

        // Create streaming completion
        const completion = await client.chat.completions.create({
            model: config.model,
            messages: openaiMessages,
            stream: true,
            temperature: 0.7,
            max_tokens: 2000,
        });

        // Convert OpenAI stream to AI SDK v5 format
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    for await (const chunk of completion) {
                        const content = chunk.choices[0]?.delta?.content;
                        if (content) {
                            const data = JSON.stringify({ type: 'text', text: content });
                            controller.enqueue(encoder.encode(`0:${data}\n`));
                        }

                        // Check for finish
                        if (chunk.choices[0]?.finish_reason) {
                            controller.enqueue(encoder.encode(`d:{"finishReason":"${chunk.choices[0].finish_reason}"}\n`));
                        }
                    }
                    controller.close();
                } catch (error) {
                    console.error('Stream error:', error);
                    const errorData = JSON.stringify({ type: 'text', text: '\n\n[Error: Stream interrupted]' });
                    controller.enqueue(encoder.encode(`0:${errorData}\n`));
                    controller.enqueue(encoder.encode(`d:{"finishReason":"error"}\n`));
                    controller.close();
                }
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1',
            },
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process chat request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
