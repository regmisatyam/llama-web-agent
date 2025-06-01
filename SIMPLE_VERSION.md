# 🤖 AI Website Generator - Real Image Recognition

The AI Website Generator uses Llama-4-Maverick-17B-128E-Instruct-FP8 to analyze website screenshots and generate pixel-perfect HTML code.

## 🎯 Core Functionality

### Real AI-Powered Process:

1. **📤 Image Upload**: Single image drag & drop (PNG, JPG, JPEG up to 10MB)
2. **🔍 AI Analysis**: Llama AI performs detailed visual analysis of the design
3. **⚡ Code Generation**: Creates HTML/CSS that matches the uploaded image
4. **🔧 Optimization**: Finalizes responsive, production-ready code
5. **👁️ Live Preview**: Real-time preview in secure iframe sandbox

## 🚀 How Real AI Analysis Works

When you upload an image with a configured API key:

### Step 1: Image Recognition
```
Llama AI analyzes:
- Layout structure and sections
- Color palette and visual design  
- Typography and text hierarchy
- Interactive elements (buttons, forms)
- Content organization
- Overall aesthetic and style
```

### Step 2: Code Generation
```
AI generates:
- Semantic HTML5 structure
- Tailwind CSS styling
- Responsive design patterns
- Matching colors and layouts
- Interactive elements
- Mobile-optimized code
```

## 🛠 Technical Implementation

### API Endpoint: `/api/generate-html`

**Process Flow:**
1. Validates uploaded image (type, size)
2. Converts image to base64 for AI processing
3. Sends detailed analysis prompt to Llama API
4. Generates comprehensive HTML based on analysis
5. Returns code with processing metadata

**Response Format:**
```json
{
  "success": true,
  "html": "<html>...</html>",
  "filename": "screenshot.jpg",
  "fileSize": 1024000,
  "timestamp": "2024-01-01T00:00:00.000Z",
  "analysis": "Detailed AI analysis text...",
  "processing": {
    "analysisTime": 3200,
    "codeTime": 2800,
    "totalTime": 6000
  }
}
```

## 🎨 What Makes This Different

### vs Template-Based Generators:
- ❌ **Templates**: Generic layouts with placeholder content
- ✅ **Our AI**: Analyzes YOUR specific design and generates matching code

### vs Basic Image-to-Code Tools:
- ❌ **Basic Tools**: Simple HTML structure, limited styling
- ✅ **Our AI**: Complete responsive websites with Tailwind CSS

### vs Manual Coding:
- ❌ **Manual**: Hours of development time
- ✅ **Our AI**: Instant code generation from screenshots

## 📊 Supported Image Types

### Best Results:
- **Website Screenshots**: Full page captures work best
- **Design Mockups**: Clean, high-resolution designs
- **UI Interfaces**: Landing pages, dashboards, portfolios

### Image Requirements:
- **Formats**: PNG, JPG, JPEG
- **Size**: Up to 10MB
- **Quality**: Clear, readable text and elements
- **Resolution**: Higher resolution = better analysis

## 🔧 Setup & Configuration

### 1. Get Llama API Key
```bash
# Visit: https://llama.developer.meta.com/docs
# Sign up and create API key
```

### 2. Configure Environment
```bash
# Create .env.local
LLAMA_API_KEY=your_actual_api_key_here
```

### 3. Run Application
```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 💻 Live Preview Features

- **Secure Sandbox**: Code runs in isolated iframe
- **Real-time Rendering**: See results immediately
- **Responsive Testing**: Preview works on all screen sizes
- **Download Ready**: Generated code is production-ready

## 🎯 Use Cases

### 1. **Design to Development**
Convert Figma/Sketch screenshots to working websites

### 2. **Rapid Prototyping**
Turn mockups into interactive prototypes instantly

### 3. **Learning Tool**
See how visual designs translate to code

### 4. **Template Generation**
Create starting points for custom projects

## 📈 Demo Mode vs AI Mode

### Demo Mode (No API Key):
- ✅ Full UI functionality
- ✅ Upload and preview
- ✅ Professional demo output
- ⚠️ Generic template, not image-specific

### AI Mode (With API Key):
- ✅ Real image analysis
- ✅ Custom code generation
- ✅ Pixel-perfect matching
- ✅ Processing time tracking

## 🔍 Quality Expectations

### What the AI Does Well:
- Layout structure and positioning
- Color matching and schemes
- Typography and text hierarchy
- Button and form styling
- Responsive grid systems

### Current Limitations:
- Complex animations (generates static CSS)
- Custom illustrations (uses placeholders)
- Advanced JavaScript functionality
- Brand-specific assets

## 🚀 Getting Started

1. **Upload**: Select a clear website screenshot
2. **Wait**: AI analysis takes 3-8 seconds
3. **Review**: Check generated code and preview
4. **Download**: Save HTML file for your project
5. **Customize**: Use as starting point for development

The AI Website Generator transforms the traditional design-to-code workflow, making it instant and accessible to everyone! 🎨✨ 