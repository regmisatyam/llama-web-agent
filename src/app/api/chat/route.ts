import { NextRequest, NextResponse } from 'next/server';
import LlamaAPIClient from 'llama-api-client';

// Initialize Llama API client
let llamaAPI: LlamaAPIClient | null = null;
if (process.env.LLAMA_API_KEY) {
  llamaAPI = new LlamaAPIClient({
    apiKey: process.env.LLAMA_API_KEY,
  });
}

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json();

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'No messages provided' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.LLAMA_API_KEY || !llamaAPI) {
      console.log('🔑 LLAMA_API_KEY not configured, returning demo response');
      return NextResponse.json({
        success: true,
        message: "I'm currently in demo mode. In production, I can help you modify the generated HTML, answer questions about web development, or assist with any other requests!",
        demo: true
      });
    }

    console.log('💬 Processing chat request with', messages.length, 'messages');

    // Prepare messages for Llama API
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    }));

    // Add context if provided (e.g., generated HTML)
    if (context?.currentFile) {
      let contextMessage = `You are a helpful AI assistant specialized in web development. The user is working on a web project with the following files:\n\n`;
      
      // Current file details
      contextMessage += `CURRENT ACTIVE FILE: ${context.currentFile.name} (${context.currentFile.language.toUpperCase()})\n`;
      contextMessage += `\`\`\`${context.currentFile.language}\n${context.currentFile.content}\n\`\`\`\n\n`;
      
      // List other project files if available
      if (context.projectFiles && context.projectFiles.length > 1) {
        contextMessage += `OTHER PROJECT FILES:\n`;
        context.projectFiles.forEach((file: any) => {
          if (!file.isActive) {
            contextMessage += `- ${file.name} (${file.language.toUpperCase()})\n`;
          }
        });
        contextMessage += `\n`;
      }
      
      // Add file relationships if available
      if (context.fileRelationships && context.fileRelationships.length) {
        contextMessage += `FILE RELATIONSHIPS:\n`;
        context.fileRelationships.forEach((rel: any) => {
          contextMessage += `- ${rel.htmlFile} links to `;
          if (rel.linkedCssFiles.length) {
            contextMessage += `CSS: ${rel.linkedCssFiles.join(', ')} `;
          }
          if (rel.linkedJsFiles.length) {
            contextMessage += `JS: ${rel.linkedJsFiles.join(', ')}`;
          }
          contextMessage += `\n`;
        });
        contextMessage += `\n`;
      }
      
      contextMessage += `When the user asks for modifications:
1. Provide the COMPLETE modified code, not just snippets
2. Include ALL the original code with your changes
3. Wrap HTML, CSS, or JS code in appropriate code blocks like \`\`\`html, \`\`\`css, or \`\`\`js
4. Explain what changes you made

You can help the user understand, modify, or improve any of these files, or assist with any other questions.`;
      
      formattedMessages.unshift({
        role: 'system',
        content: contextMessage
      });
    } else if (context?.generatedHtml) {
      formattedMessages.unshift({
        role: 'system',
        content: `You are a helpful AI assistant specialized in web development. The user has previously generated HTML code from an image. Here is the current HTML code for reference:

${context.generatedHtml}

When the user asks for modifications:
1. Provide the COMPLETE modified HTML code, not just snippets
2. Include ALL the original code with your changes
3. Wrap the HTML in a code block with \`\`\`html and \`\`\`
4. Explain what changes you made

You can help the user understand, modify, or improve this code, or assist with any other questions.`
      });
    } else {
      formattedMessages.unshift({
        role: 'system',
        content: 'You are a helpful AI assistant specialized in web development and HTML/CSS. You can help with code generation, modifications, explanations, and general web development questions. When providing HTML code, always wrap it in ```html code blocks.'
      });
    }

    try {
      const response = await llamaAPI.chat.completions.create({
        messages: formattedMessages,
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        max_completion_tokens: 2048, // Increased for full HTML responses
        temperature: 0.7,
      });

      if (response && response.completion_message) {
        const content = response.completion_message.content;
        const messageContent = typeof content === 'string' ? content : content?.text || '';
        
        console.log('✅ Chat response received');
        
        // Check if the response contains HTML code
        const htmlMatch = messageContent.match(/```html\n?([\s\S]*?)```/);
        let extractedHtml = null;
        let cleanedMessage = messageContent;
        
        if (htmlMatch && htmlMatch[1]) {
          extractedHtml = htmlMatch[1].trim();
          // Keep the message but we'll handle HTML display differently in the UI
          console.log('📝 HTML code detected in response');
        }
        
        return NextResponse.json({
          success: true,
          message: cleanedMessage,
          generatedHtml: extractedHtml,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error('No response from Llama API');
      }
    } catch (error: any) {
      console.error('❌ Chat API error:', error);
      
      // Handle specific errors
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json({
          success: false,
          error: 'API authentication failed',
          demo: true,
          message: "API key issue detected. I'm in demo mode - in production, I could help you modify HTML, answer questions, or assist with web development!"
        });
      }
      
      return NextResponse.json({
        success: false,
        error: error.message || 'Chat processing failed',
        demo: true,
        message: "I encountered an error but I'm here to help! What would you like to know about web development or the generated HTML?"
      });
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error',
      demo: true,
      message: "Server error occurred, but I can still provide general assistance. What would you like help with?"
    });
  }
} 