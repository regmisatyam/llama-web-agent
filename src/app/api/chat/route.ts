import { NextRequest, NextResponse } from 'next/server';
import LlamaAPIClient from 'llama-api-client';

let llamaAPI: LlamaAPIClient | null = null;
if (process.env.LLAMA_API_KEY) {
  llamaAPI = new LlamaAPIClient({ apiKey: process.env.LLAMA_API_KEY });
}

// ─── RAG Knowledge Base ───────────────────────────────────────────────────────
// Curated snippets of web dev best practices used as retrieval-augmented context
const WEB_DEV_KNOWLEDGE_BASE = [
  {
    topic: 'html_semantic',
    content: `Semantic HTML best practices:
- Use <header>, <nav>, <main>, <article>, <section>, <aside>, <footer> for structure
- Use <h1>–<h6> in logical order; only one <h1> per page
- Use <button> for actions, <a href> for navigation
- Use <form>, <label for="">, <input id=""> for accessible forms
- Use aria-label, aria-describedby, role attributes for accessibility
- Always include alt text on <img> elements`
  },
  {
    topic: 'tailwind_patterns',
    content: `Modern Tailwind CSS patterns:
- Responsive: sm:, md:, lg:, xl: prefixes
- Dark mode: dark: prefix
- Hover/focus states: hover:, focus:, active:
- Animation: animate-spin, animate-ping, animate-bounce, animate-pulse
- Glassmorphism: bg-white/10 backdrop-blur-sm border border-white/20
- Gradient text: bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent
- Card: bg-white rounded-2xl shadow-xl p-6 border border-gray-100
- Modern button: px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-blue-500/25`
  },
  {
    topic: 'css_modern',
    content: `Modern CSS techniques:
- CSS custom properties: --color-primary: #3b82f6; used with var(--color-primary)
- Grid layout: display:grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
- Flexbox: display:flex; align-items:center; justify-content:space-between;
- Smooth transitions: transition: all 0.2s ease-in-out;
- Box shadow: box-shadow: 0 20px 60px rgba(0,0,0,0.1);
- Clamp for fluid type: font-size: clamp(1rem, 2.5vw, 2rem);
- Scroll snap: scroll-snap-type: x mandatory; scroll-snap-align: start;`
  },
  {
    topic: 'javascript_modern',
    content: `Modern JavaScript patterns:
- Use const/let, avoid var
- Arrow functions: const fn = (x) => x * 2;
- Destructuring: const { name, age } = user;
- Template literals: \`Hello \${name}!\`
- Optional chaining: user?.profile?.avatar
- Nullish coalescing: value ?? 'default'
- Async/await with try/catch for API calls
- fetch API: const res = await fetch(url); const data = await res.json();
- LocalStorage: localStorage.setItem/getItem
- Event delegation for dynamic elements`
  },
  {
    topic: 'responsive_design',
    content: `Responsive design patterns:
- Mobile-first approach: base styles for mobile, then md:/lg: overrides
- Breakpoints in Tailwind: sm(640px) md(768px) lg(1024px) xl(1280px)
- Fluid images: max-width: 100%; height: auto;
- Viewport units: vh, vw for full-screen sections
- Container queries for component-level responsiveness
- Touch targets: minimum 44x44px for interactive elements`
  },
  {
    topic: 'ui_components',
    content: `Common UI component patterns:
Navigation bar: sticky top-0 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b
Hero section: min-h-screen flex items-center justify-center with gradient background
Cards: hover:-translate-y-1 hover:shadow-2xl transition-all duration-300
Modals: fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center
Toast notifications: fixed bottom-4 right-4 z-50 with slide-in animation
Forms: space-y-4 with labeled inputs and validation states`
  },
  {
    topic: 'performance',
    content: `Web performance best practices:
- Lazy load images: <img loading="lazy">
- Use srcset for responsive images
- Minimize repaints: use transform/opacity for animations instead of layout properties
- Debounce resize/scroll handlers
- Use requestAnimationFrame for smooth animations
- Prefer CSS transitions over JavaScript animations`
  },
  {
    topic: 'accessibility',
    content: `Accessibility best practices:
- Sufficient color contrast (4.5:1 for text, 3:1 for large text)
- Keyboard navigation: all interactive elements focusable
- Skip navigation link at top of page
- Focus styles: never remove outline, enhance with custom styles
- Screen reader text: sr-only class for hidden text
- ARIA live regions for dynamic content: aria-live="polite"
- Form validation messages linked to inputs`
  }
];

