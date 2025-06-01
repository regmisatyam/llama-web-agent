import { generateSvgLogo, svgToDataUrl, extractSiteNameFromHtml } from './svgGenerator';

/**
 * Process HTML to replace external logo URLs with SVG logos
 * @param html HTML content to process
 * @returns Processed HTML with SVG logos
 */
export function processHtmlWithSvgLogos(html: string): string {
  // Extract site name for logo text
  const siteName = extractSiteNameFromHtml(html);
  
  // Generate logo SVG
  const svgLogo = generateSvgLogo(siteName);
  const svgLogoUrl = svgToDataUrl(svgLogo);
  
  // Replace common logo image patterns
  let processedHtml = html;
  
  // First, try to find and replace logo images by common class names
  const logoClassRegexes = [
    /<img[^>]*class="[^"]*\b(logo|brand|site-logo|header-logo|navbar-brand-img)\b[^"]*"[^>]*>/gi,
    /<img[^>]*id="[^"]*\b(logo|brand|site-logo|header-logo)\b[^"]*"[^>]*>/gi
  ];
  
  for (const regex of logoClassRegexes) {
    processedHtml = processedHtml.replace(regex, (match) => {
      // Check if it's not already an SVG or data URL (to avoid double processing)
      if (match.includes('.svg') || match.includes('data:image')) return match;
      
      // Extract current src and alt attributes if available
      const srcMatch = match.match(/src="([^"]*)"/i);
      const altMatch = match.match(/alt="([^"]*)"/i);
      
      const currentAlt = altMatch ? altMatch[1] : siteName;
      
      // Build new img tag with SVG data URL
      return `<img src="${svgLogoUrl}" alt="${currentAlt}" class="generated-logo" />`;
    });
  }
  
  // Replace common placeholder logo URLs
  const logoUrlPatterns = [
    /src="https?:\/\/[^"]*logo[^"]*\.(?:png|jpg|jpeg|gif)"/gi,
    /src="https?:\/\/via\.placeholder\.com[^"]*"/gi,
    /src="https?:\/\/placehold\.it[^"]*"/gi,
    /src="https?:\/\/picsum\.photos[^"]*"/gi,
    /src="https?:\/\/unsplash\.it[^"]*"/gi,
    /src="https?:\/\/loremflickr\.com[^"]*"/gi,
    /src="https?:\/\/dummyimage\.com[^"]*"/gi
  ];
  
  for (const pattern of logoUrlPatterns) {
    processedHtml = processedHtml.replace(pattern, `src="${svgLogoUrl}"`);
  }
  
  // Replace logos in common header areas
  processedHtml = processLogo(processedHtml, 'header', svgLogoUrl, siteName);
  processedHtml = processLogo(processedHtml, 'nav', svgLogoUrl, siteName);
  
  return processedHtml;
}

/**
 * Process logos in specific HTML sections
 */
function processLogo(html: string, section: string, logoUrl: string, siteName: string): string {
  const sectionRegex = new RegExp(`<${section}[^>]*>(.*?)</${section}>`, 'gis');
  
  return html.replace(sectionRegex, (match) => {
    // Look for img tags without src or with placeholder src
    const imgRegex = /<img[^>]*src="([^"]*)"[^>]*>/gi;
    
    let hasProcessed = false;
    
    // Process section HTML
    const processedSection = match.replace(imgRegex, (imgTag, src) => {
      // Skip if already processed or it's not a logo image
      if (hasProcessed || imgTag.includes('generated-logo')) return imgTag;
      
      // Check if it's a placeholder or logo image
      if (src.includes('logo') || 
          src.includes('placeholder') || 
          src.includes('dummy') || 
          src === '#' || 
          src === '') {
        hasProcessed = true;
        return `<img src="${logoUrl}" alt="${siteName} logo" class="generated-logo" />`;
      }
      
      return imgTag;
    });
    
    return processedSection;
  });
}

/**
 * Generate a simple favicon SVG
 * @param text Text to use in the favicon (usually 1-2 characters)
 * @returns SVG favicon as a data URL
 */
export function generateFaviconSvg(text: string): string {
  // Generate a simple square SVG with text
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
    <rect x="0" y="0" width="32" height="32" fill="#3182ce" />
    <text x="16" y="20" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">${text.substring(0, 2).toUpperCase()}</text>
  </svg>`;
  
  return svgToDataUrl(svg);
}

/**
 * Add a favicon to HTML if missing
 * @param html HTML content
 * @returns HTML with favicon
 */
export function addFaviconIfMissing(html: string): string {
  // Check if favicon already exists
  if (html.includes('<link rel="icon"') || 
      html.includes('<link rel="shortcut icon"') || 
      html.includes('<link rel="apple-touch-icon"')) {
    return html;
  }
  
  // Extract site name for favicon text
  const siteName = extractSiteNameFromHtml(html);
  
  // Generate favicon SVG
  const faviconUrl = generateFaviconSvg(siteName);
  
  // Add favicon link to head
  const faviconLink = `<link rel="icon" href="${faviconUrl}" type="image/svg+xml">`;
  
  // Insert into head
  return html.replace('</head>', `  ${faviconLink}\n</head>`);
} 