# 🚀 AI Website Generator

A powerful web application that transforms website screenshots into responsive HTML code using Llama AI vision recognition.

## ✨ Features

🤖 **Real AI Image Recognition**: Uses Llama-4-Maverick-17B-128E-Instruct-FP8 for analyzing website designs  
⚡ **Live Code Generation**: Generates HTML that matches your uploaded images  
👁️ **Live Preview**: Real-time preview in secure sandbox  
📱 **Responsive Design**: Clean, modern UI built with Tailwind CSS  
📤 **Drag & Drop Upload**: Easy image upload with validation  
⬇️ **Download**: Save generated websites as HTML files  
🔍 **Process Tracking**: See AI analysis steps in real-time  

## 🎯 How It Works

1. **Upload Image**: Drag & drop or select a website screenshot (PNG/JPG)
2. **AI Analysis**: Llama AI analyzes layout, colors, typography, and components
3. **Code Generation**: AI generates pixel-perfect HTML with Tailwind CSS
4. **Live Preview**: View and download your generated website

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Llama API (Required for AI features)
```bash
# Create .env.local file
echo "LLAMA_API_KEY=your_actual_llama_api_key_here" > .env.local
```

### 3. Run Development Server
```bash
npm run dev
```

### 4. Open Application
```
http://localhost:3000
```

## 🤖 API Integration

### Real AI Processing
When `LLAMA_API_KEY` is configured, the app uses real Llama AI:

1. **Image Analysis**: Detailed analysis of layout, colors, components
2. **Code Generation**: HTML/CSS that matches the design
3. **Process Tracking**: Real-time progress updates

### Demo Mode
Without API key, shows professional demo websites with setup instructions.

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes  
- **AI**: Llama-4-Maverick-17B-128E-Instruct-FP8 via llama-api-client
- **Icons**: Lucide React

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx                 # Main application interface
│   └── api/
│       └── generate-html/
│           └── route.ts         # AI-powered API endpoint
├── components/                  # Reusable UI components
└── styles/                     # Global styles
```

## 🔧 Environment Variables

```env
# Required for AI functionality
LLAMA_API_KEY=your_llama_api_key_here
```

## 🎨 Supported Images

- **Formats**: PNG, JPG, JPEG
- **Size**: Up to 10MB
- **Content**: Website screenshots, design mockups, UI designs

## 📊 AI Processing

The application follows a structured AI process:

1. **📤 Upload**: Image validation and preparation
2. **🔍 Analysis**: Llama AI analyzes design elements
3. **⚡ Generation**: Creates matching HTML/CSS code  
4. **🔧 Optimization**: Finalizes responsive code

## 🎯 Use Cases

- **Design to Code**: Convert screenshots to websites
- **Rapid Prototyping**: Quick website generation
- **Learning**: See how designs translate to code
- **Template Creation**: Generate starting points for projects

## 🔍 Troubleshooting

### API Issues
- **API Key Setup**: Ensure `LLAMA_API_KEY` is set in `.env.local` (not `.env`)
- **Restart Required**: Restart development server after adding API key
- **Valid API Key**: Check API key validity and permissions at [Llama Developer Portal](https://llama.developer.meta.com/docs)
- **Model Access**: Ensure your API key has access to vision-capable models

### Common Error Solutions

#### "Llama API server error"
- The Llama API is experiencing issues - app will fallback to demo mode
- Try again in a few minutes
- Check [Llama API status](https://llama.developer.meta.com/docs) for service updates

#### "API key authentication failed"
```bash
# Check your .env.local file format:
LLAMA_API_KEY=your_actual_key_here

# No quotes, no spaces around the equals sign
# Restart the dev server after changes:
npm run dev
```

#### "Demo Mode Active"
- This indicates the API key is not configured or there's an API error
- The app continues to work with professional demo websites
- Configure `LLAMA_API_KEY` for real AI-powered generation

### Image Upload
- Use supported formats (PNG, JPG, JPEG)
- Keep files under 10MB
- Ensure clear, high-quality screenshots

### Generated Code
- Code automatically includes Tailwind CSS
- All generated websites are responsive
- Includes semantic HTML5 structure

## 🚧 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🎉 Ready to Transform Images to Websites?

1. **Get Llama API Key** from the official Llama developer portal
2. **Add to `.env.local`** file
3. **Upload your website screenshot**
4. **Watch AI generate your code**
5. **Download and deploy**

Transform any website design into code with the power of AI! 🚀✨

## 🤖 Supported AI Models

The application requires **vision-capable** Llama models for image analysis:

### **Vision-Capable Models (Required for Image Analysis):**
- ✅ **`llama-3.2-11b-vision-instruct`** - Recommended for our use case
- ✅ **`llama-3.2-90b-vision-instruct`** - Larger, more capable (if available)

### **Text-Only Models (Won't Work for Images):**
- ❌ **`Llama-4-Scout-17B-16E-Instruct-FP8`** - Text generation only
- ❌ **`llama-3.1-8b-instruct`** - Text generation only
- ❌ **Most other models** - Check [Llama API Documentation](https://llama.developer.meta.com/docs/models) for vision support

### **Model Requirements:**
- ✅ **Vision Support**: Must accept image inputs (base64)
- ✅ **Text Generation**: Must generate HTML/CSS code
- ✅ **API Availability**: Must be available in your API plan

### **Common Model Issues:**
- **500 Error**: Using text-only model with image inputs
- **400 Error**: Model name doesn't exist
- **401/403 Error**: API key or permission issues

### **How to Check if a Model Supports Vision:**
Look for **"vision"** in the model name or check the [official documentation](https://llama.developer.meta.com/docs/models) for "Multimodal" or "Vision" capabilities.
