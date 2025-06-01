'use client';

import { useState, useRef, useEffect } from 'react';

// Inline SVG Icons to avoid Heroicons issues
const Icons = {
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Photo: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Code: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  Eye: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Edit: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  Save: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
};

interface Message {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  generatedHtml?: string;
  isLoading?: boolean;
  processingStep?: string;
  isEditing?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const STORAGE_KEY = 'ai-website-generator-conversations';

export default function HomePage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState<string | null>(null);
  const [editingCode, setEditingCode] = useState<string>('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Counter for unique IDs
  const messageIdCounter = useRef(0);

  const generateUniqueId = () => {
    messageIdCounter.current += 1;
    return `${Date.now()}-${messageIdCounter.current}`;
  };

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Load conversations from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const conversationsWithDates = parsed.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setConversations(conversationsWithDates);
        
        // Set active conversation to the most recent one
        if (conversationsWithDates.length > 0) {
          setActiveConversationId(conversationsWithDates[0].id);
        }
      } catch (error) {
        console.error('Failed to load conversations:', error);
      }
    }
  }, []);

  // Save conversations to localStorage whenever they change
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    }
  }, [conversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages]);

  const createNewConversation = () => {
    const newConversation: Conversation = {
      id: generateUniqueId(),
      title: 'New Website Generation',
      messages: [{
        id: generateUniqueId(),
        type: 'system',
        content: 'Welcome! Upload a website screenshot and I\'ll generate responsive HTML code for you.',
        timestamp: new Date()
      }],
      createdAt: new Date()
    };
    
    setConversations(prev => [newConversation, ...prev]);
    setActiveConversationId(newConversation.id);
  };

  const deleteConversation = (conversationId: string) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    if (activeConversationId === conversationId) {
      const remaining = conversations.filter(conv => conv.id !== conversationId);
      setActiveConversationId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const updateConversationTitle = (conversationId: string, filename: string) => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, title: `Generated from ${filename}` }
          : conv
      )
    );
  };

  const addMessage = (conversationId: string, message: Omit<Message, 'id' | 'timestamp'>) => {
    const newMessageId = generateUniqueId();
    const newMessage = {
      ...message,
      id: newMessageId,
      timestamp: new Date()
    };
    
    console.log('➕ Adding message:', {
      conversationId,
      messageId: newMessageId,
      type: newMessage.type,
      hasHtml: !!newMessage.generatedHtml
    });
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: [...conv.messages, newMessage]
            }
          : conv
      )
    );
    
    // Return the ID of the created message
    return newMessageId;
  };

  const updateMessage = (conversationId: string, messageId: string, updates: Partial<Message>) => {
    console.log('📝 Updating message:', {
      conversationId,
      messageId,
      updates,
      hasGeneratedHtml: !!updates.generatedHtml,
      htmlLength: updates.generatedHtml?.length
    });
    
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? { 
              ...conv, 
              messages: conv.messages.map(msg => {
                if (msg.id === messageId) {
                  const updated = { ...msg, ...updates };
                  console.log('✅ Message updated:', {
                    id: updated.id,
                    hasHtml: !!updated.generatedHtml,
                    htmlLength: updated.generatedHtml?.length
                  });
                  return updated;
                }
                return msg;
              })
            }
          : conv
      )
    );
  };

  const startEditing = (messageId: string, currentHtml: string) => {
    setEditingMessageId(messageId);
    setEditingCode(currentHtml);
  };

  const saveEdit = (conversationId: string, messageId: string) => {
    updateMessage(conversationId, messageId, { 
      generatedHtml: editingCode,
      isEditing: false 
    });
    setEditingMessageId(null);
    setEditingCode('');
  };

  const cancelEdit = () => {
    setEditingMessageId(null);
    setEditingCode('');
  };

  const handleFileUpload = async (file: File) => {
    if (!activeConversationId) return;

    setIsUploading(true);
    
    // Add user message with image
    const imageUrl = URL.createObjectURL(file);
    addMessage(activeConversationId, {
      type: 'user',
      content: `Generate a website from this screenshot: ${file.name}`,
      imageUrl
    });

    // Add loading assistant message
    const loadingMessageId = addMessage(activeConversationId, {
      type: 'assistant',
      content: 'Analyzing your image and generating HTML...',
      isLoading: true,
      processingStep: 'Uploading image...'
    });
    
    console.log('🔄 Loading message created with actual ID:', loadingMessageId);

    updateConversationTitle(activeConversationId, file.name);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/generate-html', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Update the loading message with success
        updateMessage(activeConversationId, loadingMessageId, {
          content: `✅ Successfully generated responsive HTML code from ${file.name}!`,
          isLoading: false,
          generatedHtml: result.html,
          processingStep: undefined
        });

        console.log('✅ HTML generated successfully:', {
          hasHtml: !!result.html,
          htmlLength: result.html?.length || 0,
          filename: file.name
        });

        // Add analysis if available
        if (result.analysis) {
          addMessage(activeConversationId, {
            type: 'assistant',
            content: `**Image Analysis:**\n${result.analysis}`
          });
        }
      } else {
        console.error('❌ Generation failed:', result);
        updateMessage(activeConversationId, loadingMessageId, {
          content: `❌ Generation failed: ${result.message || 'Unknown error'}`,
          isLoading: false,
          processingStep: undefined
        });
      }
    } catch (error) {
      updateMessage(activeConversationId, loadingMessageId, {
        content: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        isLoading: false,
        processingStep: undefined
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    if (imageFile) {
      handleFileUpload(imageFile);
    }
  };

  const downloadHtml = (html: string, filename: string) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-${filename.replace(/\.[^/.]+$/, '')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Initialize with first conversation if none exist
  useEffect(() => {
    if (conversations.length === 0) {
      createNewConversation();
    }
  }, [conversations.length]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewConversation}
            className="w-full flex items-center gap-3 px-4 py-3 text-left bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icons.Plus />
            New Generation
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`group flex items-center gap-2 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                activeConversationId === conversation.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : ''
              }`}
            >
              <button
                onClick={() => setActiveConversationId(conversation.id)}
                className="flex-1 p-4 text-left"
              >
                <div className="font-medium text-gray-900 truncate">
                  {conversation.title}
                </div>
                <div className="text-sm text-gray-500">
                  {conversation.createdAt.toLocaleDateString()}
                </div>
              </button>
              <button
                onClick={() => deleteConversation(conversation.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 transition-all"
                title="Delete conversation"
              >
                <Icons.Trash />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <h1 className="text-xl font-semibold text-gray-900">
                {activeConversation.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                AI-powered website generation from screenshots • Conversations auto-saved
              </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {activeConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-4xl rounded-2xl px-6 py-4 ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'system'
                        ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        : 'bg-white border border-gray-200 text-gray-900'
                    }`}
                  >
                    {/* Message Content */}
                    <div className="space-y-4">
                      {message.imageUrl && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={message.imageUrl}
                            alt="Uploaded screenshot"
                            className="max-w-full h-auto max-h-64 object-contain"
                          />
                        </div>
                      )}

                      <div className="prose prose-sm max-w-none">
                        {message.content.split('\n').map((line, i) => (
                          <div key={i}>
                            {line.startsWith('**') && line.endsWith('**') ? (
                              <strong className="text-lg">{line.slice(2, -2)}</strong>
                            ) : (
                              line
                            )}
                          </div>
                        ))}
                      </div>

                      {message.isLoading && (
                        <div className="flex items-center gap-3 text-blue-600">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">{message.processingStep}</span>
                        </div>
                      )}

                      {/* Debug info */}
                      {message.type === 'assistant' && (
                        <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                          Debug: Has HTML? {message.generatedHtml ? `Yes (${message.generatedHtml.length} chars)` : 'No'}
                        </div>
                      )}

                      {/* Simplified HTML display for debugging */}
                      {message.generatedHtml && message.generatedHtml.length > 0 && (
                        <div className="space-y-4 border-t border-gray-200 pt-4">
                          <div className="bg-yellow-100 p-3 rounded-lg">
                            <div className="text-sm font-semibold text-yellow-800 mb-2">
                              ✅ HTML Code Generated! ({message.generatedHtml.length} characters)
                            </div>
                            <div className="text-xs text-yellow-700">
                              The HTML has been generated successfully. Use the buttons below to view or preview it.
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-wrap">
                            <button
                              onClick={() => {
                                console.log('Preview button clicked', { htmlLength: message.generatedHtml?.length });
                                setShowPreview(message.generatedHtml!);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Icons.Eye />
                              Preview Website
                            </button>
                            <button
                              onClick={() => {
                                console.log('Download button clicked');
                                downloadHtml(message.generatedHtml!, activeConversation.title);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              <Icons.Download />
                              Download HTML
                            </button>
                            <button
                              onClick={() => {
                                console.log('Edit button clicked');
                                startEditing(message.id, message.generatedHtml!);
                              }}
                              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                            >
                              <Icons.Edit />
                              Edit Code
                            </button>
                          </div>
                          
                          {editingMessageId === message.id ? (
                            /* Code Editor */
                            <div className="space-y-4">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-4">
                                  <h4 className="font-medium text-gray-900">Edit HTML Code</h4>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => saveEdit(activeConversation.id, message.id)}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                                    >
                                      <Icons.Save />
                                      Save Changes
                                    </button>
                                    <button
                                      onClick={cancelEdit}
                                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                                <textarea
                                  value={editingCode}
                                  onChange={(e) => setEditingCode(e.target.value)}
                                  className="w-full h-96 p-4 bg-gray-900 text-green-400 font-mono text-sm rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Edit your HTML code here..."
                                />
                                <div className="mt-4 flex gap-2">
                                  <button
                                    onClick={() => {
                                      console.log('Preview changes clicked');
                                      setShowPreview(editingCode);
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                                  >
                                    <Icons.Eye />
                                    Preview Changes
                                  </button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Code Viewer - Always visible for debugging */
                            <div className="bg-gray-50 rounded-lg">
                              <details open className="group">
                                <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:text-gray-900 flex items-center bg-gray-100 rounded-t-lg">
                                  <Icons.Code />
                                  <span className="ml-2">Generated HTML Code</span>
                                  <span className="ml-auto text-sm text-gray-500">
                                    {message.generatedHtml.length} characters • Click to toggle
                                  </span>
                                </summary>
                                <div className="p-4">
                                  <div className="mb-2 text-xs text-gray-500 flex justify-between">
                                    <span>Generated HTML Code</span>
                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(message.generatedHtml!);
                                        alert('Code copied to clipboard!');
                                      }}
                                      className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                      📋 Copy to Clipboard
                                    </button>
                                  </div>
                                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs max-h-96 overflow-y-auto border border-gray-700">
                                    <pre className="whitespace-pre-wrap"><code>{message.generatedHtml}</code></pre>
                                  </div>
                                </div>
                              </details>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Fallback if no HTML but success message */}
                      {message.type === 'assistant' && 
                       message.content.includes('Successfully generated') && 
                       !message.generatedHtml && (
                        <div className="bg-red-100 p-3 rounded-lg text-red-700 text-sm">
                          ⚠️ HTML generation reported success but no HTML found in message. 
                          This might be a data synchronization issue.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-6 border-t border-gray-200 bg-white">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors"
              >
                <div className="mx-auto mb-4 text-gray-400">
                  <Icons.Photo />
                </div>
                <p className="text-gray-600 mb-4">
                  Drag and drop a website screenshot here, or click to upload
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Icons.Photo />
                  {isUploading ? 'Uploading...' : 'Choose Image'}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto text-gray-400 mb-4">
                <Icons.Photo />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Welcome to AI Website Generator
              </h2>
              <p className="text-gray-600 mb-6">
                Create a new conversation to start generating websites from screenshots
              </p>
              <button
                onClick={createNewConversation}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icons.Plus />
                Start New Generation
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-6xl max-h-[90vh] w-full flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Website Preview</h3>
                <p className="text-sm text-gray-500">
                  Preview of generated HTML ({showPreview.length} characters)
                </p>
              </div>
              <button
                onClick={() => {
                  console.log('Preview modal closed');
                  setShowPreview(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Icons.Close />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {showPreview ? (
                <iframe
                  srcDoc={showPreview}
                  className="w-full h-full border-0"
                  title="Generated Website Preview"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  onLoad={() => console.log('Preview iframe loaded')}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No HTML content to preview
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
