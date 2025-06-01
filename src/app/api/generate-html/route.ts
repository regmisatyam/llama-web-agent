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
  const startTime = Date.now();
  let fileName = 'unknown.jpg';
  
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image uploaded' },
        { status: 400 }
      );
    }

    fileName = file.name; // Store filename for error handling

    // Validate file type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Please upload a PNG or JPG image' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.LLAMA_API_KEY || !llamaAPI) {
      console.log('🔑 LLAMA_API_KEY not configured, returning demo HTML');
      return getDemoResponse(file.name);
    }

    // Validate API key format
    const apiKey = process.env.LLAMA_API_KEY;
    if (apiKey.length < 10) {
      console.log('⚠️ API key appears too short - returning demo mode');
      return getDemoResponse(file.name, 'API key format invalid - check your LLAMA_API_KEY');
    }

    console.log(`🚀 Processing image: ${file.name} (${file.size} bytes)`);
    console.log(`🔑 Using API key: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`);

    // Convert image to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    console.log(`📸 Image converted to base64: ${Math.round(base64.length / 1024)}KB`);

    // STEP 1: Image Analysis with Llama AI
    console.log('🔍 Step 1: AI analyzing image...');
    const analysisStart = Date.now();
    
    const analysisPrompt = `
You are an expert web developer and designer. Analyze this website/design image in detail and provide a comprehensive description of:

1. **Layout Structure**: Overall page layout, sections, header, navigation, content areas, footer
2. **Visual Design**: Colors, typography, spacing, visual hierarchy
3. **Components**: Buttons, forms, cards, images, icons, interactive elements
4. **Content**: Text content, headings, paragraphs, lists, links
5. **Style**: Modern/classic, professional/casual, color scheme, overall aesthetic

Be very specific about what you see - colors, text content, layout arrangement, component styles, etc. This analysis will be used to generate matching HTML/CSS code.

Image: ${dataUrl}
`;

    let imageAnalysis = '';
    try {
      const analysisResponse = await llamaAPI.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert web designer and analyst. Analyze the provided website screenshot carefully and describe its layout, components, design elements, colors, typography, and overall structure in detail.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please analyze this website screenshot and describe its design, layout, components, and visual elements in detail.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/${file.type.split('/')[1]};base64,${base64}`
                }
              }
            ]
          }
        ],
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
        temperature: 0.1,
      });

      if (analysisResponse && analysisResponse.completion_message) {
        const content = analysisResponse.completion_message.content;
        imageAnalysis = typeof content === 'string' ? content : content?.text || '';
        console.log('✅ Image analysis completed');
      } else {
        throw new Error('No analysis response from Llama API');
      }
    } catch (error) {
      console.error('❌ Image analysis failed:', error);
      
      // Check for specific API errors
      if (error && typeof error === 'object' && 'status' in error) {
        if (error.status === 500) {
          console.log('🔧 Llama API server error - falling back to demo mode');
          return getDemoResponse(file.name, 'Llama API server error - using demo mode');
        } else if (error.status === 401 || error.status === 403) {
          console.log('🔑 API key authentication failed - falling back to demo mode');
          return getDemoResponse(file.name, 'API key authentication failed - check your LLAMA_API_KEY');
        } else if (error.status === 400) {
          const errorMessage = (error as any).message || '';
          if (errorMessage.includes('Model') && errorMessage.includes('not supported')) {
            console.log('🤖 Unsupported model - falling back to demo mode');
            return getDemoResponse(file.name, 'Model not supported - using demo mode with default model');
          } else {
            console.log('📝 Bad request - falling back to demo mode');
            return getDemoResponse(file.name, 'API request error - using demo mode');
          }
        }
      }
      
      console.log('🎭 API error occurred - falling back to demo mode');
      return getDemoResponse(file.name, 'API error - using demo mode');
    }

    const analysisTime = Date.now() - analysisStart;

    // STEP 2: Code Generation based on analysis
    console.log('⚡ Step 2: Generating HTML/CSS code...');
    const codeStart = Date.now();

    const codePrompt = `
Based on this detailed image analysis, generate a complete, responsive HTML page with inline CSS that exactly matches the design:

ANALYSIS:
${imageAnalysis}

REQUIREMENTS:
- Generate a complete HTML document with DOCTYPE, head, and body
- Include Tailwind CSS via CDN for styling
- Make it responsive and mobile-friendly
- Match the exact colors, layout, typography, and content from the image
- Include all text content, buttons, forms, and interactive elements seen in the image
- Use semantic HTML5 elements
- Ensure clean, professional code structure
- Make it pixel-perfect to match the original design

OUTPUT FORMAT:
Return ONLY the complete HTML code, nothing else. No explanations, no markdown code blocks, just the raw HTML.

Generate the HTML now:
`;

    let generatedHTML = '';
    try {
      const codeResponse = await llamaAPI.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: 'You are an expert front-end developer who creates pixel-perfect HTML/CSS code from design specifications. Always output clean, semantic HTML with proper styling.'
          },
          {
            role: 'user',
            content: codePrompt
          }
        ],
        model: 'Llama-4-Maverick-17B-128E-Instruct-FP8',
      });

      if (codeResponse && codeResponse.completion_message) {
        const content = codeResponse.completion_message.content;
        generatedHTML = typeof content === 'string' ? content : content?.text || '';
        
        // Clean up the response - remove markdown code blocks if present
        generatedHTML = generatedHTML
          .replace(/```html\n?/g, '')
          .replace(/```\n?/g, '')
          .trim();

        console.log('✅ HTML code generated successfully');
      } else {
        throw new Error('No code response from Llama API');
      }
    } catch (error) {
      console.error('❌ Code generation failed:', error);
      console.log('🎭 Code generation error - falling back to demo mode');
      return getDemoResponse(file.name, 'Code generation failed - using demo mode');
    }

    const codeTime = Date.now() - codeStart;
    const totalTime = Date.now() - startTime;

    // Validate generated HTML
    if (!generatedHTML || generatedHTML.length < 100) {
      console.log('⚠️ Generated HTML too short - falling back to demo mode');
      return getDemoResponse(file.name, 'Generated HTML validation failed - using demo mode');
    }

    console.log(`✅ Website generation completed in ${totalTime}ms`);

    return NextResponse.json({
      success: true,
      html: generatedHTML,
      filename: file.name,
      fileSize: file.size,
      timestamp: new Date().toISOString(),
      analysis: imageAnalysis,
      processing: {
        analysisTime,
        codeTime,
        totalTime
      }
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    
    // Return demo response with the filename we stored
    return getDemoResponse(fileName, 'Server error - using demo mode');
  }
}

function getDemoResponse(filename: string, message?: string) {
  console.log(`🎭 Returning demo response for: ${filename}`);
  
  const demoHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generated Website - Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#3B82F6',
                        secondary: '#8B5CF6'
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-50 font-sans">
    <!-- Demo Notice -->
    <div class="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4">
        <div class="flex">
            <div class="py-1">
                <svg class="fill-current h-6 w-6 text-amber-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z"/></svg>
            </div>
            <div>
                <p class="font-bold">Demo Mode Active</p>
                <p class="text-sm">${message || 'Configure LLAMA_API_KEY environment variable to enable AI-powered image analysis and code generation.'} Generated from: <strong>${filename}</strong></p>
            </div>
        </div>
    </div>

    <!-- Header -->
    <header class="bg-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-6 md:justify-start md:space-x-10">
                <div class="flex justify-start lg:w-0 lg:flex-1">
                    <span class="text-2xl font-bold text-gray-900">WebsiteGen</span>
                </div>
                <nav class="hidden md:flex space-x-10">
                    <a href="#" class="text-base font-medium text-gray-500 hover:text-gray-900">Home</a>
                    <a href="#" class="text-base font-medium text-gray-500 hover:text-gray-900">Features</a>
                    <a href="#" class="text-base font-medium text-gray-500 hover:text-gray-900">About</a>
                    <a href="#" class="text-base font-medium text-gray-500 hover:text-gray-900">Contact</a>
                </nav>
                <div class="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
                    <button class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <main class="flex-1">
        <div class="bg-gradient-to-r from-primary to-secondary">
            <div class="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
                <div class="text-center">
                    <h1 class="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">
                        AI-Powered Website Generation
                    </h1>
                    <p class="mt-3 max-w-md mx-auto text-base text-blue-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                        Transform your design images into fully functional, responsive websites using advanced AI technology.
                    </p>
                    <div class="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                        <button class="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg">
                            Upload Your Design
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Features Section -->
        <div class="py-16 bg-white">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="lg:text-center">
                    <h2 class="text-base text-primary font-semibold tracking-wide uppercase">Features</h2>
                    <p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                        Everything you need to generate websites
                    </p>
                </div>

                <div class="mt-10">
                    <div class="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
                        <div class="relative">
                            <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p class="ml-16 text-lg leading-6 font-medium text-gray-900">AI Image Analysis</p>
                            <p class="mt-2 ml-16 text-base text-gray-500">
                                Advanced computer vision to understand your design layouts, colors, and components.
                            </p>
                        </div>

                        <div class="relative">
                            <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Clean Code Generation</p>
                            <p class="mt-2 ml-16 text-base text-gray-500">
                                Generates semantic HTML with modern CSS and responsive design principles.
                            </p>
                        </div>

                        <div class="relative">
                            <div class="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                                <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <p class="ml-16 text-lg leading-6 font-medium text-gray-900">Mobile Responsive</p>
                            <p class="mt-2 ml-16 text-base text-gray-500">
                                Every generated website is fully responsive and optimized for all devices.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- CTA Section -->
        <div class="bg-gray-50">
            <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
                <h2 class="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                    <span class="block">Ready to generate your website?</span>
                    <span class="block text-primary">Configure your API key to get started.</span>
                </h2>
                <div class="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                    <div class="inline-flex rounded-md shadow">
                        <button class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 transition-colors">
                            Upload Image
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <!-- Footer -->
    <footer class="bg-white">
        <div class="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
            <div class="flex justify-center space-x-6 md:order-2">
                <a href="#" class="text-gray-400 hover:text-gray-500">
                    <span class="sr-only">GitHub</span>
                    <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clip-rule="evenodd" />
                    </svg>
                </a>
            </div>
            <div class="mt-8 md:mt-0 md:order-1">
                <p class="text-center text-base text-gray-400">
                    &copy; 2024 AI Website Generator. Demo mode - Configure LLAMA_API_KEY for full functionality.
                </p>
            </div>
        </div>
    </footer>

    <script>
        // Demo interactions
        document.addEventListener('DOMContentLoaded', function() {
            const buttons = document.querySelectorAll('button');
            buttons.forEach(button => {
                button.addEventListener('click', function() {
                    alert('🤖 Demo Mode: Configure LLAMA_API_KEY to enable full AI-powered website generation!');
                });
            });
        });
    </script>
</body>
</html>`;

  return NextResponse.json({
    success: true,
    html: demoHtml,
    filename: filename,
    demo: true,
    message: message || 'Demo response - Configure LLAMA_API_KEY for AI generation',
    timestamp: new Date().toISOString()
  });
} 