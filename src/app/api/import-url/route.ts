import { NextRequest, NextResponse } from 'next/server';
import LlamaAPIClient from 'llama-api-client';

let llamaAPI: LlamaAPIClient | null = null;
if (process.env.LLAMA_API_KEY) {
  llamaAPI = new LlamaAPIClient({ apiKey: process.env.LLAMA_API_KEY });
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Please provide a valid URL starting with http or https.' }, { status: 400 });
    }

    // Fetch the page server-side (avoids CORS)
    let rawHtml = '';
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; LlamaBuilder/1.0; +https://llama-builder.app)' },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      rawHtml = await res.text();
    } catch (e: any) {
      return NextResponse.json(
        { error: `Could not fetch that URL: ${e.message}. Make sure it is publicly accessible.` },
        { status: 400 }
      );
    }

    // Strip scripts, styles, comments and collapse whitespace to reduce tokens
    const structuralHtml = rawHtml
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .substring(0, 6000); // cap to stay within context budget

    if (!llamaAPI || !process.env.LLAMA_API_KEY) {
      // Demo mode
      const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Imported from ${url}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-gray-900 antialiased">
  <nav class="sticky top-0 z-50 bg-white border-b border-gray-100 px-6 py-4">
    <div class="max-w-6xl mx-auto flex items-center justify-between">
      <span class="font-bold text-lg text-gray-900">Imported Site</span>
      <div class="flex gap-6 text-sm text-gray-600">
        <a href="#" class="hover:text-gray-900">Home</a>
        <a href="#" class="hover:text-gray-900">About</a>
        <a href="#" class="hover:text-gray-900">Contact</a>
      </div>
    </div>
  </nav>
  <main class="max-w-4xl mx-auto px-6 py-20 text-center">
    <p class="text-sm text-blue-600 font-medium mb-4">Recreated from ${url}</p>
    <h1 class="text-4xl font-bold mb-6">Add your LLAMA_API_KEY to enable real import</h1>
    <p class="text-gray-500 text-lg">With an API key configured, LLAMA Builder will fetch this URL and recreate its layout using Tailwind CSS.</p>
  </main>
</body>
</html>`;
      return NextResponse.json({ success: true, html: demoHtml, demo: true });
    }

    const response = await llamaAPI.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are a senior front-end developer. Your job is to take a raw HTML skeleton scraped from a website and recreate it as a clean, modern, responsive page using Tailwind CSS CDN.

Rules:
- Preserve the overall structure, sections, navigation hierarchy, and purpose of the site
- Replace any placeholder or missing content with sensible, realistic placeholder copy
- Use Tailwind CSS classes for ALL styling (no inline styles, no <style> blocks)
- Include the Tailwind CDN script tag in <head>
- Return a single complete standalone HTML file
- Wrap your output in \`\`\`html code fences`,
        },
        {
          role: 'user',
          content: `Recreate the layout of this website (${url}) using Tailwind CSS. Here is its HTML skeleton:\n\n${structuralHtml}`,
        },
      ],
      model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
      max_completion_tokens: 4096,
      temperature: 0.3,
    });

    const content = response?.completion_message?.content;
    const text = typeof content === 'string' ? content : (content as any)?.text || '';

    const htmlMatch = text.match(/```html\n?([\s\S]*?)```/);
    const html = htmlMatch?.[1]?.trim();

    if (!html) {
      return NextResponse.json({ error: 'AI did not return valid HTML. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, html });
  } catch (error: any) {
    console.error('import-url error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
