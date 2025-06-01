import { NextRequest, NextResponse } from 'next/server';
import { generateSvgLogo, svgToDataUrl } from '../../utils/svgGenerator';
import { processHtmlWithSvgLogos, addFaviconIfMissing } from '../../utils/htmlProcessor';

export async function GET(request: NextRequest) {
  // Get text parameter from URL
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text') || 'TEST';
  
  // Generate logo SVG
  const svg = generateSvgLogo(text);
  const dataUrl = svgToDataUrl(svg);
  
  // Create a simple HTML page to preview the SVG
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SVG Logo Test</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4">
  <div class="max-w-3xl w-full bg-white p-8 rounded-lg shadow-md">
    <h1 class="text-3xl font-bold text-center mb-8">SVG Logo Generator Test</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div class="flex flex-col items-center">
        <h2 class="text-xl font-semibold mb-4">Raw SVG (64px)</h2>
        <div class="bg-gray-200 p-4 rounded-lg flex items-center justify-center" style="min-height: 150px;">
          ${svg}
        </div>
        <div class="mt-4 bg-gray-100 p-4 rounded-lg w-full overflow-auto">
          <pre class="text-xs">${svg.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
        </div>
      </div>
      
      <div class="flex flex-col items-center">
        <h2 class="text-xl font-semibold mb-4">As Image (data URL)</h2>
        <div class="bg-gray-200 p-4 rounded-lg flex items-center justify-center" style="min-height: 150px;">
          <img src="${dataUrl}" alt="Generated Logo" class="w-32 h-32" />
        </div>
        
        <div class="mt-8">
          <h3 class="text-lg font-medium mb-2">Different Sizes:</h3>
          <div class="flex items-center justify-center gap-4">
            <img src="${dataUrl}" alt="Logo" class="w-16 h-16" />
            <img src="${dataUrl}" alt="Logo" class="w-32 h-32" />
            <img src="${dataUrl}" alt="Logo" class="w-48 h-48" />
          </div>
        </div>
      </div>
    </div>
    
    <div class="mt-12">
      <h2 class="text-xl font-semibold mb-4">Try with different text:</h2>
      <form class="flex gap-2">
        <input type="text" name="text" value="${text}" 
               class="flex-1 px-4 py-2 border border-gray-300 rounded-lg" />
        <button type="submit" 
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Generate
        </button>
      </form>
    </div>
  </div>
  
  <div class="mt-8 max-w-3xl w-full bg-white p-8 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">HTML with logo and favicon processing:</h2>
    <p class="mb-4">Original HTML header has placeholder logo, processed version uses SVG:</p>
    
    <div class="flex gap-4 overflow-x-auto">
      <div class="bg-gray-100 p-4 rounded flex-1 min-w-[300px]">
        <h3 class="font-medium mb-2">Original HTML:</h3>
        <div class="bg-gray-200 p-4 rounded">
          <img src="https://via.placeholder.com/150" alt="Placeholder" class="logo" />
          <h4>Company Name</h4>
        </div>
      </div>
      
      <div class="bg-gray-100 p-4 rounded flex-1 min-w-[300px]">
        <h3 class="font-medium mb-2">Processed HTML:</h3>
        <div class="bg-gray-200 p-4 rounded">
          ${processHtmlWithSvgLogos(`
            <img src="https://via.placeholder.com/150" alt="Placeholder" class="logo" />
            <h4>Company Name</h4>
          `)}
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  
  // Add favicon to HTML
  const finalHtml = addFaviconIfMissing(html);
  
  return new NextResponse(finalHtml, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
} 