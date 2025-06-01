import { FileNode } from '../components/FileExplorer';

// Re-export FileNode for other modules
export type { FileNode };

export interface IDEContext {
  id: string;
  name: string;
  timestamp: number;
  files: FileNode[];
  activeFileId: string | null;
  description?: string;
}

export interface ChatMessage {
  id: string;
  content: string;
  type: 'user' | 'assistant' | 'system';
  timestamp: Date;
  htmlSuggestion?: string;
}

export interface CodeHistory {
  id: string;
  timestamp: number;
  files: FileNode[];
  activeFileId: string | null;
  chatMessages: ChatMessage[];
}

// Auto-save code and chat history
export const saveCodeAndChatState = (
  files: FileNode[], 
  activeFileId: string | null, 
  chatMessages: ChatMessage[]
): string => {
  // Limit to the last 50 messages to prevent storage issues
  const limitedMessages = chatMessages.slice(-50);
  
  const codeState: CodeHistory = {
    id: `state-${Date.now()}`,
    timestamp: Date.now(),
    files,
    activeFileId,
    chatMessages: limitedMessages
  };
  
  // Store in localStorage
  localStorage.setItem('ide-code-state', JSON.stringify(codeState));
  
  return codeState.id;
};

// Get the last saved code and chat state
export const getCodeAndChatState = (): CodeHistory | null => {
  try {
    const stateJson = localStorage.getItem('ide-code-state');
    if (!stateJson) return null;
    
    const state = JSON.parse(stateJson) as CodeHistory;
    
    // Convert timestamps back to Date objects for chat messages
    state.chatMessages = state.chatMessages.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }));
    
    return state;
  } catch (error) {
    console.error('Failed to parse code state:', error);
    return null;
  }
};

// Revert to previous state
export const revertToPreviousState = (): CodeHistory | null => {
  // For now, we only support going back to the last saved state
  return getCodeAndChatState();
};

// Save current context to localStorage
export const saveContext = (files: FileNode[], activeFileId: string | null, name?: string): IDEContext => {
  const existingContexts = getContextList();
  
  const newContext: IDEContext = {
    id: `context-${Date.now()}`,
    name: name || `Saved Context ${new Date().toLocaleString()}`,
    timestamp: Date.now(),
    files,
    activeFileId
  };
  
  // Add to the beginning of the list
  existingContexts.unshift(newContext);
  
  // Store in localStorage (limit to max 10 contexts)
  const limitedContexts = existingContexts.slice(0, 10);
  localStorage.setItem('ide-context-list', JSON.stringify(limitedContexts));
  
  return newContext;
};

// Get the list of saved contexts
export const getContextList = (): IDEContext[] => {
  try {
    const contextListJson = localStorage.getItem('ide-context-list');
    return contextListJson ? JSON.parse(contextListJson) : [];
  } catch (error) {
    console.error('Failed to parse context list:', error);
    return [];
  }
};

// Get a specific context by ID
export const getContextById = (contextId: string): IDEContext | null => {
  const contexts = getContextList();
  return contexts.find(ctx => ctx.id === contextId) || null;
};

// Delete a context by ID
export const deleteContext = (contextId: string): boolean => {
  const contexts = getContextList();
  const updatedContexts = contexts.filter(ctx => ctx.id !== contextId);
  
  if (updatedContexts.length !== contexts.length) {
    localStorage.setItem('ide-context-list', JSON.stringify(updatedContexts));
    return true;
  }
  
  return false;
};

// Update a context's name or description
export const updateContext = (contextId: string, updates: { name?: string; description?: string }): boolean => {
  const contexts = getContextList();
  const updatedContexts = contexts.map(ctx => 
    ctx.id === contextId ? { ...ctx, ...updates } : ctx
  );
  
  localStorage.setItem('ide-context-list', JSON.stringify(updatedContexts));
  return true;
};

// Clear all saved contexts
export const clearAllContexts = (): boolean => {
  try {
    localStorage.removeItem('ide-context-list');
    return true;
  } catch (error) {
    console.error('Failed to clear contexts:', error);
    return false;
  }
};

// Prepare files for download as a zip
export const prepareFilesForZip = (files: FileNode[]): { name: string; content: string; }[] => {
  // Flatten nested files if any and extract file data
  const flattenFiles = (nodes: FileNode[], prefix = ''): { name: string; content: string; }[] => {
    return nodes.reduce((acc, node) => {
      if (node.type === 'folder' && node.children) {
        // For folders, recursively process children with path prefix
        const folderPath = `${prefix}${node.name}/`;
        return [...acc, ...flattenFiles(node.children, folderPath)];
      } else if (node.type === 'file' && node.content) {
        // For files, add to the result array
        return [...acc, { name: `${prefix}${node.name}`, content: node.content }];
      }
      return acc;
    }, [] as { name: string; content: string; }[]);
  };

  return flattenFiles(files);
}; 