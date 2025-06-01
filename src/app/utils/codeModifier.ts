/**
 * Code Modification Utility
 * Helps process and apply modifications to HTML/CSS/JS based on user prompts
 */

import { processHtmlWithSvgLogos, addFaviconIfMissing } from './htmlProcessor';

/**
 * Extract code modifications from AI response
 * @param response The AI response text
 * @returns Object containing extracted code blocks
 */
export function extractCodeFromResponse(response: string): {
  html?: string;
  css?: string;
  js?: string;
  explanation?: string;
} {
  const result: {
    html?: string;
    css?: string;
    js?: string;
    explanation?: string;
  } = {};
  
  if (!response) return result;
  
  // Extract HTML code - try both with and without language specification
  const htmlMatch = response.match(/```(?:html)?\n?([\s\S]*?)```/);
  if (htmlMatch && htmlMatch[1]) {
    const htmlCode = htmlMatch[1].trim();
    // Only assign if it looks like HTML (contains at least one HTML tag)
    if (htmlCode.includes('<') && htmlCode.includes('>')) {
      result.html = htmlCode;
    }
  }
  
  // Extract CSS code
  const cssMatch = response.match(/```css\n?([\s\S]*?)```/);
  if (cssMatch && cssMatch[1]) {
    const cssCode = cssMatch[1].trim();
    // Verify it looks like CSS
    if (cssCode.includes('{') && cssCode.includes('}')) {
      result.css = cssCode;
    }
  }
  
  // Extract JavaScript code
  const jsMatch = response.match(/```(?:js|javascript)\n?([\s\S]*?)```/);
  if (jsMatch && jsMatch[1]) {
    const jsCode = jsMatch[1].trim();
    // Simple check that it resembles JavaScript
    if (jsCode.includes('function') || jsCode.includes('const') || jsCode.includes('let') || jsCode.includes('var')) {
      result.js = jsCode;
    }
  }
  
  // If we haven't found HTML code but there are code blocks, try to detect HTML without language specifier
  if (!result.html) {
    const codeBlocks = response.match(/```([\s\S]*?)```/g);
    if (codeBlocks) {
      for (const block of codeBlocks) {
        const content = block.replace(/```/g, '').trim();
        // Check if it looks like HTML and we haven't already assigned it
        if (content.includes('<html') || content.includes('<!DOCTYPE html') || 
            (content.includes('<') && content.includes('</') && content.includes('>'))) {
          result.html = content;
          break;
        }
      }
    }
  }
  
  // Extract explanation text (anything before, between, or after code blocks)
  const codeBlockRegex = /```(?:html|css|js|javascript)?\n?[\s\S]*?```/g;
  const textParts = response.split(codeBlockRegex).filter(part => part.trim());
  
  if (textParts.length > 0) {
    result.explanation = textParts.join('\n\n').trim();
  }
  
  // If no explanation was found but we have code, add a default explanation
  if (!result.explanation && (result.html || result.css || result.js)) {
    result.explanation = "Here's the modified code as requested.";
  }
  
  return result;
}

/**
 * Process HTML code with SVG logos and favicon
 * @param html HTML code to process
 * @returns Processed HTML
 */
export function processGeneratedHtml(html: string): string {
  if (!html) return html;
  
  // Add SVG logos
  let processedHtml = processHtmlWithSvgLogos(html);
  
  // Add favicon if missing
  processedHtml = addFaviconIfMissing(processedHtml);
  
  return processedHtml;
}

/**
 * Apply modifications to code based on a prompt
 * This function prepares a prompt for the AI that explicitly asks for modifications
 * @param originalCode The original code to modify
 * @param prompt The user's modification request
 * @param language The code language (html, css, js)
 * @returns Formatted prompt for the AI
 */
export function prepareModificationPrompt(originalCode: string, prompt: string, language: string = 'html'): string {
  return `I want you to modify the following ${language.toUpperCase()} code according to this request: "${prompt}"

Here's the original code:

\`\`\`${language}
${originalCode}
\`\`\`

Please provide the complete modified code wrapped in a \`\`\`${language} code block, followed by a brief explanation of the changes you made. 
Make sure to include ALL of the original code with your changes, not just the modified parts.
If you're unsure about any aspect, maintain the original structure and only make the specific changes requested.`;
}

/**
 * Create a custom system prompt for code modifications
 * @param language The code language being modified
 * @returns System prompt for code modifications
 */
export function getCodeModificationSystemPrompt(language: string = 'html'): string {
  return `You are an expert web developer specializing in ${language.toUpperCase()} modifications.
When modifying code:
1. ALWAYS return the COMPLETE code with your changes, not just snippets
2. Wrap your code in \`\`\`${language} code blocks
3. Preserve the overall structure of the original code
4. Only make the specific changes requested
5. Provide a brief explanation of what you changed and why
6. If the request is unclear, ask clarifying questions

For HTML modifications specifically:
- Maintain correct HTML structure
- Keep existing CSS classes unless explicitly asked to change them
- Preserve any JavaScript event handlers
- Ensure the document remains valid HTML

For CSS modifications:
- Keep the existing style structure
- Only modify the specific styles mentioned
- Use the same naming conventions as the original

For JavaScript modifications:
- Maintain the existing code structure
- Preserve variable names and function signatures
- Add clear comments for new functionality`;
}

/**
 * Format a chat message focused on code modification
 * @param content The user's message content
 * @param originalCode The code to modify
 * @param language The code language
 * @returns Formatted message for the AI
 */
export function formatCodeModificationMessage(content: string, originalCode: string, language: string = 'html'): any {
  return {
    role: 'user',
    content: prepareModificationPrompt(originalCode, content, language)
  };
} 