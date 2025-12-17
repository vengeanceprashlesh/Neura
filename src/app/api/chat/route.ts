import { streamText, UIMessage, convertToModelMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

// Simple echo model for testing - creates a mock response
async function createEchoResponse(userMessage: string) {
    const response = `I received your message: "${userMessage}"

This is a streaming response from the AI SDK v5. The chat is working correctly! 🎉

In the next milestone, this will be connected to a real LLM for code generation.`;

    return response;
}

export async function POST(req: Request) {
    try {
        const { messages }: { messages: UIMessage[] } = await req.json();

        // Get the last user message
        const lastUserMessage = messages
            .filter((m) => m.role === 'user')
            .pop();

        // Extract text from user message parts
        const userText = lastUserMessage?.parts
            .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
            .map(part => part.text)
            .join('') || 'Hello';

        // Create echo response
        const responseText = await createEchoResponse(userText);

        // Create a streaming response manually for the echo demo
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            async start(controller) {
                // Stream character by character for demo effect
                for (let i = 0; i < responseText.length; i += 5) {
                    const chunk = responseText.slice(i, i + 5);
                    // Format: text part in UI message stream format
                    const data = JSON.stringify({ type: 'text', text: chunk });
                    controller.enqueue(encoder.encode(`0:${data}\n`));
                    // Small delay for streaming effect
                    await new Promise(resolve => setTimeout(resolve, 20));
                }
                // Send finish message
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
    } catch (error) {
        console.error('Chat API error:', error);
        return new Response(
            JSON.stringify({ error: 'Failed to process chat request' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
