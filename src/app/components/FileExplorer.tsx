'use client';

import { useState } from 'react';

// SVG Icons
const Icons = {
  Folder: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  File: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  HTML: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  CSS: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
    </svg>
  ),
  JS: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Chevron: ({ isOpen }: { isOpen: boolean }) => (
    <svg
      className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-90' : ''}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  NewFile: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Download: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  ),
  Clear: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
};

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  language?: 'html' | 'css' | 'js';
  dateCreated: Date;
}

interface FileExplorerProps {
  files: FileNode[];
  activeFileId: string | null;
  onFileSelect: (file: FileNode) => void;
  onCreateNewFile: () => void;
  onClearContexts?: () => void;
  onDownloadZip?: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  activeFileId, 
  onFileSelect,
  onCreateNewFile,
  onClearContexts,
  onDownloadZip
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true, // Root folder is expanded by default
  });
  
  // State for confirmation dialogs
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  const getFileIcon = (file: FileNode) => {
    if (file.type === 'folder') return <Icons.Folder />;
    switch (file.language) {
      case 'html': return <Icons.HTML />;
      case 'css': return <Icons.CSS />;
      case 'js': return <Icons.JS />;
      default: return <Icons.File />;
    }
  };

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 16}px` }}>
        {node.type === 'folder' ? (
          <div className="mb-1">
            <div 
              onClick={() => toggleFolder(node.id)}
              className="flex items-center py-1 px-2 rounded hover:bg-gray-700 cursor-pointer text-gray-300 hover:text-white"
            >
              <span className="mr-1"><Icons.Chevron isOpen={!!expandedFolders[node.id]} /></span>
              <span className="mr-2">{getFileIcon(node)}</span>
              <span className="text-sm font-medium">{node.name}</span>
            </div>
            {expandedFolders[node.id] && node.children && (
              <div className="mt-1">
                {renderFileTree(node.children, level + 1)}
              </div>
            )}
          </div>
        ) : (
          <div 
            onClick={() => onFileSelect(node)}
            className={`flex items-center py-1 px-2 rounded cursor-pointer text-sm ${
              activeFileId === node.id ? 'bg-blue-800 text-white' : 'hover:bg-gray-700 text-gray-300 hover:text-white'
            }`}
          >
            <span className="mr-2">{getFileIcon(node)}</span>
            <span>{node.name}</span>
          </div>
        )}
      </div>
    ));
  };

  // Handle clear contexts with confirmation
  const handleClearContexts = () => {
    if (onClearContexts) {
      onClearContexts();
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Explorer</span>
        <div className="flex gap-2">
          <button 
            onClick={onDownloadZip}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
            title="Download as ZIP"
          >
            <Icons.Download />
          </button>
          <button 
            onClick={() => setShowClearConfirm(true)}
            className="text-gray-400 hover:text-red-400 p-1 rounded hover:bg-gray-700"
            title="Clear All Saved Contexts"
          >
            <Icons.Clear />
          </button>
          <button 
            onClick={onCreateNewFile}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
            title="New File"
          >
            <Icons.NewFile />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="text-center text-gray-500 text-sm mt-4 px-4">
            <p>No files yet</p>
            <p className="mt-2">Generate a website or create a new file to get started</p>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog for Clearing Contexts */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-4 max-w-sm w-full mx-4">
            <h3 className="text-white font-medium mb-2">Clear All Contexts?</h3>
            <p className="text-gray-300 text-sm mb-4">
              This will delete all saved contexts. This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-3 py-1 bg-gray-600 hover:bg-gray-500 text-white rounded text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleClearContexts}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer; 