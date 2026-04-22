'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import FileExplorer from './FileExplorer';
import CodeEditor from './CodeEditor';
import ChatPanel from './ChatPanel';
import {
  saveContext,
  getContextList,
  getContextById,
  deleteContext,
  IDEContext,
  getCodeAndChatState,
  saveCodeAndChatState,
  ChatMessage,
  clearAllContexts
} from '../utils/contextManager';
import { generateZipFromFiles } from '../utils/zipGenerator';
import { TEMPLATES, Template } from '../utils/templates';
import type { FileNode } from './FileExplorer';

interface IDELayoutProps {
  initialHtml?: string;
}

interface FixIssue {
  id: string;
  category: string;
  issue: string;
  detail: string;
  severity: 'high' | 'medium' | 'low';
  file: string;
  fixing?: boolean;
  fixed?: boolean;
}

const IDELayout: React.FC<IDELayoutProps> = ({ initialHtml = '' }) => {
  const [files, setFiles] = useState<FileNode[]>([]);
  const [activeFileId, setActiveFileId] = useState<string | null>(null);
  const [activeFile, setActiveFile] = useState<FileNode | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([{
    id: 'system-welcome',
    content: 'Welcome to the AI code assistant. Ask about the current code, request modifications, or ask for help.',
    type: 'system',
    timestamp: new Date()
  }]);

  const [savedContexts, setSavedContexts] = useState<IDEContext[]>([]);
  const [showContextModal, setShowContextModal] = useState(false);
  const [contextName, setContextName] = useState('');
  const [showContextListModal, setShowContextListModal] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createFileName, setCreateFileName] = useState('');
  const [createFileType, setCreateFileType] = useState<'html' | 'css' | 'js' | null>(null);
  const [showImageUploadModal, setShowImageUploadModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imagePreviewIndex, setImagePreviewIndex] = useState(0);
  const [promptText, setPromptText] = useState('');
  const [isGeneratingFromImage, setIsGeneratingFromImage] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationTotal, setGenerationTotal] = useState(0);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);

  // Global voice control state
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // ── New feature modals ────────────────────────────────────────────────────
  const [showTemplateGallery, setShowTemplateGallery] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);
  const [showContentSwapModal, setShowContentSwapModal] = useState(false);
  const [showImportUrlModal, setShowImportUrlModal] = useState(false);
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const toolsDropdownRef = useRef<HTMLDivElement>(null);

  // Fix My Site state
  const [fixIssues, setFixIssues] = useState<FixIssue[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);

  // Content Swap state
  const [contentSwapDesc, setContentSwapDesc] = useState('');
  const [isSwappingContent, setIsSwappingContent] = useState(false);
  const [swapProgress, setSwapProgress] = useState({ current: 0, total: 0 });

  // Import URL state
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Split preview pane
  const [showPreviewPane, setShowPreviewPane] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Explain This Code – text selected in Monaco that gets sent to chat
  const [explainText, setExplainText] = useState<string | undefined>(undefined);

  const generateUniqueId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Load saved state on mount
  useEffect(() => {
    setSavedContexts(getContextList());
    const savedState = getCodeAndChatState();
    if (savedState && savedState.files.length > 0 && (!initialHtml || files.length === 0)) {
      setFiles(savedState.files);
      setActiveFileId(savedState.activeFileId);
      setActiveFile(savedState.files.find(f => f.id === savedState.activeFileId) || null);
      if (savedState.chatMessages?.length > 0) {
        setChatMessages(savedState.chatMessages);
      }
    }
    const isClosed = localStorage.getItem('ide-welcome-banner-closed') === 'true';
    setShowWelcomeBanner(!isClosed);
  }, [initialHtml]);

  // Auto-save
  useEffect(() => {
    if (files.length > 0 && chatMessages.length > 0) {
      saveCodeAndChatState(files, activeFileId, chatMessages);
    }
  }, [files, activeFileId, chatMessages]);

  // Initialize with initialHtml
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

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setActiveFileId(file.id);
      setActiveFile(file);
    }
  };

  const handleCodeChange = (newCode: string) => {
    if (!activeFileId) return;
    const updatedFiles = files.map(f =>
      f.id === activeFileId ? { ...f, content: newCode } : f
    );
    setFiles(updatedFiles);
    if (activeFile) setActiveFile({ ...activeFile, content: newCode });
  };

  // Debounce preview refresh whenever active file or preview pane changes
  useEffect(() => {
    if (!showPreviewPane) return;
    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(() => {
      if (activeFile?.language === 'html') {
        setPreviewContent(activeFile.content || '');
      }
    }, 500);
    return () => { if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current); };
  }, [activeFile?.content, showPreviewPane, activeFile?.language]);

  const handleRenameFile = (id: string, newName: string) => {
    const updatedFiles = files.map(f => f.id === id ? { ...f, name: newName } : f);
    setFiles(updatedFiles);
    if (activeFile?.id === id) setActiveFile({ ...activeFile, name: newName });
  };

  const handleDeleteFile = (id: string) => {
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) {
      const next = newFiles[0] || null;
      setActiveFileId(next?.id || null);
      setActiveFile(next);
    }
  };

  const handleCreateNewFile = () => {
    setCreateFileType(null);
    setCreateFileName('');
    setShowCreateDialog(true);
  };

  const getDefaultContent = (type: 'html' | 'css' | 'js') => {
    switch (type) {
      case 'html':
        return '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>New Page</title>\n  <script src="https://cdn.tailwindcss.com"></script>\n</head>\n<body>\n  <div class="container mx-auto p-4">\n    <h1 class="text-2xl font-bold">Hello World</h1>\n    <p>Start editing this file</p>\n  </div>\n</body>\n</html>';
      case 'css':
        return '/* Styles */\nbody {\n  font-family: system-ui, -apple-system, sans-serif;\n  line-height: 1.5;\n  color: #333;\n}\n\n.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 0 1rem;\n}';
      case 'js':
        return '// JavaScript\ndocument.addEventListener("DOMContentLoaded", () => {\n  console.log("Document ready!");\n});';
    }
  };

  const getDefaultExtension = (type: 'html' | 'css' | 'js') => {
    const counts = { html: 0, css: 0, js: 0 };
    files.forEach(f => { if (f.language) counts[f.language]++; });
    switch (type) {
      case 'html': return counts.html === 0 ? 'index.html' : `page-${counts.html + 1}.html`;
      case 'css': return counts.css === 0 ? 'style.css' : `style-${counts.css + 1}.css`;
      case 'js': return counts.js === 0 ? 'script.js' : `script-${counts.js + 1}.js`;
    }
  };

  const createFileWithType = (type: 'html' | 'css' | 'js') => {
    const fileId = generateUniqueId();
    const name = createFileName.trim() || getDefaultExtension(type);
    const finalName = name.includes('.') ? name : `${name}.${type}`;
    const newFile: FileNode = {
      id: fileId,
      name: finalName,
      type: 'file',
      content: getDefaultContent(type),
      language: type,
      dateCreated: new Date()
    };
    setFiles(prev => [...prev, newFile]);
    setActiveFileId(fileId);
    setActiveFile(newFile);
    setShowCreateDialog(false);
    setCreateFileName('');
    setCreateFileType(null);
  };

  const handleSaveContext = () => {
    if (files.length === 0) return;
    const saved = saveContext(files, activeFileId, contextName || undefined);
    setSavedContexts(prev => [saved, ...prev.filter(c => c.id !== saved.id)]);
    setContextName('');
    setShowContextModal(false);
  };

  const handleLoadContext = (contextId: string) => {
    const context = getContextById(contextId);
    if (!context) return;
    setFiles(context.files);
    setActiveFileId(context.activeFileId);
    setActiveFile(context.files.find(f => f.id === context.activeFileId) || null);
    setShowContextListModal(false);
  };

  const handleDeleteContext = (contextId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteContext(contextId);
    setSavedContexts(prev => prev.filter(c => c.id !== contextId));
  };

  const handleRevertState = (stateToRevert: {
    files: FileNode[];
    activeFileId: string | null;
    messages: ChatMessage[];
  }) => {
    if (stateToRevert.files?.length > 0) {
      setFiles(stateToRevert.files);
      setActiveFileId(stateToRevert.activeFileId);
      setActiveFile(stateToRevert.files.find(f => f.id === stateToRevert.activeFileId) || null);
      setChatMessages(stateToRevert.messages);
    }
  };

  const handleChatMessagesUpdate = (messages: ChatMessage[]) => {
    setChatMessages(messages);
  };

  const handleApplyHtml = (html: string) => {
    if (activeFileId && activeFile) handleCodeChange(html);
  };

  // Enhanced handleSendMessage with RAG - includes full content of all relevant files
  const handleSendMessage = async (message: string) => {
    try {
      let contextInfo: any = {};

      if (activeFile?.content) {
        contextInfo.currentFile = {
          name: activeFile.name,
          language: activeFile.language,
          content: activeFile.content
        };

        // RAG: Include full content of all project files (not just names)
        if (files.length > 1) {
          // Score files by relevance to the user's message using keyword matching
          const messageWords = message.toLowerCase().split(/\W+/).filter(w => w.length > 2);
          const scoredFiles = files
            .filter(f => f.id !== activeFileId)
            .map(f => {
              const fileText = (f.name + ' ' + (f.content || '')).toLowerCase();
              const score = messageWords.filter(w => fileText.includes(w)).length;
              return { file: f, score };
            })
            .sort((a, b) => b.score - a.score);

          // Include all files if <= 5, otherwise top 3 most relevant
          const filesToInclude = scoredFiles.length <= 5
            ? scoredFiles.map(s => s.file)
            : scoredFiles.slice(0, 3).map(s => s.file);

          contextInfo.projectFiles = filesToInclude.map(f => ({
            name: f.name,
            language: f.language,
            content: f.content,
            isActive: false
          }));

          // Build file relationships
          const htmlFiles = files.filter(f => f.language === 'html');
          const cssFiles = files.filter(f => f.language === 'css');
          const jsFiles = files.filter(f => f.language === 'js');

          if (htmlFiles.length && (cssFiles.length || jsFiles.length)) {
            const fileRelationships: Array<{
              htmlFile: string;
              linkedCssFiles: string[];
              linkedJsFiles: string[];
            }> = [];

            for (const htmlFile of htmlFiles) {
              const rel = {
                htmlFile: htmlFile.name,
                linkedCssFiles: cssFiles.filter(c => htmlFile.content?.includes(c.name)).map(c => c.name),
                linkedJsFiles: jsFiles.filter(j => htmlFile.content?.includes(j.name)).map(j => j.name)
              };
              fileRelationships.push(rel);
            }
            contextInfo.fileRelationships = fileRelationships;
          }
        }
      }

      const contexts = getContextList();
      if (contexts.length > 0) {
        contextInfo.savedContexts = contexts.map(ctx => ({
          id: ctx.id,
          name: ctx.name,
          timestamp: ctx.timestamp,
          fileCount: ctx.files.length,
        }));
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  // Image upload handlers
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedImages(newFiles);
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImagePreview(ev.target.result as string);
          setImagePreviewIndex(0);
        }
      };
      reader.readAsDataURL(newFiles[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (newFiles.length > 0) {
        setSelectedImages(prev => [...prev, ...newFiles]);
        if (!imagePreview) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              setImagePreview(ev.target.result as string);
              setImagePreviewIndex(0);
            }
          };
          reader.readAsDataURL(newFiles[0]);
        }
      }
    }
  };

  const handleImageGeneration = async () => {
    if (selectedImages.length === 0) return;
    setIsGeneratingFromImage(true);
    setGenerationProgress(0);
    setGenerationTotal(selectedImages.length);

    try {
      const newFiles: FileNode[] = [...files];
      const isNewUser = files.length === 0 ||
        (files.length === 1 && files[0].name === 'index.html' && files[0].content?.includes('Welcome to the IDE'));
      const existingHtmlCount = files.filter(f => f.type === 'file' && f.language === 'html').length;
      let indexCounter = existingHtmlCount;

      for (let i = 0; i < selectedImages.length; i++) {
        const image = selectedImages[i];
        setGenerationProgress(i + 1);

        let pageFileName;
        if (isNewUser && i === 0) {
          pageFileName = 'index';
          const defaultIdx = newFiles.findIndex(f => f.name === 'index.html' && f.content?.includes('Welcome to the IDE'));
          if (defaultIdx !== -1) newFiles.splice(defaultIdx, 1);
        } else {
          pageFileName = `index-${indexCounter + 1}`;
          indexCounter++;
        }

        const formData = new FormData();
        formData.append('image', image);
        formData.append('prompt', promptText || 'Create a responsive page with Tailwind CSS');

        const response = await fetch('/api/generate-html', { method: 'POST', body: formData });
        const result = await response.json();

        if (result.success) {
          const htmlId = generateUniqueId();
          const htmlFile: FileNode = {
            id: htmlId, name: `${pageFileName}.html`, type: 'file',
            content: result.html, language: 'html', dateCreated: new Date()
          };
          newFiles.push(htmlFile);
          setActiveFileId(htmlId);
          setActiveFile(htmlFile);

          if (result.css) {
            newFiles.push({
              id: generateUniqueId(), name: `style-${pageFileName}.css`, type: 'file',
              content: result.css, language: 'css', dateCreated: new Date()
            });
          }
          if (result.js) {
            newFiles.push({
              id: generateUniqueId(), name: `${pageFileName}-script.js`, type: 'file',
              content: result.js, language: 'js', dateCreated: new Date()
            });
          }
        } else {
          throw new Error(result.error || `Failed to generate code from image ${i + 1}`);
        }
      }

      setFiles(newFiles);
      setShowImageUploadModal(false);
      setSelectedImages([]);
      setImagePreview(null);
      setImagePreviewIndex(0);
      setPromptText('');

      const msg: ChatMessage = {
        id: `system-${Date.now()}`,
        content: isNewUser
          ? 'Created your website from the image. You can edit it now.'
          : `Added ${selectedImages.length} new page(s) to your project.`,
        type: 'system',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, msg]);
    } catch (error) {
      console.error('Failed to generate from image:', error);
      alert('Failed to generate code from image. Please try again.');
    } finally {
      setIsGeneratingFromImage(false);
    }
  };

  const handlePreview = () => {
    if (!activeFile?.content) return;
    const blob = new Blob([activeFile.content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const htmlFiles = files.filter(f => f.type === 'file' && f.language === 'html');
  const hasMultiplePages = htmlFiles.length > 1;

  const handleMultiPagePreview = () => {
    if (htmlFiles.length === 0) return;
    const combinedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Multi-Page Preview</title><script src="https://cdn.tailwindcss.com"></script><style>.page-nav{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(8px);color:white;padding:8px 16px;border-radius:50px;z-index:1000;display:flex;gap:8px;}.page-nav a{color:white;text-decoration:none;padding:4px 12px;border-radius:20px;transition:all .2s;font-size:12px;}.page-nav a:hover{background:rgba(255,255,255,.2)}.page-section{min-height:100vh;border-bottom:2px solid #3B82F6;}</style></head><body><nav class="page-nav">${htmlFiles.map((f, i) => `<a href="#page-${i}">${f.name.replace('.html', '')}</a>`).join('')}</nav>${htmlFiles.map((f, i) => `<section class="page-section" id="page-${i}"><div style="background:#1e40af;color:white;padding:4px 12px;font-size:11px">${f.name}</div>${f.content?.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || f.content}</section>`).join('')}</body></html>`;
    const blob = new Blob([combinedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleClearMessages = () => {
    const welcome = chatMessages.find(m => m.id === 'system-welcome');
    setChatMessages(welcome ? [welcome] : [{
      id: 'system-welcome',
      content: 'Welcome to the AI code assistant. Ask about the current code, request modifications, or ask for help.',
      type: 'system',
      timestamp: new Date()
    }]);
  };

  const handleClearAllContexts = () => {
    if (clearAllContexts()) {
      setSavedContexts([]);
      alert('All saved contexts have been cleared.');
    }
  };

  const handleDownloadZip = async () => {
    if (files.length === 0) { alert('No files to download.'); return; }
    try {
      const projectName = activeFile ? `website-${activeFile.name.split('.')[0]}` : 'website-project';
      await generateZipFromFiles(files, projectName);
    } catch (error) {
      console.error('Failed to download ZIP:', error);
      alert('Failed to download ZIP. Please try again.');
    }
  };

  // Close tools dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (toolsDropdownRef.current && !toolsDropdownRef.current.contains(e.target as Node)) {
        setShowToolsDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Template Gallery ──────────────────────────────────────────────────────
  const handleSelectTemplate = (template: Template) => {
    const newFiles: FileNode[] = template.files.map(f => ({
      id: generateUniqueId(),
      name: f.name,
      type: 'file' as const,
      content: f.content,
      language: f.language,
      dateCreated: new Date(),
    }));
    setFiles(newFiles);
    setActiveFileId(newFiles[0].id);
    setActiveFile(newFiles[0]);
    setShowTemplateGallery(false);
    setChatMessages([{
      id: 'system-welcome',
      content: `Loaded "${template.name}" template (${newFiles.length} file${newFiles.length > 1 ? 's' : ''}). Customize it using the AI assistant or edit the code directly!`,
      type: 'system',
      timestamp: new Date(),
    }]);
  };

  // ── Fix My Site ───────────────────────────────────────────────────────────
  const handleRunAudit = async () => {
    if (files.length === 0) return;
    setIsAuditing(true);
    setAuditComplete(false);
    setFixIssues([]);
    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map(f => ({ name: f.name, language: f.language, content: f.content })),
        }),
      });
      const result = await response.json();
      if (result.success && result.issues) {
        setFixIssues(result.issues);
        setAuditComplete(true);
      } else {
        throw new Error(result.error || 'Audit failed');
      }
    } catch (err: any) {
      alert(`Audit failed: ${err.message}`);
    } finally {
      setIsAuditing(false);
    }
  };

  const handleFixIssue = async (issue: FixIssue) => {
    setFixIssues(prev => prev.map(i => i.id === issue.id ? { ...i, fixing: true } : i));
    try {
      const targetFile = files.find(f => f.name === issue.file) || activeFile;
      if (!targetFile) return;
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Fix this issue: "${issue.issue}". ${issue.detail}. Return the complete updated ${targetFile.language?.toUpperCase()} file with the fix applied. Keep everything else unchanged.` }],
          context: { currentFile: { name: targetFile.name, language: targetFile.language, content: targetFile.content } },
        }),
      });
      const result = await res.json();
      const htmlMatch = result.message?.match(/```(?:html|css|js|javascript)\n?([\s\S]*?)```/);
      const fixed = result.generatedHtml || htmlMatch?.[1]?.trim();
      if (fixed) {
        const updated = files.map(f => f.id === targetFile.id ? { ...f, content: fixed } : f);
        setFiles(updated);
        if (activeFile?.id === targetFile.id) setActiveFile({ ...targetFile, content: fixed });
      }
      setFixIssues(prev => prev.map(i => i.id === issue.id ? { ...i, fixing: false, fixed: true } : i));
    } catch {
      setFixIssues(prev => prev.map(i => i.id === issue.id ? { ...i, fixing: false } : i));
    }
  };

  // ── Content Swap ──────────────────────────────────────────────────────────
  const handleContentSwap = async () => {
    if (!contentSwapDesc.trim()) return;
    const htmlFiles = files.filter(f => f.language === 'html');
    if (htmlFiles.length === 0) { alert('No HTML files to update.'); return; }
    setIsSwappingContent(true);
    setSwapProgress({ current: 0, total: htmlFiles.length });
    try {
      const updatedFiles = [...files];
      for (let i = 0; i < htmlFiles.length; i++) {
        const file = htmlFiles[i];
        setSwapProgress({ current: i + 1, total: htmlFiles.length });
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{
              role: 'user',
              content: `Replace ALL placeholder text (lorem ipsum, "Your Company", "Feature Title", generic descriptions, sample names, etc.) in this HTML file with real, contextually appropriate content for: "${contentSwapDesc}". Keep the HTML structure, Tailwind classes, and layout EXACTLY as is. Only replace the text content. Return the complete updated HTML file.`,
            }],
            context: { currentFile: { name: file.name, language: file.language, content: file.content } },
          }),
        });
        const result = await res.json();
        const match = result.message?.match(/```html\n?([\s\S]*?)```/);
        const newContent = result.generatedHtml || match?.[1]?.trim();
        if (newContent) {
          const idx = updatedFiles.findIndex(f => f.id === file.id);
          if (idx !== -1) updatedFiles[idx] = { ...updatedFiles[idx], content: newContent };
        }
      }
      setFiles(updatedFiles);
      const updatedActive = updatedFiles.find(f => f.id === activeFileId);
      if (updatedActive) setActiveFile(updatedActive);
      setShowContentSwapModal(false);
      setContentSwapDesc('');
      setChatMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        content: `Content personalized across ${htmlFiles.length} page${htmlFiles.length > 1 ? 's' : ''} based on your description.`,
        type: 'system',
        timestamp: new Date(),
      }]);
    } catch (err: any) {
      alert(`Content swap failed: ${err.message}`);
    } finally {
      setIsSwappingContent(false);
      setSwapProgress({ current: 0, total: 0 });
    }
  };

  // ── Import from URL ───────────────────────────────────────────────────────
  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;
    setIsImporting(true);
    try {
      const res = await fetch('/api/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      });
      const result = await res.json();
      if (result.success && result.html) {
        const fileId = generateUniqueId();
        let domainName = 'imported';
        try { domainName = new URL(importUrl.trim()).hostname.replace('www.', '').split('.')[0]; } catch {}
        const newFile: FileNode = {
          id: fileId,
          name: `${domainName}.html`,
          type: 'file',
          content: result.html,
          language: 'html',
          dateCreated: new Date(),
        };
        setFiles(prev => [...prev, newFile]);
        setActiveFileId(fileId);
        setActiveFile(newFile);
        setShowImportUrlModal(false);
        setImportUrl('');
        setChatMessages(prev => [...prev, {
          id: `system-${Date.now()}`,
          content: `Imported and recreated layout from ${importUrl}. The content has been rebuilt with Tailwind CSS.`,
          type: 'system',
          timestamp: new Date(),
        }]);
      } else {
        throw new Error(result.error || 'Import failed');
      }
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Voice command handler (called from ChatPanel, can also trigger IDE actions)
  const handleVoiceIDECommand = useCallback((command: string) => {
    const cmd = command.toLowerCase().trim();
    if (cmd === 'preview' || cmd === 'show preview') {
      handlePreview();
    } else if (cmd === 'new file' || cmd === 'create file' || cmd === 'create new file') {
      handleCreateNewFile();
    } else if (cmd.startsWith('rename file to ')) {
      const newName = command.substring('rename file to '.length).trim();
      if (activeFileId && newName) handleRenameFile(activeFileId, newName);
    }
  }, [activeFileId, activeFile]);

  return (
    <div className="h-screen flex flex-col bg-[#0d0d0f] overflow-hidden">
      {/* Top Bar */}
      <div className="h-11 bg-[#111114] border-b border-gray-800/80 flex items-center justify-between px-4 flex-shrink-0">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-sm font-semibold text-gray-200 tracking-tight">LLAMA Builder</span>
          {activeFile && (
            <>
              <span className="text-gray-700">/</span>
              <span className="text-xs text-gray-400">{activeFile.name}</span>
            </>
          )}
        </div>

        {/* Center: Action buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New File
          </button>

          {activeFile && (
            <button
              onClick={handlePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-green-300 hover:text-white bg-green-500/10 hover:bg-green-500/20 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </button>
          )}

          {hasMultiplePages && (
            <button
              onClick={handleMultiPagePreview}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 rounded-md transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
              All Pages
            </button>
          )}

          <button
            onClick={() => setShowContextModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save
          </button>

          <button
            onClick={() => setShowContextListModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            Contexts
            {savedContexts.length > 0 && (
              <span className="bg-blue-600 text-white text-[9px] px-1 rounded-full">{savedContexts.length}</span>
            )}
          </button>

          {/* Tools Dropdown */}
          <div className="relative" ref={toolsDropdownRef}>
            <button
              onClick={() => setShowToolsDropdown(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                showToolsDropdown
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
                  : 'bg-white/5 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title="AI Tools"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Tools
              <svg className={`w-2.5 h-2.5 transition-transform ${showToolsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showToolsDropdown && (
              <div className="absolute top-full left-0 mt-1 w-52 bg-[#1a1d26] border border-gray-700/80 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="px-3 py-2 border-b border-gray-800">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">AI Tools</span>
                </div>
                <div className="p-1">
                  <button
                    onClick={() => { setShowToolsDropdown(false); setShowTemplateGallery(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span className="text-base">🎨</span>
                    <div>
                      <div className="font-medium">Template Gallery</div>
                      <div className="text-gray-600 text-[10px]">Start from a pro template</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowToolsDropdown(false); setShowImportUrlModal(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span className="text-base">🔗</span>
                    <div>
                      <div className="font-medium">Import from URL</div>
                      <div className="text-gray-600 text-[10px]">Recreate any webpage</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowToolsDropdown(false); setAuditComplete(false); setFixIssues([]); setShowFixModal(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span className="text-base">🔍</span>
                    <div>
                      <div className="font-medium">Fix My Site</div>
                      <div className="text-gray-600 text-[10px]">AI accessibility & SEO scan</div>
                    </div>
                  </button>
                  <button
                    onClick={() => { setShowToolsDropdown(false); setShowContentSwapModal(true); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left"
                  >
                    <span className="text-base">✍️</span>
                    <div>
                      <div className="font-medium">Personalize Content</div>
                      <div className="text-gray-600 text-[10px]">Replace lorem ipsum with real copy</div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Split + Voice + Download */}
        <div className="flex items-center gap-1.5">
          {/* Split Preview toggle */}
          {activeFile?.language === 'html' && (
            <button
              onClick={() => setShowPreviewPane(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                showPreviewPane
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Toggle Live Preview"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              {showPreviewPane ? 'Hide Preview' : 'Split Preview'}
            </button>
          )}

          <button
            onClick={handleDownloadZip}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
            title="Download as ZIP"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>

          {/* Global Voice Button */}
          <button
            onClick={() => setIsVoiceActive(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
              isVoiceActive
                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
            }`}
            title="Toggle Voice Control (Alt+V)"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            {isVoiceActive ? 'Listening...' : 'Voice'}
          </button>
        </div>
      </div>

      {/* Welcome Banner */}
      {showWelcomeBanner && (
        <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-b border-blue-800/50 text-white px-4 py-2.5 relative flex-shrink-0">
          <button
            onClick={() => {
              setShowWelcomeBanner(false);
              localStorage.setItem('ide-welcome-banner-closed', 'true');
            }}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="flex items-center gap-6 text-xs">
            <div><span className="font-semibold text-blue-300">Explorer</span><span className="text-gray-400 ml-1">— Browse & manage files</span></div>
            <div><span className="font-semibold text-green-300">Editor</span><span className="text-gray-400 ml-1">— Edit with syntax highlighting</span></div>
            <div><span className="font-semibold text-purple-300">AI Chat</span><span className="text-gray-400 ml-1">— Ask AI to modify your code</span></div>
            <div><span className="font-semibold text-red-300">Voice</span><span className="text-gray-400 ml-1">— Control with Alt+V</span></div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer */}
        <div className="w-56 flex-shrink-0 border-r border-gray-800/80">
          <FileExplorer
            files={files}
            activeFileId={activeFileId}
            onFileSelect={handleFileSelect}
            onCreateNewFile={handleCreateNewFile}
            onRenameFile={handleRenameFile}
            onDeleteFile={handleDeleteFile}
            onClearContexts={handleClearAllContexts}
            onDownloadZip={handleDownloadZip}
          />
        </div>

        {/* Code Editor + optional Split Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor column */}
          <div className={`flex flex-col overflow-hidden ${showPreviewPane && activeFile?.language === 'html' ? 'w-1/2 border-r border-gray-800/80' : 'flex-1'}`}>
            {hasMultiplePages && (
              <div className="bg-[#111114] border-b border-gray-800/80 px-3 py-1.5 flex gap-1.5 overflow-x-auto flex-shrink-0">
                {htmlFiles.map(file => (
                  <button
                    key={file.id}
                    onClick={() => { setActiveFileId(file.id); setActiveFile(file); }}
                    className={`px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                      activeFileId === file.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    {file.name.replace('.html', '')}
                  </button>
                ))}
              </div>
            )}

            {activeFile ? (
              <CodeEditor
                code={activeFile.content || ''}
                language={activeFile.language || 'html'}
                fileName={activeFile.name}
                onChange={handleCodeChange}
                onExplainCode={(text) => setExplainText(text)}
              />
            ) : (
              <div className="h-full flex items-center justify-center bg-[#0d0d0f]">
                <div className="text-center max-w-xs">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                  </div>
                  <h3 className="text-gray-300 font-semibold mb-1">No file open</h3>
                  <p className="text-gray-600 text-sm mb-4">Select a file from the explorer or create a new one</p>
                  <button onClick={handleCreateNewFile} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors">
                    Create New File
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Live Preview pane */}
          {showPreviewPane && activeFile?.language === 'html' && (
            <div className="w-1/2 flex flex-col overflow-hidden bg-white">
              {/* Preview header */}
              <div className="h-9 bg-[#1a1a22] border-b border-gray-800/80 flex items-center px-3 gap-2 flex-shrink-0">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                </div>
                <div className="flex-1 bg-[#0d0d0f] rounded-md px-3 py-1 mx-2">
                  <span className="text-[10px] text-gray-500">preview — {activeFile.name}</span>
                </div>
                <button
                  onClick={() => { setShowPreviewPane(false); }}
                  className="text-gray-600 hover:text-gray-400 p-1 rounded transition-colors"
                  title="Close preview"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* iframe */}
              {previewContent ? (
                <iframe
                  srcDoc={previewContent}
                  className="flex-1 w-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  title="Live preview"
                />
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-100">
                  <p className="text-gray-400 text-sm">Waiting for content...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <div className="w-[360px] flex-shrink-0 border-l border-gray-800/80">
          <div className="h-full flex flex-col bg-[#111114]">
            <div className="px-3 py-2.5 border-b border-gray-800/80 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-gray-200">AI Assistant</span>
                <span className="text-[9px] bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-full font-medium">RAG</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowImageUploadModal(true)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
                  title="Generate from Image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <button
                  onClick={handleClearMessages}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-colors"
                  title="Clear conversation"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
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
              globalVoiceActive={isVoiceActive}
              onGlobalVoiceToggle={() => setIsVoiceActive(v => !v)}
              onIDEVoiceCommand={handleVoiceIDECommand}
              explainText={explainText}
              onExplainTextConsumed={() => setExplainText(undefined)}
            />
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Save Context Modal */}
      {showContextModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl p-6 w-96 text-white shadow-2xl">
            <h3 className="text-base font-semibold mb-4">Save Context</h3>
            <div className="space-y-3">
              <input
                type="text"
                value={contextName}
                onChange={e => setContextName(e.target.value)}
                placeholder="e.g., 'Landing Page Design'"
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                onKeyDown={e => e.key === 'Enter' && handleSaveContext()}
                autoFocus
              />
              <p className="text-xs text-gray-500">{files.length} file(s) will be saved.</p>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowContextModal(false)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
              <button onClick={handleSaveContext} className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Context List Modal */}
      {showContextListModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl p-6 w-[480px] max-h-[500px] text-white flex flex-col shadow-2xl">
            <h3 className="text-base font-semibold mb-4">Saved Contexts</h3>
            <div className="flex-1 overflow-y-auto space-y-1.5">
              {savedContexts.length === 0 ? (
                <div className="text-center py-10 text-gray-600 text-sm">No saved contexts yet</div>
              ) : (
                savedContexts.map(ctx => (
                  <div
                    key={ctx.id}
                    onClick={() => handleLoadContext(ctx.id)}
                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors group"
                  >
                    <div>
                      <div className="text-sm font-medium">{ctx.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{new Date(ctx.timestamp).toLocaleString()} · {ctx.files.length} files</div>
                    </div>
                    <button
                      onClick={e => handleDeleteContext(ctx.id, e)}
                      className="p-1.5 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button onClick={() => setShowContextListModal(false)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* File Creation Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl p-6 w-96 text-white shadow-2xl">
            <h3 className="text-base font-semibold mb-1">Create New File</h3>
            <p className="text-xs text-gray-500 mb-4">Choose a file type and optionally give it a custom name</p>

            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1.5 block">File name (optional)</label>
              <input
                type="text"
                value={createFileName}
                onChange={e => setCreateFileName(e.target.value)}
                placeholder="e.g., contact, about, styles"
                className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                onKeyDown={e => { if (e.key === 'Enter' && createFileType) createFileWithType(createFileType); }}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              {(['html', 'css', 'js'] as const).map(type => {
                const labels: Record<string, { label: string; desc: string; color: string }> = {
                  html: { label: 'HTML', desc: 'Web page with Tailwind CSS', color: 'bg-orange-500/15 hover:bg-orange-500/25 border-orange-500/30 text-orange-200' },
                  css: { label: 'CSS', desc: 'Stylesheet for custom styles', color: 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/30 text-blue-200' },
                  js: { label: 'JavaScript', desc: 'Script for interactivity', color: 'bg-yellow-500/15 hover:bg-yellow-500/25 border-yellow-500/30 text-yellow-200' },
                };
                const { label, desc, color } = labels[type];
                return (
                  <button
                    key={type}
                    onClick={() => createFileWithType(type)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-colors ${color}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-xs font-bold">{label.substring(0, 2)}</div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{label}</div>
                      <div className="text-xs opacity-60">{desc}</div>
                    </div>
                    {createFileName && (
                      <span className="ml-auto text-xs opacity-50">{createFileName}.{type}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={() => { setShowCreateDialog(false); setCreateFileName(''); }} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Template Gallery Modal ── */}
      {showTemplateGallery && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-white">Template Gallery</h3>
                <p className="text-xs text-gray-500 mt-0.5">Choose a starter — all files are pre-linked and ready to customize</p>
              </div>
              <button onClick={() => setShowTemplateGallery(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {TEMPLATES.map(template => (
                  <div key={template.id} className="border border-gray-700/60 rounded-xl overflow-hidden hover:border-gray-600 transition-all group">
                    <div className={`h-28 bg-gradient-to-br ${template.gradient} flex items-end p-4`}>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">{template.category}</span>
                        <h4 className="text-lg font-black text-white mt-0.5">{template.name}</h4>
                      </div>
                    </div>
                    <div className="p-4 bg-[#111114]">
                      <p className="text-xs text-gray-400 leading-relaxed mb-3">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          {template.files.map(f => (
                            <span key={f.name} className={`text-[9px] px-1.5 py-0.5 rounded font-medium uppercase ${
                              f.language === 'html' ? 'bg-orange-500/20 text-orange-300' :
                              f.language === 'css' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-yellow-500/20 text-yellow-300'
                            }`}>{f.name}</span>
                          ))}
                        </div>
                        <button
                          onClick={() => handleSelectTemplate(template)}
                          className="text-xs px-3 py-1.5 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                          Use Template
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Fix My Site Modal ── */}
      {showFixModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
              <div>
                <h3 className="text-base font-semibold text-white">Fix My Site</h3>
                <p className="text-xs text-gray-500 mt-0.5">AI scans your files for accessibility, SEO, and performance issues</p>
              </div>
              <button onClick={() => setShowFixModal(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!auditComplete && !isAuditing && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🔍</div>
                  <h4 className="text-white font-semibold mb-2">Ready to scan {files.length} file{files.length !== 1 ? 's' : ''}</h4>
                  <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto">The AI will check for accessibility issues, missing SEO tags, performance problems, and more.</p>
                  <button
                    onClick={handleRunAudit}
                    disabled={files.length === 0}
                    className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                  >
                    Scan Now
                  </button>
                </div>
              )}
              {isAuditing && (
                <div className="text-center py-12">
                  <div className="w-10 h-10 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-400 text-sm">Analyzing your code...</p>
                </div>
              )}
              {auditComplete && fixIssues.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-300 font-medium">{fixIssues.filter(i => !i.fixed).length} issue{fixIssues.filter(i => !i.fixed).length !== 1 ? 's' : ''} found</span>
                    <button onClick={() => { setAuditComplete(false); setFixIssues([]); }} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Scan again</button>
                  </div>
                  {fixIssues.map(issue => (
                    <div key={issue.id} className={`p-4 rounded-xl border transition-all ${issue.fixed ? 'border-green-800/50 bg-green-900/10' : 'border-gray-700/60 bg-[#111114]'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                              issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>{issue.severity}</span>
                            <span className="text-[9px] font-medium text-gray-500 uppercase tracking-wider">{issue.category}</span>
                            <span className="text-[9px] text-gray-600">{issue.file}</span>
                          </div>
                          <p className="text-sm font-medium text-white mb-1">{issue.issue}</p>
                          <p className="text-xs text-gray-500 leading-relaxed">{issue.detail}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {issue.fixed ? (
                            <span className="flex items-center gap-1 text-xs text-green-400 font-medium">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                              Fixed
                            </span>
                          ) : issue.fixing ? (
                            <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                          ) : (
                            <button
                              onClick={() => handleFixIssue(issue)}
                              className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium whitespace-nowrap"
                            >
                              Fix it
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {auditComplete && fixIssues.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">✅</div>
                  <p className="text-white font-semibold">No issues found!</p>
                  <p className="text-gray-400 text-sm mt-2">Your site looks clean.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Content Swap Modal ── */}
      {showContentSwapModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Personalize Content</h3>
                <p className="text-xs text-gray-500 mt-0.5">Replace lorem ipsum with real copy across all pages</p>
              </div>
              <button onClick={() => { if (!isSwappingContent) setShowContentSwapModal(false); }} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {isSwappingContent ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">Personalizing content...</p>
                  <p className="text-gray-400 text-sm">Page {swapProgress.current} of {swapProgress.total}</p>
                  <div className="mt-4 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${swapProgress.total > 0 ? (swapProgress.current / swapProgress.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Describe your project in 1–2 sentences
                    </label>
                    <textarea
                      value={contentSwapDesc}
                      onChange={e => setContentSwapDesc(e.target.value)}
                      placeholder='e.g. "A freelance photographer based in Austin who specializes in wedding and portrait photography."'
                      rows={3}
                      className="w-full bg-white/5 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                    <p className="text-xs text-gray-600 mt-1.5">
                      The AI will rewrite all placeholder text on {files.filter(f => f.language === 'html').length} HTML page{files.filter(f => f.language === 'html').length !== 1 ? 's' : ''} to match your description.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowContentSwapModal(false)} className="flex-1 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">Cancel</button>
                    <button
                      onClick={handleContentSwap}
                      disabled={!contentSwapDesc.trim()}
                      className="flex-1 py-2.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                      Personalize All Pages
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Import from URL Modal ── */}
      {showImportUrlModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Import from URL</h3>
                <p className="text-xs text-gray-500 mt-0.5">Fetch any public webpage and recreate its layout with Tailwind CSS</p>
              </div>
              <button onClick={() => { if (!isImporting) setShowImportUrlModal(false); }} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6">
              {isImporting ? (
                <div className="text-center py-8">
                  <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-white font-medium mb-1">Fetching and recreating...</p>
                  <p className="text-gray-400 text-sm">This may take 15–30 seconds</p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={importUrl}
                      onChange={e => setImportUrl(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleImportUrl()}
                      placeholder="https://example.com"
                      autoFocus
                      className="w-full bg-white/5 border border-gray-700 rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
                    />
                    <p className="text-xs text-gray-600 mt-1.5">
                      The AI will analyze the page structure and rebuild it using Tailwind CSS. Works best on simple, publicly accessible pages.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowImportUrlModal(false)} className="flex-1 py-2.5 text-sm bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors">Cancel</button>
                    <button
                      onClick={handleImportUrl}
                      disabled={!importUrl.trim()}
                      className="flex-1 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors disabled:opacity-50"
                    >
                      Import &amp; Recreate
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal */}
      {showImageUploadModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#1a1d26] border border-gray-700/80 rounded-2xl p-6 w-[480px] text-white shadow-2xl">
            <h3 className="text-base font-semibold mb-4">Generate from Image</h3>
            <div className="space-y-4">
              <div
                className="border-2 border-dashed border-gray-700 hover:border-gray-600 rounded-xl p-4 text-center transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-44 mx-auto object-contain rounded-lg" />
                    <button
                      onClick={() => { setSelectedImages([]); setImagePreview(null); }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="w-10 h-10 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-400 mb-2">Drag & drop or click to browse</p>
                    <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg inline-block transition-colors">
                      Choose Image
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} multiple />
                    </label>
                  </>
                )}
              </div>
              {selectedImages.length > 0 && (
                <p className="text-xs text-gray-500">{selectedImages.length} image(s) selected</p>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block">Instructions for AI (optional)</label>
                <textarea
                  value={promptText}
                  onChange={e => setPromptText(e.target.value)}
                  placeholder="e.g., 'Make it dark themed with a hero section'"
                  className="w-full bg-white/5 border border-gray-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 resize-none outline-none focus:border-blue-500 transition-colors"
                  rows={2}
                />
              </div>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowImageUploadModal(false)} className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors">Cancel</button>
              <button
                onClick={handleImageGeneration}
                disabled={selectedImages.length === 0 || isGeneratingFromImage}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isGeneratingFromImage ? (
                  <>
                    <div className="animate-spin w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                    {generationProgress}/{generationTotal}
                  </>
                ) : 'Generate Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IDELayout;
