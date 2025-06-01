'use client';

import { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import ChatPanel from './ChatPanel';
import { 
  saveContext, 
  getContextList, 
  getContextById, 
  deleteContext, 
  updateContext, 
  IDEContext, 
  getCodeAndChatState,
  saveCodeAndChatState,
  ChatMessage
} from '../utils/contextManager';

// Icons for the chat panel header
const Icons = {
  Revert: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
  Clear: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
};

// Types
import type { FileNode } from './FileExplorer';

interface IDELayoutProps {
  initialHtml?: string;
}

const IDELayout: React.FC<IDELayoutProps> = ({ initialHtml = '' }) => {
  // State for files
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);
  
  // State for chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'system-welcome',
    content: 'Welcome to the AI code assistant. Ask about the current code, request modifications, or ask for help.',
    type: 'system',
    timestamp: new Date()
  }]);
  
  // State to check if we can revert
  const [canRevert, setCanRevert] = useState(false);
  
  // State for context management
  const [showContextModal, setShowContextModal] = useState(false);
  const [savedContexts, setSavedContexts] = useState<IDEContext[]>([]);
  const [contextName, setContextName] = useState('');
  const [showContextListModal, setShowContextListModal] = useState(false);
  
  // Load saved contexts on mount
  useEffect(() => {
    setSavedContexts(getContextList());
    
    // Try to load previously saved state
    const savedState = getCodeAndChatState();
    if (savedState && savedState.files.length > 0) {
      // Only restore from saved state if we don't have initial HTML provided
      if (!initialHtml || files.length === 0) {
        setFiles(savedState.files);
        setActiveFileId(savedState.activeFileId);
        setActiveFile(savedState.files.find(file => file.id === savedState.activeFileId) || null);
        
        // Restore chat messages
        if (savedState.chatMessages && savedState.chatMessages.length > 0) {
          setChatMessages(savedState.chatMessages);
        }
      }
    }
  }, [initialHtml]);
  
  // Auto-save whenever files or chat messages change
  useEffect(() => {
    if (files.length > 0 && chatMessages.length > 0) {
      saveCodeAndChatState(files, activeFileId, chatMessages);
    }
  }, [files, activeFileId, chatMessages]);
  
  // Generate a unique ID
  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Handle saving current context
  const handleSaveContext = () => {
    if (files.length === 0) return;
    
    const savedContext = saveContext(files, activeFileId, contextName || undefined);
    setSavedContexts(prev => [savedContext, ...prev.filter(ctx => ctx.id !== savedContext.id)]);
    setContextName('');
    setShowContextModal(false);
  };
  
  // Handle loading a saved context
  const handleLoadContext = (contextId: string) => {
    const context = getContextById(contextId);
    if (!context) return;
    
    setFiles(context.files);
    setActiveFileId(context.activeFileId);
    const activeFile = context.files.find(file => file.id === context.activeFileId) || null;
    setActiveFile(activeFile);
    setShowContextListModal(false);
  };
  
  // Handle deleting a saved context
  const handleDeleteContext = (contextId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the list item
    deleteContext(contextId);
    setSavedContexts(prev => prev.filter(ctx => ctx.id !== contextId));
  };
  
  // Handle reverting to a previous state
  const handleRevertState = (stateToRevert: {
    files: FileNode[];
    activeFileId: string | null;
    messages: ChatMessage[];
  }) => {
    if (stateToRevert.files && stateToRevert.files.length > 0) {
      setFiles(stateToRevert.files);
      setActiveFileId(stateToRevert.activeFileId);
      setActiveFile(stateToRevert.files.find(file => file.id === stateToRevert.activeFileId) || null);
      setChatMessages(stateToRevert.messages);
    }
  };
  
  // Button handler for revert
  const handleRevertClick = () => {
    const savedState = getCodeAndChatState();
    if (savedState) {
      handleRevertState({
        files: savedState.files,
        activeFileId: savedState.activeFileId,
        messages: savedState.chatMessages
      });
    }
  };
  
  // Handle chat message updates
  const handleChatMessagesUpdate = (messages: ChatMessage[]) => {
    setChatMessages(messages);
  };
  
  // Initialize with default files if provided initialHtml
  useEffect(() => {
    if (initialHtml) {
      const fileId = generateUniqueId();
      const newFile: FileNode = {
        id: fileId,
        name: 'index.html',
        type: 'file',
        content: initialHtml,
        language: 'html',
        dateCreated: new Date()
      };
      
      setFiles([newFile]);
      setActiveFileId(fileId);
      setActiveFile(newFile);
    }
  }, [initialHtml]);
  
  // Show welcome banner
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(true);
  
  // Close welcome banner
  const closeBanner = () => {
    setShowWelcomeBanner(false);
    // Save to localStorage so it doesn't show again
    localStorage.setItem('ide-welcome-banner-closed', 'true');
  };
  
  // Check if banner should be shown
  useEffect(() => {
    const isClosed = localStorage.getItem('ide-welcome-banner-closed') === 'true';
    setShowWelcomeBanner(!isClosed);
  }, []);
  
  // Handle file selection
  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setActiveFileId(file.id);
      setActiveFile(file);
    }
  };
  
  // Handle code changes
  const handleCodeChange = (newCode: string) => {
    if (activeFileId) {
      // Update the file content
      const updatedFiles = files.map(file => 
        file.id === activeFileId
          ? { ...file, content: newCode }
          : file
      );
      
      setFiles(updatedFiles);
      
      // Also update activeFile
      if (activeFile) {
        const updatedActiveFile = { ...activeFile, content: newCode };
        setActiveFile(updatedActiveFile);
      }
      
      // Auto-save will happen via the useEffect
    }
  };
  
  // Create new file
  const handleCreateNewFile = () => {
    const fileId = generateUniqueId();
    const newFile: FileNode = {
      id: fileId,
      name: `new-file-${files.length + 1}.html`,
      type: 'file',
      content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Page</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div class="container mx-auto p-4">\n    <h1 class="text-2xl font-bold">Hello World</h1>\n    <p>Start editing this file</p>\n  </div>\n</body>\n</html>',
      language: 'html',
      dateCreated: new Date()
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(fileId);
    setActiveFile(newFile);
  };
  
  // Show file creation dialog
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  // Create file with specific type
  const createFileWithType = (type: 'html' | 'css' | 'js') => {
    const fileId = generateUniqueId();
    let content = '';
    let name = '';
    
    switch (type) {
      case 'html':
        name = `page-${files.length + 1}.html`;
        content = '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Page</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div class="container mx-auto p-4">\n    <h1 class="text-2xl font-bold">Hello World</h1>\n    <p>Start editing this file</p>\n  </div>\n</body>\n</html>';
        break;
      case 'css':
        name = `styles-${files.length + 1}.css`;
        content = '/* Main Styles */\nbody {\n  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  line-height: 1.5;\n  color: #333;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 1rem;\n}\n\nh1, h2, h3 {\n  margin-top: 2rem;\n  margin-bottom: 1rem;\n}\n\np {\n  margin-bottom: 1rem;\n}';
        break;
      case 'js':
        name = `script-${files.length + 1}.js`;
        content = '// JavaScript functionality\n\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Document loaded and ready!");\n  \n  // Get elements\n  const headings = document.querySelectorAll("h1, h2, h3");\n  \n  // Do something with them\n  headings.forEach(heading => {\n    heading.addEventListener("click", () => {\n      heading.classList.toggle("text-blue-600");\n    });\n    \n    console.log(`Found heading: ${heading.textContent}`);\n  });\n});';
        break;
    }
    
    const newFile: FileNode = {
      id: fileId,
      name,
      type: 'file',
      content,
      language: type,
      dateCreated: new Date()
    };
    
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(fileId);
    setActiveFile(newFile);
    setShowCreateDialog(false);
  };
  
  // Handle AI chat
  const handleSendMessage = async (message: string) => {
    try {
      // This function is now simplified since the ChatPanel handles the actual API call
      // But we keep it for compatibility with other components that might use it
      
      // Build context with information about all files
      let contextInfo: any = {};
      
      if (activeFile?.content) {
        // Add current file context
        contextInfo.currentFile = {
          name: activeFile.name,
          language: activeFile.language,
          content: activeFile.content
        };
        
        // Add information about other files in the project
        if (files.length > 1) {
          contextInfo.projectFiles = files.map(file => ({
            name: file.name,
            language: file.language,
            isActive: file.id === activeFileId
          }));
          
          // Add relationships between files (e.g., HTML files linking to CSS/JS)
          const fileRelationships: Array<{
            htmlFile: string;
            linkedCssFiles: string[];
            linkedJsFiles: string[];
          }> = [];
          const htmlFiles = files.filter(f => f.language === 'html');
          const cssFiles = files.filter(f => f.language === 'css');
          const jsFiles = files.filter(f => f.language === 'js');
          
          if (htmlFiles.length && (cssFiles.length || jsFiles.length)) {
            for (const htmlFile of htmlFiles) {
              const relationships = {
                htmlFile: htmlFile.name,
                linkedCssFiles: [] as string[],
                linkedJsFiles: [] as string[]
              };
              
              // Check for CSS links in HTML
              for (const cssFile of cssFiles) {
                if (htmlFile.content?.includes(cssFile.name)) {
                  relationships.linkedCssFiles.push(cssFile.name);
                }
              }
              
              // Check for JS links in HTML
              for (const jsFile of jsFiles) {
                if (htmlFile.content?.includes(jsFile.name)) {
                  relationships.linkedJsFiles.push(jsFile.name);
                }
              }
              
              fileRelationships.push(relationships);
            }
            
            contextInfo.fileRelationships = fileRelationships;
          }
        }
      }
      
      // Add information about saved contexts (just metadata, not content)
      const contexts = getContextList();
      if (contexts.length > 0) {
        contextInfo.savedContexts = contexts.map(ctx => ({
          id: ctx.id,
          name: ctx.name,
          timestamp: ctx.timestamp,
          fileCount: ctx.files.length,
        }));
      }
      
      // Call the chat API directly
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: message }],
          context: contextInfo
        }),
      });
      
      return await response.json();
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  };
  
  // Handle applying HTML changes from chat
  const handleApplyHtml = (html: string) => {
    if (activeFileId && activeFile) {
      handleCodeChange(html);
    }
  };
  
  // Handle creating a new project with image upload
  const handleNewFromImage = () => {
    // Redirect to the image upload page
    window.location.href = '/';
  };
  
  // Image upload and prompt state
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [pageName, setPageName] = useState('index');
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationTotal, setGenerationTotal] = useState(0);
  
  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      
      // If we're uploading just one image at a time, replace selection instead of adding
      setSelectedImages(newFiles);
      
      // Create preview for the first image
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
          setImagePreviewIndex(0);
        }
      };
      reader.readAsDataURL(newFiles[0]);
    }
  };
  
  // Remove image from selection
  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    
    // Update preview if needed
    if (selectedImages.length > 1) {
      if (index === imagePreviewIndex) {
        // Show the next image, or previous if removing the last
        const newIndex = index === selectedImages.length - 1 ? index - 1 : index;
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setImagePreview(e.target.result as string);
            setImagePreviewIndex(newIndex);
          }
        };
        reader.readAsDataURL(selectedImages[newIndex]);
      } else if (index < imagePreviewIndex) {
        // Adjust preview index if removing an image before the current preview
        setImagePreviewIndex(imagePreviewIndex - 1);
      }
    } else {
      // No more images
      setImagePreview(null);
      setImagePreviewIndex(0);
    }
  };
  
  // Change preview image
  const previewImage = (index: number) => {
    if (index >= 0 && index < selectedImages.length) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImagePreview(e.target.result as string);
          setImagePreviewIndex(index);
        }
      };
      reader.readAsDataURL(selectedImages[index]);
    }
  };
  
  // Handle drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      
      if (newFiles.length > 0) {
        setSelectedImages(prev => [...prev, ...newFiles]);
        
        // Create preview for the first image if no preview exists
        if (!imagePreview) {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              setImagePreview(e.target.result as string);
              setImagePreviewIndex(0);
            }
          };
          reader.readAsDataURL(newFiles[0]);
        }
      }
    }
  };
  
  // Handle image upload and code generation
  const handleImageGeneration = async () => {
    if (selectedImages.length === 0) return;
    
    setIsGeneratingFromImage(true);
    setGenerationProgress(0);
    setGenerationTotal(selectedImages.length);
    
    try {
      // Process each image to generate a new page
      const newFiles: FileNode[] = [...files]; // Start with existing files
      
      // Check if this is a new user (only has default template file or no files)
      const isNewUser = files.length === 0 || 
        (files.length === 1 && 
         files[0].name === 'index.html' && 
         files[0].content?.includes('Welcome to the IDE'));
      
      // Count existing index pages to determine numbering
      const existingIndexPages = files
        .filter(file => file.type === 'file' && file.language === 'html')
        .map(file => file.name)
        .filter(name => name.startsWith('index') || name === 'index.html');
      
      // Base index number for new pages
      let indexCounter = existingIndexPages.length;
      
      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        setGenerationProgress(i + 1);
        
        // For new users with no content, overwrite the index.html
        // For existing users who have generated content, create new pages
        let pageFileName;
        if (isNewUser && i === 0) {
          pageFileName = 'index';
          
          // Remove the default template file if it exists
          const defaultIndexFileIndex = newFiles.findIndex(
            file => file.name === 'index.html' && file.content?.includes('Welcome to the IDE')
          );
          
          if (defaultIndexFileIndex !== -1) {
            newFiles.splice(defaultIndexFileIndex, 1);
          }
        } else {
          // For users with existing content or additional images, create new pages
          pageFileName = `index-${indexCounter + 1}`;
          indexCounter++;
        }
        
        // Create custom prompt for the image
        let pagePrompt = promptText || 'Create a responsive page with Tailwind CSS';
        
        // Create FormData with the image and prompt
        const formData = new FormData();
        formData.append('image', image);
        formData.append('prompt', pagePrompt);
        
        // Send to the API
        const response = await fetch('/api/generate-html', {
          method: 'POST',
          body: formData,
        });
        
        const result = await response.json();
        
        if (result.success) {
          // Create HTML file
          const htmlId = generateUniqueId();
          const htmlFile: FileNode = {
            id: htmlId,
            name: `${pageFileName}.html`,
            type: 'file',
            content: result.html,
            language: 'html',
            dateCreated: new Date()
          };
          
          newFiles.push(htmlFile);
          
          // Set as active file
          setActiveFileId(htmlId);
          setActiveFile(htmlFile);
          
          // Create CSS file if there's CSS content
          if (result.css) {
            const cssId = generateUniqueId();
            const cssFileName = `${pageFileName}-styles`;
            const cssFile: FileNode = {
              id: cssId,
              name: `${cssFileName}.css`,
              type: 'file',
              content: result.css,
              language: 'css',
              dateCreated: new Date()
            };
            
            newFiles.push(cssFile);
          }
          
          // Create JS file if there's JS content
          if (result.js) {
            const jsId = generateUniqueId();
            const jsFileName = `${pageFileName}-script`;
            const jsFile: FileNode = {
              id: jsId,
              name: `${jsFileName}.js`,
              type: 'file',
              content: result.js,
              language: 'js',
              dateCreated: new Date()
            };
            
            newFiles.push(jsFile);
          }
        } else {
          throw new Error(result.error || `Failed to generate code from image ${i+1}`);
        }
      }
      
      // Update files with all new files
      setFiles(newFiles);
      setShowImageUploadModal(false);
      
      // Reset upload state
      setSelectedImages([]);
      setImagePreview(null);
      setImagePreviewIndex(0);
      setPromptText('');
      setPageName('index');
      
      // Add a message to the chat about the new page creation
      const message = isNewUser ? 
        `Created your website from the image. You can edit it now.` :
        `Added ${selectedImages.length} new page(s) to your project. You can edit and preview them now.`;
        
      const newMessage: ChatMessage = {
        id: `system-${Date.now()}`,
        content: message,
        type: 'system',
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, newMessage]);
    } catch (error) {
      console.error('Failed to generate from image:', error);
      alert('Failed to generate code from image. Please try again.');
    } finally {
      setIsGeneratingFromImage(false);
    }
  };
  
  // Check if we have multiple HTML files to enable navigation
  const hasMultiplePages = files.filter(f => f.language === 'html').length > 1;
  
  // Navigation between pages
  const navigateToPage = (pageFile: FileNode) => {
    setActiveFileId(pageFile.id);
    setActiveFile(pageFile);
  };
  
  // Get all HTML files for navigation
  const htmlFiles = files.filter(f => f.type === 'file' && f.language === 'html');
  
  // Preview the current file in a new tab
  const handlePreview = () => {
    if (!activeFile?.content) return;
    
    const blob = new Blob([activeFile.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  
  // Preview all HTML files in a combined view
  const handleMultiPagePreview = () => {
    if (htmlFiles.length === 0) return;
    
    // Create a combined HTML file with navigation between pages
    const htmlHead = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multi-Page Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .page-section {
      min-height: 100vh;
      position: relative;
      border-bottom: 4px solid #3B82F6;
      padding-bottom: 2rem;
    }
    .page-indicator {
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      z-index: 1000;
    }
    .page-nav {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 8px 16px;
      border-radius: 50px;
      z-index: 1000;
      display: flex;
      gap: 8px;
    }
    .page-nav a {
      color: white;
      text-decoration: none;
      padding: 4px 12px;
      border-radius: 20px;
      transition: all 0.2s;
    }
    .page-nav a:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  </style>
</head>
<body>
  <div class="page-indicator">
    ${htmlFiles.length} Pages Combined
  </div>
  <div class="page-nav">
    ${htmlFiles.map((file, index) => 
      `<a href="#page-${index}">${file.name.replace('.html', '')}</a>`
    ).join('')}
  </div>`;
    
    const htmlSections = htmlFiles.map((file, index) => {
      // Extract the body content to avoid duplicate HTML structure
      const bodyContent = file.content?.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || file.content;
      
      return `
  <section class="page-section" id="page-${index}">
    <div class="bg-blue-100 text-blue-800 p-2 text-sm sticky top-0 z-10">
      Page: ${file.name}
    </div>
    ${bodyContent}
  </section>`;
    }).join('\n');
    
    const htmlFooter = `
</body>
</html>`;
    
    const combinedHtml = htmlHead + htmlSections + htmlFooter;
    
    // Create a blob and open in new tab
    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    
    // Clean up the URL after a delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  
  // Clear chat messages
  const handleClearMessages = () => {
    // Keep only the system welcome message
    const welcomeMessage = chatMessages.find(msg => msg.id === 'system-welcome');
    if (welcomeMessage) {
      setChatMessages([welcomeMessage]);
    } else {
      // Create a new welcome message if it doesn't exist
      const newWelcomeMessage: ChatMessage = {
        id: 'system-welcome',
        content: 'Welcome to the AI code assistant. Ask about the current code, request modifications, or ask for help.',
        type: 'system',
        timestamp: new Date()
      };
      setChatMessages([newWelcomeMessage]);
    }
  };
  
  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <div className="bg-gray-900 border-b border-gray-700 p-2 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-gray-100 font-semibold ml-2">LLAMA Website Builder</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowCreateDialog(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white text-sm py-1 px-3 rounded flex items-center gap-1"
          >
            New File
          </button>
          {activeFile && (
            <button 
              onClick={handlePreview}
              className="bg-green-600 hover:bg-green-700 text-white text-sm py-1 px-3 rounded flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
          )}
          {htmlFiles.length > 1 && (
            <button 
              onClick={handleMultiPagePreview}
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm py-1 px-3 rounded flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z M9 3v2 M15 3v2 M9 21v-2 M15 21v-2 M3 9h2 M3 15h2 M21 9h-2 M21 15h-2" />
              </svg>
              Preview All Pages
            </button>
          )}
        </div>
      </div>
      
      {/* Save Context Modal */}
      {showContextModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
            <h3 className="text-lg font-semibold mb-4">Save Current Context</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Context Name
                </label>
                <input
                  type="text"
                  value={contextName}
                  onChange={(e) => setContextName(e.target.value)}
                  placeholder="e.g., 'Landing Page Design', 'Multi-page Site'"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-white"
                />
              </div>
              
              <div className="text-sm text-gray-400">
                <p>This will save your current:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>All files ({files.length} files)</li>
                  <li>Current active file</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowContextModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveContext}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
              >
                Save Context
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Context List Modal */}
      {showContextListModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[500px] max-h-[600px] text-white flex flex-col">
            <h3 className="text-lg font-semibold mb-4">Saved Contexts</h3>
            
            <div className="flex-1 overflow-y-auto">
              {savedContexts.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p>No saved contexts found</p>
                  <p className="text-sm mt-1">Save your current work to restore it later</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedContexts.map(context => (
                    <div 
                      key={context.id}
                      onClick={() => handleLoadContext(context.id)}
                      className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg cursor-pointer flex justify-between items-start"
                    >
                      <div>
                        <div className="font-medium">{context.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(context.timestamp).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {context.files.length} files
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleDeleteContext(context.id, e)}
                          className="text-red-400 hover:text-red-300 p-1"
                          title="Delete context"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowContextListModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* File Creation Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96 text-white">
            <h3 className="text-lg font-semibold mb-4">Create New File</h3>
            <div className="space-y-3">
              <button
                onClick={() => createFileWithType('html')}
                className="w-full flex items-center p-3 bg-blue-700 hover:bg-blue-600 rounded transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                <span>HTML File</span>
              </button>
              
              <button
                onClick={() => createFileWithType('css')}
                className="w-full flex items-center p-3 bg-pink-700 hover:bg-pink-600 rounded transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
                </svg>
                <span>CSS File</span>
              </button>
              
              <button
                onClick={() => createFileWithType('js')}
                className="w-full flex items-center p-3 bg-yellow-700 hover:bg-yellow-600 rounded transition-colors"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>JavaScript File</span>
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowCreateDialog(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-[500px] text-white">
            <h3 className="text-lg font-semibold mb-4">Generate Code from Image</h3>
            
            <div className="space-y-4">
              {/* Image Upload Area */}
              <div 
                className="border-2 border-dashed border-gray-500 rounded-lg p-4 text-center"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-48 mx-auto object-contain rounded"
                    />
                    <button 
                      onClick={() => {
                        setSelectedImages([]);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 bg-red-600 rounded-full p-1 text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    
                    {/* Multiple images indicator */}
                    {selectedImages.length > 1 && (
                      <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                        <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded flex items-center gap-2">
                          {selectedImages.map((_, idx) => (
                            <button 
                              key={idx}
                              onClick={() => previewImage(idx)}
                              className={`w-2 h-2 rounded-full ${idx === imagePreviewIndex ? 'bg-white' : 'bg-gray-500'}`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mb-2">Drag & drop images or click to browse</p>
                    <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded inline-block">
                      Choose Images
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handleImageSelect}
                        multiple
                      />
                    </label>
                    <p className="text-xs text-gray-400 mt-2">
                      Upload multiple images to create multiple pages
                    </p>
                  </>
                )}
              </div>
              
              {/* Selected Images Counter */}
              {selectedImages.length > 0 && (
                <div className="mt-3 bg-gray-900 p-2 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-300">
                      {selectedImages.length} {selectedImages.length === 1 ? 'image' : 'images'} selected
                    </span>
                    <button 
                      onClick={() => {
                        setSelectedImages([]);
                        setImagePreview(null);
                      }}
                      className="text-xs text-gray-400 hover:text-red-400"
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-400 mt-2">
                    {files.length <= 1 && files.some(file => file.content?.includes('Welcome to the IDE')) ? 
                      "Your first upload will create the main index.html page." : 
                      "Pages will be named: index-2.html, index-3.html, etc."}
                  </p>
                </div>
              )}
              
              {/* Prompt Text Area */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Optional Prompt (Instructions for the AI)
                </label>
                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  placeholder="E.g., 'Generate a responsive landing page with Tailwind CSS and a contact form'"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-sm text-white"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setShowImageUploadModal(false)}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleImageGeneration}
                disabled={!selectedImages || isGeneratingFromImage}
                className={`px-4 py-2 rounded flex items-center gap-2 ${
                  !selectedImages || isGeneratingFromImage
                    ? 'bg-blue-800 opacity-50 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isGeneratingFromImage ? (
                  <>
                    <div className="flex flex-col items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Generating {generationProgress} of {generationTotal}...</span>
                      
                      {/* Progress bar */}
                      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mt-2">
                        <div 
                          className="h-full bg-blue-600"
                          style={{ 
                            width: `${(generationProgress / generationTotal) * 100}%`,
                            transition: 'width 0.3s ease-in-out' 
                          }}
                        ></div>
                      </div>
                    </div>
                  </>
                ) : (
                  <span>Generate Code</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <div className="bg-blue-900 bg-opacity-70 text-white p-3 relative">
          <button 
            onClick={closeBanner}
            className="absolute right-3 top-3 text-white hover:text-blue-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="max-w-4xl mx-auto">
            <h3 className="font-semibold text-lg mb-2">Welcome to the LLAMA Website Builder IDE!</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">File Explorer (Left)</h4>
                <p className="text-blue-200 text-xs">Browse and manage your files. Click on a file to edit it.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Code Editor (Middle)</h4>
                <p className="text-blue-200 text-xs">Edit your HTML, CSS, and JavaScript files with syntax highlighting.</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">AI Assistant (Right)</h4>
                <p className="text-blue-200 text-xs">Ask the LLAMA AI to help modify your code or answer questions.</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-200">
              Tip: Try the "Generate from Image" button to create a website from a screenshot, or ask the AI to "Add a navigation bar" to your code!
            </p>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer (Left Panel) */}
        <div className="w-64 border-r border-gray-700">
          <FileExplorer 
            files={files} 
            activeFileId={activeFileId} 
            onFileSelect={handleFileSelect}
            onCreateNewFile={handleCreateNewFile}
          />
        </div>
        
        {/* Code Editor (Middle Panel) */}
        <div className="flex-1 flex flex-col">
          {/* Page Navigation */}
          {hasMultiplePages && (
            <div className="bg-gray-800 border-b border-gray-700 p-2 overflow-x-auto">
              <div className="flex gap-2">
                {htmlFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => navigateToPage(file)}
                    className={`px-3 py-1 text-xs rounded ${
                      activeFileId === file.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {file.name.replace('.html', '')}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeFile ? (
            <CodeEditor 
              code={activeFile.content || ''} 
              language={activeFile.language || 'html'} 
              fileName={activeFile.name}
              onChange={handleCodeChange}
            />
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-800 text-gray-400">
              <div className="text-center max-w-md p-6">
                <h3 className="text-xl font-semibold mb-2">No file selected</h3>
                <p className="mb-4">Select a file from the explorer or create a new one to start editing.</p>
                <button 
                  onClick={handleCreateNewFile}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
                >
                  Create New File
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Chat Panel (Right Panel) */}
        <div className="w-96">
          <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700">
            {/* Chat Header */}
            <div className="p-3 border-b border-gray-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-200">AI Assistant</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowImageUploadModal(true)}
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                  title="Generate from Image"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                {canRevert && (
                  <button 
                    onClick={handleRevertClick} 
                    className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                    title="Revert to previous state"
                  >
                    <Icons.Revert />
                  </button>
                )}
                <button 
                  onClick={handleClearMessages} 
                  className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
                  title="Clear conversation"
                >
                  <Icons.Clear />
                </button>
              </div>
            </div>
            
            <ChatPanel 
              currentFileContent={activeFile?.content}
              files={files}
              activeFileId={activeFileId}
              onApplyHtml={handleApplyHtml}
              onSendMessage={handleSendMessage}
              onRevertState={handleRevertState}
              messages={chatMessages}
              onMessagesUpdate={handleChatMessagesUpdate}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IDELayout; 