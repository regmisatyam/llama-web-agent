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
}

const FileExplorer: React.FC<FileExplorerProps> = ({ 
  files, 
  activeFileId, 
  onFileSelect,
  onCreateNewFile
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'root': true, // Root folder is expanded by default
  });

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

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white overflow-hidden">
      <div className="p-3 border-b border-gray-700 flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Explorer</span>
        <button 
          onClick={onCreateNewFile}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700"
          title="New File"
        >
          <Icons.NewFile />
        </button>
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
    </div>
  );
};

export default FileExplorer; 