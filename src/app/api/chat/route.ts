import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a creative AI assistant inside FUNCTIONAL HUB — a Swiss Army knife platform for content creation. You help users create:

1. UGC (User-Generated Content) videos — product showcase videos with scripts and scenes
2. Product photography — AI-generated photoshoots for e-commerce
3. YouTube-inspired content — recreating trending video concepts
4. Marketing content — ad copy, social media posts, campaign ideas

When a user describes what they want, respond with:
- Creative suggestions and options
- Specific scripts or scene descriptions they can use
- Actionable next steps (e.g., "Go to UGC Studio and use this script...")

Be concise, creative, and direct. Use a friendly, professional tone. If the user asks to generate an image or video, provide the prompt they should use in the appropriate tool.

You can format responses with markdown for readability.`;

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured. Add it to your environment variables.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { messages } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required.' }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        })),
      ],
      max_tokens: 1024,
      temperature: 0.8,
    });

    const reply = completion.choices[0]?.message?.content || 'I could not generate a response.';

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Chat failed.' },
      { status: 500 }
    );
  }
}
