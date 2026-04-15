'use client';

import { useState, useRef, useEffect } from 'react';

const getLanguageColor = (language?: string) => {
  switch (language) {
    case 'html': return '#e34c26';
    case 'css': return '#264de4';
    case 'js': return '#f7df1e';
    default: return '#9ca3af';
  }
};

const getLanguageBg = (language?: string) => {
  switch (language) {
    case 'html': return 'bg-orange-500/20 text-orange-300';
    case 'css': return 'bg-blue-500/20 text-blue-300';
    case 'js': return 'bg-yellow-500/20 text-yellow-300';
    default: return 'bg-gray-500/20 text-gray-300';
  }
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
  onRenameFile?: (id: string, newName: string) => void;
  onDeleteFile?: (id: string) => void;
  onClearContexts?: () => void;
  onDownloadZip?: () => void;
}

const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onFileSelect,
  onCreateNewFile,
  onRenameFile,
  onDeleteFile,
  onClearContexts,
  onDownloadZip
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ root: true });
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const startRename = (file: FileNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(file.id);
    setRenameValue(file.name);
  };

  const commitRename = () => {
    if (renamingId && renameValue.trim() && onRenameFile) {
      onRenameFile(renamingId, renameValue.trim());
    }
    setRenamingId(null);
    setRenameValue('');
  };

  const cancelRename = () => {
    setRenamingId(null);
    setRenameValue('');
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') commitRename();
    else if (e.key === 'Escape') cancelRename();
  };

  const handleDeleteFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (deleteConfirmId && onDeleteFile) {
      onDeleteFile(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  const FileIcon = ({ language }: { language?: string }) => (
    <span
      className="inline-block w-2 h-2 rounded-full mr-2 flex-shrink-0"
      style={{ backgroundColor: getLanguageColor(language) }}
    />
  );

  const renderFileTree = (nodes: FileNode[], level = 0) => {
    return nodes.map(node => (
      <div key={node.id} style={{ marginLeft: `${level * 12}px` }}>
        {node.type === 'folder' ? (
          <div className="mb-0.5">
            <div
              onClick={() => toggleFolder(node.id)}
              className="flex items-center py-1 px-2 rounded-md hover:bg-white/5 cursor-pointer text-gray-300 hover:text-white group"
            >
              <svg
                className={`w-3 h-3 mr-1.5 transition-transform text-gray-500 ${expandedFolders[node.id] ? 'rotate-90' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <svg className="w-3.5 h-3.5 mr-1.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
              </svg>
              <span className="text-xs font-medium">{node.name}</span>
            </div>
            {expandedFolders[node.id] && node.children && (
              <div className="mt-0.5">{renderFileTree(node.children, level + 1)}</div>
            )}
          </div>
        ) : (
          <div
            className={`group flex items-center py-1 px-2 rounded-md cursor-pointer text-xs transition-colors ${
              activeFileId === node.id
                ? 'bg-blue-600/25 text-blue-300 border-l-2 border-blue-400'
                : 'hover:bg-white/5 text-gray-300 hover:text-white border-l-2 border-transparent'
            }`}
            onClick={() => onFileSelect(node)}
            onMouseEnter={() => setHoveredId(node.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <FileIcon language={node.language} />
            {renamingId === node.id ? (
              <input
                ref={renameInputRef}
                value={renameValue}
                onChange={e => setRenameValue(e.target.value)}
                onKeyDown={handleRenameKeyDown}
                onBlur={commitRename}
                onClick={e => e.stopPropagation()}
                className="flex-1 bg-gray-700 border border-blue-500 text-white text-xs px-1 py-0.5 rounded outline-none"
              />
            ) : (
              <>
                <span className="flex-1 truncate">{node.name}</span>
                <span className={`text-[9px] px-1 py-0.5 rounded uppercase font-bold tracking-wide ml-1 flex-shrink-0 ${getLanguageBg(node.language)}`}>
                  {node.language}
                </span>
                {(hoveredId === node.id || activeFileId === node.id) && (
                  <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onRenameFile && (
                      <button
                        onClick={e => startRename(node, e)}
                        className="p-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white"
                        title="Rename (double-click)"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}
                    {onDeleteFile && (
                      <button
                        onClick={e => handleDeleteFile(node.id, e)}
                        className="p-0.5 rounded hover:bg-red-500/20 text-gray-400 hover:text-red-400"
                        title="Delete file"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    ));
  };

  const handleClearContexts = () => {
    if (onClearContexts) {
      onClearContexts();
      setShowClearConfirm(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-gray-800/80 flex justify-between items-center bg-gray-950">
        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Explorer</span>
        <div className="flex gap-1">
          {onDownloadZip && (
            <button
              onClick={onDownloadZip}
              className="p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
              title="Download as ZIP"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          )}
          {onClearContexts && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Clear All Saved Contexts"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
          <button
            onClick={onCreateNewFile}
            className="p-1.5 rounded-md text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-colors"
            title="New File"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>

      {/* File count */}
      <div className="px-3 py-1.5 border-b border-gray-800/50">
        <span className="text-[10px] text-gray-600">{files.length} file{files.length !== 1 ? 's' : ''}</span>
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto px-1 py-1 space-y-0.5">
        {files.length > 0 ? (
          renderFileTree(files)
        ) : (
          <div className="text-center text-gray-600 text-xs mt-8 px-4 space-y-1">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p>No files yet</p>
            <p className="text-gray-700">Create a file or generate from an image</p>
          </div>
        )}
      </div>

      {/* Tips at bottom */}
      {files.length > 0 && (
        <div className="px-3 py-2 border-t border-gray-800/50">
          <p className="text-[9px] text-gray-700">Double-click to rename • Hover to see actions</p>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 max-w-xs w-full mx-3 shadow-2xl">
            <h3 className="text-white font-semibold text-sm mb-1">Delete File?</h3>
            <p className="text-gray-400 text-xs mb-4">
              {files.find(f => f.id === deleteConfirmId)?.name} will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeleteConfirmId(null)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
              <button onClick={confirmDelete} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear contexts confirmation */}
      {showClearConfirm && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 max-w-xs w-full mx-3 shadow-2xl">
            <h3 className="text-white font-semibold text-sm mb-1">Clear All Contexts?</h3>
            <p className="text-gray-400 text-xs mb-4">This will delete all saved contexts. This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowClearConfirm(false)} className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">Cancel</button>
              <button onClick={handleClearContexts} className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">Clear All</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileExplorer;
