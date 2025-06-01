'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { getContextList, IDEContext, saveCodeAndChatState, getCodeAndChatState, ChatMessage } from '../utils/contextManager';
import { formatCodeModificationMessage, getCodeModificationSystemPrompt, extractCodeFromResponse, processGeneratedHtml } from '../utils/codeModifier';
import VoiceAgent from './VoiceAgent';

// Icons for the chat panel
const Icons = {
  Send: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Loading: () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
  ),
  User: () => (
    <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">
      U
    </div>
  ),
  AI: () => (
    <div className="bg-emerald-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">
      AI
    </div>
  ),
  System: () => (
    <div className="bg-yellow-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm">
      S
    </div>
  ),
  Clear: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Apply: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Revert: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  ),
  ModifyCode: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Chat: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Voice: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  )
};

interface Message extends ChatMessage {
  isLoading?: boolean;
}

interface ChatPanelProps {
  currentFileContent?: string;
  files: any[];
  activeFileId: string | null;
  onApplyHtml: (html: string) => void;
  onSendMessage: (message: string) => Promise<any>;
  onRevertState: (stateToRevert: {
    files: any[];
    activeFileId: string | null;
    messages: Message[];
  }) => void;
  messages: Message[];
  onMessagesUpdate: (messages: Message[]) => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  currentFileContent, 
  files,
  activeFileId,
  onApplyHtml, 
  onSendMessage,
  onRevertState,
  messages,
  onMessagesUpdate
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [savedContexts, setSavedContexts] = useState<IDEContext[]>([]);
  const [canRevert, setCanRevert] = useState(false);
  
  // Mode switching (chat vs code modification)
  const [modifyMode, setModifyMode] = useState(false);
  const [promptPlaceholder, setPromptPlaceholder] = useState('Ask about code or request changes...');
  
