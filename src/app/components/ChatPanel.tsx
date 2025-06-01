'use client';

import { useState, useRef, useEffect } from 'react';

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
  )
};

interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  isLoading?: boolean;
  htmlSuggestion?: string;
}

interface ChatPanelProps {
  currentFileContent?: string;
  onApplyHtml: (html: string) => void;
  onSendMessage: (message: string) => Promise<any>;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ 
  currentFileContent, 
  onApplyHtml, 
  onSendMessage 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-welcome',
      content: 'Welcome to the AI code assistant. Ask about the current code, request modifications, or ask for help.',
      type: 'system',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

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
    
    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);
    
    try {
      const response = await onSendMessage(inputValue);
      
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: response.message, 
              isLoading: false,
              htmlSuggestion: response.generatedHtml || undefined
            } 
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => 
        msg.id === loadingMessage.id 
          ? { 
              ...msg, 
              content: 'Sorry, I encountered an error. Please try again.', 
              isLoading: false 
            } 
          : msg
      ));
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

  const formatMessageContent = (content: string) => {
    // Handle code blocks
    const formattedContent = content.split('\n').map((line, i) => (
      <div key={i} className="whitespace-pre-wrap">{line}</div>
    ));
    
    return formattedContent;
  };

  return (
    <div className="h-full flex flex-col bg-gray-800 border-l border-gray-700">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <span className="text-sm font-semibold text-gray-200">AI Assistant</span>
        <button 
          onClick={() => setMessages([messages[0]])} 
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
          title="Clear conversation"
        >
          <Icons.Clear />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div key={message.id} className="flex items-start gap-3">
            {/* Avatar */}
            <div className="mt-1">
              {message.type === 'user' ? <Icons.User /> : 
               message.type === 'system' ? <Icons.System /> : 
               <Icons.AI />}
            </div>
            
            {/* Message Content */}
            <div className="flex-1">
              <div className={`${
                message.type === 'user' 
                  ? 'bg-gray-700 text-white' 
                  : message.type === 'system'
                  ? 'bg-yellow-900 bg-opacity-30 text-yellow-100'
                  : 'bg-gray-900 text-gray-100'
              } p-3 rounded-lg`}>
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
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={() => onApplyHtml(message.htmlSuggestion!)}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs"
                  >
                    <Icons.Apply />
                    Apply HTML Changes
                  </button>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-gray-700">
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about code or request changes..."
            className="w-full bg-gray-700 text-gray-100 rounded-lg px-4 py-3 pr-10 resize-none max-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      </div>
    </div>
  );
};

export default ChatPanel; 