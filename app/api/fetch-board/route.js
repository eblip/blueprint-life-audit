import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { boardUrl } = await req.json();

    if (!boardUrl) {
      return NextResponse.json({ error: 'Please paste a Pinterest URL' }, { status: 400 });
    }

    // Convert public URL to RSS feed
    const cleanUrl = boardUrl.replace(/\/$/, '');
    const rssUrl = `${cleanUrl}.rss`;

    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Board must be Public, not secret.' },
        { status: 404 }
      );
    }

    const xmlData = await response.text();
    
    // Extract pin titles and image links
    const matches = [...xmlData.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?src="(.*?)"[\s\S]*?<\/item>/g)];
    
    const pins = matches.slice(0, 10).map(match => ({
      title: match[1] || 'Inspiration Pin',
      imageUrl: match[2] || '',
    }));

    return NextResponse.json({ pins });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process board' }, { status: 500 });
  }
}