  // Voice agent state
  const [isVoiceAgentListening, setIsVoiceAgentListening] = useState(false);
  const [showVoiceAgent, setShowVoiceAgent] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use a more reliable scrolling method
      const scrollContainer = messagesEndRef.current.parentElement;
      if (scrollContainer) {
        // Store scroll position before update
        const isAtBottom = scrollContainer.scrollHeight - scrollContainer.scrollTop <= scrollContainer.clientHeight + 100;
        
        // Only auto-scroll if user was already at the bottom
        if (isAtBottom) {
          // Delay scroll slightly to ensure content is rendered
          setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }, 100);
        }
      }
    }
  }, [messages]);
  
  // Prevent scroll jumps when code blocks expand
  const handleCodeBlockExpand = useCallback((event: React.MouseEvent) => {
    // Prevent scroll jumps when clicking on code blocks
    event.stopPropagation();
    
    // Store current scroll position
    const messagesContainer = messagesEndRef.current?.parentElement;
    if (messagesContainer) {
      const scrollTop = messagesContainer.scrollTop;
      
      // After DOM updates, restore scroll position
      setTimeout(() => {
        messagesContainer.scrollTop = scrollTop;
      }, 10);
    }
  }, []);
  
  // Log messages for debugging when they change
  useEffect(() => {
    if (messages.length > 0) {
      console.log(`Rendering ${messages.length} messages`);
    }
  }, [messages]);
  
  // Update placeholder based on mode
  useEffect(() => {
    if (modifyMode) {
      setPromptPlaceholder('Describe the changes you want to make to the current file...');
    } else {
      setPromptPlaceholder('Ask about code or request changes...');
    }
  }, [modifyMode]);
  
  // Load saved contexts on mount
  useEffect(() => {
    setSavedContexts(getContextList());
    
    // Check if we can revert
    const savedState = getCodeAndChatState();
    if (savedState) {
      setCanRevert(true);
    }
  }, []);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);
  
  // Handle reverting to the previous state
  const handleRevert = () => {
    const savedState = getCodeAndChatState();
    if (savedState) {
      onRevertState({
        files: savedState.files,
        activeFileId: savedState.activeFileId,
        messages: savedState.chatMessages as Message[]
      });
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: inputValue,
      type: 'user',
      timestamp: new Date()
    };
    
    const loadingMessage: Message = {
      id: `assistant-${Date.now()}`,
      content: 'Thinking...',
      type: 'assistant',
      timestamp: new Date(),
      isLoading: true
    };
    
    // Update messages through the parent component
    onMessagesUpdate([...messages, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      // Handle differently based on mode
      let response;
      
      if (modifyMode && currentFileContent) {
        // Get the active file's language
        const activeFile = files.find(f => f.id === activeFileId);
        const language = activeFile?.language || 'html';
        
        // Format as a code modification request with the current file content
        const modificationMessage = formatCodeModificationMessage(inputValue, currentFileContent, language);
        
        // Get a system prompt specific to code modification
        const systemPrompt = getCodeModificationSystemPrompt(language);
        
        // Send the modification request
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: systemPrompt },
              modificationMessage
            ],
          }),
        });
      } else {
        // Include saved contexts information in the request
        // Note: We're only sending metadata about contexts, not the full content
        // to avoid making the request too large
        const contextsMetadata = savedContexts.map(ctx => ({
          id: ctx.id,
          name: ctx.name,
          timestamp: ctx.timestamp,
          fileCount: ctx.files.length,
        }));
        
        // Get the active file for context
        const currentActiveFile = files.find(f => f.id === activeFileId);
        
        // Regular chat message
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [{ role: 'user', content: inputValue }],
            context: {
              currentFile: currentActiveFile?.content ? {
                name: currentActiveFile.name,
                language: currentActiveFile.language,
                content: currentActiveFile.content
              } : undefined,
              savedContexts: contextsMetadata
            }
          }),
        });
      }
      
      const result = await response.json();
      
      // Debug information
      console.log("API response:", {
        success: result.success,
        hasMessage: !!result.message,
        messageLength: result.message ? result.message.length : 0,
        hasGeneratedHtml: !!result.generatedHtml,
        hasHtmlSuggestion: !!(result.message && result.message.includes('```html')),
      });
      
      // Process the response
      if (result.message) {
        // Always check for code in the response, whether in modify mode or not
        const extracted = extractCodeFromResponse(result.message);
        
        // Debug the extracted code
        console.log("Extracted code:", {
          hasHtml: !!extracted.html,
          hasCss: !!extracted.css,
          hasJs: !!extracted.js,
          hasExplanation: !!extracted.explanation
        });
        
        // If we have HTML, process it with SVG logos and favicon
        if (extracted.html) {
          const processedHtml = processGeneratedHtml(extracted.html);
          result.generatedHtml = processedHtml;
        } else if (result.generatedHtml) {
          // If the API already extracted HTML, make sure it's processed
          result.generatedHtml = processGeneratedHtml(result.generatedHtml);
        }
        
        // Also check for CSS or JS
        if (extracted.css || extracted.js) {
          console.log('Found CSS or JS in response:', { 
            hasCss: !!extracted.css, 
            hasJs: !!extracted.js 
          });
          // In the future, we could handle CSS and JS application here
        }
        
        // Log debug info
        console.log('Response processed:', { 
          hasMessage: !!result.message, 
          hasHtml: !!result.generatedHtml,
          extractedCodeTypes: Object.keys(extracted).filter(k => !!extracted[k as keyof typeof extracted])
        });
      } else {
        console.warn('Response has no message content');
      }
      
      // Create updated messages array with the response
      const newMessages = [...messages];
      const loadingMessageIndex = newMessages.findIndex(msg => msg.id === loadingMessage.id);
      
      if (loadingMessageIndex !== -1) {
        // Check for empty or undefined response content
        if (!result.message || result.message.trim() === '') {
          console.warn('Received empty message from API');
          result.message = "I'm sorry, but I didn't receive a valid response. Please try again.";
        }
        
        // Make sure the message content is visible in the chat
        newMessages[loadingMessageIndex] = {
          ...newMessages[loadingMessageIndex],
          content: result.message,
          isLoading: false,
          htmlSuggestion: result.generatedHtml || undefined
        };
        
        // Log for debugging
        console.log(`Updated message at index ${loadingMessageIndex} with content length: ${result.message.length}`);
        
        // Force message rendering by providing a new reference
        onMessagesUpdate([...newMessages]);
      } else {
        console.warn('Could not find loading message to update');
        // Add as a new message if we couldn't find the loading message
        const newAssistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          content: result.message,
          type: 'assistant',
          timestamp: new Date(),
          htmlSuggestion: result.generatedHtml || undefined
        };
        onMessagesUpdate([...messages, newAssistantMessage]);
      }
      
      // Refresh the contexts list after sending a message
      setSavedContexts(getContextList());
      setCanRevert(true);
    } catch (error) {
      // Update the loading message with an error
      console.error('Chat error:', error);
      
      // Customize error message based on error type
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'The request timed out. Please try again.';
        } else if (error.message.includes('api key')) {
          errorMessage = 'API key error. Please make sure your LLAMA_API_KEY is configured correctly.';
        }
      }
      
      const errorMessages = messages.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: errorMessage, 
              isLoading: false 
            } 
          : msg
      );
      onMessagesUpdate(errorMessages);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Add a function to copy text to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // Show a brief notification (could be enhanced with a toast component)
        alert('Code copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  const formatMessageContent = (content: string) => {
    if (!content) return null;
    
    // Debug: Log the raw content for troubleshooting
    console.log("Rendering message content:", content.substring(0, 100) + (content.length > 100 ? "..." : ""));
    
    // First, identify if we have any code blocks
    const hasCodeBlocks = content.includes('```');
    
    if (!hasCodeBlocks) {
      // Simple text without code blocks - render as Markdown-like text
      return (
        <div className="markdown-content whitespace-pre-wrap">
          {content.split('\n').map((line, i) => {
            // Basic Markdown-like formatting
            if (line.startsWith('# ')) {
              return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
            } else if (line.startsWith('## ')) {
              return <h2 key={i} className="text-lg font-bold mt-3 mb-2">{line.substring(3)}</h2>;
            } else if (line.startsWith('### ')) {
              return <h3 key={i} className="text-md font-bold mt-3 mb-1">{line.substring(4)}</h3>;
            } else if (line.startsWith('- ')) {
              return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
            } else if (line.startsWith('1. ')) {
              return <li key={i} className="ml-4 list-decimal">{line.substring(3)}</li>;
            } else if (line.trim() === '') {
              return <div key={i} className="h-2"></div>;
            } else {
              return <div key={i}>{line}</div>;
            }
          })}
        </div>
      );
    }
    
    // We have code blocks - extract them
    // This regex identifies code blocks with or without language specification
    const parts: Array<{type: 'text' | 'code', content: string, language?: string}> = [];
    let currentIndex = 0;
    const regex = /```([a-z]*\n)?([\s\S]*?)```/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      // Add text before the code block
      if (match.index > currentIndex) {
        const textBefore = content.substring(currentIndex, match.index).trim();
        if (textBefore) {
          parts.push({
            type: 'text',
            content: textBefore
          });
        }
      }
      
      // Extract language if specified
      const language = match[1] ? match[1].trim() : 'text';
      const code = match[2] ? match[2].trim() : '';
      
      // Add the code block
      parts.push({
        type: 'code',
        language: language,
        content: code
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last code block
    if (currentIndex < content.length) {
      const textAfter = content.substring(currentIndex).trim();
      if (textAfter) {
        parts.push({
          type: 'text',
          content: textAfter
        });
      }
    }
    
    // Return the formatted content
    return (
      <div className="message-content">
        {parts.map((part, index) => {
          if (part.type === 'text') {
            return (
              <div key={index} className="markdown-content whitespace-pre-wrap mb-4">
                {part.content.split('\n').map((line, i) => {
                  // Basic Markdown-like formatting
                  if (line.startsWith('# ')) {
                    return <h1 key={i} className="text-xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
                  } else if (line.startsWith('## ')) {
                    return <h2 key={i} className="text-lg font-bold mt-3 mb-2">{line.substring(3)}</h2>;
                  } else if (line.startsWith('### ')) {
                    return <h3 key={i} className="text-md font-bold mt-3 mb-1">{line.substring(4)}</h3>;
                  } else if (line.startsWith('- ')) {
                    return <li key={i} className="ml-4 list-disc">{line.substring(2)}</li>;
                  } else if (line.startsWith('1. ')) {
                    return <li key={i} className="ml-4 list-decimal">{line.substring(3)}</li>;
                  } else if (line.trim() === '') {
                    return <div key={i} className="h-2"></div>;
                  } else {
                    return <div key={i}>{line}</div>;
                  }
                })}
              </div>
            );
          } else {
            // Code block with copy and accept buttons
            return (
              <div key={index} className="my-4 rounded-md overflow-hidden border border-gray-700">
                <div className="bg-gray-800 text-xs text-gray-300 py-2 px-3 flex justify-between items-center">
                  <span>{part.language ? part.language.toUpperCase() : 'CODE'}</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => copyToClipboard(part.content)}
                      className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 px-2 py-1 rounded flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </button>
                    {(part.language === 'html' || part.language === 'css' || part.language === 'js' || part.language === 'javascript') && (
                      <button 
                        onClick={() => onApplyHtml(part.content)}
                        className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Apply
                      </button>
                    )}
                  </div>
                </div>
                <pre className="bg-gray-950 p-3 overflow-x-auto">
                  <code className="text-gray-300 text-sm whitespace-pre-wrap">
                    {part.content}
                  </code>
                </pre>
              </div>
            );
          }
        })}
      </div>
    );
  };
  
  const handleClearMessages = () => {
    // Keep only the system welcome message
    const welcomeMessage = messages.find(msg => msg.id === 'system-welcome');
    if (welcomeMessage) {
      onMessagesUpdate([welcomeMessage]);
    } else {
      // Create a new welcome message if it doesn't exist
      const newWelcomeMessage: Message = {
        id: 'system-welcome',
        content: 'Welcome to the AI code assistant. Ask about the current code, request modifications, or ask for help.',
        type: 'system',
        timestamp: new Date()
      };
      onMessagesUpdate([newWelcomeMessage]);
    }
  };
  
  // Toggle between chat and modify modes
  const toggleModifyMode = () => {
    setModifyMode(!modifyMode);
  };
  
  // Toggle voice agent visibility
  const toggleVoiceAgent = useCallback(() => {
    setShowVoiceAgent(prev => {
      // If turning on voice agent, also start listening
      if (!prev) {
        setTimeout(() => setIsVoiceAgentListening(true), 100);
      } else {
        // If turning off, stop listening
        setIsVoiceAgentListening(false);
      }
      return !prev;
    });
  }, []);
  
  // Add keyboard shortcuts for voice agent
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+V to toggle voice agent
      if (e.altKey && e.key === 'v') {
        toggleVoiceAgent();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleVoiceAgent]);
  
  // Handle voice commands
  const handleVoiceCommand = (command: string) => {
    console.log("Voice command received:", command);
    
    // Don't process empty commands
    if (!command || !command.trim()) {
      return;
    }
    
    // Automatically switch to modify mode for code editing commands
    if (!modifyMode && (
      command.toLowerCase().startsWith('modify') || 
      command.toLowerCase().startsWith('add') || 
      command.toLowerCase().startsWith('change') || 
      command.toLowerCase().startsWith('delete')
    )) {
      setModifyMode(true);
    }
    
    // Set the input value to the voice command
    setInputValue(command);
    
    // Create a user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: command,
      type: 'user',
      timestamp: new Date()
    };
    
    // Create a loading message
    const loadingMessage: Message = {
      id: `assistant-${Date.now()}`,
      content: 'Processing voice command...',
      type: 'assistant',
      timestamp: new Date(),
      isLoading: true
    };
    
    // Update messages with a stable reference
    const updatedMessages = [...messages, userMessage, loadingMessage];
    onMessagesUpdate(updatedMessages);
    
    // Process the command after a short delay to allow UI to update
    setTimeout(async () => {
      try {
        setIsLoading(true);
        
        // Handle differently based on mode
        let response;
        
        if (modifyMode && currentFileContent) {
          // Get the active file's language
          const activeFile = files.find(f => f.id === activeFileId);
          const language = activeFile?.language || 'html';
          
          // Format as a code modification request with the current file content
          const modificationMessage = formatCodeModificationMessage(command, currentFileContent, language);
          
          // Get a system prompt specific to code modification
          const systemPrompt = getCodeModificationSystemPrompt(language);
          
          // Send the modification request
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [
                { role: 'system', content: systemPrompt },
                modificationMessage
              ],
            }),
          });
        } else {
          // Include saved contexts information in the request
          const contextsMetadata = savedContexts.map(ctx => ({
            id: ctx.id,
            name: ctx.name,
            timestamp: ctx.timestamp,
            fileCount: ctx.files.length,
          }));
          
          // Get the active file for context
          const currentActiveFile = files.find(f => f.id === activeFileId);
          
          // Regular chat message
          response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: [{ role: 'user', content: command }],
              context: {
                currentFile: currentActiveFile?.content ? {
                  name: currentActiveFile.name,
                  language: currentActiveFile.language,
                  content: currentActiveFile.content
                } : undefined,
                savedContexts: contextsMetadata
              }
            }),
          });
        }
        
        const result = await response.json();
        
        // Process the response
        if (result.message) {
          // Always check for code in the response, whether in modify mode or not
          const extracted = extractCodeFromResponse(result.message);
          
          // If we have HTML, process it with SVG logos and favicon
          if (extracted.html) {
            const processedHtml = processGeneratedHtml(extracted.html);
            result.generatedHtml = processedHtml;
          } else if (result.generatedHtml) {
            // If the API already extracted HTML, make sure it's processed
            result.generatedHtml = processGeneratedHtml(result.generatedHtml);
          }
        }
        
        // Create a new stable reference for the final messages array
        const finalMessages = updatedMessages.map(msg => 
          msg.id === loadingMessage.id 
            ? {
                ...msg,
                content: result.message || "No response received",
                isLoading: false,
                htmlSuggestion: result.generatedHtml
              }
            : msg
        );
        
        // Update messages with the final content
        onMessagesUpdate([...finalMessages]);
        
        // Refresh the contexts list after sending a message
        setSavedContexts(getContextList());
        setCanRevert(true);
      } catch (error) {
        console.error("Error processing voice command:", error);
        
        // Update with error message
        const errorMessages = updatedMessages.map(msg => 
          msg.id === loadingMessage.id 
            ? {
                ...msg,
                content: "Sorry, I encountered an error processing your voice command.",
                isLoading: false
              }
            : msg
        );
        
        onMessagesUpdate([...errorMessages]);
      } finally {
        setIsLoading(false);
        setInputValue('');
      }
    }, 300);
  };

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages" style={{ 
        scrollBehavior: 'smooth', 
        overscrollBehavior: 'contain',
        contain: 'paint layout',
        position: 'relative',
        maxHeight: 'calc(100vh - 220px)'
      }}>
        {messages.map(message => (
          <div key={message.id} className="flex items-start gap-3 message animate-fade-in" data-id={message.id} data-type={message.type}>
            {/* Avatar */}
            <div className="mt-1 flex-shrink-0" style={{ flexBasis: '28px', minWidth: '28px' }}>
              {message.type === 'user' ? <Icons.User /> : 
               message.type === 'system' ? <Icons.System /> : 
               <Icons.AI />}
            </div>
            
            {/* Message Content */}
            <div className="flex-1 message-container" style={{ minWidth: 0 }}>
              <div className={`${
                message.type === 'user' 
                  ? 'bg-gray-700 text-white border-gray-600' 
                  : message.type === 'system'
                  ? 'bg-yellow-900 bg-opacity-30 text-yellow-100 border-yellow-800'
                  : 'bg-gray-900 text-gray-100 border-gray-700'
              } p-4 rounded-lg border shadow-sm`}>
                {message.isLoading ? (
                  <div className="flex items-center gap-2">
                    <Icons.Loading />
                    <span>Thinking...</span>
                  </div>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none break-words">
                    {formatMessageContent(message.content)}
                  </div>
                )}
              </div>
              
              {/* If there's HTML suggestion, show apply button */}
              {message.htmlSuggestion && (
                <div className="mt-3 border border-blue-500 rounded-md bg-blue-900 bg-opacity-20 p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-blue-300 font-medium">HTML Suggestion Available</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(message.htmlSuggestion!)}
                        className="flex items-center gap-1 px-2 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 text-xs"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Copy
                      </button>
                      <button
                        onClick={() => onApplyHtml(message.htmlSuggestion!)}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                      >
                        <Icons.Apply />
                        Apply Changes
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    This suggestion includes HTML modifications that can be applied to your current file.
                  </div>
                  <div className="max-h-32 overflow-y-auto bg-gray-900 rounded p-2">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                      {message.htmlSuggestion.substring(0, 200)}
                      {message.htmlSuggestion.length > 200 ? '...' : ''}
                    </pre>
                  </div>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                <span>{message.timestamp.toLocaleTimeString()}</span>
                {message.type === 'assistant' && !message.isLoading && (
                  <button 
                    onClick={() => copyToClipboard(message.content)}
                    className="text-gray-500 hover:text-gray-300 p-1 -my-1 rounded text-xs flex items-center gap-1"
                    title="Copy message"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="text-xs">Copy</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-4 border-t border-gray-700 bg-gray-850">
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={toggleModifyMode}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
              modifyMode 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={modifyMode ? "Switch to chat mode" : "Switch to code modification mode"}
          >
            {modifyMode ? <Icons.Chat /> : <Icons.ModifyCode />}
            {modifyMode ? 'Chat Mode' : 'Modify Mode'}
          </button>
          
          <button
            onClick={toggleVoiceAgent}
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-md ${
              showVoiceAgent
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            title={showVoiceAgent ? "Hide voice agent" : "Show voice agent"}
          >
            <Icons.Voice />
            Voice Agent
          </button>
          
          {modifyMode && (
            <div className="text-xs text-gray-400">
              Enter instructions to modify the current file
            </div>
          )}
        </div>
        
        {/* Voice Agent */}
        {showVoiceAgent && (
          <div className="mb-3 bg-gray-900 p-3 rounded-md border border-gray-700">
            <VoiceAgent 
              onVoiceCommand={handleVoiceCommand}
              isListening={isVoiceAgentListening}
              setIsListening={setIsVoiceAgentListening}
            />
          </div>
        )}
        
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={promptPlaceholder}
            className={`w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-3 pr-10 resize-none max-h-32 focus:outline-none focus:ring-2 ${
              modifyMode ? 'focus:ring-blue-500 border border-blue-500' : 'focus:ring-gray-500'
            }`}
            rows={1}
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-3 top-3 text-gray-400 hover:text-white p-1 rounded hover:bg-gray-600 disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <Icons.Send />
          </button>
        </div>
        
        {/* Add a small help text at the bottom */}
        
      </div>
      
      {/* Add global CSS for animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .chat-messages .message:last-child {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .bg-gray-850 {
          background-color: #1a1d23;
        }
        .markdown-content h1, 
        .markdown-content h2, 
        .markdown-content h3 {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .markdown-content ul, 
        .markdown-content ol {
          padding-left: 1.5em;
        }
        
        /* Fix for code block expansion */
        .chat-messages {
          scroll-padding-bottom: 20px;
          contain: paint layout;
          height: 100%;
          overscroll-behavior: contain;
        }
        .chat-messages pre {
          contain: content;
        }
        .message {
          contain: layout;
        }
        .prose pre {
          margin: 0;
        }
        
        /* Fix for voice agent UI stability */
        .voice-agent {
          min-height: 100px;
          position: relative;
          contain: paint layout;
        }
        
        /* Prevent layout shifts */
        .flex-1 {
          min-height: 0;
        }
        
        /* Fix for message container */
        .message-content {
          overflow-wrap: break-word;
          word-break: break-word;
        }
      `}</style>
    </div>
  );
};

export default ChatPanel; 