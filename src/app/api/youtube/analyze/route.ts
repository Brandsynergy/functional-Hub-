import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'YouTube URL is required.' }, { status: 400 });
    }

    // Validate it looks like a YouTube URL
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/;
    const match = url.match(ytRegex);
    if (!match) {
      return NextResponse.json({ error: 'Invalid YouTube URL.' }, { status: 400 });
    }

    const videoId = match[1];

    // Fetch metadata via oEmbed (no API key needed)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const oembedRes = await fetch(oembedUrl);

    if (!oembedRes.ok) {
      return NextResponse.json({ error: 'Could not fetch video info. The video may be private or removed.' }, { status: 404 });
    }

    const oembed = await oembedRes.json();

    // Build thumbnail URLs (YouTube standard thumbnails)
    const thumbnails = {
      default: `https://img.youtube.com/vi/${videoId}/default.jpg`,
      medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      high: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      maxres: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };

    return NextResponse.json({
      videoId,
      title: oembed.title || 'Untitled Video',
      author: oembed.author_name || 'Unknown',
      authorUrl: oembed.author_url || '',
      thumbnails,
      thumbnail: thumbnails.high,
      embedHtml: oembed.html || '',
    });
  } catch (error) {
    console.error('YouTube analyze error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze YouTube URL.' },
      { status: 500 }
    );
  }
}
