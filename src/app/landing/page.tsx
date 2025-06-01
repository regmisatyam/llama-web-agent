'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

// Icons for the landing page
const Icons = {
  Image: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Code: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Pages: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  )
};

export default function LandingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Create a new project and redirect to IDE
  const goToNewProject = () => {
    router.push('/ide');
  };
  
  // Handle file upload and redirect to conversations
  const handleFileUpload = (files: File[]) => {
    if (files.length > 0) {
      // For multiple images, send to main image upload page
      router.push('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-600">LLAMA</span>
            <span className="text-2xl font-semibold">Website Builder</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={goToNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            >
              <Icons.Plus />
              New Project
            </button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Build Websites from Images with AI
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Upload screenshots and let our AI generate responsive, multi-page websites with clean code. Edit in our IDE and customize with LLAMA's assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <button 
              onClick={goToNewProject}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-lg text-lg font-medium flex items-center justify-center gap-2"
            >
              <Icons.Code />
              Start Coding Now
            </button>
            
           
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            Everything You Need to Build Amazing Websites
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Icons.Image />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Generate from Images</h3>
              <p className="text-gray-600">
                Upload up to 4 website screenshots and our AI will generate responsive HTML, CSS, and JS code. Each image becomes a different page of your website.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Icons.Pages />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">Multi-Page Websites</h3>
              <p className="text-gray-600">
                Create complete websites with index, about, services, and contact pages. Edit all pages in our VS Code-like IDE with real-time preview.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-xl p-8 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                <Icons.Chat />
              </div>
              <h3 className="text-xl font-bold mb-4 text-gray-900">AI Assistance</h3>
              <p className="text-gray-600">
                Ask LLAMA to modify your code, add features, or explain how things work. The AI understands your entire project and can edit multiple files.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-gray-900">
            How It Works
          </h2>
          
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-md">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Upload Screenshots</h3>
                <p className="text-gray-600">
                  Upload screenshots of websites you like or sketches of your design. You can upload multiple images to create different pages.
                </p>
              </div>
              <div className="w-full md:w-1/2 bg-blue-100 h-60 rounded-xl flex items-center justify-center">
                <Icons.Image />
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
              <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-md">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">LLAMA AI Generates Code</h3>
                <p className="text-gray-600">
                  Our powerful LLAMA AI analyzes the images and generates clean, responsive HTML, CSS, and JavaScript code for each page.
                </p>
              </div>
              <div className="w-full md:w-1/2 bg-blue-100 h-60 rounded-xl flex items-center justify-center">
                <Icons.Code />
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="w-full md:w-1/2 bg-white p-6 rounded-xl shadow-md">
                <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-4 text-gray-900">Edit in IDE & Chat with AI</h3>
                <p className="text-gray-600">
                  Use our VS Code-like IDE to edit your website. Chat with LLAMA AI to make changes, add features, or get help with your code.
                </p>
              </div>
              <div className="w-full md:w-1/2 bg-blue-100 h-60 rounded-xl flex items-center justify-center">
                <Icons.Chat />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Build Your Website?
          </h2>
          <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto">
            Start with a new project in our IDE or upload images to generate code. LLAMA AI is ready to assist you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={goToNewProject}
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg text-lg font-medium"
            >
              Start New Project
            </button>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 hover:bg-blue-700 text-white border border-white px-8 py-4 rounded-lg text-lg font-medium"
            >
              Upload Images
            </button>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-blue-400">LLAMA</span>
                <span className="text-xl">Website Builder</span>
              </div>
              <p className="mt-2 text-gray-400">
                Build amazing websites with AI assistance
              </p>
            </div>
            <div className="flex gap-8">
              <div>
                <h4 className="font-semibold mb-3">Features</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Image to Code</li>
                  <li>Multi-Page Websites</li>
                  <li>AI Code Assistant</li>
                  <li>VS Code-like IDE</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Resources</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>Documentation</li>
                  <li>API Reference</li>
                  <li>Examples</li>
                  <li>Support</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-500">
            <p>© {new Date().getFullYear()} LLAMA Website Builder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 
