/**
 * SVG Logo Generator Utility
 * Generates simple SVG logos with different styles and colors
 */

// Define color palettes
const colorPalettes = [
  // Blue shades
  ['#1a365d', '#2a4365', '#2c5282', '#2b6cb0', '#3182ce', '#4299e1', '#63b3ed', '#90cdf4', '#bee3f8'],
  // Green shades
  ['#1c4532', '#22543d', '#276749', '#2f855a', '#38a169', '#48bb78', '#68d391', '#9ae6b4', '#c6f6d5'],
  // Purple shades
  ['#322659', '#44337a', '#553c9a', '#6b46c1', '#805ad5', '#9f7aea', '#b794f4', '#d6bcfa', '#e9d8fd'],
  // Red shades
  ['#742a2a', '#9b2c2c', '#c53030', '#e53e3e', '#f56565', '#fc8181', '#feb2b2', '#fed7d7', '#fff5f5'],
  // Orange shades
  ['#652b19', '#7b341e', '#9c4221', '#c05621', '#dd6b20', '#ed8936', '#f6ad55', '#fbd38d', '#feebc8'],
];

// Define different SVG shapes and styles
const logoStyles = [
  'geometric',
  'abstract',
  'lettermark',
  'minimalist',
  'gradient',
];

/**
 * Generate a random SVG logo
 * @param text Optional text to include in the logo (usually 1-2 characters)
 * @param size Size of the SVG (default 64)
 * @returns SVG markup as a string
 */
export function generateSvgLogo(text?: string, size: number = 64): string {
  // Pick a random style
  const style = logoStyles[Math.floor(Math.random() * logoStyles.length)];
  
  // Pick a random color palette
  const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  
  // Pick primary and secondary colors
  const primaryColor = palette[Math.floor(Math.random() * 4)]; // Darker colors
  const secondaryColor = palette[Math.floor(Math.random() * 4) + 5]; // Lighter colors
  
  // Default text if none provided
  const logoText = text || getRandomLetters(2);
  
  // Generate SVG based on style
  switch (style) {
    case 'geometric':
      return generateGeometricLogo(logoText, primaryColor, secondaryColor, size);
    case 'abstract':
      return generateAbstractLogo(logoText, primaryColor, secondaryColor, size);
    case 'lettermark':
      return generateLettermarkLogo(logoText, primaryColor, secondaryColor, size);
    case 'minimalist':
      return generateMinimalistLogo(logoText, primaryColor, secondaryColor, size);
    case 'gradient':
      return generateGradientLogo(logoText, primaryColor, secondaryColor, size);
    default:
      return generateGeometricLogo(logoText, primaryColor, secondaryColor, size);
  }
}

/**
 * Generate a geometric logo (squares, circles, triangles)
 */
function generateGeometricLogo(text: string, primary: string, secondary: string, size: number): string {
  const shapes = [
    `<rect x="${size * 0.2}" y="${size * 0.2}" width="${size * 0.6}" height="${size * 0.6}" fill="${primary}" />`,
    `<circle cx="${size / 2}" cy="${size / 2}" r="${size * 0.3}" fill="${primary}" />`,
    `<polygon points="${size/2},${size*0.2} ${size*0.2},${size*0.8} ${size*0.8},${size*0.8}" fill="${primary}" />`
  ];
  
  const selectedShape = shapes[Math.floor(Math.random() * shapes.length)];
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${selectedShape}
    <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="${secondary}" text-anchor="middle">${text}</text>
  </svg>`;
}

/**
 * Generate an abstract logo with random shapes
 */
function generateAbstractLogo(text: string, primary: string, secondary: string, size: number): string {
  // Create a few random shapes
  const shape1 = `<circle cx="${size * 0.3}" cy="${size * 0.3}" r="${size * 0.2}" fill="${primary}" />`;
  const shape2 = `<rect x="${size * 0.4}" y="${size * 0.4}" width="${size * 0.4}" height="${size * 0.4}" fill="${secondary}" opacity="0.8" />`;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    ${shape1}
    ${shape2}
    <text x="${size/2}" y="${size/2}" font-family="Arial, sans-serif" font-size="${size * 0.25}" font-weight="bold" fill="#fff" text-anchor="middle">${text}</text>
  </svg>`;
}

/**
 * Generate a lettermark logo (letter in a shape)
 */
function generateLettermarkLogo(text: string, primary: string, secondary: string, size: number): string {
  const shortText = text.substring(0, 1).toUpperCase();
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${size * 0.4}" fill="${primary}" />
    <text x="${size/2}" y="${size/2 + size*0.15}" font-family="Arial, sans-serif" font-size="${size * 0.4}" font-weight="bold" fill="${secondary}" text-anchor="middle">${shortText}</text>
  </svg>`;
}

/**
 * Generate a minimalist logo (simple shapes, no text)
 */
function generateMinimalistLogo(text: string, primary: string, secondary: string, size: number): string {
  const lines = [];
  
  for (let i = 0; i < 3; i++) {
    const y = size * (0.3 + i * 0.2);
    lines.push(`<line x1="${size * 0.2}" y1="${y}" x2="${size * 0.8}" y2="${y}" stroke="${primary}" stroke-width="${size * 0.05}" />`);
  }
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <rect x="0" y="0" width="${size}" height="${size}" fill="${secondary}" opacity="0.1" />
    ${lines.join('\n    ')}
  </svg>`;
}

/**
 * Generate a gradient logo
 */
function generateGradientLogo(text: string, primary: string, secondary: string, size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primary}" />
        <stop offset="100%" stop-color="${secondary}" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${size}" height="${size}" fill="url(#grad)" />
    <text x="${size/2}" y="${size/2 + size*0.1}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" fill="white" text-anchor="middle">${text}</text>
  </svg>`;
}

/**
 * Get random letters for logo text
 */
function getRandomLetters(count: number = 2): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < count; i++) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return result;
}

/**
 * Convert SVG string to data URL for use in src attributes
 */
export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Extracts company/site name from HTML to use for logo text
 */
export function extractSiteNameFromHtml(html: string): string {
  // Try to find the title
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    // Get first word or first two letters
    const title = titleMatch[1].trim();
    const firstWord = title.split(/\s+/)[0];
    if (firstWord.length <= 3) {
      return firstWord.toUpperCase();
    } else {
      return firstWord.substring(0, 2).toUpperCase();
    }
  }
  
  // Try to find a prominent heading
  const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    const heading = h1Match[1].replace(/<[^>]*>/g, '').trim(); // Remove any HTML tags
    const firstWord = heading.split(/\s+/)[0];
    if (firstWord.length <= 3) {
      return firstWord.toUpperCase();
    } else {
      return firstWord.substring(0, 2).toUpperCase();
    }
  }
  
  // Default to random letters
  return getRandomLetters(2);
} 