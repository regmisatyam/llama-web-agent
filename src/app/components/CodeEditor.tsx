'use client';

import { useState, useEffect } from 'react';

interface CodeEditorProps {
  code: string;
  language?: string;
  fileName: string;
  onChange: (newCode: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ 
  code, 
  language = 'html', 
  fileName,
  onChange 
}) => {
  const [editorContent, setEditorContent] = useState(code);
  const [lineCount, setLineCount] = useState(1);

  useEffect(() => {
    setEditorContent(code);
    // Count lines
    const lineCount = (code.match(/\n/g) || []).length + 1;
    setLineCount(lineCount);
  }, [code]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setEditorContent(newContent);
    onChange(newContent);
    
    // Count lines
    const lineCount = (newContent.match(/\n/g) || []).length + 1;
    setLineCount(lineCount);
  };

  // Generate line numbers
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1).join('\n');

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-800 text-white">
      {/* Editor Header */}
      <div className="p-2 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <span className="text-sm px-3 py-1 rounded bg-gray-700 text-gray-300">
            {fileName}
          </span>
          <span className="ml-2 text-xs text-gray-400">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="text-xs text-gray-400">
          Lines: {lineCount} | Cursor: -
        </div>
      </div>
      
      {/* Editor Body */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex text-sm font-mono">
          {/* Line Numbers */}
          <div className="p-2 text-right bg-gray-900 text-gray-500 select-none w-[50px] whitespace-pre">
            {lineNumbers}
          </div>
          
          {/* Code Area */}
          <textarea
            value={editorContent}
            onChange={handleChange}
            className="flex-1 p-2 bg-gray-800 text-gray-100 outline-none resize-none w-full border-none"
            style={{ 
              lineHeight: '1.5',
              minHeight: '100%',
              tabSize: 2,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'
            }}
            spellCheck="false"
          />
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="p-1 border-t border-gray-700 flex items-center justify-between text-xs text-gray-400 bg-gray-900">
        <div className="flex items-center space-x-3">
          <span>{language.toUpperCase()}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Spaces: 2</span>
          <span>LF</span>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor; 