/**
 * Simple RAG retrieval: score knowledge base entries by keyword relevance to the query
 */
function retrieveRelevantKnowledge(query: string, topK = 3): string[] {
  const queryWords = query.toLowerCase().split(/\W+/).filter(w => w.length > 2);

  const scored = WEB_DEV_KNOWLEDGE_BASE.map(entry => {
    const text = (entry.topic + ' ' + entry.content).toLowerCase();
    const score = queryWords.filter(w => text.includes(w)).length;
    return { entry, score };
  }).sort((a, b) => b.score - a.score);

  const topEntries = scored.slice(0, topK).filter(s => s.score > 0);

  if (topEntries.length === 0) {
    // Fall back to general Tailwind + semantic HTML if no specific match
    return [
      WEB_DEV_KNOWLEDGE_BASE.find(e => e.topic === 'tailwind_patterns')?.content || '',
      WEB_DEV_KNOWLEDGE_BASE.find(e => e.topic === 'html_semantic')?.content || '',
    ].filter(Boolean);
  }

  return topEntries.map(s => s.entry.content);
}

/**
 * Build a comprehensive RAG-augmented system prompt
 */
function buildSystemPrompt(context: any, userQuery: string): string {
  const retrievedKnowledge = retrieveRelevantKnowledge(userQuery);

  let systemPrompt = `You are an expert AI web developer assistant integrated into a live IDE. You help users write high-quality, production-ready HTML, CSS, and JavaScript code.

## Your Capabilities
- Generate complete, well-structured web pages
- Modify existing code with precise, targeted changes
- Explain code clearly and concisely
- Apply modern web development best practices

## Code Quality Standards
- Always use semantic HTML5 elements
- Write responsive, mobile-first designs
- Prefer Tailwind CSS for styling when HTML files already use it
- Write clean, readable JavaScript with modern ES2020+ syntax
- Ensure accessibility: proper alt text, ARIA labels, keyboard navigation
- When asked for modifications, provide the COMPLETE updated file (not just snippets)
- Wrap code in appropriate fenced code blocks: \`\`\`html, \`\`\`css, \`\`\`javascript

## Retrieved Best Practices (RAG)
The following knowledge is relevant to the user's query:

${retrievedKnowledge.join('\n\n---\n\n')}

`;

  if (context?.currentFile) {
    systemPrompt += `## Current Active File: ${context.currentFile.name} (${context.currentFile.language.toUpperCase()})
\`\`\`${context.currentFile.language}
${context.currentFile.content}
\`\`\`

`;

    if (context.projectFiles && context.projectFiles.length > 0) {
      systemPrompt += `## Other Project Files\n`;
      context.projectFiles.forEach((file: any) => {
        systemPrompt += `\n### ${file.name} (${(file.language || 'text').toUpperCase()})\n`;
        if (file.content) {
          // Limit content to ~2000 chars per file to avoid token overload
          const truncated = file.content.length > 2000
            ? file.content.substring(0, 2000) + '\n...[truncated]'
            : file.content;
          systemPrompt += `\`\`\`${file.language || 'text'}\n${truncated}\n\`\`\`\n`;
        } else {
          systemPrompt += `(no content)\n`;
        }
      });
      systemPrompt += '\n';
    }

    if (context.fileRelationships && context.fileRelationships.length > 0) {
      systemPrompt += `## File Relationships\n`;
      context.fileRelationships.forEach((rel: any) => {
        systemPrompt += `- ${rel.htmlFile}`;
        if (rel.linkedCssFiles.length) systemPrompt += ` → CSS: ${rel.linkedCssFiles.join(', ')}`;
        if (rel.linkedJsFiles.length) systemPrompt += ` → JS: ${rel.linkedJsFiles.join(', ')}`;
        systemPrompt += '\n';
      });
      systemPrompt += '\n';
    }
  } else if (context?.generatedHtml) {
    systemPrompt += `## Current HTML\n\`\`\`html\n${context.generatedHtml}\n\`\`\`\n\n`;
  } else {
    systemPrompt += `The user is starting a new project. Help them create beautiful, modern web pages.\n\n`;
  }

  if (context?.savedContexts && context.savedContexts.length > 0) {
    systemPrompt += `## Saved Project Contexts\n`;
    context.savedContexts.forEach((ctx: any) => {
      systemPrompt += `- "${ctx.name}" (${new Date(ctx.timestamp).toLocaleString()}, ${ctx.fileCount} files)\n`;
    });
    systemPrompt += '\n';
  }

  systemPrompt += `## Response Format
When providing code changes:
1. Give a brief explanation of what you changed and why
2. Provide the COMPLETE file content (not just the modified section)
3. Use proper code fences with language tags
4. If creating new files, mention what filename to use

When answering questions:
1. Be concise and practical
2. Include code examples when relevant
3. Reference the actual files in the project when applicable`;

  return systemPrompt;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const userQuery = messages.find((m: any) => m.role === 'user')?.content || '';

    if (!process.env.LLAMA_API_KEY || !llamaAPI) {
      console.log('LLAMA_API_KEY not configured, returning demo response');
      let demo = "I'm in demo mode (no API key configured). ";

      if (userQuery.toLowerCase().includes('html') || userQuery.toLowerCase().includes('create') || userQuery.toLowerCase().includes('build')) {
        demo += "Here's an example of what I'd generate:\n\n```html\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Modern Page</title>\n  <script src=\"https://cdn.tailwindcss.com\"></script>\n</head>\n<body class=\"bg-gray-50\">\n  <header class=\"bg-white shadow-sm\">\n    <nav class=\"max-w-6xl mx-auto px-4 py-4 flex items-center justify-between\">\n      <span class=\"text-xl font-bold text-blue-600\">Brand</span>\n      <div class=\"flex gap-6 text-sm text-gray-600\">\n        <a href=\"#\" class=\"hover:text-blue-600\">Home</a>\n        <a href=\"#\" class=\"hover:text-blue-600\">About</a>\n        <a href=\"#\" class=\"hover:text-blue-600\">Contact</a>\n      </div>\n    </nav>\n  </header>\n  <main class=\"max-w-6xl mx-auto px-4 py-16\">\n    <h1 class=\"text-4xl font-bold text-gray-900 mb-4\">Welcome</h1>\n    <p class=\"text-lg text-gray-600\">Your content goes here.</p>\n  </main>\n</body>\n</html>\n```";
      } else {
        demo += "Add your LLAMA_API_KEY to .env.local to enable full AI-powered code generation with RAG-enhanced context.";
      }

      return NextResponse.json({ success: true, message: demo, demo: true });
    }

    console.log(`Processing chat request: "${userQuery.substring(0, 80)}..."`);

    // Build RAG-augmented system prompt
    const systemPromptContent = buildSystemPrompt(context, userQuery);

    const formattedMessages = [
      { role: 'system', content: systemPromptContent },
      ...messages.map((msg: any) => ({ role: msg.role, content: msg.content }))
    ];

    try {
      const response = await llamaAPI.chat.completions.create({
        messages: formattedMessages,
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        max_completion_tokens: 4096,
        temperature: 0.4,
      });

      if (response?.completion_message) {
        const content = response.completion_message.content;
        const messageContent = typeof content === 'string' ? content : (content as any)?.text || '';

        console.log('Chat response received, length:', messageContent.length);

        // Extract HTML from response for direct apply
        const htmlMatch = messageContent.match(/```html\n?([\s\S]*?)```/);
        const extractedHtml = htmlMatch?.[1]?.trim() || null;

        return NextResponse.json({
          success: true,
          message: messageContent,
          generatedHtml: extractedHtml,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('No response from Llama API');
      }
    } catch (error: any) {
      console.error('Chat API error:', error);

      if (error.status === 401 || error.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'API authentication failed',
          message: "API key issue detected. Please check your LLAMA_API_KEY in .env.local."
        });
      }

      return NextResponse.json({
        success: false,
        error: error.message || 'Chat processing failed',
        message: "I encountered an error. Please try again."
      });
    }
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: "Server error occurred. Please try again."
    });
  }
}
