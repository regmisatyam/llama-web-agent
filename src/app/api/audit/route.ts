import { NextRequest, NextResponse } from 'next/server';
import LlamaAPIClient from 'llama-api-client';

let llamaAPI: LlamaAPIClient | null = null;
if (process.env.LLAMA_API_KEY) {
  llamaAPI = new LlamaAPIClient({ apiKey: process.env.LLAMA_API_KEY });
}

export interface AuditIssue {
  id: string;
  category: 'Accessibility' | 'SEO' | 'Performance' | 'Responsiveness' | 'Best Practices';
  issue: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  file: string;
}

export async function POST(request: NextRequest) {
  try {
    const { files } = await request.json();

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (!llamaAPI || !process.env.LLAMA_API_KEY) {
      // Demo mode — return plausible mock issues based on file names
      const firstFile = files[0]?.name || 'index.html';
      const mockIssues: AuditIssue[] = [
        {
          id: '1',
          category: 'Accessibility',
          issue: 'Images missing alt attributes',
          detail: 'All <img> tags must have descriptive alt text for screen readers and SEO.',
          severity: 'high',
          file: firstFile,
        },
        {
          id: '2',
          category: 'SEO',
          issue: 'Missing <meta name="description"> tag',
          detail: 'Add a compelling meta description (150-160 chars) to improve search engine previews.',
          severity: 'medium',
          file: firstFile,
        },
        {
          id: '3',
          category: 'Performance',
          issue: 'Images not using lazy loading',
          detail: 'Add loading="lazy" to below-the-fold images to speed up initial page load.',
          severity: 'low',
          file: firstFile,
        },
        {
          id: '4',
          category: 'Best Practices',
          issue: 'Buttons missing type attribute',
          detail: 'All <button> elements should have type="button" or type="submit" to avoid accidental form submission.',
          severity: 'medium',
          file: firstFile,
        },
        {
          id: '5',
          category: 'Accessibility',
          issue: 'Form inputs missing associated labels',
          detail: 'Every form input needs a <label for="id"> or aria-label to be accessible.',
          severity: 'high',
          file: firstFile,
        },
      ];
      return NextResponse.json({ success: true, issues: mockIssues, demo: true });
    }

    const filesSummary = files
      .map((f: any) => {
        const truncated = (f.content || '').substring(0, 2500);
        return `### ${f.name} (${f.language?.toUpperCase() || 'HTML'})\n\`\`\`${f.language || 'html'}\n${truncated}${(f.content || '').length > 2500 ? '\n...[truncated]' : ''}\n\`\`\``;
      })
      .join('\n\n');

    const response = await llamaAPI.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert web quality auditor specializing in accessibility, SEO, performance, and best practices.

Analyze the provided web files and return a JSON array of specific, actionable issues you find.

Each issue object must have exactly these fields:
- id: string (sequential "1", "2", etc.)
- category: one of "Accessibility", "SEO", "Performance", "Responsiveness", "Best Practices"
- issue: short title (max 60 chars)
- detail: one sentence explaining exactly what to fix and why
- severity: "high", "medium", or "low"
- file: the filename where the issue was found

Find between 4 and 8 real issues. Be specific — reference actual elements or patterns you see.

Return ONLY a JSON array inside a code fence like this:
\`\`\`json
[{"id":"1","category":"Accessibility","issue":"...","detail":"...","severity":"high","file":"index.html"}]
\`\`\``,
        },
        {
          role: 'user',
          content: `Audit these files and return the issues as JSON:\n\n${filesSummary}`,
        },
      ],
      model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
      max_completion_tokens: 1500,
      temperature: 0.2,
    });

    const content = response?.completion_message?.content;
    const text = typeof content === 'string' ? content : (content as any)?.text || '';

    const jsonMatch = text.match(/```json\n?([\s\S]*?)```/);
    if (!jsonMatch) {
      throw new Error('AI response did not contain a JSON block');
    }

    const issues: AuditIssue[] = JSON.parse(jsonMatch[1].trim());
    return NextResponse.json({ success: true, issues });
  } catch (error: any) {
    console.error('audit error:', error);
    return NextResponse.json({ error: error.message || 'Audit failed' }, { status: 500 });
  }
}
