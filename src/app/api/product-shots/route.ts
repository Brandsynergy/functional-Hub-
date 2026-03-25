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

async function fetchAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');
  const contentType = res.headers.get('content-type') || 'image/png';
  return `data:${contentType};base64,${base64}`;
}

// Curated product photography templates
const STYLE_PROMPTS: Record<string, string> = {
  'kitchen-morning': 'on a clean kitchen counter with warm morning sunlight streaming through a window, soft shadows, lifestyle product photography',
  'marble-luxury': 'on a polished white marble surface with subtle gold accents, luxury brand aesthetic, soft diffused lighting, premium product photography',
  'nature-outdoor': 'placed on natural stone surface outdoors with soft bokeh green foliage background, golden hour sunlight, organic lifestyle photography',
  'studio-white': 'on a pure white seamless studio background, professional product photography, even soft lighting, clean shadows, commercial quality',
  'studio-dark': 'on a dark matte black surface with dramatic side lighting, moody premium product photography, rim light highlighting edges',
  'beach-tropical': 'on light sand with blurred turquoise ocean in background, tropical vibes, bright natural sunlight, vacation lifestyle photography',
  'wooden-rustic': 'on a rustic weathered wooden table, warm ambient light, cozy artisanal aesthetic, farmhouse style product photography',
  'minimalist-pastel': 'on a soft pastel colored surface with matching tonal background, minimalist aesthetic, gentle even lighting, modern product photography',
  'desk-workspace': 'on a modern clean desk workspace with subtle accessories, professional lifestyle photography, natural window light',
  'fabric-texture': 'draped on luxurious linen fabric, soft folds creating texture, editorial style product photography, diffused natural light',
};

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.REPLICATE_API_TOKEN;
    if (!apiKey) {
      return NextResponse.json({ error: 'REPLICATE_API_TOKEN is not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { productDescription, style, customScene, aspectRatio = '1:1', productImageUrl } = body;

    if (!productDescription && !productImageUrl) {
      return NextResponse.json({ error: 'Product description or image is required.' }, { status: 400 });
    }

    const replicate = new Replicate({ auth: apiKey });

    // Build the product photography prompt
    const sceneDesc = customScene || STYLE_PROMPTS[style] || STYLE_PROMPTS['studio-white'];
    const productDesc = productDescription || 'the product';

    const prompt = [
      `Professional product photography of ${productDesc}`,
      sceneDesc,
      'Ultra sharp detail, accurate product shape and texture, professional color grading',
      'Shot on Phase One IQ4, 80mm lens, f/8, product photography, 8K resolution, commercial quality',
    ].join('. ');

    // Use FLUX Kontext Pro for best product photography results
    const input: Record<string, unknown> = {
      prompt,
      aspect_ratio: aspectRatio,
      output_format: 'png',
      safety_tolerance: 2,
      ...(productImageUrl ? { input_image: productImageUrl } : {}),
    };

    const output = await replicate.run('black-forest-labs/flux-kontext-pro' as `${string}/${string}`, { input });
    const imageUrl = extractUrl(output);

    if (!imageUrl) {
      return NextResponse.json({ error: 'Generation completed but could not extract image URL.' }, { status: 500 });
    }

    // Convert to data URL for persistence
    let permanentUrl = imageUrl;
    try {
      permanentUrl = await fetchAsDataUrl(imageUrl);
    } catch {
      console.warn('Could not convert to data URL, returning temporary URL');
    }

    return NextResponse.json({ output: permanentUrl, prompt });
  } catch (error) {
    console.error('Product shot error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Product shot generation failed.' },
      { status: 500 }
    );
  }
}
