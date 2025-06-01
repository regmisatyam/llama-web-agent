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
    // Parse the FormData
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const customPrompt = formData.get('prompt') as string | null;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.LLAMA_API_KEY || !llamaAPI) {
      console.log('🔑 LLAMA_API_KEY not configured, returning demo response');
      return NextResponse.json({
        success: true,
        html: createDemoHTML(),
        css: createDemoCSS(),
        js: createDemoJS(),
        demo: true
      });
    }

    console.log('🔄 Processing image:', image.name);

    // Convert image to base64
    const arrayBuffer = await image.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const base64Image = `data:${image.type};base64,${imageBuffer.toString('base64')}`;

    // Define the prompt
    const basePrompt = customPrompt || "Analyze this website design image and generate clean, responsive HTML using Tailwind CSS. Please provide HTML, CSS, and JavaScript as separate files.";
    
    // Define prompt with separate file instructions
    const fullPrompt = `${basePrompt}

Please provide your response in the following format:

1. HTML File:
\`\`\`html
// Your complete HTML code here
\`\`\`

2. CSS File (if needed):
\`\`\`css
// Your CSS code here
\`\`\`

3. JavaScript File (if needed):
\`\`\`js
// Your JavaScript code here
\`\`\`

4. Brief explanation of the implementation.

Make the design responsive and use Tailwind CSS for styling. Include JavaScript only if necessary for interactive elements.`;

    try {
      console.log('🔄 Sending image to Llama API with prompt:', fullPrompt.substring(0, 100) + '...');
      
      const response = await llamaAPI.chat.completions.create({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: fullPrompt },
              { type: 'image_url', image_url: { url: base64Image } }
            ]
          }
        ],
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        max_completion_tokens: 4096,
        temperature: 0.7,
      });

      if (response && response.completion_message) {
        const content = response.completion_message.content;
        const messageContent = typeof content === 'string' ? content : content?.text || '';
        
        console.log('✅ AI response received, extracting code');
        
        // Extract HTML, CSS, and JS from the response
        const htmlMatch = messageContent.match(/```html\n([\s\S]*?)```/);
        const cssMatch = messageContent.match(/```css\n([\s\S]*?)```/);
        const jsMatch = messageContent.match(/```js(?:cript)?\n([\s\S]*?)```/);
        
        const html = htmlMatch ? htmlMatch[1].trim() : '';
        const css = cssMatch ? cssMatch[1].trim() : '';
        const js = jsMatch ? jsMatch[1].trim() : '';
        
        // Extract any analysis or explanation
        let analysis = '';
        const parts = messageContent.split(/```(?:html|css|js(?:cript)?)\n[\s\S]*?```/g);
        if (parts.length > 0) {
          // Get the last part after all code blocks
          analysis = parts[parts.length - 1].trim();
        }
        
        if (html) {
          return NextResponse.json({
            success: true,
            html,
            css,
            js,
            analysis,
            timestamp: new Date().toISOString()
          });
        } else {
          throw new Error('No HTML code found in the response');
        }
      } else {
        throw new Error('No response from Llama API');
      }
    } catch (error: any) {
      console.error('❌ Llama API error:', error);
      
      // Handle specific errors
      if (error.status === 401 || error.status === 403) {
        return NextResponse.json(
          { success: false, error: 'API authentication failed' },
          { status: error.status }
        );
      }
      
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to generate HTML' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Server error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error' },
      { status: 500 }
    );
  }
}

// Demo HTML for when API key is not configured
function createDemoHTML() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demo Website</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="bg-blue-600 text-white shadow-md">
    <div class="container mx-auto px-4 py-6">
      <nav class="flex justify-between items-center">
        <a href="#" class="text-2xl font-bold">DEMO</a>
        <ul class="flex space-x-6">
          <li><a href="#" class="hover:underline">Home</a></li>
          <li><a href="#" class="hover:underline">Features</a></li>
          <li><a href="#" class="hover:underline">Pricing</a></li>
          <li><a href="#" class="hover:underline">Contact</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section class="py-20 bg-gray-100">
      <div class="container mx-auto px-4 text-center">
        <h1 class="text-5xl font-bold mb-6">Welcome to Demo Website</h1>
        <p class="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">This is a demo website generated without using the Llama API. Configure your API key to generate real websites from images!</p>
        <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">Get Started</button>
      </div>
    </section>

    <section class="py-16">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Features</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-4">Feature 1</h3>
            <p class="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-4">Feature 2</h3>
            <p class="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-xl font-bold mb-4">Feature 3</h3>
            <p class="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="bg-gray-800 text-white py-10">
    <div class="container mx-auto px-4 text-center">
      <p>&copy; 2023 Demo Website. All rights reserved.</p>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>`;
}

function createDemoCSS() {
  return `/* Custom styles */
body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.container {
  max-width: 1200px;
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animated {
  animation: fadeIn 0.5s ease-in-out;
}`;
}

function createDemoJS() {
  return `// Demo JavaScript
document.addEventListener('DOMContentLoaded', function() {
  console.log('Demo website loaded!');
  
  // Add animation class to elements
  const elements = document.querySelectorAll('section');
  elements.forEach(el => {
    el.classList.add('animated');
  });
  
  // Add event listener to the button
  const button = document.querySelector('button');
  if (button) {
    button.addEventListener('click', function() {
      alert('This is a demo website. Configure your Llama API key to generate real websites!');
    });
  }
});`;
} 