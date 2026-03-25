import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required.' }, { status: 400 });
    }

    // Fetch the page HTML
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FunctionalHub/1.0)',
        'Accept': 'text/html',
      },
      redirect: 'follow',
    });

    if (!res.ok) {
      return NextResponse.json({ error: 'Could not fetch the URL.' }, { status: 400 });
    }

    const html = await res.text();

    // Extract Open Graph metadata
    const ogImage = extractMeta(html, 'og:image') || extractMeta(html, 'twitter:image');
    const ogTitle = extractMeta(html, 'og:title') || extractMeta(html, 'twitter:title') || extractTitle(html);
    const ogDescription = extractMeta(html, 'og:description') || extractMeta(html, 'description');

    if (!ogImage) {
      return NextResponse.json({ error: 'No product image found on this page. Try uploading an image instead.' }, { status: 404 });
    }

    // Make relative URLs absolute
    const baseUrl = new URL(url);
    const absoluteImage = ogImage.startsWith('http') ? ogImage : new URL(ogImage, baseUrl.origin).toString();

    return NextResponse.json({
      title: ogTitle || 'Product',
      description: ogDescription || '',
      image: absoluteImage,
      sourceUrl: url,
    });
  } catch (error) {
    console.error('Product URL preview error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch product URL.' },
      { status: 500 }
    );
  }
}

function extractMeta(html: string, name: string): string | null {
  // Try property= first (Open Graph), then name= (standard meta)
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${name}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${name}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${name}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim() || null;
}
