import { NextRequest, NextResponse } from 'next/server';
import LlamaAPIClient from 'llama-api-client';

export async function GET() {
  try {
    // Check if API key exists
    if (!process.env.LLAMA_API_KEY) {
      return NextResponse.json({
        status: 'error',
        message: 'LLAMA_API_KEY not found in environment variables',
        solution: 'Add LLAMA_API_KEY to your .env.local file'
      });
    }

    const apiKey = process.env.LLAMA_API_KEY;
    
    // Basic format validation
    if (apiKey.length < 10) {
      return NextResponse.json({
        status: 'error',
        message: 'API key appears to be too short',
        keyLength: apiKey.length,
        solution: 'Check that you copied the full API key'
      });
    }

    // Initialize client
    const llamaAPI = new LlamaAPIClient({
      apiKey: apiKey,
    });

    // Test multiple models to find what works
    const modelsToTest = [
      // Vision models (correct names from Meta documentation)
      'meta/llama-3.2-11b-vision-instruct',
      'meta/llama-3.2-90b-vision-instruct',
      // Alternative naming patterns
      'llama-3.2-11b-vision-instruct',
      'llama-3.2-90b-vision-instruct',
      // User's Python example model
      'Llama-4-Maverick-17B-128E-Instruct-FP8',
      // Text-only models for comparison
      'meta/llama-3.1-8b-instruct',
      'meta/llama-3.1-70b-instruct',
      'llama-3.1-8b-instruct',
      'llama-3.1-70b-instruct',
      // Other models to test
      'Llama-4-Scout-17B-16E-Instruct-FP8',
      'llama-2-7b-chat',
      'llama-2-13b-chat'
    ];

    const results = [];

    for (const model of modelsToTest) {
      try {
        console.log(`🧪 Testing model: ${model}`);
        const testResponse = await llamaAPI.chat.completions.create({
          messages: [
            {
              role: 'user',
              content: 'Hello, respond with just "OK"'
            }
          ],
          model: model,
        });

        if (testResponse && testResponse.completion_message) {
          results.push({
            model: model,
            status: 'success',
            response: testResponse.completion_message.content
          });
          console.log(`✅ Model ${model} works`);
        } else {
          results.push({
            model: model,
            status: 'error',
            error: 'No response'
          });
        }
      } catch (error: any) {
        results.push({
          model: model,
          status: 'error',
          error: error.message || 'Unknown error',
          status_code: error.status || 'Unknown'
        });
        console.log(`❌ Model ${model} failed: ${error.message}`);
      }
    }

    // Test vision capabilities for working models
    const workingModels = results.filter(r => r.status === 'success').map(r => r.model);
    const visionResults = [];

    if (workingModels.length > 0) {
      console.log('🔍 Testing vision capabilities for working models...');
      
      // Create a simple test image (1x1 red pixel PNG in base64)
      const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
      
      for (const model of workingModels) {
        try {
          console.log(`🖼️ Testing vision for: ${model}`);
          const visionResponse = await llamaAPI.chat.completions.create({
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'What color is this image? Answer with just the color name.'
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${testImageBase64}`
                    }
                  }
                ]
              }
            ],
            model: model,
          });

          if (visionResponse && visionResponse.completion_message) {
            visionResults.push({
              model: model,
              visionSupport: true,
              response: visionResponse.completion_message.content
            });
            console.log(`✅ Model ${model} supports vision`);
          } else {
            visionResults.push({
              model: model,
              visionSupport: false,
              error: 'No vision response'
            });
          }
        } catch (error: any) {
          visionResults.push({
            model: model,
            visionSupport: false,
            error: error.message || 'Vision test failed',
            status_code: error.status || 'Unknown'
          });
          console.log(`❌ Model ${model} vision test failed: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      status: 'completed',
      message: 'Model testing completed',
      keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      results: results,
      workingModels: results.filter(r => r.status === 'success').map(r => r.model),
      visionResults: visionResults,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      status: 'error',
      message: 'Server error during API test',
      error: error.message || 'Unknown error'
    });
  }
} 