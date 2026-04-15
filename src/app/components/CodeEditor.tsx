'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';

// Monaco must be loaded client-side only
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#1e1e1e]">
      <div className="text-center space-y-2">
        <div className="w-6 h-6 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin mx-auto" />
        <p className="text-gray-600 text-xs">Loading editor...</p>
      </div>
    </div>
  )
});

interface CodeEditorProps {
  code: string;
  language?: string;
  fileName: string;
  onChange: (newCode: string) => void;
  onExplainCode?: (selectedCode: string) => void;
}

interface SelectionInfo {
  text: string;
  lineCount: number;
}

const getMonacoLanguage = (lang: string) => {
  if (lang === 'js') return 'javascript';
  return lang;
};

const LANG_COLORS: Record<string, string> = {
  html: '#e34c26',
  css: '#264de4',
  js: '#f7df1e',
  javascript: '#f7df1e',
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language = 'html',
  fileName,
  onChange,
  onExplainCode,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorCol, setCursorCol] = useState(1);
  const [lineCount, setLineCount] = useState(1);
  const [selection, setSelection] = useState<SelectionInfo | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const handleEditorMount = useCallback((editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // VS Code dark theme tweaks
    monaco.editor.defineTheme('llama-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'tag', foreground: '4EC9B0' },
        { token: 'attribute.name', foreground: '9CDCFE' },
        { token: 'attribute.value', foreground: 'CE9178' },
      ],
      colors: {
        'editor.background': '#0d0d0f',
        'editor.lineHighlightBackground': '#1a1a22',
        'editorLineNumber.foreground': '#3a3a4a',
        'editorLineNumber.activeForeground': '#858595',
        'editor.selectionBackground': '#264f78',
        'editor.inactiveSelectionBackground': '#1a3a5c',
        'editorCursor.foreground': '#528bff',
        'scrollbarSlider.background': '#2a2a35',
        'scrollbarSlider.hoverBackground': '#3a3a45',
        'minimap.background': '#0d0d0f',
      }
    });
    monaco.editor.setTheme('llama-dark');

    editor.onDidChangeCursorPosition((e: any) => {
      setCursorLine(e.position.lineNumber);
      setCursorCol(e.position.column);
    });

    editor.onDidChangeModelContent(() => {
      setLineCount(editor.getModel()?.getLineCount() || 1);
    });

    editor.onDidChangeCursorSelection((e: any) => {
      const model = editor.getModel();
      if (!model) return;
      const selected = model.getValueInRange(e.selection);
      if (selected && selected.trim().length > 5) {
        const lines = selected.split('\n').length;
        setSelection({ text: selected, lineCount: lines });
      } else {
        setSelection(null);
      }
    });

    setLineCount(editor.getModel()?.getLineCount() || 1);

    // Focus editor
    editor.focus();
  }, []);

  // Sync external code changes without resetting cursor
  useEffect(() => {
    if (!editorRef.current) return;
    const current = editorRef.current.getValue();
    if (current !== code) {
      const pos = editorRef.current.getPosition();
      editorRef.current.setValue(code);
      if (pos) editorRef.current.setPosition(pos);
    }
  }, [code]);

  const handleExplain = () => {
    if (selection && onExplainCode) {
      onExplainCode(selection.text);
      setSelection(null);
    }
  };

  const langColor = LANG_COLORS[language] || '#9ca3af';

  if (!isMounted) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0d0d0f]">
        <div className="w-6 h-6 border-2 border-blue-500/40 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Tab bar */}
      <div className="h-9 bg-[#252526] border-b border-gray-800/80 flex items-center px-2 gap-1 flex-shrink-0">
        <div className="flex items-center gap-2 px-3 py-1 bg-[#1e1e1e] border border-gray-700/50 rounded-t-md">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: langColor }}
          />
          <span className="text-xs text-gray-300 font-medium">{fileName}</span>
        </div>
        <div className="ml-auto flex items-center gap-3 pr-2">
          <span className="text-[10px] text-gray-600 uppercase tracking-wider">{language}</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          value={code}
          language={getMonacoLanguage(language)}
          theme="llama-dark"
          onChange={(val) => onChange(val ?? '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: true, scale: 1 },
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", ui-monospace, monospace',
            fontLigatures: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: 'off',
            padding: { top: 8, bottom: 8 },
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            renderLineHighlight: 'line',
            bracketPairColorization: { enabled: true },
            guides: {
              bracketPairs: true,
              indentation: true,
            },
            renderWhitespace: 'none',
            suggest: { showKeywords: true },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            formatOnPaste: true,
            formatOnType: false,
            scrollbar: {
              verticalScrollbarSize: 6,
              horizontalScrollbarSize: 6,
            },
          }}
        />
      </div>

      {/* "Explain This Code" floating bar — shown when text is selected */}
      {selection && onExplainCode && (
        <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1e1f2e] border border-blue-500/40 rounded-xl px-3 py-2 shadow-2xl shadow-blue-500/10 animate-slide-up">
          <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          <span className="text-[11px] text-gray-400">
            {selection.lineCount > 1
              ? `${selection.lineCount} lines selected`
              : `${selection.text.length} chars selected`}
          </span>
          <div className="w-px h-3.5 bg-gray-700" />
          <button
            onClick={handleExplain}
            className="text-[11px] px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-all font-medium flex items-center gap-1"
          >
            <span>✦</span>
            Ask AI to explain
          </button>
          <button
            onClick={() => setSelection(null)}
            className="text-gray-600 hover:text-gray-400 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* VS Code-style status bar */}
      <div className="h-5 bg-[#007acc] flex items-center px-3 gap-4 flex-shrink-0">
        <span className="text-[10px] text-white/80">Ln {cursorLine}, Col {cursorCol}</span>
        <span className="text-[10px] text-white/70">{lineCount} lines</span>
        {selection && (
          <span className="text-[10px] text-white/70">
            ({selection.lineCount > 1 ? `${selection.lineCount} lines` : `${selection.text.length} chars`} selected)
          </span>
        )}
        <span className="ml-auto text-[10px] text-white/70 uppercase tracking-wider">{language}</span>
        <span className="text-[10px] text-white/60">UTF-8</span>
        <span className="text-[10px] text-white/60">Spaces: 2</span>
      </div>

      <style jsx global>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(8px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.18s ease-out; }
      `}</style>
    </div>
  );
};

export default CodeEditor;
