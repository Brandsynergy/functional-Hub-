import { NextRequest, NextResponse } from 'next/server';
import Replicate from 'replicate';

function extractUrl(output: unknown): string | null {
  if (!output) return null;
  if (Array.isArray(output)) return extractUrl(output[0]);
  if (typeof output === 'object' && output !== null) {
    if ('url' in output && typeof (output as Record<string, unknown>).url === 'function') {
      return String((output as { url: () => string }).url());
    }
    if ('href' in output) return String((output as { href: string }).href);
  }
  if (typeof output === 'string' && output.startsWith('http')) return output;
  const str = String(output);
  return str.startsWith('http') ? str : null;
}

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: 'REPLICATE_API_TOKEN is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { prompt, productImageUrl, aspectRatio = '16:9' } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required.' }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });

    // Build the full UGC-style prompt
    const fullPrompt = [
      'Create a natural-looking UGC advertisement video.',
      prompt,
      'Realistic motion, natural expressions, warm confident tone.',
      'Professional lighting, high quality, 4K resolution.',
    ].join(' ');

    const input: Record<string, unknown> = {
      prompt: fullPrompt,
      ...(productImageUrl ? { first_frame_image: productImageUrl } : {}),
    };

    // Try multiple video models with fallbacks
    let output: unknown;
    let model = '';
    const errors: string[] = [];

    const models: { id: string; buildInput: () => Record<string, unknown> }[] = [
      {
        id: 'wavespeedai/wan-2.1-t2v-480p',
        buildInput: () => ({
          prompt: fullPrompt,
          ...(productImageUrl ? { image: productImageUrl } : {}),
        }),
      },
      {
        id: 'minimax/video-01-live',
        buildInput: () => ({
          prompt: fullPrompt,
          ...(productImageUrl ? { first_frame_image: productImageUrl } : {}),
        }),
      },
      {
        id: 'tencent/hunyuan-video',
        buildInput: () => ({
          prompt: fullPrompt,
        }),
      },
    ];

    for (const m of models) {
      try {
        output = await replicate.run(m.id as `${string}/${string}`, { input: m.buildInput() });
        model = m.id;
        break;
      } catch (e) {
        errors.push(`${m.id}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (!output) {
      return NextResponse.json(
        { error: `Video generation failed. All models returned errors: ${errors.join(' | ')}` },
        { status: 500 }
      );
    }

    const videoUrl = extractUrl(output);
    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video generated but could not extract URL.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ output: videoUrl, model });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Video generation failed.' },
      { status: 500 }
    );
  }
}
