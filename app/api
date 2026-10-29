import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { boardUrl } = await req.json();

    if (!boardUrl) {
      return NextResponse.json({ error: 'Veuillez coller une URL Pinterest' }, { status: 400 });
    }

    const cleanUrl = boardUrl.replace(/\/$/, '');
    const rssUrl = `${cleanUrl}.rss`;

    const response = await fetch(rssUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Le tableau doit être Public et non secret.' },
        { status: 404 }
      );
    }

    const xmlData = await response.text();
    const matches = [...xmlData.matchAll(/<item>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?src="(.*?)"[\s\S]*?<\/item>/g)];
    
    const pins = matches.slice(0, 10).map(match => ({
      title: match[1] || 'Épingle',
      imageUrl: match[2] || '',
    }));

    return NextResponse.json({ pins });
  } catch (error) {
    return NextResponse.json({ error: 'Échec du traitement du tableau' }, { status: 500 });
  }
}
