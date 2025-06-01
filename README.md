# 🚀 AI Website Generator

A powerful web application that transforms website screenshots/ figma design into responsive HTML code(Template) using Llama AI vision recognition and modify/edit update code using voice commands.

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

# LLAMA Website Builder

A powerful web application that generates complete websites from images using LLAMA AI.

## Features

### Website Generation
- Upload images to generate responsive HTML, CSS, and JavaScript code
- Support for multiple images to create multi-page websites
- Real-time preview of generated code
- Custom prompts for AI generation

### IDE Features
- VS Code-like editor with syntax highlighting
- File explorer for managing multiple files
- Live preview of changes
- Multi-page website navigation

### AI Assistance
- Chat with LLAMA AI to help modify your code
- AI understands your entire project structure
- Get help with specific code changes or features

### Auto-Save & Revert
- Automatic saving of your code and chat history
- No need to manually save your work
- Revert to previous state if needed with a single click
- Chat history is preserved between sessions

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser to http://localhost:3000

## How to Use

1. **Generate a website from images**
   - Click "Generate from Image" in the IDE
   - Upload one or more images
   - Add optional prompts for better results
   - Wait for the AI to generate your website

2. **Edit your code**
   - Use the file explorer to navigate between files
   - Make changes in the code editor
   - See real-time preview with the Preview button

3. **Get AI help**
   - Use the chat panel to ask LLAMA for help
   - Ask for code modifications or explanations
   - Apply suggested changes with a single click

4. **Auto-Save & Revert**
   - Your code and chat history are automatically saved
   - Use the revert button (↩️) to go back to previous state
   - Clear chat history while preserving your code

## Technologies Used

- Next.js
- React
- Tailwind CSS
- LLAMA AI API
- Monaco Editor (VS Code editor)
